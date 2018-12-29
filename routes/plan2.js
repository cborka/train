var express = require('express');
var router = express.Router();

var db = require("../db");


// ПЛАНИРОВАНИЕ И ОТСЛЕЖИВАНИЕ ВЫПОЛНЕНИЯ ПЛАНА

// Таблицы
//   plan_plan
//   plan_fact
//   sklad



//====== ПЛАН ======= таблица plan_plan =============
// То, что запланировано сделать. На месяц и по дням

//
// Показать список ПЛАН
//
router.get('/plan_plan_s/:spr_name', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var where_clause = '';

  db.any(
    "SELECT item_id " +
    "  FROM item_list " +
    "  WHERE  item_name = $1 ", [spr_name])
    .then(function (data) {

      if (data.length == 1) {
        where_clause = " WHERE item.spr_rf = " + data[0].item_id;
      }
      else
        where_clause = " WHERE item.spr_rf = 0 ";

//      res.render('plan2/sklad_s', {data: data}); // Показ формы

    })
    .then(function () {
  db.any(
    "SELECT pp.plan_rf, plan.item_name AS plan_name, " +
    "    pp.sd_rf, sd.item_name AS sd_name, pp.item_rf, item.item_name AS item_name, num_plan, num_day " +
    " FROM (((plan_plan pp " +
    "   LEFT JOIN item_list plan ON plan_rf = plan.item_id) " +
    "   LEFT JOIN item_list sd ON sd_rf = sd.item_id) " +
    "   LEFT JOIN item_list item ON item_rf = item.item_id) " +
    where_clause +
    " ORDER BY plan.item_name, sd.item_name, item.item_name ")
    .then(function (data) {

      for (var i = 0; i < data.length; i++) {
        data[i].num_plan = Math.round(data[i].num_plan * 1000) / 1000
        data[i].num_day = Math.round(data[i].num_day * 1000) / 1000
      }

      data.spr_name = spr_name;
      res.render('plan2/plan_plan_s', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
  });
});

//
// Добавить новую строку в ПЛАН
//
router.get('/plan_plan_addnew/:spr_name', function(req, res, next) {
  var spr_name = req.params.spr_name;
  db.one("SELECT 0 AS plan_rf, '' AS plan_name, 0 AS sd_rf, '' AS sd_name, 0 AS item_rf, '' AS item_name, 0 AS num_plan, 0 AS num_day ")
    .then(function (data) {

      data.spr_name = spr_name;

      res.render('plan2/plan_plan', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить строку ПЛАНа
//
router.get('/plan_plan/:spr_name/:plan_rf/:sd_rf/:item_rf', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  var item_rf = req.params.item_rf;
  db.one(
    "SELECT pp.plan_rf, plan.item_name AS plan_name, " +
    "    pp.sd_rf, sd.item_name AS sd_name, pp.item_rf, item.item_name AS item_name, num_plan, num_day " +
    " FROM (((plan_plan pp " +
    "   LEFT JOIN item_list plan ON plan_rf = plan.item_id) " +
    "   LEFT JOIN item_list sd ON sd_rf = sd.item_id) " +
    "   LEFT JOIN item_list item ON item_rf = item.item_id) " +
    " WHERE plan_rf=$1 AND sd_rf=$2 AND item_rf=$3", [plan_rf, sd_rf, item_rf])
    .then(function (data) {

      data.num_plan = Math.round(data.num_plan * 1000) / 1000
      data.num_day = Math.round(data.num_day * 1000) / 1000

      data.spr_name = spr_name;

      res.render('plan2/plan_plan', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавление и корректировка строки ПЛАНа
//
router.post('/plan_plan/update', function(req, res, next) {
  var spr_name = req.body.spr_name;
  var plan_rf = req.body.plan_rf;
  var sd_rf = req.body.sd_rf;
  var item_rf = req.body.item_rf;
  var plan_name = req.body.plan_name;
  var sd_name = req.body.sd_name;
  var item_name = req.body.item_name;
  var num_plan = req.body.num_plan;
  var num_day = req.body.num_day;
  var old_plan_rf = req.body.old_plan_rf;
  var old_sd_rf = req.body.old_sd_rf;
  var old_item_rf = req.body.old_item_rf;
  if (sd_rf > 0 ) {
//  Обновление
    db.none(
      "UPDATE plan_plan " +
      "SET plan_rf=(SELECT item_id FROM item_list WHERE item_name=$1), " +
      "    sd_rf=(SELECT item_id FROM item_list WHERE item_name=$2), " +
      "    item_rf=(SELECT item_id FROM item_list WHERE item_name=$3), " +
      "    num_plan=$4, num_day=$5 " +
      "WHERE plan_rf=$6 AND sd_rf=$7 AND item_rf=$8",
      [plan_name, sd_name, item_name, num_plan, num_day, old_plan_rf, old_sd_rf, old_item_rf])
      .then (function () {
        res.redirect('/plan2/plan_plan_s/'+spr_name);
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO  plan_plan (plan_rf, sd_rf, item_rf, num_plan, num_day) " +
      "VALUES ((SELECT item_id FROM item_list WHERE item_name=$1), " +
      "  (SELECT item_id FROM item_list WHERE item_name=$2), " +
      "  (SELECT item_id FROM item_list WHERE item_name=$3), $4, $5)",
      [plan_name, sd_name, item_name, num_plan, num_day])
      .then (function (data) {
        res.redirect('/plan2/plan_plan_s/'+spr_name);
      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить  ПЛАН ПРОИЗВОДСТВА ЖБИ
router.get('/plan_plan_delete/:spr_name/:plan_rf/:sd_rf/:item_rf', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  var item_rf = req.params.item_rf;
  db.none("DELETE FROM plan_plan WHERE plan_rf=$1 AND sd_rf=$2 AND item_rf=$3", [plan_rf, sd_rf, item_rf])
    .then(function () {
      res.redirect('/plan2/plan_plan_s/'+spr_name); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});


//====== ФАКТ ======= таблица plan_fact =========================================================
// То, что сделано

//
// Показать список ФАКТ
//
router.get('/plan_fact_s/:spr_name', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var where_clause = '';

  db.any(
    "SELECT item_id " +
    "  FROM item_list " +
    "  WHERE  item_name = $1 ", [spr_name])
    .then(function (data) {

      if (data.length == 1) {
        where_clause = " WHERE item.spr_rf = " + data[0].item_id;
      }
      else
        where_clause = " WHERE item.spr_rf = 0 ";

//      res.render('plan2/sklad_s', {data: data}); // Показ формы

    })
    .then(function () {
  db.any(
    "SELECT pp.plan_rf, plan.item_name AS plan_name, " +
    "    pp.sd_rf, sd.item_name AS sd_name, pp.item_rf, item.item_name AS item_name, CAST(pp.dt AS VARCHAR) AS dt, num_fact, doc_rf " +
    " FROM (((plan_fact pp " +
    "   LEFT JOIN item_list plan ON plan_rf = plan.item_id) " +
    "   LEFT JOIN item_list sd ON sd_rf = sd.item_id) " +
    "   LEFT JOIN item_list item ON item_rf = item.item_id) " +
    where_clause +
    " ORDER BY plan.item_name, pp.dt, sd.item_name, item.item_name ")
    .then(function (data) {

      for (var i = 0; i < data.length; i++) {
        data[i].num_fact = Math.round(data[i].num_fact * 1000) / 1000
      }

      data.spr_name = spr_name;

      res.render('plan2/plan_fact_s', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
  });
});

//
// Добавить новую строку в ФАКТ
//
router.get('/plan_fact_addnew/:spr_name', function(req, res, next) {
  var spr_name = req.params.spr_name;
  db.one("SELECT 0 AS plan_rf, '' AS plan_name, 0 AS sd_rf, '' AS sd_name, 0 AS item_rf, '' AS item_name, CAST(CURRENT_TIMESTAMP AS VARCHAR) AS dt, 0 AS num_fact ")
    .then(function (data) {

      data.spr_name = spr_name;

      res.render('plan2/plan_fact', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить строку ФАКТа
//
router.get('/plan_fact/:spr_name/:plan_rf/:sd_rf/:item_rf', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  var item_rf = req.params.item_rf;
  db.one(
    "SELECT pp.plan_rf, plan.item_name AS plan_name, " +
    "    pp.sd_rf, sd.item_name AS sd_name, pp.item_rf, item.item_name AS item_name, CAST(pp.dt AS VARCHAR) AS dt, num_fact " +
    " FROM (((plan_fact pp " +
    "   LEFT JOIN item_list plan ON plan_rf = plan.item_id) " +
    "   LEFT JOIN item_list sd ON sd_rf = sd.item_id) " +
    "   LEFT JOIN item_list item ON item_rf = item.item_id) " +
    " WHERE plan_rf=$1 AND sd_rf=$2 AND item_rf=$3", [plan_rf, sd_rf, item_rf])
    .then(function (data) {

      data.num_fact = Math.round(data.num_fact * 1000) / 1000

      data.spr_name = spr_name;

      res.render('plan2/plan_fact', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавление и корректировка строки ФАКТа
//
router.post('/plan_fact/update', function(req, res, next) {
  var spr_name = req.body.spr_name;
  var plan_rf = req.body.plan_rf;
  var sd_rf = req.body.sd_rf;
  var item_rf = req.body.item_rf;
  var plan_name = req.body.plan_name;
  var sd_name = req.body.sd_name;
  var item_name = req.body.item_name;
  var dt = req.body.dt;
  var num_fact = req.body.num_fact;
  var old_plan_rf = req.body.old_plan_rf;
  var old_sd_rf = req.body.old_sd_rf;
  var old_item_rf = req.body.old_item_rf;
  if (sd_rf > 0 ) {
//  Обновление
    db.none(
      "UPDATE plan_fact " +
      "SET plan_rf=(SELECT item_id FROM item_list WHERE item_name=$1), " +
      "    sd_rf=(SELECT item_id FROM item_list WHERE item_name=$2), " +
      "    item_rf=(SELECT item_id FROM item_list WHERE item_name=$3), " +
      "    dt=$4, num_fact=$5 " +
      "WHERE plan_rf=$6 AND sd_rf=$7 AND item_rf=$8",
      [plan_name, sd_name, item_name, dt, num_fact, old_plan_rf, old_sd_rf, old_item_rf])
      .then (function () {
        res.redirect('/plan2/plan_fact_s/'+spr_name);
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO  plan_fact (plan_rf, sd_rf, item_rf, dt, num_fact) " +
      "VALUES ((SELECT item_id FROM item_list WHERE item_name=$1), " +
      "  (SELECT item_id FROM item_list WHERE item_name=$2), " +
      "  (SELECT item_id FROM item_list WHERE item_name=$3), $4, $5)",
      [plan_name, sd_name, item_name, dt, num_fact])
      .then (function (data) {
        res.redirect('/plan2/plan_fact_s/'+spr_name);
      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить ФАКТ
router.get('/plan_fact_delete/:spr_name/:plan_rf/:sd_rf/:item_rf', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  var item_rf = req.params.item_rf;
  db.none("DELETE FROM plan_fact WHERE plan_rf=$1 AND sd_rf=$2 AND item_rf=$3", [plan_rf, sd_rf, item_rf])
    .then(function () {
      res.redirect('/plan2/plan_fact_s/'+spr_name); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});


//====== СКЛАД ======= таблица sklad ===========================================

//
// Показать список СКЛАД
//
router.get('/sklad_s', function(req, res, next) {

  res.redirect('/plan2/sklad_s/all');

});

router.get('/sklad_s/:spr_name', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var where_clause = '';

//  if (spr_name != '0')
//    where_clause = " WHERE item.spr_rf = " + spr_name;

  db.any(
    "SELECT item_id " +
    "  FROM item_list " +
    "  WHERE  item_name = $1 ", [spr_name])
    .then(function (data) {

      if (data.length == 1) {
        where_clause = " WHERE item.spr_rf = " + data[0].item_id;
      }
      else
        where_clause = " WHERE item.spr_rf = 0 ";

//      res.render('plan2/sklad_s', {data: data}); // Показ формы

    })
    .then(function () {
      db.any(
    "SELECT pp.sklad_rf, sklad.item_name AS sklad_name, " +
    "    pp.item_rf, item.item_name AS item_name, num_fact, num_max, (num_max - num_fact) AS num_free " +
    " FROM ((sklad pp " +
    "   LEFT JOIN item_list sklad ON sklad_rf = sklad.item_id) " +
    "   LEFT JOIN item_list item ON item_rf = item.item_id) " +
      where_clause +
    " ORDER BY sklad.item_name, item.item_name ")
    .then(function (data) {

      for (var i = 0; i < data.length; i++) {
        data[i].num_fact = Math.round(data[i].num_fact * 1000) / 1000
        data[i].num_max = Math.round(data[i].num_max * 1000) / 1000
        data[i].num_free = Math.round(data[i].num_free * 1000) / 1000
      }

      data.spr_name = spr_name;
      res.render('plan2/sklad_s', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });

  });

});

//
// Добавить новую строку в СКЛАД
//sklad_addnew
router.get('/sklad_addnew/:spr_name', function(req, res, next) {
  var spr_name = req.params.spr_name;
  db.one("SELECT 0 AS sklad_rf, '' AS sklad_name, 0 AS item_rf, '' AS item_name, 0 AS num_fact, 0 AS num_max, 0 AS num_free ")
    .then(function (data) {

      data.spr_name = spr_name;

      res.render('plan2/sklad', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить строку СКЛАДа
//
router.get('/sklad/:spr_name/:sklad_rf/:item_rf', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var sklad_rf = req.params.sklad_rf;
  var item_rf = req.params.item_rf;
  db.one(
    "SELECT pp.sklad_rf, sklad.item_name AS sklad_name, " +
    "    pp.item_rf, item.item_name AS item_name, num_fact, num_max, (num_max - num_fact) AS num_free " +
    " FROM ((sklad pp " +
    "   LEFT JOIN item_list sklad ON sklad_rf = sklad.item_id) " +
    "   LEFT JOIN item_list item ON item_rf = item.item_id) " +
    " WHERE sklad_rf=$1 AND item_rf=$2", [sklad_rf, item_rf])
    .then(function (data) {

      data.num_fact = Math.round(data.num_fact * 1000) / 1000
      data.num_max = Math.round(data.num_max * 1000) / 1000
      data.num_free = Math.round(data.num_free * 1000) / 1000

      data.spr_name = spr_name;

      res.render('plan2/sklad', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавление и корректировка строки СКЛАДа
//
router.post('/sklad/update', function(req, res, next) {
  var spr_name = req.body.spr_name;
  var sklad_rf = req.body.sklad_rf;
  var item_rf = req.body.item_rf;
  var sklad_name = req.body.sklad_name;
  var item_name = req.body.item_name;
  var num_fact = req.body.num_fact;
  var num_max = req.body.num_max;
  var old_sklad_rf = req.body.old_sklad_rf;
  var old_item_rf = req.body.old_item_rf;
  if (item_rf > 0 ) {
//  Обновление
    db.none(
      "UPDATE sklad " +
      "SET sklad_rf=(SELECT item_id FROM item_list WHERE item_name=$1), " +
      "    item_rf=(SELECT item_id FROM item_list WHERE item_name=$2), " +
      "    num_fact=$3, num_max=$4 " +
      "WHERE sklad_rf=$5 AND item_rf=$6",
      [sklad_name, item_name, num_fact, num_max, old_sklad_rf, old_item_rf])
      .then (function () {
        res.redirect('/plan2/sklad_s/'+spr_name);
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO sklad (sklad_rf, item_rf, num_fact, num_max) " +
      "VALUES ((SELECT item_id FROM item_list WHERE item_name=$1), " +
      "  (SELECT item_id FROM item_list WHERE item_name=$2), $3, $4)",
      [sklad_name, item_name, num_fact, num_max])
      .then (function (data) {
        res.redirect('/plan2/sklad_s/'+spr_name);
      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить предмет со СКЛАДа
router.get('/sklad_delete/:spr_name/:sklad_rf/:item_rf', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var sklad_rf = req.params.sklad_rf;
  var item_rf = req.params.item_rf;
  db.none("DELETE FROM sklad WHERE sklad_rf=$1 AND item_rf=$2", [sklad_rf, item_rf])
    .then(function () {
      res.redirect('/plan2/sklad_s/'+spr_name); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});


module.exports = router;