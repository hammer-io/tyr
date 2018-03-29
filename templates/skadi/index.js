const express = require('express');
const routes = require('./routes');
const skadi = require('skadi-hammerio');

const app = express();

// skadi library setup
skadi.heartbeat();
skadi.osdata();

// set our port
const port = process.env.PORT || 8080;

// skadi http request data capture
app.use((req, res, next) => {
  skadi.captureRequestData(req);
  next();
});

// routes
app.use('/', routes);

// skadi http response data capture
app.use((req, res, next) => {
  skadi.captureResponseData(req, res);
});

// start app at localhost:8080
app.listen(port);

console.log(`Listening on ${port}`);
module.exports = app;
