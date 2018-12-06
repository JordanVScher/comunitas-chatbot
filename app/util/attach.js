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
