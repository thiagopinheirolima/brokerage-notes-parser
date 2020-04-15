const utils = require('./utils');
const transactions = require('./transactions');
const wallet = require('./wallet');

async function main() {
    const data = await transactions.load();
    data.wallet = wallet.calculate(data.transactions);
    utils.exportJSON(data);
}

main();