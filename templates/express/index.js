const express = require('express');
const routes = require('./routes');

// set our port
const port = process.env.PORT || 8080;

const app = express();

// routes
app.use('/', routes);

// start app at localhost:8080
app.listen(port);

console.log(`Listening on ${port}`);
module.exports = app;