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
        
        await page.goto('https://www.banquemisr.com/ar-EG/MarketData/CurrencyExchangeRates', { 
            waitUntil: 'networkidle2',
            timeout: 60000 
        });

        await page.waitForSelector('.table-responsive', { timeout: 15000 });
        
        const data = await page.evaluate(() => {
            // Updated logic to match the visual structure in your screenshot
            const rows = Array.from(document.querySelectorAll('.table-responsive table tbody tr'));
            return rows.map(row => {
                const tds = row.querySelectorAll('td');
                // Based on the visual: td[0] is often icon/name, td[1] is buy, td[2] is sell
                return {
                    currency: tds[0]?.innerText.trim() || 'N/A',
                    buy: tds[1]?.innerText.trim() || 'N/A',
                    sell: tds[2]?.innerText.trim() || 'N/A'
                };
            }).filter(item => item.currency !== 'N/A');
        });
        
        await browser.close();
        res.json({ success: true, data });
        
    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));