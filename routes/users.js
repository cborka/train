var express = require('express');
//var bodyParser = require("body-parser");
var router = express.Router();


var pgp = require("pg-promise")(/*options*/);
var db = pgp(process.env.PG_CONNECT);
//var db = pgp('postgresql://postgres:@127.0.0.1:5432/zkpde');


/* GET users list */
router.get('/', function(req, res, next) {
  res.send('respond with a resource'+process.env.PG_CONNECT);
});

router.get('/tst/:parqq', function(req, res, next) {
  var parqq = req.params["parqq"]; // получаем id
  res.send('param param: '+parqq);
});

// Показать пользователя из БД
router.get('/select/:id', function(req, res, next) {
  var id = req.params.id; // получаем id
  db.one("SELECT id, login FROM users WHERE id=$1", id)
    .then(function (data) {
//      res.send(data);
      res.render('users/user', data); // Показ формы
    })
    .catch(function (error) {
      res.send("код ошибки: "+error.code+"<br> получено: "+error.received+"<br> запрос: "+error.query);
    });
});


// Показать пользователя из БД
router.post('/write', function(req, res, next) {
  var id = req.params.id; // получаем id
  db.one("SELECT id, login FROM users WHERE id=$1", id)
    .then(function (data) {
//      res.send(data);
      res.render('users/user', data); // Показ формы
    })
    .catch(function (error) {
      res.send("код ошибки: "+error.code+"<br> получено: "+error.received+"<br> запрос: "+error.query);
    });
});



module.exports = router;
