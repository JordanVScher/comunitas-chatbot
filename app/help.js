const dialogFlow = require('apiai-promise');
const gsjson = require('google-spreadsheet-to-json');

const privateKey = require('./private_key.json');

module.exports.apiai = dialogFlow(process.env.DIALOGFLOW_TOKEN);

async function reloadSpreadSheet() {
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
}

module.exports.reloadSpreadSheet = reloadSpreadSheet;

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
