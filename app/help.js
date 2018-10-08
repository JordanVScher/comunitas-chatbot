const dialogFlow = require('apiai-promise');

module.exports.apiai = dialogFlow(process.env.DIALOGFLOW_TOKEN);

const gsjson = require('google-spreadsheet-to-json');
const privateKey = require('./private_key.json');

async function reloadSpreadSheet() {
	const results = await gsjson({
		spreadsheetId: process.env.SPREADKEY,
		credentials: privateKey,
		// hash: 'id',
		// ignoreCol: 2,
	}).then(result => result).catch((err) => {
		console.log(err.message);
		console.log(err.stack);
		return undefined;
	});

	return results;
}

module.exports.reloadSpreadSheet = reloadSpreadSheet;
