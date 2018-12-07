var express = require('express');
var router = express.Router();

var fs = require('fs');

var db = require("../db");


function ShowFolderList(path) {
  var s = "x";


  return (s);
}




//
// Показать список файлов в каталоге
//
router.get('/files', function(req, res, next) {

  sss = ShowFolderList('c:');



  res.send('Процедура /test/files <br>('+sss+')<br>');

});

router.get('/fileio', function(req, res, next) {

  var data = { };
  data.dir = 'Каталог.';


  res.render('test/fileio', data);

});


//
// Загрузить список ЖБИ из файла с разделителями
//
router.get('/fc_load', function(req, res, next) {

  file_name = 'c:\\cborka\\fcl.txt';


  // Считываем содержание файла в память
  fs.readFile(file_name, function (err, logData) {

    // Если возникла ошибка, мы кидаем исключение
    // и программа заканчивается
    if (err) throw err;

    // logData это объект типа Buffer, переводим в строку
    var text = logData.toString();


    var ret = '';

    // Разбиваем текст на массив из строчек
    var lines = text.split('\n');
//    var arr = ["Яблоко", "Апельсин", "Груша"];

    for (var i = 0; i < lines.length; i++) {
      var parts = lines[i].split('|');
      ret = ret + ', nm='+parts[0]+', v='+parts[1];

      db.none(
        "INSERT INTO fc_list (fc_name, fc_v, bet_v, fc_w, concrete_rf, ok, notes) " +
        "VALUES ($1, $2, 0, 0, 1, '', '')",
        [parts[0],parts[1]])
        .then (function (data) {
          //res.redirect('/pro/fcs');

        })
        .catch(function (error) {
          res.send(error);
        });

    }
    res.send(ret);
  });

});


//====== СКЛАД ======= таблица sklad =============

//
// Показать список СКЛАД
//
router.get('/sklad_s', function(req, res, next) {

  res.redirect('/plan2/sklad_s/all');

});

router.get('/sklad_s/:spr_name', function(req, res, next) {
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
      res.render('plan2/sklad', data);
      data.spr_name = spr_name;


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