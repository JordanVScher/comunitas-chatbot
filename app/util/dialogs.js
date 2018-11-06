const { mailRegex } = require('./help');
const { sendSimpleError } = require('./mailer');

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


// handles user not clicking any of the quick_reply buttons on answerNotFound. // Remember: we still have to send the e-mail with the doubt, regardless of what the user do.
// if onAnswerNotFound === true, the only way of changing it to false is by sending any e-mail. Quick_reply and user typing his e-mail shouldn't trigger this.
module.exports.handleActionOnAnswerNotFound = async (context) => {
	if (context.state.onAnswerNotFound === true) { // check if user did something other than clicking on any of the buttons on AnswerNotFound (We still have to send the e-mail)
		await sendSimpleError(context, context.state.whatWasTyped); // sending old text, before it's updated with the new user text
	}
};
