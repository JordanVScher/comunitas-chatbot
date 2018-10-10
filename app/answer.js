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
		let related = question.perguntasRelacionadas.toString().split(',').map(Number); // get questions from sheet and turn it into an array of Numbers
		if (!related || related.length === 0) { // check if we found anything (error)
			await context.sendText('Não temos mais perguntas relacionadas! Escreve aí.');
		} else {
			related = await help.findAllAnswersById(sheetAnswers, related); // loading the questions
			if (!related || related.length === 0) { // check if we found anything (error)
				await context.sendText('Não temos mais perguntas relacionadas! Escreve aí.');
			} else if (related.length === 1) { // only one question
				await context.sendText('Que tal?', await attach.RelatedQuestionsQR(related));
			} else { // more than one
				await context.sendText('Sabia mais!', await attach.RelatedQuestionsQR(related));
			}
		}
	} else {
		await context.sendText('Acabou :)');
	}
};
