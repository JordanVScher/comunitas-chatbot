module.exports.frasesFallback = ['Essa resposta eu não tenho 🤔. Muito boa a sua pergunta! irei encaminhar para nosso time e já te respondo.',
	'Uma pergunta nova 👏👏👏! Irei encaminhar para nossa equipe, que deve responder em breve.',
	'Ainda não nos fizeram essa pergunta. Vamos descobrir a resposta 🤗 ! Vou encaminhar para nosso time.',
	'Eu não sei te responder, estou aprendendo com suas perguntas. 👨‍🎓 Vou encaminhar para nossa equipe.',
	'Humm, essa resposta eu não sei. Irei procurar com nossa equipe e te respondemos.',
	'Não encontrei sua resposta. Mas, irei encaminhar para nossa equipe, que irá te responder. 🤗'];

module.exports.iaraAvatar = 'https://gallery.mailchimp.com/926cb477483bcd8122304bc56/images/31bc6941-cd82-4f19-81ca-32ad94ae917b.jpg';

module.exports.eMailFirst = {
	quick_replies: [
		{ content_type: 'user_email' },
		{
			content_type: 'text',
			title: 'Deixar meu e-mail',
			payload: 'leaveMail',
		},
		{
			content_type: 'text',
			title: 'Não deixar e-mail',
			payload: 'dontLeaveMail',
		},
	],
};
module.exports.eMailSecond = {
	quick_replies: [
		{ content_type: 'user_email' },
		{
			content_type: 'text',
			title: 'Trocar meu e-mail',
			payload: 'leaveMail',
		},
		{
			content_type: 'text',
			title: 'Mandar nesse e-mail',
			payload: 'sendMail',
		},
		{
			content_type: 'text',
			title: 'Não quero a resposta',
			payload: 'dontWantAnswer',
		},
	],
};

module.exports.askMail = {
	quick_replies: [
		{ content_type: 'user_email' },
		{
			content_type: 'text',
			title: 'Sair',
			payload: 'dontLeaveMail',
		},
	],
};

module.exports.share = {
	quick_replies: [
		{
			content_type: 'text',
			title: 'Compartilhar',
			payload: 'share',
		},
	],
};
