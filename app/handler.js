const { apiai } = require('./util/help');
const help = require('./util/help');
const { Sentry } = require('./util/help');
const answer = require('./util/answer');
const attach = require('./util/attach');
const events = require('./util/fb_events');
const audio = require('./util/audio');
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
			} else if (context.event.isAudio) {
				await context.setState({ dialog: '' });
				await dialogs.handleActionOnAnswerNotFound(context);
				await context.sendText('Áudio? Me dê um momento para processar.');
				if (context.event.audio.url) {
					await context.setState({ audio: await audio.voiceRequest(context.event.audio.url, context.session.user.id) });
					if (context.state.audio && context.state.audio.txtMag && context.state.audio.txtMag !== '') { // there was an error (or the user just didn't say anything)
						await context.sendText(context.state.audio.txtMag);
					} else if (!context.state.audio || !context.state.audio.intentName) {
						await context.sendText('Não entendi o que você disse. Tente me perguntar novamente ou digitar a sua dúvida.');
					} else {
						await context.setState({ whatWasTyped: context.state.audio.whatWasSaid });
						await context.setState({ intentName: context.state.audio.intentName });
						await answer.handleText(context, context.state.intentName, sheetAnswers);
					}
				}
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
					await context.setState({ apiaiResp: await apiai.textRequest(await help.formatString(context.state.whatWasTyped), { sessionId: context.session.user.id }) });
					await answer.handleText(context, context.state.apiaiResp.result.metadata.intentName, sheetAnswers);
				} // --end else
			} // --end isText
			// --end event handler
			switch (context.state.dialog) {
			case 'restart':
				await events.addCustomAction(context.session.user.id, 'Usuario reinicia conversa');
				// falls throught
			case 'greetings':
				await context.sendImage(flow.iaraAvatar);
				await context.sendText(`Olá, ${context.session.user.first_name}. Espero que esteja bem! `
				+ 'Sou Iara, a assistente digital da Comunitas e estou aqui para te orientar de forma correta e eficiente sobre o CAUC.');
				await context.sendText('Como posso te ajudar? Basta digitar de forma breve qual sua dúvida sobre o CAUC. '
				+ '\n\nPor exemplo: Quero saber o que é o CAUC');
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
				await context.sendText('Esse e-mail não parece estar correto. Tente um formato como "iara@gmail.com".', await flow.askMail);
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
