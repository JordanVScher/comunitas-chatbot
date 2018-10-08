module.exports = async (context) => {
	try {
		if (!context.event.isDelivery && !context.event.isEcho) {
			await context.sendText('Hello World');
		}
	} catch (err) {
		const date = new Date();
		console.log(`Parece que aconteceu um erro as ${date.toLocaleTimeString('pt-BR')} de ${date.getDate()}/${date.getMonth() + 1} =>`);
		console.log(err);
		await context.sendText('Ops. Tive um erro interno. Tente novamente.');
	}
};
