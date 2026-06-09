const puppeteer = require('puppeteer');

module.exports = async (req, res) => {
    let browser;
    try {
        // Launch the browser with specific arguments for Linux environments
        browser = await puppeteer.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        
        // Navigate to the target website
        await page.goto('https://www.cbe.org.eg/', { waitUntil: 'networkidle2' });

        // Extract data from the page
        const data = await page.evaluate(() => {
            return {
                pageTitle: document.title,
                timestamp: new Date().toISOString()
            };
        });

        await browser.close();
        
        // Return the success response
        res.status(200).json({
            success: true,
            data: data
        });

    } catch (error) {
        // Ensure the browser is closed in case of an error
        if (browser) {
            await browser.close();
        }
        
        // Return the error response
        res.status(500).json({
            success: false,
            message: 'An error occurred during execution',
            error: error.message
        });
    }
};