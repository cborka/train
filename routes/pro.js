var express = require('express');
var router = express.Router();

var db = require("../db");

//
// Показать список ПОДРАЗДЕЛЕНИЙ
//
router.get('/sds', function(req, res, next) {
  db.any(
    "SELECT sd.sd_id, sd.sd_name, sd.psd_rf, psd.sd_name AS psd_name, sd.sd_short_name, sd.sd_full_name " +
      " FROM sd_list sd LEFT JOIN sd_list psd ON sd.psd_rf = psd.sd_id " +
      " ORDER BY sd.sd_name")
    .then(function (data) {
      res.render('pro/sds', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавить новое ПОДРАЗДЕЛЕНИЕ
//
router.get('/sd_addnew', function(req, res, next) {
  db.one("SELECT 0 AS sd_id, '' AS sd_name, 0 AS psd_rf, '' AS sd_short_name, '' AS sd_full_name ")
    .then(function (data) {
      res.render('pro/sd', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить ПОДРАЗДЕЛЕНИЕ
//
router.get('/sd/:sd_id', function(req, res, next) {
  var sd_id = req.params.sd_id;
  db.one(
    "SELECT sd.sd_id, sd.sd_name, sd.psd_rf, psd.sd_name AS psd_name, sd.sd_short_name, sd.sd_full_name " +
    " FROM sd_list sd LEFT JOIN sd_list psd ON sd.psd_rf = psd.sd_id " +
    " WHERE sd.sd_id = $1", sd_id)
    .then(function (data) {
      res.render('pro/sd', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});
//
// Добавление и корректировка ПОДРАЗДЕЛЕНИЯ
//
router.post('/sd_update', function(req, res, next) {
  var sd_id = req.body.sd_id;
  var sd_name = req.body.sd_name;
  var psd_name = req.body.psd_name;
  var sd_short_name = req.body.sd_short_name;
  var sd_full_name = req.body.sd_full_name;
  if (sd_id > 0 ) {
//  Обновление
    db.none(
      "UPDATE sd_list " +
      "SET sd_name=$1, psd_rf=(SELECT sd_id FROM sd_list WHERE sd_name = $2), sd_short_name=$3, sd_full_name=$4 " +
      "WHERE sd_id=$5",
      [sd_name, psd_name, sd_short_name, sd_full_name, sd_id])
      .then (function () {
        res.redirect('/pro/sds');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO sd_list (sd_name, psd_rf, sd_short_name, sd_full_name) " +
      "VALUES ($1, (SELECT sd_id FROM sd_list WHERE sd_name = $2), $3, $4)",
      [sd_name, psd_name, sd_short_name, sd_full_name])
      .then (function (data) {
        res.redirect('/pro/sds');

      })
      .catch(function (error) {
        res.send(error);
      });
  }
});
// Удалить ПОДРАЗДЕЛЕНИЕ
router.get('/sd_delete/:sd_id', function(req, res, next) {
  var sd_id = req.params.sd_id;
  db.none("DELETE FROM sd_list WHERE sd_id=$1", sd_id)
    .then(function () {
      res.redirect('/pro/sds'); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Сформировать и возвратить список ПОДРАЗДЕЛЕНИЙ для выбора
//
router.get('/get_sd_names', function(req, res, next) {
  db.any("SELECT sd_name FROM sd_list ORDER BY 1 ")
    .then (function (data) {
      var result = '';
      for (var i = 0; i < data.length; i++) {
        result = result + ' <option value="'+data[i].sd_name+'">'+data[i].sd_name+'</option>';
      }
      res.send(result);
    })
    .catch(function (error) {
      res.send(error);
    });

});

//=================== ЖБИ =====================

//
// Показать список ЖБИ
//
router.get('/fcs', function(req, res, next) {
  db.any(
    "SELECT fc_id, fc_name, fc_v, bet_v, fc_w, concrete_rf, ok, notes " +
    " FROM fc_list " +
    " WHERE fc_id > 1 " +
    " ORDER BY fc_name")
    .then(function (data) {
      res.render('pro/fcs', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавить новое ЖБИ
//
router.get('/fc_addnew', function(req, res, next) {
  db.one("SELECT 0 AS fc_id, '' AS fc_name, 0 AS fc_v, 0 AS bet_v, 0 AS fc_w, 1 AS concrete_rf, '' AS ok, '' AS notes ")
    .then(function (data) {
      res.render('pro/fc', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить ЖБИ
//
router.get('/fc/:fc_id', function(req, res, next) {
  var fc_id = req.params.fc_id;
  db.one(
    "SELECT fc_id, fc_name, fc_v, bet_v, fc_w, concrete_rf, ok, notes " +
    " FROM fc_list " +
    " WHERE fc_id = $1", fc_id)
    .then(function (data) {
      res.render('pro/fc', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});
//
// Добавление и корректировка ЖБИ
//
router.post('/fc_update', function(req, res, next) {
  var fc_id = req.body.fc_id;
  var fc_name = req.body.fc_name;
  var fc_v = req.body.fc_v;
  var bet_v = req.body.bet_v;
  var fc_w = req.body.fc_w;
  var ok = req.body.ok;
  var notes = req.body.notes;
  if (fc_id > 0 ) {
//  Обновление
    db.none(
      "UPDATE fc_list " +
      "SET fc_name=$1, fc_v=$2, bet_v=$3, fc_w=$4, concrete_rf=1, ok=$5, notes=$6 " +
      "WHERE fc_id=$7",
      [fc_name, fc_v, bet_v, fc_w, ok, notes, fc_id])
      .then (function () {
        res.redirect('/pro/fcs');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO fc_list (fc_name, fc_v, bet_v, fc_w, concrete_rf, ok, notes) " +
      "VALUES ($1, $2, $3, $4, 1, $5, $6)",
      [fc_name, fc_v, bet_v, fc_w, ok, notes])
      .then (function (data) {
        res.redirect('/pro/fcs');

      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить ЖБИ
router.get('/fc_delete/:fc_id', function(req, res, next) {
  var fc_id = req.params.fc_id;
  db.none("DELETE FROM fc_list WHERE fc_id=$1", fc_id)
    .then(function () {
      res.redirect('/pro/fcs'); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});

//=================== ФОРМЫ для формовки ЖБИ =====================

//
// Показать список ФОРМ
//
router.get('/forms', function(req, res, next) {
  db.any(
    "SELECT form_id, form_name " +
    " FROM form_list " +
    " WHERE form_id > 1 " +
    " ORDER BY form_name")
    .then(function (data) {
      res.render('pro/forms', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавить новую ФОРМУ
//
router.get('/form_addnew', function(req, res, next) {
  db.one("SELECT 0 AS form_id, '' AS form_name ")
    .then(function (data) {
      res.render('pro/form', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить ФОРМУ
//
router.get('/form/:form_id', function(req, res, next) {
  var form_id = req.params.form_id;
  db.one(
    "SELECT form_id, form_name " +
    " FROM form_list " +
    " WHERE form_id = $1", form_id)
    .then(function (data) {
      res.render('pro/form', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});
//
// Добавление и корректировка ФОРМЫ
//
router.post('/form_update', function(req, res, next) {
  var form_id = req.body.form_id;
  var form_name = req.body.form_name;
  if (form_id > 0 ) {
//  Обновление
    db.none(
      "UPDATE form_list " +
      "SET form_name=$1 " +
      "WHERE form_id=$2",
      [form_name, form_id])
      .then (function () {
        res.redirect('/pro/forms');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO form_list (form_name) " +
      "VALUES ($1)",
      [form_name])
      .then (function (data) {
        res.redirect('/pro/forms');

      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить ФОРМУ
router.get('/form_delete/:form_id', function(req, res, next) {
  var form_id = req.params.form_id;
  db.none("DELETE FROM form_list WHERE form_id=$1", form_id)
    .then(function () {
      res.redirect('/pro/forms'); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});

//=================== ПЛАНЫ (периоды планирования) =====================

//
// Показать список ПЛАНОВ
//
router.get('/plans', function(req, res, next) {
  db.any(
    "SELECT plan_id, plan_name " +
    " FROM plan_list " +
    " WHERE plan_id > 1 " +
    " ORDER BY plan_name")
    .then(function (data) {
      res.render('pro/plans', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавить новый ПЛАН
//
router.get('/plan_addnew', function(req, res, next) {
  db.one("SELECT 0 AS plan_id, '' AS plan_name ")
    .then(function (data) {
      res.render('pro/plan', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить ПЛАН
//
router.get('/plan/:plan_id', function(req, res, next) {
  var plan_id = req.params.plan_id;
  db.one(
    "SELECT plan_id, plan_name " +
    " FROM plan_list " +
    " WHERE plan_id = $1", plan_id)
    .then(function (data) {
      res.render('pro/plan', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});
//
// Добавление и корректировка ПЛАНА
//
router.post('/plan_update', function(req, res, next) {
  var plan_id = req.body.plan_id;
  var plan_name = req.body.plan_name;
  if (plan_id > 0 ) {
//  Обновление
    db.none(
      "UPDATE plan_list " +
      "SET plan_name=$1 " +
      "WHERE plan_id=$2",
      [plan_name, plan_id])
      .then (function () {
        res.redirect('/pro/plans');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO plan_list (plan_name) " +
      "VALUES ($1)",
      [plan_name])
      .then (function (data) {
        res.redirect('/pro/plans');

      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить ПЛАН
router.get('/plan_delete/:plan_id', function(req, res, next) {
  var plan_id = req.params.plan_id;
  db.none("DELETE FROM plan_list WHERE plan_id=$1", plan_id)
    .then(function () {
      res.redirect('/pro/plans'); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});


module.exports = router;