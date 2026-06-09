const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
    let browser;
    try {
        // Launching browser with advanced stealth settings to mimic a real user
        browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--window-size=1920,1080',
                '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            ],
            headless: 'new'
        });

        const page = await browser.newPage();

        // Setting a realistic viewport
        await page.setViewport({ width: 1920, height: 1080 });

        // Adding extra headers to look like a legitimate browser request
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
        });

        // Navigate to the target website with a timeout limit
        await page.goto('https://www.cbe.org.eg/en', { 
            waitUntil: 'domcontentloaded', 
            timeout: 60000 
        });

        // Professional data extraction logic
        const data = await page.evaluate(() => {
            // This is a placeholder; you need to inspect the CBE page 
            // to find the exact CSS selectors for the currency data.
            return {
                pageTitle: document.title,
                fetchedAt: new Date().toISOString(),
                // Example: selector for a currency table
                // currencyValue: document.querySelector('.currency-table')?.innerText 
            };
        });

        await browser.close();

        res.status(200).json({
            success: true,
            data: data
        });

    } catch (error) {
        if (browser) await browser.close();
        res.status(500).json({
            success: false,
            message: 'Failed to access the Central Bank of Egypt website',
            error: error.message
        });
    }
};