const config = require('../config');

/*
    Insert your subscriptions and bonifications using
    name: Ticker of company
    type: Type of transaction, as setted on application config (config.BUY_STRING or config.SELL_STRING)
    quantity: Quantity
    value: Individual price
    total: Total amount, calculated by quantity * value
    tax: Total of taxes
    date: Date of transaction
*/

module.exports = [
    // Exemples:
    {
        "name": "XPLG13",
        "type": config.BUY_STRING,
        "quantity": 11,
        "value": 0.0,
        "total": 0.0,
        "tax": 0.0,
        "date": "12/09/2019"
    },
    {
        "name": "TIET2",
        "type": config.BUY_STRING,
        "quantity": 1,
        "value": 0.0,
        "total": 0.0,
        "tax": 0.0,
        "date": "18/08/2019"
    }
];