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


//======================= ПОЛЬЗОВАТЕЛИ === USERS ===============================

//
// Показать список ПОЛЬЗОВАТЕЛЕЙ
//
router.get('/users', function(req, res, next) {
  db.any(
    "SELECT ul.user_id, ul.user_name, ul.fullname, ul.email, ul.password, ul.added_at, ul.group_rf, grp.user_name AS group_name, ul.phone, ul.notes " +
    " FROM user_list ul LEFT JOIN user_list grp ON ul.group_rf = grp.user_id" +
    " WHERE ul.user_id > 0" +
    " ORDER BY ul.user_name")
    .then(function (data) {
      res.render('users/users2', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавить нового ПОЛЬЗОВАТЕЛЯ
//
router.get('/user_addnew', function(req, res, next) {
  db.one("SELECT 0 AS user_id, '' AS user_name, 1 AS group_rf, Гость' AS group_name, '' AS fullname, '' AS email, '' AS phone, '' AS notes, '123' AS password ")
    .then(function (data) {
      res.render('users/user2', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить ПОЛЬЗОВАТЕЛЯ
//
router.get('/user/:user_id', function(req, res, next) {
  var user_id = req.params.user_id;
  db.one(
    "SELECT ul.user_id, ul.user_name, ul.fullname, ul.email, ul.password, ul.added_at, ul.group_rf, grp.user_name AS group_name, ul.phone, ul.notes " +
    " FROM user_list ul LEFT JOIN user_list grp ON ul.group_rf = grp.user_id" +
    " WHERE ul.user_id = $1", user_id)
    .then(function (data) {
      res.render('users/user2', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});
//
// Добавление и корректировка ПОЛЬЗОВАТЕЛЯ
//
router.post('/user_update', function(req, res, next) {
  var user_id = req.body.user_id;
  var user_name = req.body.user_name;
  var group_name = req.body.group_name;
  var fullname = req.body.fullname;
  var email = req.body.email;
  var password = req.body.password;
  var group_rf = req.body.group_rf;
  var phone = req.body.phone;
  var notes = req.body.notes;
  if (user_id > 0 ) {
//  Обновление
    db.none(
      "UPDATE user_list " +
      "SET user_name=$1, group_rf=(SELECT user_id FROM user_list WHERE user_name = $2), fullname=$3, email=$4, " +
      "  phone=$5, notes=$6 " +
      "WHERE user_id=$7",
      [user_name, group_name, fullname, email, phone, notes, user_id])
      .then (function () {
        res.redirect('/users/users');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO user_list (user_name, group_rf, fullname, email, password, phone, notes) " +
      "VALUES ($1, (SELECT user_id FROM user_list WHERE user_name = $2), $3, $4, $5, $6, $7)",
      [user_name, group_name, fullname, email, password, phone, notes])
      .then (function (data) {
        res.redirect('/users/users');

      })
      .catch(function (error) {
        res.send(error);
      });
  }
});
// Удалить ПОЛЬЗОВАТЕЛЯ
router.get('/user_delete/:user_id', function(req, res, next) {
  var user_id = req.params.user_id;
  db.none("DELETE FROM user_list WHERE userid=$1", user_id)
    .then(function () {
      res.redirect('/users/users'); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Сформировать и возвратить список ПОЛЬЗОВАТЕЛЕЙ для выбора
//
router.get('/get_user_names', function(req, res, next) {
  db.any("SELECT user_name FROM user_list ORDER BY 1 ")
    .then (function (data) {
      var result = '';
      for (var i = 0; i < data.length; i++) {
        result = result + ' <option value="'+data[i].user_name+'">'+data[i].user_name+'</option>';
      }
      res.send(result);
    })
    .catch(function (error) {
      res.send(error);
    });
});


//======================= ПРАВА ПОЛЬЗОВАТЕЛЕЙ === USER RIGHTS ===============================

//
// Показать список ПРАВ
//
router.get('/rights', function(req, res, next) {
  db.any(
    "SELECT right_id, right_name, pre_url, url, post_url, url_attributes, notes, right_group " +
    " FROM right_list " +
    " WHERE right_id > 1 " +
    " ORDER BY right_group, right_name")
    .then(function (data) {
      res.render('users/rights', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавить новое ПРАВО
//
router.get('/right_addnew', function(req, res, next) {
  db.one("SELECT 0 AS right_id, '' AS right_name, '/home' AS url ")
    .then(function (data) {
      res.render('users/right', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить ПРАВО
//
router.get('/right/:right_id', function(req, res, next) {
  var right_id = req.params.right_id;
  db.one(
    "SELECT right_id, right_name, pre_url, url, post_url, url_attributes, notes, right_group  " +
    " FROM right_list " +
    " WHERE right_id = $1", right_id)
    .then(function (data) {
      res.render('users/right', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});
//
// Добавление и корректировка ПЛАНА
//
router.post('/right_update', function(req, res, next) {
  var right_id = req.body.right_id;
  var right_name = req.body.right_name;
  var pre_url = req.body.pre_url;
  var url = req.body.url;
  var post_url = req.body.post_url;
  var url_attributes = req.body.url_attributes;
  var notes = req.body.notes;
  var right_group = req.body.right_group;
  if (right_id > 0 ) {
//  Обновление
    db.none(
      "UPDATE right_list " +
      "SET right_name=$1, " +
      "    pre_url=$2, " +
      "    url=$3, " +
      "    post_url=$4, " +
      "    url_attributes=$5, " +
      "    notes=$6, " +
      "    right_group=$7 " +
      "WHERE right_id=$8",
      [right_name, pre_url, url, post_url, url_attributes, notes, right_group, right_id])
      .then (function () {
        res.redirect('/users/rights');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO right_list (right_name, pre_url, url, post_url, url_attributes, notes, right_group) " +
      "VALUES ($1, $2, $3, $4, $5, $6)",
      [right_name, pre_url, url, post_url, url_attributes, notes, right_group])
      .then (function (data) {
        res.redirect('/users/rights');

      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить ПРАВО
router.get('/right_delete/:right_id', function(req, res, next) {
  var right_id = req.params.right_id;
  db.none("DELETE FROM right_list WHERE right_id=$1", right_id)
    .then(function () {
      res.redirect('/users/rights'); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Сформировать и возвратить список ПРАВ для выбора
//
router.get('/get_right_names', function(req, res, next) {
  db.any("SELECT right_name FROM right_list ORDER BY 1 ")
    .then (function (data) {
      var result = '';
      for (var i = 0; i < data.length; i++) {
        result = result + ' <option value="'+data[i].right_name+'">'+data[i].right_name+'</option>';
      }
      res.send(result);
    })
    .catch(function (error) {
      res.send(error);
    });
});




module.exports = router;
