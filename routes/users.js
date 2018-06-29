var express = require('express');
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

//
// Показать пользователя из БД
//
router.get('/select/:id', function(req, res, next) {
  var id = req.params.id; // получаем id
  db.one("SELECT id, login, phone FROM users WHERE id=$1", id)
    .then(function (data) {
//      res.send(data);
      res.render('users/user', data); // Показ формы
    })
    .catch(function (error) {
      res.send("код ошибки: "+error.code+"<br> получено: "+error.received+"<br> запрос: "+error.query);
    });
});

//
// Добавление пользователя, корректировка данных пользователя
//
router.post('/update', function(req, res, next) {
  var id = req.body.id;
  var login = req.body.login;
  var phone = req.body.phone;
  if (id > 0 ) {
//    res.send("id="+id+"login="+login+" Phone="+ phone);
//    res.send("Обновление данных пользователя");
    db.none("UPDATE users SET phone=$1 WHERE id=$2", [phone, id])
      .then (function () {
        res.redirect('/users/select/'+id);
//        res.send("Обновления записаны в БД.");
      })
      .catch(function (error) {
//      res.send("код ошибки: "+error.code+"<br> получено: "+error.received+"<          br> запрос: "+error.query);
        res.send(error);
      });
  }
  else {
//    res.send("Добавление нового пользователя");
    db.none("INSERT INTO users (login, phone) VALUES ($1, $2)", [login, phone])
      .then (function () {
        res.send("Запись добавлена в БД.");
      })
      .catch(function (error) {
//        res.send("код ошибки: "+error.code+"<br> получено: "+error.received+"<          br> запрос: "+error.query);
        res.send(error);
      });
  }
});

//
// Показать список пользователей
//
router.get('/all', function(req, res, next) {
  db.any("SELECT id, login, phone FROM users ORDER BY 2")
    .then(function (data) {
//      res.send(data[1].login);
//      res.send(data);
      var usr2 = "qwweerrr"; //data[1].login;
      res.render('users/users', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});



//{{#each data}}
//<br>     {{login}} - {{phone}} - {{id}}.
//{{/each}}



  module.exports = router;
