const express = require('express');
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const app = express();
const port = process.env.PORT || 8080;

app.get('/api/cbe', async (req, res) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            args: chromium.args,
            defaultViewport: chromium.defaultViewport,
            executablePath: await chromium.executablePath(),
            headless: chromium.headless,
        });
        const page = await browser.newPage();
        await page.goto('https://www.cbe.org.eg/', { waitUntil: 'networkidle2' });
        const data = await page.evaluate(() => ({ title: document.title }));
        await browser.close();
        res.json({ success: true, data });
    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));