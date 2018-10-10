

module.exports.RelatedQuestionsQR = async (questions) => {
	const elements = [];


	questions.forEach(async (element) => {
		let title = element.pergunta;
		if (title.length > 20) { title = title.slice(0, 20); }
		elements.push({
			content_type: 'text',
			title,
			payload: `question${element.idDaPergunta}`,
		});
	});

	return { quick_replies: elements };
};
