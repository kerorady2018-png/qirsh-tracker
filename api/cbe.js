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
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        await page.goto('https://www.cbe.org.eg/en/economic-research/statistics/cbe-exchange-rates', { waitUntil: 'networkidle2' });
        
        const data = await page.evaluate(() => {
            const table = document.querySelector('table');
            const rows = Array.from(table.querySelectorAll('tbody tr'));
            return rows.map(row => {
                const tds = row.querySelectorAll('td');
                return {
                    currency: tds[0]?.innerText.trim(),
                    buy: tds[1]?.innerText.trim(),
                    sell: tds[2]?.innerText.trim()
                };
            });
        });
        
        await browser.close();
        res.json({ success: true, data });
    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));