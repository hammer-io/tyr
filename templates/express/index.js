const express = require('express');
const routes = require('./routes');

const app = express();

// set our port
const port = process.env.PORT || 8080;

// routes
app.use('/', routes);

// start app at localhost:8080
app.listen(port);

console.log(`Listening on ${port}`);
module.exports = app;