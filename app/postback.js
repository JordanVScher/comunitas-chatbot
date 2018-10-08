require('dotenv').config();

const { MessengerClient } = require('messaging-api-messenger');
const config = require('./bottender.config').messenger;

const client = MessengerClient.connect({
	accessToken: config.accessToken,
	appSecret: config.appSecret,
});


async function createGetStarted() { // eslint-disable-line no-unused-vars
	console.log(await client.setGetStarted('restart')); // don't forget to subscribe page to app for this to work
	console.log(await client.setGreeting([{
		locale: 'default',
		text: 'Oi, eu sou a Iara',
	}]));
}

async function createPersistentMenu() { // eslint-disable-line no-unused-vars
	console.log(await client.setPersistentMenu([
		{
			locale: 'default',
			call_to_actions: [
				{
					type: 'postback',
					title: 'Ir para o Início',
					payload: 'restart',
				},
			],
		},
	]));
}

// Each of these functions should be ran from the terminal, with all changes being made right here on the code
// Run it => node postback.js
createGetStarted();
createPersistentMenu();
