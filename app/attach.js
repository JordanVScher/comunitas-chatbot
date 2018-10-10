

module.exports.RelatedQuestionsQR = async (questions) => {
	const elements = [];


	questions.forEach(async (element) => {
		let title = element.perguntaBotao;
		if (title.length > 20) { title = title.slice(0, 20); }
		elements.push({
			content_type: 'text',
			title,
			payload: `question${element.idDaPergunta}`,
		});
	});

	return { quick_replies: elements };
};

module.exports.sendMainMenu = async (context) => {
	await context.sendText('Esse é o menu principal. Manda mais dúvidas!');
};
