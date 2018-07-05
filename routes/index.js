var express = require('express');
var router = express.Router();

//var mys = require('../bin/mys');

/* GET home page. */
router.get('/', function(req, res, next) {
  login = req.session.login;
//  res.send("("+login+")");

  if (login == "" || login == undefined)
    res.render('index', { });
  else
    res.redirect('/users/home');
});

router.get('/ajax', function(req, res, next) {
  res.send("Hello from server!");
});

router.post('/ajax', function(req, res, next) {
  var msg = req.body.msg;
  res.send("Hello from server! "+msg);
});



router.get('/m', function(req, res, next) {
    res.send("req.session.id="+req.session.id+
    ", req.session.cookie.expires="+req.session.cookie.expires+
    ", req.session.cookie.maxAge="+req.session.cookie.maxAge+
    ", req.session.store="+req.session.store+
    ", req.session.name="+req.session.name+
    ", cookie.path="+req.session.cookie.path);
});

router.get('/sess', function(req, res, next) {
  res.send(req.session);
});

module.exports = router;
