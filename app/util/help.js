const dialogFlow = require('apiai-promise');
const gsjson = require('google-spreadsheet-to-json');
const accents = require('remove-accents');

// # Sentry
const Sentry = require('@sentry/node');

Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.ENV });
module.exports.Sentry = Sentry;

// # Dialogflow
module.exports.apiai = dialogFlow(process.env.DIALOGFLOW_TOKEN);

// # Google Spreadsheet
const privateKey = require('../private_key.json');

module.exports.reloadSpreadSheet = async () => {
	const results = await gsjson({
		spreadsheetId: process.env.SPREADKEY,
		credentials: privateKey,
		// hash: 'id',
	}).then(result => result).catch((err) => {
		console.log(err.message);
		console.log(err.stack);
		return undefined;
	});
	return results;
};

// # Regex
module.exports.mailRegex = new RegExp(/\S+@\S+/);

// # helpful functions
// get the answer using the intent
module.exports.findAnswerByIntent = async (array, keyword) => {
	const answer = array.find(x => (x.nomeIntent ? x.nomeIntent.trim() : 'error') === keyword); return answer;
};

// get the answer using the id
module.exports.findAnswerByID = async (array, id) => {
	const answer = array.find(x => x.idDaPergunta.toString() === id); return answer;
};

// get the answer using question ID
module.exports.findAllAnswersById = async (answers, ids) => {
	const results = [];
	ids.forEach(async (element) => {
		const found = answers.find(x => x.idDaPergunta === element);
		if (found) { results.push({ perguntaBotao: found.perguntaBotao, idDaPergunta: found.idDaPergunta }); }
	});
	return results;
};

module.exports.getRandomFrasesFallback = myArray => myArray[Math.floor(Math.random() * myArray.length)];

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
