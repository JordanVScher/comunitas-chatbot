const help = require('./util/help');
const DF = require('./util/dialogflow');
const { Sentry } = require('./util/help');
const answer = require('./util/answer');
const attach = require('./util/attach');
const events = require('./util/fb_events');
const flow = require('./util/flow');
const mailer = require('./util/mailer');
const dialogs = require('./util/dialogs');

let sheetAnswers = '';
async function initialLoading() {
	sheetAnswers = await help.reloadSpreadSheet();
	if (sheetAnswers) {
		console.log('Spreadsheet loaded succesfully!');
		// console.log(sheetAnswers);
	} else { console.log("Couldn't load Spreadsheet!");	}
}
initialLoading();

module.exports = async (context) => {
	try {
		if (!context.event.isDelivery && !context.event.isEcho) {
			if (context.event.isQuickReply) {
				await context.setState({ payload: context.event.message.quick_reply.payload });
				if (context.state.payload.slice(0, 8) === 'question') {
					await answer.handleQuestionButton(context, sheetAnswers);
					await events.addCustomAction(context.session.user.id, 'usuario clica em pergunta relacionada');
				} else if (help.mailRegex.test(context.event.quickReply.payload)) {
					await dialogs.handleMail(context, context.event.quickReply.payload);
				} else {
					await context.setState({ dialog: context.event.quickReply.payload });
				}
			} else if (context.event.isLikeSticker || context.event.isFile || context.event.isVideo
				|| context.event.isImage || context.event.isFallback || context.event.isLocation) {
				await dialogs.handleActionOnAnswerNotFound(context);
				await context.sendText('Não entendi sua última mensagem. Por favor, mensagens de texto para as suas dúvidas ou clique nos botões.');
			} else if (context.event.isPostback) {
				await dialogs.handleActionOnAnswerNotFound(context);
				await context.setState({ dialog: context.event.postback.payload });
			} else if (context.event.isText) { //
				if (context.event.message.text === process.env.RELOAD_KEYWORD) { // admin types reload spreadsheet keyword
					await context.setState({ dialog: 'reload' });
				} else if (context.state.dialog === 'leaveMail' || context.state.dialog === 'reAskMail' || context.state.dialog === 'answerNotFound') { // user leaves e-mail
					await dialogs.handleMail(context, context.event.message.text);
				} else {
					await dialogs.handleActionOnAnswerNotFound(context);
					await context.setState({ whatWasTyped: context.event.message.text }); // storing the text
					await context.setState({ apiaiResp: await DF.textRequestDF(await help.formatString(context.state.whatWasTyped), context.session.user.id) });
					await context.setState({ intentName: context.state.apiaiResp[0].queryResult.intent.displayName || '' }); // intent name
					await context.setState({ resultParameters: await DF.getEntity(context.state.apiaiResp) }); // entities
					await context.setState({ apiaiTextAnswer: context.state.apiaiResp[0].queryResult.fulfillmentText || '' }); // response text
					await answer.handleText(context, context.state.intentName, sheetAnswers);
				} // --end else
			} // --end isText
			// --end event handler
			switch (context.state.dialog) {
			case 'restart':
				await events.addCustomAction(context.session.user.id, 'Usuario reinicia conversa');
				// falls throught
			case 'greetings':
				await context.sendImage(flow.iaraAvatar);
				await context.sendText(flow.intro.txt1);
				await context.sendText(flow.intro.txt2);
				break;
			case 'answerFound':
				await answer.sendAnswerInSheet(context, context.state.currentAnswer);
				await answer.sendRelatedQuestions(context, sheetAnswers, context.state.currentAnswer);
				await events.addCustomAction(context.session.user.id, 'Resposta encontrada');
				break;
			case 'answerNotFound':
				await context.setState({ onAnswerNotFound: true });
				await answer.answerNotFound(context);
				await events.addCustomAction(context.session.user.id, 'Resposta nao encontrada');
				break;
			case 'leaveMail':
				await context.sendText('Qual o seu e-mail? Pode digitá-lo e nos mandar.', await flow.askMail);
				await events.addCustomAction(context.session.user.id, 'Usuario quer deixar e-mail');
				break;
			case 'dontLeaveMail': // user doesn't want to leave mail
				if (context.state.userMail && context.state.userMail.length > 0) { // check if user left his e-mail already and simply didn't want to update his e-mail
					await dialogs.sendFullDoubt(context);
				} else { // user doesn't want to leave e-mail
					context.setState({ onAnswerNotFound: await mailer.sendSimpleError(context, context.state.whatWasTyped) });
					await attach.sendMainMenu(context);
					await events.addCustomAction(context.session.user.id, 'Usuario nao quer deixar e-mail');
				}
				break;
			case 'dontWantAnswer':
				context.setState({ onAnswerNotFound: await mailer.sendSimpleError(context, context.state.whatWasTyped) });
				await attach.sendMainMenu(context);
				await events.addCustomAction(context.session.user.id, 'Usuario nao quer resposta');
				break;
			case 'reAskMail':
				await context.sendText('Esse e-mail não parece estar correto. Tente um formato como "iara@gmail.com. Ou clique em "Sair" para continuar me fazendo perguntas.', await flow.askMail);
				break;
			case 'sendMail':
				await dialogs.sendFullDoubt(context);
				break;
			case 'share':
				await context.sendText('Siga nossa página e compartilhe nossos esforços. Basta encaminhar a mensagem abaixo. 👍');
				await attach.sendShareButton(context, flow.cardData);
				await context.sendText('Mais dúvidas? É só me mandar!');
				await events.addCustomAction(context.session.user.id, 'Usuario quer compartilhar');
				break;
			case 'help':
				await context.setState({ whatWasTyped: '' });
				await context.sendText(flow.helpText.first);
				await context.sendText(flow.helpText.second, flow.help);
				await events.addCustomAction(context.session.user.id, 'Usuario pede ajuda');
				break;
			case 'thanks':
				await context.sendText(flow.helpText.first);
				await events.addCustomAction(context.session.user.id, 'Usuario agradece');
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
		await context.sendText('Ops. Tive um erro interno. Escreva sua dúvida!');
		await Sentry.configureScope(async (scope) => {
			scope.setUser({ username: context.session.user.first_name }); scope.setExtra('state', context.state); throw error;
		});
	}
};
