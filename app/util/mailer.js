const nodemailer = require('nodemailer');
const { Sentry } = require('./help');
const attach = require('./attach');

const user = process.env.MAIL_USER;
const pass = process.env.MAIL_PASS;
const host = process.env.MAIL_HOST;
const port = process.env.MAIL_PORT;
const service = process.env.MAIL_SERVICE;
const from = process.env.MAIL_FROM;

const sendTo = process.env.MAIL_SEND_TO.split(',');
// const sendTo = process.env.MAIL_SEND_TO;

const transporter = nodemailer.createTransport({
	service,
	host,
	port,
	auth: {
		user,
		pass,
		secure: true, // use SSL
	},
	tls: { rejectUnauthorized: false },
	debug: true,
});

function handleUserName(userData) {
	let userName = 'Sem Nome';
	if (userData.first_name) {
		userName = userData.first_name;
		if (userData.last_name) { userName = `${userName} ${userData.last_name}`; }
	}
	return userName;
}

// sends only the user doubt, without user mail and without confirming to the user
async function sendSimpleError(context, userText) {
	const userName = handleUserName(context.session.user);

	const mailOptions = {
		from,
		to: sendTo,
		subject: `Iara: dúvida de ${userName}`,
		text: `Não entendemos essa dúvida de ${userName}: \n\n${userText}\n\nEsse usuário não quis deixar o e-mail conosco.`,
	};

	let result;
	try {
		result = await transporter.sendMail(mailOptions);
	} catch (error) {
		await Sentry.configureScope(async (scope) => {
			scope.setUser({ username: context.session.user.first_name });
			scope.setExtra('whatHappened', 'Single mail couldnt be sent');
			scope.setExtra('state', context.state); throw error;
		});
		return true;
	}

	if (!result || result.error) { // case where e-mail couldn't be properly delivered but tere was no error with the request
		await Sentry.configureScope(async (scope) => {
			scope.setUser({ username: context.session.user.first_name });
			scope.setExtra('whatHappened', 'Single mail couldnt be sent');
			scope.setExtra('state', context.state); throw result.error;
		});
		return true;
	}

	console.log(`Single email sent to ${sendTo}: ${result.response}`);
	return false;
}

module.exports.sendSimpleError = sendSimpleError;

// sends full error, including user mail and confirming to the user that we received the doubt (In this case, the user expects an answer)
async function sendErrorMail(context, userText, userMail) {
	const userName = handleUserName(context.session.user);

	const mailOptions = {
		from: user,
		to: sendTo,
		subject: `Iara: dúvida de ${userName}`,
		text: `Recebemos uma nova dúvida de ${userName}. `
			+ `\nA dúvida: ${userText}`
			+ `\nO email que o usuário deixou para respondê-lo: ${userMail}`,
	};

	let result;
	try {
		result = await transporter.sendMail(mailOptions); // sends first e-mail to us
	} catch (error) {
		console.log(`Couldn't send e-mail: ${error}`);
		await attach.sendMainMenu(context);
		await Sentry.configureScope(async (scope) => {
			scope.setUser({ username: context.session.user.first_name });
			scope.setExtra('whatHappened', 'First mail couldnt be sent');
			scope.setExtra('state', context.state); throw error;
		});
		return { needToResend: true };
	}

	console.log(`First Email sent to ${sendTo}: ${result.response}`);
	let msgStatus = 'Ok, recebemos sua dúvida. Logo mais estaremos te respondendo. 👍';

	if (userText && userText.length > 0) {
		const confirmation = {
			from: user,
			to: userMail,
			subject: 'Iara, o chatbot do Comunitas: Recebemos sua dúvida!',
			text: 'Olá.\nRecebemos a dúvida que você nos enviou em nossa página do Facebook. '
				+ 'Iremos responder o mais breve possível.'
				+ `\n\nVocê enviou: ${userText}`
				+ `\n\n\nNão é você? Houve algum engano? Acredita que não deveria ter recebido esse e-mail? Avise-nos em ${sendTo}`,
		};

		try {
			result = await transporter.sendMail(confirmation); // sends second e-mail to the user, confirming we have received his doubt
		} catch (error) {
			console.log(`Couldn't send user confirmation e-mail: ${error}`);
			await Sentry.configureScope(async (scope) => {
				scope.setUser({ username: context.session.user.first_name });
				scope.setExtra('whatHappened', 'Second mail couldnt be sent');
				scope.setExtra('state', context.state); throw error;
			});
			return { needToResend: false, message: msgStatus };
		}
		msgStatus = `Ok, recebemos sua dúvida. Você também recebeu um e-mail de confirmação em ${userMail}. Logo mais estaremos te respondendo. 👍`;
		console.log(`Second Email sent to ${userMail}: ${result.response}`);

		return { needToResend: false, message: msgStatus };
	} // userText if
	return { needToResend: false, message: msgStatus };
}
module.exports.sendErrorMail = sendErrorMail;
