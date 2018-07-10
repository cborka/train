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












module.exports = router;