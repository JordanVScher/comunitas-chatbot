const { apiai } = require('./util/help');
const help = require('./util/help');
const { Sentry } = require('./util/help');
const answer = require('./util/answer');
const attach = require('./util/attach');

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
				await context.setState({ whatWasTyped: context.event.message.text }); // storing the text
				if (context.state.whatWasTyped === process.env.RELOAD_KEYWORD) {
					await context.setState({ dialog: 'reload' });
				} else {
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
				+ '\n\nPor exemplo: Quero saber o que é ABC');
				break;
			case 'answerFound':
				console.log(context.state.currentAnswer);

				await answer.sendAnswerInSheet(context, context.state.currentAnswer);
				await answer.sendRelatedQuestions(context, sheetAnswers, context.state.currentAnswer);
				break;
			case 'answerNotFound':
				await context.sendText('Não encontrei esse resposta!');
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
