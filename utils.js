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
    // TODO REVER ESSA FUNÇÃO
    return toFixed(parseFloat(str.toString().replace(/\./g, '').replace(/,/g, '')) / 100);
};

function toFixed(str) {
    // TODO REVER ESSA FUNÇÃO
    return parseFloat(str.toFixed(2));
};

function removeDot(str) {
    // TODO REVER ESSA FUNÇÃO
    return str.replace(/\./g, '');
};

function trimText(str) {
    return str.replace(/\s\s+/g, ' ').trim();
};

module.exports = {
    exportJSON,
    sortByDate,
    toFixed,
    toFloat,
    removeDot,
    trimText
};