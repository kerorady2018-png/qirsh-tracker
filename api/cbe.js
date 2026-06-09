const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true
        });

        const page = await browser.newPage();
        await page.goto('https://www.cbe.org.eg/en/economic-research/statistics/cbe-exchange-rates', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        const data = await page.evaluate(() => {
            const rows = Array.from(document.querySelectorAll('table tbody tr'));
            return rows.map(row => {
                const tds = row.querySelectorAll('td');
                return {
                    currency: tds[0]?.innerText.trim(),
                    buy: tds[1]?.innerText.trim(),
                    sell: tds[2]?.innerText.trim(),
                };
            }).filter(item => item.currency);
        });

        res.status(200).json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    } finally {
        if (browser !== null) await browser.close();
    }
};
