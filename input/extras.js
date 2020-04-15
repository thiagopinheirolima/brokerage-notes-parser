const config = require('../config');

/*
    Insert your subscriptions, bonifications, ...
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
    // {
    //     name: "XPLG13",
    //     type: config.BUY_STRING,
    //     quantity: 11,
    //     value: 0.0,
    //     tax: 0.0,
    //     date: "12/09/2019"
    // },
    // {
    //     name: "TIET2",
    //     type: config.BUY_STRING,
    //     quantity: 1,
    //     value: 0.0,
    //     tax: 0.0,
    //     date: "18/08/2019"
    // },
    // {
    //     name: "MXRF11",
    //     type: config.BUY_STRING,
    //     quantity: 27,
    //     value: 10.51,
    //     tax: 0.0,
    //     date: "22/04/2019"
    // },
    // {
    //     name: "EZTC3",
    //     type: config.BUY_STRING,
    //     quantity: 10,
    //     value: 15.82,
    //     tax: 0.0,
    //     date: "26/04/2019"
    // },
    // {
    //     name: "VISC11",
    //     type: config.BUY_STRING,
    //     quantity: 3,
    //     value: 108,
    //     tax: 0.0,
    //     date: "27/08/2019"
    // },
    // {
    //     name: "BCFF11",
    //     type: config.BUY_STRING,
    //     quantity: 7,
    //     value: 85,
    //     tax: 0.0,
    //     date: "10/10/2019"
    // },
    // {
    //     name: "BIDI4",
    //     type: config.BUY_STRING,
    //     quantity: 70,
    //     value: 0.0,
    //     tax: 0.0,
    //     date: "17/07/2019"
    // }
];