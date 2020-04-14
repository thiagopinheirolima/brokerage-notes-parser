const utils = require('./utils');
const config = require('./config');

function calculate(historic) {
    const data = {};

    for (const transaction of historic) {
        if (data[transaction.name]) {
            if (transaction.type === config.BUY_STRING) {
                const quantityTotal = data[transaction.name].quantity + transaction.quantity;
                data[transaction.name] = {
                    quantity: quantityTotal,
                    value: utils.toFloat(((data[transaction.name].value * data[transaction.name].quantity) + (transaction.value * transaction.quantity)) / quantityTotal)
                };
            } else {
                console.log('venda');
            }
        } else {
            if (transaction.type === config.BUY_STRING) {
                data[transaction.name] = {
                    quantity: transaction.quantity,
                    value: transaction.value
                };
            } else {
                throw 'Aconteceu uma venda sem o cadastro da ação, por favor verifique se está ordenado corretamente';
            }
        }
    }
    console.log(data);
    return data;
};

module.exports = {
    calculate
};