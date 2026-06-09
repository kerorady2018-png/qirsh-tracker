const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = process.env.PORT || 8080;

app.get('/api/cbe', async (req, res) => {
    let browser;
    try {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.goto('https://www.cbe.org.eg/', { waitUntil: 'networkidle2' });
        const data = await page.evaluate(() => ({ title: document.title }));
        await browser.close();
        res.json({ status: "success", data });
    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({ status: "error", message: error.message });
    }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));