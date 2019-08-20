const flow = require('./flow');

const shareLink = process.env.SHARE_LINK;

module.exports.RelatedQuestionsQR = async (questions) => { // format options to quick_reply ormat
	const elements = [];
	questions.forEach(async (element) => {
		if (element.perguntaBotao) { // checks if collum perguntaBotao was filled
			let title = element.perguntaBotao;
			if (title && title.length > 20) { title = `${title.slice(0, 17)}...`; } // slicing and adding ... in case the botao title is too long
			elements.push({
				content_type: 'text',
				title,
				payload: `question${element.idDaPergunta}`,
			});
		}
	});
	return elements;
};

module.exports.sendShareButton = async (context, cardData) => {
	const buttons = [
		{
			type: 'web_url',
			title: 'Ver Chatbot',
			url: `m.me/${process.env.PAGE_ID}`,
		},
	];

	await context.sendAttachment({
		type: 'template',
		payload: {
			template_type: 'generic',
			elements: [
				{
					title: cardData.title,
					subtitle: (cardData.text && cardData.text !== '') ? cardData.text : cardData.sub,
					image_url: flow.iaraAvatar,
					default_action: {
						type: 'web_url',
						url: `www.facebook.com/${process.env.PAGE_ID}`,
						messenger_extensions: 'false',
						webview_height_ratio: 'full',
					},
					buttons,
				},
			],
		},
	});
};


module.exports.sendMainMenu = async (context) => {
	await context.sendText('Tem mais alguma dúvida? Basta digitar e me mandar. Você também pode compartilhar ao mundo que eu existo, clicando abaixo ⬇️', flow.share);
};
