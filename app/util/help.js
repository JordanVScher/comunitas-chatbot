const gsjson = require('google-spreadsheet-to-json');
const accents = require('remove-accents');
const chatbaseUser = require('@google/chatbase')
	.setApiKey(process.env.MY_CHATBASE_KEY)
	.setPlatform('Messenger')
	.setAsTypeUser();

async function sendMessage(userID, message) {
	chatbaseUser.newMessage()
		.setVersion('1.0')
		.setUserId(userID)
		.setMessage(message)
		.setAsHandled()
		.setIntent()
		.send()
		.then((msg) => console.log(msg.getCreateResponse()))
		.catch((err) => console.error(err));
}

async function sendIntent(userID, intent, message) {
	chatbaseUser.newMessage()
		.setVersion('1.0')
		.setUserId(userID)
		.setMessage(message)
		.setAsHandled()
		.setIntent(intent)
		.send()
		.then((msg) => console.log(msg.getCreateResponse()))
		.catch((err) => console.error(err));
}

module.exports.sendMessage = sendMessage;
module.exports.sendIntent = sendIntent;

// # Sentry
const Sentry = require('@sentry/node');

Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.ENV });
module.exports.Sentry = Sentry;

// # Google Spreadsheet
const privateKey = require('../../google_private_key.json');

module.exports.reloadSpreadSheet = async () => {
	const results = await gsjson({
		spreadsheetId: process.env.SPREADKEY,
		credentials: privateKey,
		// hash: 'id',
	}).then((result) => result).catch((err) => {
		console.log(err.message);
		console.log(err.stack);
		return undefined;
	});
	return results;
};

// # Regex
module.exports.mailRegex = new RegExp(/\S+@\S+/);

// # helpful functions
// get the answer from the spreadsheet json using the intent
module.exports.findAnswerByIntent = async (array, keyword) => {
	const answer = array.find((x) => (x.nomeIntent ? x.nomeIntent.trim() : 'error') === keyword); return answer;
};

// get the answer from the spreadsheet json using the id
module.exports.findAnswerByID = async (array, id) => {
	const answer = array.find((x) => x.idDaPergunta.toString() === id); return answer;
};

// get the answer from the spreadsheet json using question ID
module.exports.findAllAnswersById = async (answers, ids) => {
	const results = [];
	ids.forEach(async (element) => {
		const found = answers.find((x) => x.idDaPergunta === element);
		if (found) { results.push({ perguntaBotao: found.perguntaBotao, idDaPergunta: found.idDaPergunta }); }
	});
	return results;
};

module.exports.getRandomFrasesFallback = (myArray) => myArray[Math.floor(Math.random() * myArray.length)];

async function formatString(text) {
	let result = text.toLowerCase();
	result = await result.replace(/([\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF])/g, '');
	result = await accents.remove(result);
	if (result.length >= 250) {
		result = result.slice(0, 250);
	}
	return result.trim();
}
module.exports.formatString = formatString;
