'use strict';

const puppeteer = require('puppeteer');

let browser;
let page;

async function start() {
    // This starts the a new  puppeteer browser (Chrome)
    // and load the localhost page, this page will load the
    // javascript modules (see server.js for more info)
    browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    page = await browser.newPage();
    // page.on('console', msg => console.log(msg.text()));
    await page.goto(`http://localhost:3000/`, {
        waitUntil: 'networkidle0',
    });
}

async function stop() {
    await page.close();
    await browser.close();
}

async function evaluate(fn, ...args) {
    return await page.evaluate(fn, args);
}

async function exposeFunction(name, fn) {
    return await page.exposeFunction(name, fn);
}

module.exports = {
    start,
    stop,
    evaluate,
    exposeFunction,
};
