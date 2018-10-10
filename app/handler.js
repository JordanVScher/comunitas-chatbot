const { apiai } = require('./help');
const help = require('./help');
const answer = require('./answer');

let sheetAnswers = '';
async function initialLoading() {
	sheetAnswers = await help.reloadSpreadSheet();
	if (sheetAnswers) {
		console.log('Spreadsheet loaded succesfully!');
		// console.log(sheetAnswers);
	} else {
		console.log("Couldn't load Spreadsheet!");
	}
}
initialLoading();


module.exports = async (context) => {
	try {
		if (!context.event.isDelivery && !context.event.isEcho) {
			if (context.event.isQuickReply) {
				if (context.event.message.quick_reply.payload.slice(0, 8) === 'question') {
					await context.setState({ questionID: context.event.message.quick_reply.payload.replace('question', '') });
					await context.setState({ currentAnswer: await help.findAnswerByID(sheetAnswers, context.state.questionID) }); // get question
					if (context.state.currentAnswer && context.state.currentAnswer.respostaTexto1) { // check if question exists and has the main answer (error)
						await context.setState({ dialog: 'answerFound' });
					} else { await context.setState({ dialog: 'answerNotFound' }); }
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
				await context.setState({ apiaiResp: await apiai.textRequest(context.state.whatWasTyped, { sessionId: context.session.user.id }) }); // asking dialogFlow
				switch (context.state.apiaiResp.result.metadata.intentName) { // check which intent
				case 'Fallback': // no answer found
					await context.setState({ dialog: 'answerNotFound' });
					break;
				default: // all questions
					await context.setState({ currentAnswer: await help.findAnswerByIntent(sheetAnswers, context.state.apiaiResp.result.metadata.intentName) }); // get question
					if (context.state.currentAnswer && context.state.currentAnswer.respostaTexto1) { // check if question exists and has the main answer (error)
						await context.setState({ dialog: 'answerFound' });
					} else { await context.setState({ dialog: 'answerNotFound' }); }
					break;
				}
			}
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
				await answer.sendAnswerInSheet(context, context.state.currentAnswer);
				await answer.sendRelatedQuestions(context, sheetAnswers, context.state.currentAnswer);


				break;
			case 'answerNotFound':
				await context.sendText('Não encontrei esse resposta!');
				break;
			}
		}
	} catch (err) {
		const date = new Date();
		console.log(`Parece que aconteceu um erro as ${date.toLocaleTimeString('pt-BR')} de ${date.getDate()}/${date.getMonth() + 1} =>`);
		console.log(err);
		await context.sendText('Ops. Tive um erro interno. Tente novamente.');
	}
};
