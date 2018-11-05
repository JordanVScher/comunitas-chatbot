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


function sendSimpleError(userMail, userText = 'Não tenho a dúvida? Entre em contato com os devs!') {
	console.log('I am here');

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

// when any user sends their doubt with their e-mail we send one e-mail immediately
function sendError(userName = 'erro', userText = 'entre em contato', userMail = 'imediatamente') {
	const mailOptions = {
		from: user,
		to: sendTo,
		subject: `Cora: mensagem de ${userName}`,
		text: `Recebemos uma nova mensagem de ${userName}. `
            + `\nA mensagem: ${userText}`
            + `\nO email para responder: ${userMail}`,
	};

	transporter.sendMail(mailOptions, (error, info) => {
		console.log(`User ${userName} mail status:`);
		if (error) {
			console.log(`Couldn't send e-mail: ${error}`);
		} else if (info) {
			console.log(`Email sent: ${info.response}`);
			// send confirmation e-mail to user
			const confirmation = {
				from: user,
				to: userMail,
				subject: 'RenovaBR: Recebemos sua dúvida!',
				text: `Olá, ${userName}.\nRecebemos a dúvida que você nos enviou. `
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
	});
}

module.exports.sendError = sendError;
