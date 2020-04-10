const INPUT_PATH = './input';
const BUY_STRING = 'Compra';
const SELL_STRING = 'Venda';
const TO_CSV = false;
const UNKNOWNS = [];

const f = require('fs');
const p = require('path');
const u = require('util');
const moment = require('moment');
const tickers = require('./tickers');
const extras = require('./input/extras');
const PDF2JSON = u.promisify(require('pdf-parser').pdf2json);

main();

async function main() {
    const files = getPDFFiles(INPUT_PATH);
    const pages = await extractPages(files);
    const data = extractData(pages);
    data.push(...extras);
    const sortedData = sortByDate(data);
    saveFile(sortedData);
    console.log(`${UNKNOWNS.length} Unknown Tickers: `, UNKNOWNS.join(', '));
}

function getPDFFiles(path) {
    const files = [];
    const fileNames = f.readdirSync(path).filter(f => f.endsWith('.pdf'));
    for (const fileName of fileNames) {
        const filePath = p.join(path, fileName);
        const file = f.readFileSync(filePath);
        files.push(file);
    }
    return files;
}

async function extractPages(PDFFiles) {
    const pages = [];
    for (const PDF of PDFFiles) {
        const data = await PDF2JSON(PDF);
        pages.push(...data.pages);
    }
    return pages;
}

function extractData(pages) {
    const data = [];
    for (const page of pages) {
        const date = getDate(page);
        const cost = getCost(page);
        const taxes = getTaxes(page);

        const pageTexts = [];

        for (const text of page.texts) {
            const trimmedText = text.text.replace(/\s\s+/g, ' ').trim();
            pageTexts.push(trimmedText);
        }

        data.push(...extractTransactions(pageTexts, date, cost, taxes));
    }
    return data;
}

function getDate(page) {
    for (let i = 0; i < page.texts.length; i++) {
        const text = page.texts[i].text;
        if (text === 'Data pregão') {
            return page.texts[i + 1].text;
        }
    }

    throw 'Não foi possível encontrar a data de operação';
}

function getCost(page) {
    for (let i = 0; i < page.texts.length; i++) {
        const text = page.texts[i].text;
        if (text === 'Resumo dos Negócios') {
            return toFloat(page.texts[i - 1].text);
        }
    }

    throw 'Não foi possivel encontrar os custos';
}

function getTaxes(page) {
    let taxes = 0;
    const CBL_STRING = 'Total CBLC';
    const VALUE_STRING = 'Valor líquido das operações';
    const BOVESPA_STRING = 'Total Bovespa / Soma';
    const COSTS_STRING = 'Total Custos / Despesas';
    const ZERO_TAX = 'D';

    for (let i = 0; i < page.texts.length; i++) {
        const text = page.texts[i].text;

        if (text === CBL_STRING) {
            taxes = toFixed(taxes + toFloat(page.texts[i - 1].text));
        }

        if (text === VALUE_STRING) {
            taxes = toFixed(taxes - toFloat(page.texts[i - 1].text));
            if (taxes < 0) {
                taxes *= -1;
            }
        }

        if (text === BOVESPA_STRING) {
            if (page.texts[i - 1].text != ZERO_TAX)
                taxes = toFixed(taxes + toFloat(page.texts[i - 1].text));
        }

        if (text === COSTS_STRING) {
            taxes = toFixed(taxes + toFloat(page.texts[i - 1].text));
        }
    }

    return toFixed(taxes);
}

function extractTransactions(pageTexts, date, cost, taxes) {
    const transactions = [];

    let pivotIndex = 0;
    const DOC_BUY_STRING = 'C';
    const DOC_SELL_STRING = 'V';
    const DOC_BUY_END_STRING = 'D';
    const DOC_SELL_END_STRING = 'C';
    const DOC_START_STRING = '1-BOVESPA';
    const DOC_END_STRING = 'NOTA DE NEGOCIAÇÃO';

    for (let i = 0; i < pageTexts.length; i++) {
        const text = pageTexts[i];

        if (text === DOC_START_STRING) {
            pivotIndex = i + 1;
            continue;
        }

        if ((text === DOC_BUY_END_STRING && (pageTexts[i + 1] === DOC_START_STRING || pageTexts[i + 1] === DOC_END_STRING)) || (text === DOC_SELL_END_STRING && pageTexts[pivotIndex] === DOC_SELL_STRING)) {
            transactions.push({
                type: pageTexts[pivotIndex] === DOC_BUY_STRING ? BUY_STRING : SELL_STRING,
                name: getTicker(pageTexts[pivotIndex + 2]),
                quantity: removeDot(pageTexts[i - 3]),
                value: removeDot(pageTexts[i - 2]),
                total: removeDot(pageTexts[i - 1]),
                tax: getTax(pageTexts[i - 1], cost, taxes),
                date
            });
            continue;
        }

        if (text === DOC_END_STRING) {
            break;
        }
    }
    return transactions;
}

function parseToCSV(data) {
    const text = [];
    for (const _ of data) {
        text.push(`${_.name},${_.date},"${_.value}",${_.quantity},${_.type},"${_.tax}"\n`);
    }
    return text.join('');
}

function sortByDate(data) {
    return data.sort((a, b) => {
        const date1 = moment(a.date, 'DD/MM/YYYY');
        const date2 = moment(b.date, 'DD/MM/YYYY');
        return date1.diff(date2);
    });
}

function toFloat(value) {
    return toFixed(parseFloat(value.toString().replace(/\./g, '').replace(/,/g, '')) / 100);
}

function toFixed(value) {
    return parseFloat(value.toFixed(2));
}

function getTax(value, cost, tax) {
    return tax == 0 ? 0 : toFixed(toFloat(value) / cost * tax).toString().replace('.', ',');
}

function removeDot(value) {
    return value.replace(/\./g, '');
}

function getTicker(str) {
    const FII = "FII";
    if (str.startsWith(FII)) {
        // So far its working: get the 2nd last name
        const arr = str.split(' ');
        return arr[arr.length - 2];
    } else if (tickers[str]) {
        return tickers[str];
    } else {
        UNKNOWNS.push(str);
        return str;
    }
}

function saveFile(data) {
    const fileName = TO_CSV ? 'output.csv' : 'output.json';
    if (TO_CSV) {
        f.writeFileSync(fileName, parseToCSV(data));
    } else {
        f.writeFileSync(fileName, JSON.stringify(data));
    }
}