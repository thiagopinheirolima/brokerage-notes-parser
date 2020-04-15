const utils = require('./utils');
const config = require('./config');

function calculate(transactions) {
    const data = {};

    for (const transaction of transactions) {
        if (data[transaction.name]) {
            if (transaction.type === config.BUY_STRING) {
                const currentValue = data[transaction.name].value * data[transaction.name].quantity;
                const incomingValue = (transaction.value * transaction.quantity) + transaction.tax;
                const totalQuantity = data[transaction.name].quantity + transaction.quantity;

                data[transaction.name] = {
                    quantity: totalQuantity,
                    value: utils.toFixed((currentValue + incomingValue) / totalQuantity)
                };
            } else {
                data[transaction.name].quantity -= transaction.quantity;
                if (data[transaction.name].quantity == 0) {
                    delete data[transaction.name];
                } else if (data[transaction.name].quantity < 0) {
                    throw 'Aconteceu uma venda maior que o número de ações, por favor verifique se você cadastrou as bonificações/subscrições corretamente';
                }
            }
        } else {
            if (transaction.type === config.BUY_STRING) {
                data[transaction.name] = {
                    quantity: transaction.quantity,
                    value: utils.toFixed(transaction.value + (transaction.tax / transaction.quantity))
                };
            } else {
                throw 'Aconteceu uma venda sem o cadastro da ação, por favor verifique se está ordenado corretamente';
            }
        }
    }
    return data;
};

module.exports = {
    calculate
};