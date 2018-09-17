var express = require('express');
var router = express.Router();
var md5 = require('crypto-md5/md5');

var db = require("../db");
//var pgp = require("pg-promise")(/*options*/);
//var db = pgp(process.env.PG_CONNECT);

/* GET users list */
router.get('/', function(req, res, next) {
  res.redirect('/users/all/');
//  res.send('Строка подключения к БД: '+process.env.PG_CONNECT);
});

/*
** Показать пользователя из БД
*/
router.get('/select/:id', function(req, res, next) {
  var id = req.params.id; // получаем id
  db.one("SELECT id, login, phone FROM users WHERE id=$1", id)
    .then(function (data) {
      res.render('users/user', data); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
//      res.send("код ошибки: "+error.code+"<br> получено: "+error.received+"<br> запрос: "+error.query);
    });
});

/*
** Добавить пользователя в БД
*/
router.get('/addnew', function(req, res, next) {
  db.one("SELECT 0 AS id, '' AS login, '' AS phone")
    .then(function (data) {
      res.render('users/user', data); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

/*
** Удалить пользователя из БД
*/
router.get('/delete/:id', function(req, res, next) {
  var id = req.params.id; // получаем id
  db.none("DELETE FROM users WHERE id=$1", id)
    .then(function () {
      res.redirect('/users/all'); // Обновление списка пользователей
    })
    .catch(function (error) {
      res.send(error);
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
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//    res.send("Добавление нового пользователя");
    db.one("INSERT INTO users (login, phone) VALUES ($1, $2) RETURNING id;", [login, phone])
      .then (function (data) {
        res.redirect('/users/select/'+data.id);
      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

//
// Показать список пользователей
//
router.get('/all', function(req, res, next) {
  db.any("SELECT id, login, fullname FROM users ORDER BY 2")
    .then(function (data) {
      res.render('users/users', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Регистрация пользователя
//
router.get('/reg', function(req, res, next) {
  res.render('users/reg', {id: "0"});
});
router.post('/reg', function(req, res, next) {
  var login = req.body.login;
  var password = req.body.password;
  var fullname = req.body.fullname;
//  res.send("pass="+password+"("+md5(password)+"), login="+login+", fullname="+ fullname);
  db.one("INSERT INTO users (login, password, fullname) VALUES ($1, $2, $3) RETURNING id;", [login, md5(password), fullname])
    .then (function (data) {
      res.redirect('/users/login?login='+login);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Вход в систему
//
// Вводим логин и пароль
router.get('/login', function(req, res, next) {
  var login = req.params.login;
  res.render('users/login', {login: login});
});

// Настраиваем сессию
router.post('/login', function(req, res, next) {
  var login = req.body.login;
  var password = req.body.password;

  req.session.pass = password;
  req.session.password = md5(password);
  req.session.login = login;

  db.one("SELECT id, fullname FROM users WHERE login = $1 and password = $2", [login, md5(password)])
    .then (function (data) {
      req.session.uid = data.id;
      req.session.fullname = data.fullname;

      res.redirect('/');
//      res.send(data.cnt);
    })
    .catch(function (error) {
      res.send(error);
    });
});

// Идём на СВОЮ домашнюю страницу
router.get('/home', function(req, res, next) {

  if (req.session.login == undefined)
      res.redirect('/');

  res.render('users/home', req.session);
//  res.send('Здравствуй, пользователь №'+ id);
});

// Выход
router.get('/logout', function(req, res, next) {
  req.session.destroy(function(err) {
    res.redirect('/');
  })
});

//
// Проверка, свободно ли имя?
//
router.post('/isLoginFree', function(req, res, next) {
  var login = req.body.login;
  db.one("SELECT count(*) AS cnt FROM users WHERE login = $1", login)
    .then (function (data) {
      res.send(data.cnt);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Проверка, есть ли такой пользователь?
//
router.post('/isValidUser', function(req, res, next) {
  var login = req.body.login;
  var password = req.body.password;
  db.one("SELECT count(*) AS cnt FROM users WHERE login = $1 and password = $2", [login, md5(password)])
    .then (function (data) {
      res.send(data.cnt);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Сформировать и возвратить меню пользователя на основе имеющихся у него ПРАВ
//
router.get('/get_main_menu', function(req, res, next) {
  var id = req.session.uid;

  // Пользователь не зашёл в систему, начальное меню
  if (id == "" || id == undefined)
  {
    var result = '<a href="/" >Главная</a> | <a href="/users/login">Вход</a> | <a href="/users/reg">Регистрация</a>';
    res.send(result);
    return;
  }

  db.any(
    "SELECT right_name, url, menu_delimiter " +
      "FROM user_rights " +
      "WHERE user_rf = $1 AND menu_order > 0" +
      "ORDER BY menu_order, right_name", id)
    .then (function (data) {
        var result = 'Меню '+ req.session.login +
          ':<br>  <a href="/" >Домой</a> | <a href="/users/logout">Выход</a> | ';
        for (var i = 0; i < data.length; i++) {
          result = result + ' <a href="'+ data[i].url +'" >'+data[i].right_name + '</a> '+data[i].menu_delimiter;
        }
        res.send(result);
    })
    .catch(function (error) {
      res.send(error);
    });

});

//
// Показать список ПРАВ пользователей
//
router.get('/rights/all', function(req, res, next) {
  db.any("" +
    "SELECT u.id, u.login, ur.right_name, ur.url, ur.menu_delimiter, ur.menu_order " +
      "FROM user_rights ur " +
        "LEFT JOIN users u ON u.id = ur.user_rf " +
      "ORDER BY u.login, ur.menu_order, ur.right_name")
    .then(function (data) {
      res.render('users/rights/rights', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

/*
** Добавить новое ПРАВО пользователя
*/
router.get('/rights/addnew', function(req, res, next) {
  db.one("SELECT 0 AS id, '' AS login, '' AS right_name, '' AS url, '|' AS menu_delimiter, 0 AS menu_order ")
    .then(function (data) {
      res.render('users/rights/right', data); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

/*
** Показать/обновить ПРАВО пользователя
*/
router.get('/rights/:id/:right_name', function(req, res, next) {
  var id = req.params.id;
  var right_name = req.params.right_name;
  db.one("SELECT u.id, u.login, ur.right_name, ur.url, ur.menu_delimiter, ur.menu_order FROM user_rights ur LEFT JOIN users u ON u.id = ur.user_rf WHERE ur.user_rf=$1 AND ur.right_name=$2" , [id, right_name])
    .then(function (data) {
//      res.send(data);
      res.render('users/rights/right', data); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
//      res.send("код ошибки: "+error.code+"<br> получено: "+error.received+"<br> запрос: "+error.query);
    });
});

//
// Добавление и корректировка ПРАВА пользователя
//
router.post('/right/update', function(req, res, next) {
  var id = req.body.id;
  var login = req.body.login;
  var right_name = req.body.right_name;
  var url = req.body.url;
  var menu_delimiter = req.body.menu_delimiter;
  var menu_order = req.body.menu_order;
  var old_id = req.body.old_id;
  var old_url = req.body.old_url;
  if (id > 0 ) {
//  Обновление
    db.none(
      "UPDATE user_rights " +
        "SET user_rf=$1, right_name=$2, url=$3, menu_delimiter=$4, menu_order=$5 " +
        "WHERE user_rf=$6 AND url=$7",
          [id, right_name, url, menu_delimiter, menu_order, old_id, old_url])
      .then (function () {
        res.redirect('/users/rights/all/');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO user_rights (user_rf, right_name, url, menu_delimiter, menu_order) " +
      "VALUES ((SELECT id FROM users WHERE login = $1), $2, $3, $4, $5)",
        [login, right_name, url, menu_delimiter, menu_order])
      .then (function (data) {
        res.redirect('/users/rights/all/');

      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить ПРАВО пользователя из БД
router.get('/right/delete/:id/:right_name', function(req, res, next) {
  var id = req.params.id;
  var right_name = req.params.right_name;
  db.none("DELETE FROM user_rights WHERE user_rf=$1 AND right_name=$2", [id, right_name])
    .then(function () {
      res.redirect('/users/rights/all/'); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});


module.exports = router;
