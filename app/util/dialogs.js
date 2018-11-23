const { mailRegex } = require('./help');
const mailer = require('./mailer');
const { sendMainMenu } = require('./attach');
const events = require('./fb_events');

// handles e-mail input
module.exports.handleMail = async (context, eMail) => {
	await context.setState({ eMail: eMail.toLowerCase() });
	if (mailRegex.test(context.state.eMail)) { // valid mail
		await context.setState({ userMail: eMail.toLowerCase() });
		await context.sendText('Obrigada por fazer parte! Juntos podemos fazer a diferença. ❤️');
		await context.setState({ dialog: 'sendMail' });
		await events.addCustomAction(context.session.user.id, 'Usuario entra email corretamente');
	} else { // invalid email
		await context.setState({ eMail: '', dialog: 'reAskMail' });
		await events.addCustomAction(context.session.user.id, 'Usuario entra email em formato invalido');
	}
};

// handles user not clicking any of the quick_reply buttons on answerNotFound. // Remember: we still have to send the e-mail with the doubt, regardless of what the user does.
// if onAnswerNotFound === true, the only way of changing it to false is by sending any e-mail. Quick_reply and user typing his e-mail shouldn't trigger this.
module.exports.handleActionOnAnswerNotFound = async (context) => {
	if (context.state.onAnswerNotFound === true) { // check if user did something other than clicking on any of the buttons on AnswerNotFound (We still have to send the e-mail)
		// sending old text, before it's updated with the new user text (text = user input)
		// we also use the return value from the sendSimpleError function to update the value of onAnswerNotFound (false only when the e-mail was sent properly)
		await events.addCustomAction(context.session.user.id, 'Usuario nao confirma se quer resposta');
		context.setState({ onAnswerNotFound: await mailer.sendSimpleError(context, context.state.whatWasTyped) });
	}
};

// handles user wanting to get the answer to his doubt on his e-mail
module.exports.sendFullDoubt = async (context) => {
	context.setState({ response: await mailer.sendErrorMail(context, context.state.whatWasTyped, context.state.userMail) });
	// updates onAnswerNotFound so, if everything went right theres no "need to resend" and, if there was an error we can try to resend the e-mail on the next user interaction
	if (context.state.response && context.state.response.needToResend === false) { context.setState({ onAnswerNotFound: context.state.response.needToResend }); }
	// send feedback text back to the user (e.g. 'We recevied your doubt' or 'we confirmed through your e-mail')
	if (context.state.response.message) { await context.sendText(context.state.response.message); }
	await events.addCustomAction(context.session.user.id, 'Usuario quer resposta para a duvida');
	await sendMainMenu(context);
};
