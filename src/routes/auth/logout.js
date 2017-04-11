const path = require('path');
var express = require('express');
var database = require(path.join(__base, 'database', 'database'));
var router = express.Router();

router.get('/', function (req, res) {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
