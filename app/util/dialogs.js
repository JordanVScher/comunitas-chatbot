const { mailRegex } = require('./help');

// handles e-mail input
module.exports.handleMail = async (context, eMail) => {
	await context.setState({ eMail: eMail.toLowerCase() });
	if (mailRegex.test(context.state.eMail)) { // valid mail
		await context.setState({ userMail: eMail.toLowerCase() });
		await context.sendText('Obrigada por fazer parte! Juntos podemos fazer a diferença. ❤️');
		await context.setState({ dialog: 'sendMail' });
	} else { // invalid email
		await context.setState({ eMail: '', dialog: 'reAskMail' });
	}
};
