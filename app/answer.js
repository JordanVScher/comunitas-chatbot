const help = require('./help');
const attach = require('./attach');

// send the answers we have TODO: check if links are valid, add timer, try/catch
module.exports.sendAnswerInSheet = async (context, question) => {
	if (question.respostaTexto1) { await context.sendText(question.respostaTexto1); }
	if (question.respostaTexto2) { await context.sendText(question.respostaTexto2); }
	if (question.respostaImagem) { await context.sendImage(question.respostaImagem); }
	if (question.respostaVideo) { await context.sendVideo(question.respostaVideo); }
	if (question.respostaAudio) { await context.sendAudio(question.respostaAudio); }
	if (question.respostaArquivo) { await context.sendFile(question.respostaAudio); }
};

// send the related questions of a question
module.exports.sendRelatedQuestions = async (context, sheetAnswers, question) => {
	if (question.perguntasRelacionadas && question.perguntasRelacionadas.length > 0) { // check if entry has perguntasRelacionadas
		await context.setState({ related: question.perguntasRelacionadas.toString().split(',').map(Number) }); // get questions from sheet and turn it into an array of Numbers
		if (!context.state.related || context.state.related.length === 0) { // check if we found anything (error)
			await attach.sendMainMenu(context);
		} else {
			await context.setState({ related: await help.findAllAnswersById(sheetAnswers, context.state.related) }); // check if we found anything (error)
			if (!context.state.related || context.state.related.length === 0) { // check if we found anything (error)
				await context.sendText('Ocorreu um erro! Não temos mais perguntas relacionadas! Escreve aí.');
			} else if (context.state.related.length === 1) { // only one question
				await context.sendText('Que tal?', await attach.RelatedQuestionsQR(context.state.related));
			} else { // more than one
				await context.sendText('Sabia mais!', await attach.RelatedQuestionsQR(context.state.related));
			}
		}
	} else {
		await attach.sendMainMenu(context);
	}
};
