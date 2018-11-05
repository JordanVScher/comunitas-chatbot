const nodemailer = require('nodemailer');

const user = process.env.SENDER_EMAIL;
const pass = process.env.SENDER_PASSWORD;
const sendTo = process.env.EMAIL_TO_RECEIVE;
const service = process.env.SERVICE;


const transporter = nodemailer.createTransport({
	service,
	// host: process.env.SMTP_SERVER,
	// port: process.env.SMTP_PORT,
	auth: {
		user,
		pass,
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

function sendSimpleError(userMail, userText = 'Não tenho a dúvida? Entre em contato com os devs!') {
	let userName = 'Sem Nome';
	if (userMail.first_name) {
		userName = userMail.first_name;
		if (userMail.last_name) { userName = `${userName} ${userMail.last_name}`; }
	}

	const mailOptions = {
		from: user,
		to: sendTo,
		subject: `Iara: dúvida de ${userName}`,
		text: `Não entendemos essa dúvida de ${userName}: \n\n${userText}\n\nEsse usuário não quis deixar o e-mail conosco.`,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			console.log(error);
		} else {
			console.log(`Email sent: ${info.response}`);
		}
	});
}

module.exports.sendSimpleError = sendSimpleError;


function sendErrorMail(userData, userText, userMail) {
	const userName = handleUserName(userData);
	const mailOptions = {
		from: user,
		to: sendTo,
		subject: `Iara: dúvida de ${userName}`,
		text: `Recebemos uma nova dúvida de ${userName}. `
			+ `\nA dúvida: ${userText}`
			+ `\nO email que o usuário deixou para respondê-lo: ${userMail}`,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		console.log(`User ${userName} mail status:`);
		if (error) {
			console.log(`Couldn't send e-mail: ${error}`);
		} else if (info) {
			console.log(`Email sent: ${info.response}`);
			// send confirmation e-mail to user

			if (userText && userText.length > 0) {
				const confirmation = {
					from: user,
					to: userMail,
					subject: 'Iara, o chatbot do Comunitas: Recebemos sua dúvida!',
					text: 'Olá.\nRecebemos a dúvida que você nos enviou em nossa página do Facebook. '
					+ 'Iremos responder o mais breve possível.'
					+ `\n\nVocê enviou: ${userText}`
					+ `\n\n\nNão é você? Houve algum engano? Acredita que não deveria ter recebido esse e-mail? Reporte-nos em ${sendTo}`,
				};
				transporter.sendMail(confirmation, (error2, info2) => {
					if (error) {
						console.log(`Couldn't send user confirmation e-mail: ${error2}`);
					} else if (info2) {
						console.log(`Email sent: ${info2.response}`);
					}
				});
			}
		}
	});
}
module.exports.sendErrorMail = sendErrorMail;
