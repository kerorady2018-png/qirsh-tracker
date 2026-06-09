const express = require('express');
const app = express();
const cbeHandler = require('./api/cbe');

app.get('/api/cbe', cbeHandler);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});