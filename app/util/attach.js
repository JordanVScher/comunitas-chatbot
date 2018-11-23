const flow = require('./flow');

const shareLink = process.env.SHARE_LINK;

module.exports.RelatedQuestionsQR = async (questions) => {
	const elements = [];
	questions.forEach(async (element) => {
		let title = element.perguntaBotao;
		if (title && title.length > 20) { title = title.slice(0, 20); }
		elements.push({
			content_type: 'text',
			title,
			payload: `question${element.idDaPergunta}`,
		});
	});
	return { quick_replies: elements };
};

module.exports.sendShareButton = async (context) => {
	await context.sendAttachment({
		type: 'template',
		payload: {
			template_type: 'generic',
			elements: [
				{
					title: '🌸 Chatbot Iara 🌸',
					subtitle: 'A assistente digital do Comunitas',
					image_url: flow.iaraAvatar,
					item_url: shareLink,
					buttons: [{
						type: 'element_share',
					}],
				},
			],
		},
	});
};

module.exports.sendMainMenu = async (context) => {
	await context.sendText('Tem mais alguma dúvida? Basta digitar e me mandar. Você também pode compartilhar ao mundo que eu existo, clicando abaixo ⬇️', flow.share);
};
