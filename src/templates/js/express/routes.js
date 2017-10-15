const express = require('src/templates/js/index');
const router = express.Router();

// Routes go here

module.exports = router;


// Example endpoint

router.get('/', function (req, res) {
  res.send('Hello World');
});
