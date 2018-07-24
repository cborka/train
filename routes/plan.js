var express = require('express');
var router = express.Router();

var db = require("../db");


//=================== ПЛАН ПРОИЗВОДСТВА ЖБИ =====================

//
// Показать список ПЛАН ПРОИЗВОДСТВА ЖБИ
//
router.get('/plan_sd_fc_s', function(req, res, next) {
  db.any(
    "SELECT plan_rf, plan_name, sd_rf, sd_name, fc_rf, fc_name, fc_num, pp.fc_v " +
    " FROM (((plan_fc_pro pp " +
    "   LEFT JOIN plan_list p ON plan_rf = plan_id) " +
    "   LEFT JOIN sd_list sd ON sd_rf = sd_id) " +
    "   LEFT JOIN fc_list fc ON fc_rf = fc_id) " +
    " ORDER BY plan_name, sd_name, fc_name ")
    .then(function (data) {
      res.render('pro/plan_sd_fc_s', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавить новый ПЛАН ПРОИЗВОДСТВА ЖБИ
//
router.get('/plan_sd_fc_addnew', function(req, res, next) {
  db.one("SELECT 0 AS plan_rf, '' AS plan_name, 0 AS sd_rf, '' AS sd_name, 0 AS fc_rf, '' AS fc_name, 0 AS fc_num, 0 AS fc_v ")
    .then(function (data) {
      res.render('pro/plan_sd_fc', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить ПЛАН ПРОИЗВОДСТВА ЖБИ
//
router.get('/plan_sd_fc/:plan_rf/:sd_rf/:fc_rf', function(req, res, next) {
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  var fc_rf = req.params.fc_rf;
  db.one(
    "SELECT plan_rf, plan_name, sd_rf, sd_name, fc_rf, fc_name, fc_num, pp.fc_v " +
    " FROM (((plan_fc_pro pp " +
    "   LEFT JOIN plan_list p ON plan_rf = plan_id) " +
    "   LEFT JOIN sd_list sd ON sd_rf = sd_id) " +
    "   LEFT JOIN fc_list fc ON fc_rf = fc_id) " +
    " WHERE plan_rf=$1 AND sd_rf = $2 AND fc_rf = $3", [plan_rf, sd_rf, fc_rf])
    .then(function (data) {
      res.render('pro/plan_sd_fc', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавление и корректировка ПЛАН ПРОИЗВОДСТВА ЖБИ
//
router.post('/plan_sd_fc/update', function(req, res, next) {
  var plan_rf = req.body.plan_rf;
  var sd_rf = req.body.sd_rf;
  var fc_rf = req.body.fc_rf;
  var plan_name = req.body.plan_name;
  var sd_name = req.body.sd_name;
  var fc_name = req.body.fc_name;
  var fc_num = req.body.fc_num;
  var fc_v = req.body.fc_v;
  var old_plan_rf = req.body.old_plan_rf;
  var old_sd_rf = req.body.old_sd_rf;
  var old_fc_rf = req.body.old_fc_rf;
  if (sd_rf > 0 ) {
//  Обновление
    db.none(
      "UPDATE plan_fc_pro " +
      "SET plan_rf=(SELECT plan_id FROM plan_list WHERE plan_name=$1), sd_rf=(SELECT sd_id FROM sd_list WHERE sd_name=$2), fc_rf=(SELECT fc_id FROM fc_list WHERE fc_name=$3), fc_num=$4, fc_v=$5 " +
      "WHERE plan_rf=$6 AND sd_rf=$7 AND fc_rf=$8",
      [plan_name, sd_name, fc_name, fc_num, fc_v, old_plan_rf, old_sd_rf, old_fc_rf])
      .then (function () {
        res.redirect('/plan/plan_sd_fc_s');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO  plan_fc_pro (plan_rf, sd_rf, fc_rf, fc_num, fc_v) " +
      "VALUES ((SELECT plan_id FROM plan_list WHERE plan_name=$1), (SELECT sd_id FROM sd_list WHERE sd_name=$2), (SELECT fc_id FROM fc_list WHERE fc_name=$3), $4, $5)",
      [plan_name, sd_name, fc_name, fc_num, fc_v])
      .then (function (data) {
        res.redirect('/plan/plan_sd_fc_s');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить  ПЛАН ПРОИЗВОДСТВА ЖБИ
router.get('/plan_sd_fc_delete/:plan_rf/:sd_rf/:fc_rf', function(req, res, next) {
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  var fc_rf = req.params.fc_rf;
  db.none("DELETE FROM plan_fc_pro WHERE plan_rf=$1 AND sd_rf=$2 AND fc_rf=$3", [plan_rf, sd_rf, fc_rf])
    .then(function () {
      res.redirect('/plan/plan_sd_fc_s'); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// РАСЧЁТ ПЛАНА ПРОИЗВОДСТВА В ЗАВИСИМОСТИ ОТ МОЩНОСТЕЙ ПОДРАЗДЕЛЕНИЙ
//
router.get('/plan_pro_calc', function(req, res, next) {
  var ret = '>>> ';
  var ret1 = '';
  var ret2 = '';
  var ret3 = '';
  db.any(
    "SELECT plan_rf, plan_name, sd_rf, sd_name, fc_rf, fc_name, fc_num, pp.fc_v " +
    " FROM (((plan_fc_pro pp " +
    "   LEFT JOIN plan_list p ON plan_rf = plan_id) " +
    "   LEFT JOIN sd_list sd ON sd_rf = sd_id) " +
    "   LEFT JOIN fc_list fc ON fc_rf = fc_id) " +
    " ORDER BY plan_name, sd_name, fc_name ")
    .then(function (data) {
//      res.send(data);
      for (var i = 0; i < data.length; i++) {
        ret = ret + data[i].fc_name+' ---  '+data[i].fc_num+'<br>';
      }
    })
    .then(function (r1) {

      return(
      db.any(
        "SELECT plan_rf, plan_name, sd_rf, sd_name, fc_rf, fc_name, fc_num, pp.fc_v " +
        " FROM (((plan_fc_pro pp " +
        "   LEFT JOIN plan_list p ON plan_rf = plan_id) " +
        "   LEFT JOIN sd_list sd ON sd_rf = sd_id) " +
        "   LEFT JOIN fc_list fc ON fc_rf = fc_id) " +
        " ORDER BY plan_name, sd_name, fc_name ")
        .then(function (data) {
//      res.send(data);
          for (var i = 0; i < data.length; i++) {
            ret1 = ret1 + data[i].fc_name+' =1=  '+data[i].fc_num+'<br>';
          }
        })
       )

    })
    .then(function (r1) {

      return(
        db.any(
          "SELECT plan_rf, plan_name, sd_rf, sd_name, fc_rf, fc_name, fc_num, pp.fc_v " +
          " FROM (((plan_fc_pro pp " +
          "   LEFT JOIN plan_list p ON plan_rf = plan_id) " +
          "   LEFT JOIN sd_list sd ON sd_rf = sd_id) " +
          "   LEFT JOIN fc_list fc ON fc_rf = fc_id) " +
          " ORDER BY plan_name, sd_name, fc_name ")
        .then(function (data) {
            for (var i = 0; i < data.length; i++) {
              ret2 = ret2 + data[i].fc_name+' *2*  '+data[i].fc_num+'<br>';


              db.one("SELECT fullname FROM users WHERE login = 'bororo'")
                .then(function (data) {
                   ret3 = ret3 + data.fullname+ '<br>';
                  console.log(ret3);
                })
                .then(ret3 = ret3 + 'zxcv-')
                .then(ret3 = ret3 + 'asdf-')
                .then(console.log(ret3))
                .catch(function (error) {
                  console.log(":"+error);
                });

//                .catch(console.log('Ошибочка вышла!'));

            }
        })
      )

    })
    .then(function () {

      // Обработка всех полученных последовательно результатов
      res.send(ret+'<<<<br>ret1='+ret1+'<br>ret2='+ret2+'<br>ret3='+ret3+'!!!');

    })
    .catch(function (error) {
//      res.send(error);
      res.send(":"+error);
    });
});




//=================== ПЛАН-ПРОЛЁТ =====================

//
// Показать список ПЛАН-ПРОЛЁТ
//
router.get('/plan_sd_s', function(req, res, next) {
  db.any(
    "SELECT plan_rf, plan_name, sd_rf, sd_name, days_num, workers_num " +
    " FROM ((plan_sd sf " +
    "   LEFT JOIN plan_list plan ON plan_rf = plan_id) " +
    "   LEFT JOIN sd_list sd ON sd_rf = sd_id) " +
    " ORDER BY plan_name, sd_name ")
    .then(function (data) {
      res.render('plan/plan_sd_s', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавить новый ПЛАН-ПРОЛЁТ
//
router.get('/plan_sd_addnew', function(req, res, next) {
  db.one("SELECT 0 AS plan_rf, '' AS plan_name, 0 AS sd_rf, '' AS sd_name ")
    .then(function (data) {
      res.render('plan/plan_sd', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить ПЛАН-ПРОЛЁТ
//
router.get('/plan_sd/:plan_rf/:sd_rf', function(req, res, next) {
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  db.one(
    "SELECT plan_rf, plan_name, sd_rf, sd_name, days_num, workers_num " +
    " FROM ((plan_sd sf " +
    "   LEFT JOIN plan_list plan ON plan_rf = plan_id) " +
    "   LEFT JOIN sd_list sd ON sd_rf = sd_id) " +
    " WHERE plan_rf = $1 AND sd_rf = $2", [plan_rf, sd_rf])
    .then(function (data) {
      res.render('plan/plan_sd', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавление и корректировка ПЛАН-ПРОЛЁТ
//
router.post('/plan_sd/update', function(req, res, next) {
  var plan_rf = req.body.plan_rf;
  var sd_rf = req.body.sd_rf;
  var plan_name = req.body.plan_name;
  var sd_name = req.body.sd_name;
  var days_num = req.body.days_num;
  var workers_num = req.body.workers_num;
  var old_plan_rf = req.body.old_plan_rf;
  var old_sd_rf = req.body.old_sd_rf;
  if (plan_rf > 0 ) {
//  Обновление
    db.none(
      "UPDATE plan_sd " +
      "SET plan_rf=(SELECT plan_id FROM plan_list WHERE plan_name=$1), sd_rf=(SELECT sd_id FROM sd_list WHERE sd_name=$2), days_num=$3, workers_num=$4 " +
      "WHERE plan_rf=$5 AND sd_rf=$6",
      [plan_name, sd_name, days_num, workers_num, old_plan_rf, old_sd_rf])
      .then (function () {
        res.redirect('/plan/plan_sd_s');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO  plan_sd (plan_rf, sd_rf, days_num, workers_num ) " +
      "VALUES ((SELECT plan_id FROM plan_list WHERE plan_name=$1), (SELECT sd_id FROM sd_list WHERE sd_name=$2),  $3, $4)",
      [plan_name, sd_name, days_num, workers_num])
      .then (function (data) {
        res.redirect('/plan/plan_sd_s');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить  ПЛАН-ПРОЛЁТ
router.get('/plan_sd_delete/:plan_rf/:sd_rf', function(req, res, next) {
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  db.none("DELETE FROM plan_sd WHERE plan_rf=$1 AND sd_rf=$2", [plan_rf, sd_rf])
    .then(function () {
      res.redirect('/plan/plan_sd_s'); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});















module.exports = router;