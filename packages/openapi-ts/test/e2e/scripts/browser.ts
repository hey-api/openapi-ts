import type { Browser, EvaluateFunc, Page } from 'puppeteer';
import puppeteer from 'puppeteer'

let _browser: Browser
let _page: Page

const start = async () => {
  // This starts a new puppeteer browser (Chrome)
  // and load the localhost page, this page will load the
  // javascript modules (see server.js for more info)
  _browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true
  })
  _page = await _browser.newPage()
  // _page.on('console', msg => console.log(msg.text()));
  await _page.goto(`http://localhost:3000/`, {
    waitUntil: 'networkidle0'
  })
}

const stop = async () => {
  await _page.close()
  await _browser.close()
}

const evaluate = async (fn: EvaluateFunc<unknown[]>) => await _page.evaluate(fn)

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
const exposeFunction = async (name: string, fn: Function) =>
  await _page.exposeFunction(name, fn)

export default {
  evaluate,
  exposeFunction,
  start,
  stop
}
