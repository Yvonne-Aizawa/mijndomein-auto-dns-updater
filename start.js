Object.defineProperty(exports, "__esModule", { value: true });
const config = require('config');
const myArgs = process.argv.slice(2);
let InputId = '';
console.log(myArgs)
if(myArgs.length == 0) { 
    console.log('Geen argumenten meegegeven, gebruik: node start.js CNAME record'),
    process.exit(1); 
} else {
    var record = myArgs[0];

} 
exports.default = async ({ page }) => {
    // Full puppeteer API is available
    console.log('Starting script...');
    console.log('we gaan naar de login pagina');
    await page.goto('https://auth.mijndomein.nl/login');
    await page.type('input[type="email"]', config.get('mijndomein.email'));
    await page.type('input[type="password"]', config.get('mijndomein.wachtwoord'));
    await Promise.all([
        page.click('body > div > div > div > div > div:nth-child(3) > form > div:nth-child(5) > button'),
        console.log('we gaan inloggen'),
        page.waitForNavigation(),
    ]);
    console.log('we zijn ingelogd');
    await AcceptCookiePolicyIfExists(page)
    await page.goto('https://www.mijndomein.nl/account/product/dmp/' + config.get('mijndomein.domein'));
    await page.waitForTimeout(1000);
    await Promise.all([
        page.click(' main> ul > li:first-child + li'),
        console.log('we gaan naar de dns pagina'),
        page.waitForNavigation(),
    ]);
    await AcceptCookiePolicyIfExists(page)
    console.log('we zijn op de dns pagina');
    await page.waitForTimeout(1000);
    //get all input fields
    const inputFields = await page.$$('input[id$=name]');
    //get all values from input fields that start with _acme-challenge
    const inputValues = await page.$$eval('input[id$=name]', inputs => inputs.filter(input => input.value.startsWith('_acme-challenge')).map(input => input.id));
    //get the first id of the input field
    InputId = inputValues[0].replace('name', 'content');

    await clear(page, 'input[id="' + InputId + '"]');
    await page.type('#' + InputId, record);
    console.log('we gaan de dns aanpassen'),
    await page.click('#dnsedit_submit'),
    await page.waitForTimeout(1000);
    console.log('we zijn klaar');


};
async function AcceptCookiePolicyIfExists(page){
    await page.waitForTimeout(1000);
    if(await page.$('#dd_popup_container_side_acceptButton') !== null){
        await page.click('#dd_popup_container_side_acceptButton');
        return true;
    }
    return false;
}

async function clear(page, selector) {
    await page.evaluate(selector => {
      document.querySelector(selector).value = "";
    }, selector);
  }
