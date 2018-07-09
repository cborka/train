var express = require('express');
var router = express.Router();

/*
** Домашняя страница
 */
router.get('/', function(req, res, next) {
  var login = req.session.login;

  if (login == undefined || login == "")
    res.render('index', { });
  else
    res.redirect('/users/home');
});

/*
** Тестовые страницы
 */

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
