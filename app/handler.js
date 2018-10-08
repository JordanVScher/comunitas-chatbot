const { apiai } = require('./help');
const help = require('./help');

let answer = '';
async function initialLoading() {
	answer = await help.reloadSpreadSheet();
	if (answer) {
		console.log('Spreadsheet loaded succesfully!');
		console.log(answer);
	} else {
		console.log("Couldn't load Spreadsheet!");
	}
}
initialLoading();


module.exports = async (context) => {
	try {
		if (!context.event.isDelivery && !context.event.isEcho) {
			if (context.event.isQuickReply) {
				await context.setState({ dialog: context.event.quickReply.payload });
			} else if (context.event.isPostback) {
				await context.setState({ dialog: context.event.postback.payload });
			} else if (context.event.isText) {
				await context.setState({ whatWasTyped: context.event.message.text });
				await context.setState({ apiaiResp: await apiai.textRequest(context.state.whatWasTyped, { sessionId: context.session.user.id }) });
				await context.setState({ dialog: 'answer' });
			} else if (context.event.hasAttachment || context.event.isLikeSticker
				|| context.event.isFile || context.event.isVideo || context.event.isAudio
				|| context.event.isImage || context.event.isFallback || context.event.isLocation) {
				await context.sendText('Não entendi sua última mensagem. Por favor, utilize apenas mensagens de texto ou clique nos botões.');
			}

			switch (context.state.dialog) {
			case 'restart':
				// falls throught
			case 'greetings':
				await context.sendText(`Olá, ${context.session.user.first_name}. Espero que esteja bem! `
				+ 'Sou Iara, a assistente digital da Comunitas e estou aqui para te orientar de forma correta e eficiente sobre o CAUC.');
				await context.sendText('Como posso te ajudar? Basta digitar de forma breve qual sua dúvida sobre o CAUC. '
				+ '\n\nPor exemplo: Quero saber o que é ABC');
				break;
			case 'answer':
				console.log('apiaiResp', context.state.apiaiResp);
				break;
			}
		}
	} catch (err) {
		const date = new Date();
		console.log(`Parece que aconteceu um erro as ${date.toLocaleTimeString('pt-BR')} de ${date.getDate()}/${date.getMonth() + 1} =>`);
		console.log(err);
		await context.sendText('Ops. Tive um erro interno. Tente novamente.');
	}
};
