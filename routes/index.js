var express = require('express');
var router = express.Router();

//var mys = require('../bin/mys');

/* GET home page. */
router.get('/', function(req, res, next) {
  req.session.pass = "index.js";
  res.render('index', { });
});

router.get('/ajax', function(req, res, next) {
  res.send("Hello from server!");
});


router.get('/phones.json', function(req, res, next) {
function accept(req, res) {
    file.serve(req, res);
  }
});


router.get('/m', function(req, res, next) {
  res.send("req.session.id="+req.session.id+
    ", req.session.cookie.expires="+req.session.cookie.expires+
    ", req.session.cookie.maxAge="+req.session.cookie.maxAge+
    ", req.session.store="+req.session.store+
    ", req.session.name="+req.session.name+
    ", cookie.path="+req.session.cookie.path);
});

module.exports = router;
