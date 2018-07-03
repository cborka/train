var express = require('express');
var router = express.Router();

//var mys = require('../bin/mys');

/* GET home page. */
router.get('/', function(req, res, next) {
  req.mys.pass = "index.js";
  res.render('index', { });
});

router.get('/m', function(req, res, next) {
  res.send("req.mys.pass:"+req.mys.pass+","+req.mys.xxx);
});

module.exports = router;
