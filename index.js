const utils = require('./utils');
const historic = require('./historic');
const wallet = require('./wallet');

async function main() {
    const data = await historic.load();
    data.wallet = wallet.calculate(data.historic);
    utils.exportJSON(data);
}

main();