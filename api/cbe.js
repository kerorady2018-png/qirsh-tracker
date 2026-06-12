const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/api/cbe', async (req, res) => {
    const apiKey = '22950cdd66502e2bee322124';
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/USD/EGP`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.conversion_rate) {
            res.json({
                status: 'success',
                pair: 'USD/EGP',
                price: data.conversion_rate,
                source: 'ExchangeRate-API',
                timestamp: new Date().toISOString()
            });
        } else {
            res.status(500).json({ status: 'error', message: 'Invalid data from API' });
        }
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});