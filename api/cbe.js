const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

const app = express();
const port = process.env.PORT || 8080;

app.get('/api/cbe', async (req, res) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            args: [...chromium.args, '--disable-blink-features=AutomationControlled'],
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
        
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');
        
        await page.goto('https://www.banquemisr.com/ar-EG/MarketData/CurrencyExchangeRates', { waitUntil: 'networkidle2' });
        
        const data = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('.table-responsive table tbody tr'));
            return rows.map(row => {
                const tds = row.querySelectorAll('td');
                if (tds.length < 3) return null;
                return {
                    currency: tds[0]?.innerText.trim(),
                    sell: tds[1]?.innerText.trim(),
                    buy: tds[2]?.innerText.trim()
                };
            }).filter(item => item !== null);
        });
        
        await browser.close();
        res.json({ success: true, data });
    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));