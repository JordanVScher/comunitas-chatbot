const { apiai } = require('./util/help');
const help = require('./util/help');
const { Sentry } = require('./util/help');
const answer = require('./util/answer');
const attach = require('./util/attach');
const flow = require('./util/flow');
const mailer = require('./util/mailer');
const dialogs = require('./util/dialogs');
// const maApi = require('./util/MA_api');

let sheetAnswers = '';
async function initialLoading() {
	sheetAnswers = await help.reloadSpreadSheet();
	if (sheetAnswers) {
		console.log('Spreadsheet loaded succesfully!');
		// console.log(sheetAnswers);
	} else { console.log("Couldn't load Spreadsheet!");	}
}
initialLoading();

// const { pageID } = process.env;

module.exports = async (context) => {
	try {
		if (!context.event.isDelivery && !context.event.isEcho) {
			if (context.event.isQuickReply) {
				await context.setState({ payload: context.event.message.quick_reply.payload });
				if (context.state.payload.slice(0, 8) === 'question') {
					await answer.handleQuestionButton(context, sheetAnswers);
				} else if (help.mailRegex.test(context.event.quickReply.payload)) {
					await dialogs.handleMail(context, context.event.quickReply.payload);
				} else {
					await context.setState({ dialog: context.event.quickReply.payload });
				}
			} else if (context.event.hasAttachment || context.event.isLikeSticker
				|| context.event.isFile || context.event.isVideo || context.event.isAudio
				|| context.event.isImage || context.event.isFallback || context.event.isLocation) {
				await context.sendText('Não entendi sua última mensagem. Por favor, utilize apenas mensagens de texto ou clique nos botões.');
			} else if (context.event.isPostback) {
				await context.setState({ dialog: context.event.postback.payload });
			} else if (context.event.isText) {
				if (context.event.message.text === process.env.RELOAD_KEYWORD) { // admin types reload spreadsheet keyword
					await context.setState({ dialog: 'reload' });
				} else if (context.state.dialog === 'leaveMail' || context.state.dialog === 'reAskMail') { // user leaves e-mail
					await dialogs.handleMail(context, context.event.message.text);
				} else {
					await context.setState({ whatWasTyped: context.event.message.text }); // storing the text
					await answer.handleText(context, apiai, sheetAnswers);
				} // --end else
			} // --end isText
			switch (context.state.dialog) {
			case 'restart':
				// falls throught
			case 'greetings':
				await context.sendText(`Olá, ${context.session.user.first_name}. Espero que esteja bem! `
				+ 'Sou Iara, a assistente digital da Comunitas e estou aqui para te orientar de forma correta e eficiente sobre o CAUC.');
				await context.sendText('Como posso te ajudar? Basta digitar de forma breve qual sua dúvida sobre o CAUC. '
				+ '\n\nPor exemplo: Quero saber o que é o CAUC');
				break;
			case 'answerFound':
				console.log(context.state.currentAnswer);
				await answer.sendAnswerInSheet(context, context.state.currentAnswer);
				await answer.sendRelatedQuestions(context, sheetAnswers, context.state.currentAnswer);
				break;
			case 'answerNotFound':
				await answer.answerNotFound(context);
				break;
			case 'leaveMail':
				await context.sendText('Qual o seu e-mail? Pode digitá-lo e nos mandar.', await flow.askMail);
				break;
			case 'dontLeaveMail':
				if (context.state.userMail && context.state.userMail.length > 0) {
					await mailer.sendErrorMail(context.session.user, context.state.whatWasTyped, context.state.userMail);
				} else { await mailer.sendSimpleError(context.session.user, context.state.whatWasTyped); }
				await attach.sendMainMenu(context);
				break;
			case 'reAskMail':
				await context.sendText('Esse e-mail não parece estar correto! Tente um formato como "iara@gmail.com".', await flow.askMail);
				break;
			case 'sendMail':
				await mailer.sendErrorMail(context.session.user, context.state.whatWasTyped, context.state.userMail);
				await attach.sendMainMenu(context);
				break;
			case 'reload':
				sheetAnswers = await help.reloadSpreadSheet();
				await context.sendText('Recarregamos as respostas!');
				await attach.sendMainMenu(context);
				break;
			}
		}
	} catch (error) {
		const date = new Date();
		console.log(`Parece que aconteceu um erro as ${date.toLocaleTimeString('pt-BR')} de ${date.getDate()}/${date.getMonth() + 1} =>`);
		console.log(error);
		await context.sendText('Ops. Tive um erro interno. Tente novamente.');
		await Sentry.configureScope(async (scope) => {
			scope.setUser({ username: context.session.user.first_name }); scope.setExtra('state', context.state); throw error;
		});
	}
};
