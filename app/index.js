require('dotenv').config();

const { MessengerBot, FileSessionStore, withTyping } = require('bottender');
const { createServer } = require('bottender/restify');

const config = require('./bottender.config.js').messenger;

const bot = new MessengerBot({
	accessToken: config.accessToken,
	appSecret: config.appSecret,
	verifyToken: config.verifyToken,
	sessionStore: new FileSessionStore(),
});

const messageWaiting = eval(process.env.TIME_WAIT); // eslint-disable-line no-eval
if (messageWaiting) { bot.use(withTyping({ delay: messageWaiting })); }

const handler = require('./handler.js');


bot.onEvent(handler);

const server = createServer(bot);

server.listen(process.env.API_PORT, () => {
	console.log(`Server is running on ${process.env.API_PORT} port...`);
	console.log(`App: ${process.env.APP} & Page: ${process.env.PAGE}`);
});
