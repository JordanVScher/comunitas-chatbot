module.exports = {

	frasesFallback: ['Essa resposta eu não tenho 🤔. Muito boa a sua pergunta! irei encaminhar para nosso time e já te respondo.',
		'Uma pergunta nova 👏👏👏! Irei encaminhar para nossa equipe, que deve responder em breve.',
		'Ainda não nos fizeram essa pergunta. Vamos descobrir a resposta 🤗 ! Vou encaminhar para nosso time.',
		'Eu não sei te responder, estou aprendendo com suas perguntas. 👨‍🎓 Vou encaminhar para nossa equipe.',
		'Humm, essa resposta eu não sei. Irei procurar com nossa equipe e te respondemos.',
		'Não encontrei sua resposta. Mas, irei encaminhar para nossa equipe, que irá te responder. 🤗'],

	iaraAvatar: 'https://gallery.mailchimp.com/926cb477483bcd8122304bc56/images/31bc6941-cd82-4f19-81ca-32ad94ae917b.jpg',
	cardData: {
		title: 'Chatbot Iara',
		subtitle: 'Chatbot Iara',
	},
	intro: {
		txt1: 'Oie, tudo bem? Eu sou a Iara, a assistente digital da Comunitas! Eu vou te ajudar no que precisar em relação a gestão pública. É só me perguntar o que precisa! Ah, sou muito boa de finanças públicas, mas estou estudando diariamente para aprender sobre os outros temas.\nConta comigo!',
		txt2: 'Como posso te ajudar? Basta digitar de forma breve qual sua dúvida sobre o CAUC. \n\nPor exemplo: Quero saber o que é o CAUC',
	},
	eMailFirst: {
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
	},
	eMailSecond: {
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
	},
	askMail: {
		quick_replies: [
			{ content_type: 'user_email' },
			{
				content_type: 'text',
				title: 'Sair',
				payload: 'dontLeaveMail',
			},
		],
	},
	share: {
		quick_replies: [
			{
				content_type: 'text',
				title: 'Compartilhar 🔗',
				payload: 'share',
			},
		],
	},
	notifications: {
		on: 'Vou te chamando conforme vou sabendo de mais bafos!',
		off: 'Sem problemas, beibe. Não te enviarei mais nenhuma notificação.',
	},
	helpText: {
		first: 'Estou aqui para te ajudar! Basta você digitar sua dúvida abaixo e eu tentarei de responder. '
		+ 'Ainda sou uma robô novinha e, por isso, posso não ter todas as respostas mas com cada dúvida nova eu também aprendo!',
		second: 'O que eu não souber te responder a nossa equipe do Comunitas te responderá através do seu e-mail. '
		+ 'Abaixo você poderá compartilhar e seguir nossa página! Se não conseguir ver nenhum botão fique tranquilo, você ainda poderá me consultar normalmente, só com texto.',
	},
	help: {
		quick_replies: [
			{
				content_type: 'text',
				title: 'Compartilhar 🔗',
				payload: 'share',
			},
		],
	},
};
