const OUTPUT_FILE = 'output.json';

const fs = require('fs');
const moment = require('moment');

function exportJSON(json) {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(json));
};

function sortByDate(arr) {
    return arr.sort((a, b) => {
        const date1 = moment(a.date, 'DD/MM/YYYY');
        const date2 = moment(b.date, 'DD/MM/YYYY');
        return date1.diff(date2);
    });
};

function toFloat(str) {
    return parseFloat(str.replace(/\./g, '').replace(/,/g, '.'));
};

function toFixed(n) {
    return parseFloat(n.toFixed(2));
};

function trimText(str) {
    return str.replace(/\s\s+/g, ' ').trim();
};

module.exports = {
    exportJSON,
    sortByDate,
    toFixed,
    toFloat,
    trimText
};