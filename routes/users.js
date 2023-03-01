var express = require('express');
var router = express.Router();
var md5 = require('crypto-md5/md5');

var db = require("../db");
//var pgp = require("pg-promise")(/*options*/);
//var db = pgp(process.env.PG_CONNECT);

/* GET users list */
router.get('/', function(req, res, next) {
//  res.redirect('/users/all/');
//  res.send('Строка подключения к БД: '+process.env.PG_CONNECT);
});

/*
** Показать пользователя из БД
* /
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
*/
/*
** Добавить пользователя в БД
* /
router.get('/addnew', function(req, res, next) {
  db.one("SELECT 0 AS id, '' AS login, '' AS phone")
    .then(function (data) {
      res.render('users/user', data); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});
*/
/*
** Удалить пользователя из БД
* /
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
*/
//
// Добавление пользователя, корректировка данных пользователя
//
/*
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
*/
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
  res.render('users/reg', {user_id: "0"});
});
router.post('/reg', function(req, res, next) {
  var login = req.body.login;
  var password = req.body.password;
  var fullname = req.body.fullname;
//  res.send("pass="+password+"("+md5(password)+"), login="+login+", fullname="+ fullname);
  db.one("INSERT INTO user_list (user_name, group_rf, fullname, email, password, phone) VALUES ($1, 1, $2, $1, $3, $1) RETURNING user_id;",
    [login, fullname, md5(password)])
    .then (function (data) {
      res.redirect('/users/login?login='+login);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
//  Вход в систему
//
// Вводим логин и пароль
router.get('/login', function(req, res, next) {
  var login = req.params.login;
  res.render('users/login', {login: login});
});
// и настраиваем сессию
router.post('/login', function(req, res, next) {
  var login = req.body.login;
  var password = req.body.password;

  req.session.pass = password;
  req.session.password = md5(password);
  req.session.login = login;

  db.one("SELECT user_id, group_rf, fullname " +
    " FROM user_list " +
    " WHERE user_name = $1 " +
    "   AND (password = $2 OR password = $3) ", [login, md5(password), password])
    .then (function (data) {
      req.session.uid = data.user_id;
      req.session.gid = data.group_rf;
      req.session.fullname = data.fullname;

      res.redirect('/');
//      res.send(data.cnt);
    })
    .catch(function (error) {
      res.send('ОШИБКА login: '+error);
    });
});

// Идём на СВОЮ домашнюю страницу
router.get('/home', function(req, res, next) {

  if (req.session.login == undefined)
      res.redirect('/');

  res.render('users/home', req.session);
//  res.send('Здравствуй, пользователь №'+ id);
});

//
// ПРОФИЛЬ пользователя
//
router.get('/profile', function(req, res, next) {

  if (req.session.login == undefined)
    res.redirect('/');

  var user_id = req.session.uid;
  db.one(
    "SELECT ul.user_id, ul.user_name, ul.fullname, ul.email, ul.added_at, ul.group_rf, grp.user_name AS group_name, ul.phone, ul.notes " +
    " FROM user_list ul LEFT JOIN user_list grp ON ul.group_rf = grp.user_id" +
    " WHERE ul.user_id = $1", user_id)
    .then(function (data) {
      res.render('users/profile', data);
    })
    .catch(function (error) {
      res.send(error);
    });
  });
//
// Сохранить ПРОФИЛЬ пользователя
//
router.post('/profile_update', function(req, res, next) {
  var user_id = req.body.user_id;
  var user_name = req.body.user_name;
  var fullname = req.body.fullname;
  var email = req.body.email;
  var phone = req.body.phone;
  var notes = req.body.notes;
  db.none(
      "UPDATE user_list " +
      " SET user_name=$1, fullname=$2, email=$3, phone=$4, notes=$5 " +
      " WHERE user_id=$6",
      [user_name, fullname, email, phone, notes, user_id])
    .then (function () {
        res.redirect('/users/home');
    })
    .catch(function (error) {
        res.send(error);
    });
});

//
// Сохранить ПАРОЛЬ
//
router.post('/save_password', function(req, res, next) {
  var user_id = req.body.user_id;
  var password = req.body.password;
  db.none(
    "UPDATE user_list " +
    " SET password=$1 " +
    " WHERE user_id=$2",
    [md5(password), user_id])
    .then (function () {
      res.send("0");
    })
    .catch(function (error) {
      res.send(error);
    });
});


// Выход из системы
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
  db.one("SELECT count(*) AS cnt FROM user_list WHERE user_name = $1", login)
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
  db.one("SELECT count(*) AS cnt " +
    " FROM user_list " +
    " WHERE user_name = $1 " +
    "   AND (password = $2 OR password = $3) ", [login, md5(password), password])
    .then (function (data) {
      res.send(data.cnt);
    })
    .catch(function (error) {
      res.send('ОШИБКА isValidUser: '+error);
    });
});

router.post('/test_reply', function(req, res, next) {
  var login = req.body.login;
  var password = req.body.password;
  db.one("SELECT count(*) AS cnt FROM user_list" )
      .then (function (data) {
        res.send(data.cnt);
      })
      .catch(function (error) {
        res.send('ОШИБКА isValidUser: '+error);
      });

//  res.send(login+','+md5(password));
});



//
// Сформировать и возвратить БОКОВОЕ МЕНЮ ПОЛЬЗОВАТЕЛЯ на основе имеющихся у него ПРАВ
//
router.get('/get_main_menu', function(req, res, next) {
  var id = req.session.uid;

  // Пользователь не зашёл в систему, начальное меню
  if (id == "" || id == undefined)
  {
    var result = '<a href="/" >Главная</a> <br> <a href="/users/login">Вход</a> <br> <a href="/users/reg">Регистрация</a><br>';
    res.send(result);
    return;
  }

  var gid = req.session.gid; // Группа пользователя
  var uid = req.session.uid; // Пользователь
  var guest = 1;             // Гость

  db.any(
    "SELECT DISTINCT ur.right_group, ur.right_order, right_name, pre_url, url, url_attributes, post_url " +
      " FROM user_right ur LEFT JOIN right_list ON right_rf = right_id " +
      " WHERE user_rf IN ($1, $2, $3) " +
      " ORDER BY ur.right_order, ur.right_group, right_name ", [uid ,gid, guest])
    .then (function (data) {
        var result = 'Меню '+ req.session.login +
          ':<br>  <a href="/" >Домой</a> <br> <a href="/users/logout">Выход</a> <br> <a href="/users/profile">Профиль</a>  <br> ';

        var current_group = '';
        for (var i = 0; i < data.length; i++) {
          if (i == 0 || data[i].right_group != current_group)  {
            current_group = data[i].right_group;
            result = result + '<br>'+ current_group + '<br>';
          }

          result = result +
            data[i].pre_url +
            ' <a href="'+ data[i].url +'" ' + data[i].url_attributes + '>'+ data[i].right_name + '</a> ' +
            data[i].post_url + '<br>';
        }

        res.send('z'+result+'z');
    })
    .catch(function (error) {
      res.send(error);
    });

});

//
// Сформировать и возвратить МЕНЮ ПОЛЬЗОВАТЕЛЯ на основе имеющихся у него ПРАВ
//
router.get('/get_top_user_menu', function(req, res, next) {
  var id = req.session.uid;
  var current_group = '';
  var result = '';

  // Пользователь не зашёл в систему, начальное меню
  if (id == "" || id == undefined)
  {
    result =
        '<div id="tmi0" class="top_menu_item" tag="0" onmouseenter="show_pm2(\'0\')" onmouseleave = "hide_pm2(\'pm0\')" >' +
        ' <span id="tmin0">Что?</span> ' +
        ' <div class="popup_menu" id="pm0" hidden" >' +
        '   <div class="popup_menu_item"><a href="/" >Домой</a> </div> ' +
        '   <div class="popup_menu_item"><a href="/users/login">Вход</a></div> ' +
        '   <div class="popup_menu_item"><a href="/users/reg">Регистрация</a></div> '+
        ' </div>' +
        '</div> '
    ;
//    result = '<a href="/" > Главная</a> | <a href="/users/login"> Вход</a> | <a href="/users/reg"> Регистрация</a> | ';
    res.send(result);
    return;
  }

  var gid = req.session.gid; // Группа пользователя
  var uid = req.session.uid; // Пользователь
  var guest = 1;             // Гость

  db.any(
      "SELECT DISTINCT ur.right_group, ur.right_order, right_name, pre_url, url, url_attributes, post_url " +
      " FROM user_right ur LEFT JOIN right_list ON right_rf = right_id " +
      " WHERE user_rf IN ($1, $2, $3) " +
      " ORDER BY ur.right_order, ur.right_group, right_name ", [uid ,gid, guest])
      .then (function (data) {

        // Первый пункт верхнего меню - меню пользователя
        result =
            '<div id="tmi77" class="top_menu_item" tag="0" onmouseenter="show_pm2(\'77\')" onmouseleave = "hide_pm2(\'pm77\')" >' +
            ' <span id="tmin77">'+req.session.login+'</span> ' +
            ' <div class="popup_menu" id="pm77" hidden" >' +
            '   <div class="popup_menu_item"><a href="/" >Домой</a></div> ' +
            '   <div class="popup_menu_item"><a href="/users/logout">Выход</a></div> ' +
            '   <div class="popup_menu_item"><a href="/users/profile">Профиль</a></div> '+
            ' </div>' +
            '</div>| '
        ;

        for (var i = 0; i < data.length; i++) {

          if (data[i].right_group != current_group)  { // Поменялась Группа меню

            if (i > 0 ) {
              result = result + '</div>'; // Закрываю popup_menu
              result = result + '</div>|'; // Закрываю top_menu_item
            }

            current_group = data[i].right_group; // Меняю название текущей группы (top_menu_item)

            result = result +
                '<div id="tmi'+i+'" class="top_menu_item" tag="'+i+'" onmouseenter="show_pm2(\''+i+'\')" onmouseleave = "hide_pm2(\'pm'+i+'\')" >' +
                ' <span id="tmin'+i+'">'+current_group+'</span> ' +
                ' <div class="popup_menu" id="pm'+i+'" hidden" >';
          } // Поменялась Группа меню

          result = result +  ' <div class="popup_menu_item"> '+
              data[i].pre_url +
              ' <a href="'+ data[i].url +'" ' + data[i].url_attributes + '>'+ data[i].right_name + '</a> ' +
              data[i].post_url + ' </div> ';
        }
        result = result + '</div>'; // Закрываю последнее popup_menu
        result = result + '</div>|'; // Закрываю последний пункт top_menu_item

        res.send(result);
      })
      .catch(function (error) {
        res.send(error);
      });

});
/*
//
// Сформировать и возвратить ВЕРХНЕЕ МЕНЮ ПОЛЬЗОВАТЕЛЯ на основе имеющихся у него ПРАВ
//
router.get('/get_top_user_menu_top', function(req, res, next) {
  var id = req.session.uid;

  // Пользователь не зашёл в систему, начальное меню
  if (id == "" || id == undefined)
  {
    var result = '<a href="/" > Главная</a> | <a href="/users/login"> Вход</a> | <a href="/users/reg"> Регистрация</a> | ';
    res.send(result);
    return;
  }

  var gid = req.session.gid; // Группа пользователя
  var uid = req.session.uid; // Пользователь
  var guest = 1;             // Гость

  db.any(
      "SELECT DISTINCT ur.right_group " +
      " FROM user_right ur LEFT JOIN right_list ON right_rf = right_id " +
      " WHERE user_rf IN ($1, $2, $3) " +
      " ORDER BY ur.right_group ", [uid ,gid, guest])
      .then (function (data) {
        var result = 'Меню '+ req.session.login +
            '|| <a href="/" >Домой</a> | <a href="/users/logout">Выход</a> | <a href="/users/profile">Профиль</a> || ';

        for (var i = 0; i < data.length; i++) {

            result = result +
                ' <div class="top_menu_item"  id="mi'+i+ '" ' +
                ' onmouseenter="show_pm(\'mi'+i+'\') " ' +
//                ' onmouseleave="hide_pm() " ' +
                '> '+
                data[i].right_group;

            result = result +' </div> | '; // Если всё вместе формировать, то добавляет NaN почему-то
          }
        res.send(result);
      })
      .catch(function (error) {
        res.send(error);
      });
});

//
// Сформировать и возвратить ВСПЛЫВАЮЩЕЕ МЕНЮ ПОЛЬЗОВАТЕЛЯ
//
router.post('/get_popup_user_menu', function(req, res, next) {
  var menu_item = req.body.menu_item;

  var gid = req.session.gid; // Группа пользователя
  var uid = req.session.uid; // Пользователь
  var guest = 1;             // Гость

  db.any(
      "SELECT DISTINCT ur.right_group, ur.right_order, right_name, pre_url, url, url_attributes, post_url " +
      " FROM user_right ur LEFT JOIN right_list ON right_rf = right_id " +
      " WHERE user_rf IN ($1, $2, $3) " +
      "   AND ur.right_group = $4 " +
      " ORDER BY ur.right_group, ur.right_order, right_name ", [uid ,gid, guest, menu_item])
      .then (function (data) {
        var result = '';

        for (var i = 0; i < data.length; i++) {

          if (i > 0 ) {result = result + '<br>';}

          result = result +  ' <span class="popup_menu_item" id="pmi'+i+'"> '+
              data[i].pre_url +
              ' <a href="'+ data[i].url +'" ' + data[i].url_attributes + '>'+ data[i].right_name + '</a> ' +
              data[i].post_url + ' </span> ';
        }

        res.send(result);
      })
      .catch(function (error) {
        res.send(error);
      });

});

*/


/*
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
*/
/*
** Добавить новое ПРАВО пользователя
* /
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
* /
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
*/

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

        if (user_id == req.session.uid)
          res.redirect('/users/home');
        else
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
      res.send('ОШИБКА: '+error);
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
      " VALUES ($1, $2, $3, $4, $5, $6, $7)",
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


//================ USER_RIGHT === НАБОРЫ ПРАВ ПОЛЬЗОВАТЕЛЕЙ =====================

//
// Показать список ПОЛЬЗОВАТЕЛЬ-ПРАВО
//
router.get('/user_right_s', function(req, res, next) {
  db.any(
    "SELECT user_rf, user_name, right_rf, right_name, ur.right_group, ur.right_order " +
    " FROM ((user_right ur " +
    "   LEFT JOIN user_list ul ON user_rf = user_id) " +
    "   LEFT JOIN right_list rl ON right_rf = right_id) " +
    " ORDER BY user_name, right_group, right_order, right_name ")
    .then(function (data) {
      res.render('users/user_right_s', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавить новый ПОЛЬЗОВАТЕЛЬ-ПРАВО
//
router.get('/user_right_addnew', function(req, res, next) {
  db.one("SELECT 0 AS user_rf, '' AS user_name, 0 AS right_rf, '' AS right_name, '' AS right_group, 1 AS right_order ")
    .then(function (data) {
      res.render('users/user_right', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить ПОЛЬЗОВАТЕЛЬ-ПРАВО
//
router.get('/user_right/:user_rf/:right_rf', function(req, res, next) {
  var user_rf = req.params.user_rf;
  var right_rf = req.params.right_rf;
  db.one(
    "SELECT user_rf, user_name, right_rf, right_name, ur.right_group, ur.right_order " +
    " FROM ((user_right ur " +
    "   LEFT JOIN user_list ul ON user_rf = user_id) " +
    "   LEFT JOIN right_list rl ON right_rf = right_id) " +
    " WHERE user_rf = $1 AND right_rf = $2", [user_rf, right_rf])
    .then(function (data) {
      res.render('users/user_right', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавление и корректировка ПОЛЬЗОВАТЕЛЬ-ПРАВО
//
router.post('/user_right/update', function(req, res, next) {
  var user_rf = req.body.user_rf;
  var right_rf = req.body.right_rf;
  var user_name = req.body.user_name;
  var right_name = req.body.right_name;
  var right_group = req.body.right_group;
  var right_order = req.body.right_order;
  var old_user_rf = req.body.old_user_rf;
  var old_right_rf = req.body.old_right_rf;
  if (user_rf > 0 ) {
//  Обновление
    db.none(
      "UPDATE user_right " +
      "SET user_rf=(SELECT user_id FROM user_list WHERE user_name=$1), " +
      "  right_rf=(SELECT right_id FROM right_list WHERE right_name=$2), " +
      "  right_group=$3, " +
      "  right_order=$4 " +
      "WHERE user_rf=$5 AND right_rf=$6",
      [user_name, right_name, right_group, right_order, old_user_rf, old_right_rf])
      .then (function () {
        res.redirect('/users/user_right_s');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO  user_right (user_rf, right_rf, right_group, right_order) " +
      "VALUES ((SELECT user_id FROM user_list WHERE user_name=$1), (SELECT right_id FROM right_list WHERE right_name=$2), $3, $4)",
      [user_name, right_name, right_group, right_order])
      .then (function (data) {
        res.redirect('/users/user_right_s');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить  ПОЛЬЗОВАТЕЛЬ-ПРАВО
router.get('/user_right_delete/:user_rf/:right_rf', function(req, res, next) {
  var user_rf = req.params.user_rf;
  var right_rf = req.params.right_rf;
  db.none("DELETE FROM user_right WHERE user_rf=$1 AND right_rf=$2", [user_rf, right_rf])
    .then(function () {
      res.redirect('/users/user_right_s'); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});


//================ NOTES === ЗАМЕТКИ ПОЛЬЗОВАТЕЛЕЙ =====================



//
// Показать заметки
//
router.get('/notes', function(req, res, next) {
//  res.render('Users notes', { });
  res.send('Users notes');
});


module.exports = router;

