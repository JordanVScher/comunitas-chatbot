const help = require('./help');
const attach = require('./attach');
const { Sentry } = require('./help');
const flow = require('./flow');

module.exports.answerNotFound = async (context) => {
	// await context.sendText(await help.getRandomFrasesFallback(flow.frasesFallback));
	await context.sendText('Não entendi sua pergunta. ');
	if (!context.state.userMail || context.state.userMail.length === 0) {
		await context.sendText('Se quiser, poderei responder sua dúvida por e-mail. Mas para isso precisarei que você deixe o seu e-mail conosco, tudo bem? '
			+ 'Se não quiser é só continuar perguntando.', await flow.eMailFirst);
	} else {
		await context.sendText(`Se quiser, poderei responder sua dúvida por e-mail. Pelo que me lembro o seu e-mail é ${context.state.userMail}. `
			+ 'Deseja trocar o e-mail?', await flow.eMailSecond);
	}
};

module.exports.handleText = async (context, intentName, sheetAnswers) => {
	console.log('intentName', intentName);
	switch (intentName) { // check which intent
	case 'restart':
		await context.setState({ dialog: 'restart' });
		break;
	case 'help':
		await context.setState({ dialog: 'help' });
		break;
	case 'Fallback': // no answer found
		await context.setState({ dialog: 'answerNotFound' });
		break;
	default: // all questions
		await context.setState({ currentAnswer: await help.findAnswerByIntent(sheetAnswers, intentName) }); // get question
		if (context.state.currentAnswer && context.state.currentAnswer.respostaTexto1 // check if question exists and has the main answer on the correct length
			&& context.state.currentAnswer.respostaTexto1.length > 0 && context.state.currentAnswer.respostaTexto1.length <= 1950) {
			await context.setState({ dialog: 'answerFound' });
		} else { await context.setState({ dialog: 'answerNotFound' }); }
		break;
	} // --end switch
};

// handles both quick_replies and postback buttons for questions
// Obs: you need to set state.payload before calling this function. e.g.:await context.setState({ payload: context.event.message.quick_reply.payload }); // for quick_replies
module.exports.handleQuestionButton = async (context, sheetAnswers) => {
	await context.setState({ questionID: context.state.payload.replace('question', '') });
	await context.setState({ currentAnswer: await help.findAnswerByID(sheetAnswers, context.state.questionID) }); // get question
	if (context.state.currentAnswer && context.state.currentAnswer.respostaTexto1) { // check if question exists and has the main answer (error)
		await context.setState({ dialog: 'answerFound' }); return true;
	} await context.setState({ dialog: 'answerNotFound' }); return false;
};

// send the answers we have TODO: check if links are valid, add timer
module.exports.sendAnswerInSheet = async (context, question) => {
	try {
		if (question.respostaTexto1) { await context.sendText(`${question.respostaTexto1}`); }
		if (question.respostaTexto2 && question.respostaTexto2.length > 0 && question.respostaTexto2.length <= 1950) { await context.sendText(`${question.respostaTexto2}`); }
		if (question.respostaImagem) { await context.sendImage(`${question.respostaImagem}`); }
		if (question.respostaVideo) { await context.sendVideo(`${question.respostaVideo}`); }
		if (question.respostaAudio) { await context.sendAudio(`${question.respostaAudio}`); }
		if (question.respostaArquivo) { await context.sendFile(`${question.respostaArquivo}`); }
	} catch (error) {
		console.log(error);
		await Sentry.configureScope(async (scope) => {
			scope.setUser({ username: context.session.user.first_name }); scope.setExtra('state', context.state); throw error;
		});
	}
};

// send the related questions of a question
module.exports.sendRelatedQuestions = async (context, sheetAnswers, question) => {
	if (question.perguntasRelacionadas && question.perguntasRelacionadas.toString().length > 0) { // check if entry has perguntasRelacionadas
		try {
			await context.setState({ related: question.perguntasRelacionadas.toString().split(',').map(Number) }); // get questions from sheet and turn it into an array of Numbers
			if (!context.state.related || context.state.related.length === 0) { // check if we found anything (error)
				await attach.sendMainMenu(context);
			} else {
				await context.setState({ related: await help.findAllAnswersById(sheetAnswers, context.state.related) }); // check if we found anything (error)
				if (!context.state.related || context.state.related.length === 0) { // check if we found anything (error)
					await context.sendText('Não temos mais perguntas relacionadas! Escreva sua dúvida.');
				// } else if (context.state.related.length === 1) { // only one question
				// 	await context.sendText('Que tal?', await attach.RelatedQuestionsQR(context.state.related));
				} else { // more than one
					await context.setState({ textToSend: 'Saiba mais!' });
					if (question.textoPreliminar && question.textoPreliminar.length > 0 && question.textoPreliminar.length <= 1950) {
						await context.setState({ textToSend: question.textoPreliminar });
					}
					await context.sendText(context.state.textToSend, await attach.RelatedQuestionsQR(context.state.related));
				}
			}
		} catch (error) {
			await attach.sendMainMenu(context);
			await Sentry.configureScope(async (scope) => {
				console.log(error);
				scope.setUser({ username: context.session.user.first_name }); scope.setExtra('state', context.state); throw error;
			});
		}
	} else { // no related questions
		await attach.sendMainMenu(context);
	}
};
