const unknowns = [];

const fs = require('fs');
const path = require('path');
const util = require('util');

const utils = require('./utils');
const config = require('./config');
const tickers = require('./tickers');
const extras = require('./input/extras');

const PDF2JSON = util.promisify(require('pdf-parser').pdf2json);


function getPDFFiles() {
    const INPUT_PATH = './input';
    const files = [];
    const fileNames = fs.readdirSync(INPUT_PATH).filter(f => f.endsWith('.pdf'));
    for (const fileName of fileNames) {
        const filePath = path.join(INPUT_PATH, fileName);
        const file = fs.readFileSync(filePath);
        files.push(file);
    }
    return files;
};

async function extractPages(pdfFiles) {
    const pages = [];
    for (const pdf of pdfFiles) {
        const data = await PDF2JSON(pdf);
        pages.push(...data.pages);
    }
    return pages;
};

function extractData(pages) {
    const data = [];
    for (const page of pages) {
        const date = getDate(page);
        const cost = getCost(page);
        const taxes = getTaxes(page);

        const pageTexts = [];

        for (const text of page.texts) {
            const clearText = utils.trimText(text.text);
            pageTexts.push(clearText);
        }

        data.push(...extractTransactions(pageTexts, date, cost, taxes));
    }
    return data;
};

function getDate(page) {
    const PIVOT_TEXT = 'Data pregão';
    for (let i = 0; i < page.texts.length; i++) {
        const text = page.texts[i].text;
        if (text === PIVOT_TEXT) {
            return page.texts[i + 1].text;
        }
    }

    throw 'Não foi possível encontrar a data de operação';
};

function getCost(page) {
    const PIVOT_TEXT = 'Resumo dos Negócios';
    for (let i = 0; i < page.texts.length; i++) {
        const text = page.texts[i].text;
        if (text === PIVOT_TEXT) {
            return utils.toFloat(page.texts[i - 1].text);
        }
    }

    throw 'Não foi possivel encontrar os custos';
};

function getTaxes(page) {
    let totalTaxes = 0.0;
    const CBL_STRING = 'Total CBLC';
    const VALUE_STRING = 'Valor líquido das operações';
    const BOVESPA_STRING = 'Total Bovespa / Soma';
    const COSTS_STRING = 'Total Custos / Despesas';
    const ZERO_TAX = 'D';

    for (let i = 0; i < page.texts.length; i++) {
        const text = page.texts[i].text;

        if (text === CBL_STRING) {
            totalTaxes = utils.toFixed(totalTaxes + utils.toFloat(page.texts[i - 1].text));
        }

        if (text === VALUE_STRING) {
            totalTaxes = utils.toFixed(totalTaxes - utils.toFloat(page.texts[i - 1].text));
            if (totalTaxes < 0) {
                totalTaxes *= -1;
            }
        }

        if (text === BOVESPA_STRING) {
            if (page.texts[i - 1].text != ZERO_TAX)
                totalTaxes = utils.toFixed(totalTaxes + utils.toFloat(page.texts[i - 1].text));
        }

        if (text === COSTS_STRING) {
            totalTaxes = utils.toFixed(totalTaxes + utils.toFloat(page.texts[i - 1].text));
        }
    }

    return totalTaxes;
};

function calculateTax(value, cost, tax) {
    return tax == 0 ? 0 : utils.toFixed(value / cost * tax);
};

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
            const name = getTicker(pageTexts[pivotIndex + 2]);
            const quantity = parseInt(pageTexts[i - 3]);
            const value = utils.toFloat(pageTexts[i - 2]);
            const tax = calculateTax(quantity * value, cost, taxes);
            const type = pageTexts[pivotIndex] === DOC_BUY_STRING ? config.BUY_STRING : config.SELL_STRING;
            transactions.push({ name, date, type, quantity, value, tax });
            continue;
        }

        if (text === DOC_END_STRING) {
            break;
        }
    }
    return transactions;
};

function getTicker(str) {
    const FII = "FII";
    if (str.startsWith(FII)) {
        // So far its working: get the 2nd last name
        const arr = str.split(' ');
        return arr[arr.length - 2];
    } else if (tickers[str]) {
        return tickers[str];
    } else {
        unknowns.push(str);
        return str;
    }
};

async function load() {
    const files = getPDFFiles();
    const pages = await extractPages(files);
    const data = extractData(pages);
    data.push(...extras);
    return { transactions: utils.sortByDate(data), unknowns };
};


module.exports = { load };