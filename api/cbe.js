const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

module.exports = async (req, res) => {
  let browser = null;
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto('https://www.cbe.org.eg/en/economic-research/statistics/cbe-exchange-rates', {
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    const data = await page.evaluate(() => {
      const result = [];
      const table = document.querySelector('table');
      if (!table) return [];
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const tds = row.querySelectorAll('td');
        if (tds.length >= 3) {
          result.push({
            currency: tds[0].innerText.trim(),
            buy: tds[1].innerText.trim(),
            sell: tds[2].innerText.trim()
          });
        }
      });
      return result;
    });

    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    if (browser !== null) await browser.close();
  }
};