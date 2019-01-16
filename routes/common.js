var express = require('express');
var router = express.Router();

var fs = require('fs');
var db = require("../db");

//
// Common
//
router.get('/common', function(req, res, next) {

  res.send('/common/common <br>');

});

router.get('/index', function(req, res, next) {

  res.send('/common/index <br>');

});


//
// Показать СПИСОК всего
//
router.get('/items', function(req, res, next) {
  db.any(
    "SELECT item.spr_rf, spr.item_name AS spr_name, item.group_rf, grp.item_name AS group_name, item.item_id, item.item_name, " +
    " item.item_flag, item.path_name " +
    " FROM ((item_list item " +
    "   LEFT JOIN item_list grp ON item.group_rf = grp.item_id) " +
    "   LEFT JOIN item_list spr ON item.spr_rf = spr.item_id) " +
    " WHERE item.item_id > 0" +
    " ORDER BY spr.item_name, grp.item_name, item.item_name")
    .then(function (data) {
      res.render('common/items', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавить новое 
//
router.get('/item_addnew', function(req, res, next) {
  db.one("SELECT 0 AS item_id, '' AS item_name, 0 AS group_rf, 0 AS spr_rf, 1 AS item_flag, '/' AS path_name ")
    .then(function (data) {
      res.render('common/item', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить
//
router.get('/item/:item_id', function(req, res, next) {
  var item_id = req.params.item_id;
  db.one(
    "SELECT item.item_id, item.item_name, item.group_rf, grp.item_name AS group_name, " +
    "      item.spr_rf, spr.item_name AS spr_name, item.item_flag, item.path_name " +
    " FROM ((item_list item " +
    "   LEFT JOIN item_list grp ON item.group_rf = grp.item_id) " +
    "   LEFT JOIN item_list spr ON item.spr_rf = spr.item_id) " +
    " WHERE item.item_id = $1", item_id)
    .then(function (data) {
      res.render('common/item', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});
//
// Добавление и корректировка
//
router.post('/item_update', function(req, res, next) {
  var item_id = req.body.item_id;
  var item_name = req.body.item_name;
  var group_name = req.body.group_name;
  var spr_name = req.body.spr_name;
  var item_flag = req.body.item_flag;
  var path_name = req.body.path_name;
  if (item_id > 0 ) {
//  Обновление
    db.none(
      "UPDATE item_list " +
      "SET item_name=$1, " +
      "  group_rf=(SELECT item_id FROM item_list WHERE item_name = $2), " +
      "  spr_rf=(SELECT item_id FROM item_list WHERE item_name = $3), " +
      "  item_flag=$4, " +
      "  path_name=$5 " +
      "WHERE item_id=$6",
      [item_name, group_name, spr_name, item_flag, path_name, item_id])
      .then (function () {
        res.redirect('/common/items');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO item_list (item_name, group_rf, spr_rf, item_flag, path_name) " +
      "VALUES ($1, " +
      "  (SELECT item_id FROM item_list WHERE item_name = $2), " +
      "  (SELECT item_id FROM item_list WHERE item_name = $3), " +
      "  $4, $5)",
      [item_name, group_name, spr_name, item_flag, path_name])
      .then (function (data) {
        res.redirect('/common/items');

      })
      .catch(function (error) {
        res.send(error);
      });
  }
});
// Удалить
router.get('/item_delete/:item_id', function(req, res, next) {
  var item_id = req.params.item_id;
  db.none("DELETE FROM item_list WHERE item_id=$1", item_id)
    .then(function () {
      res.redirect('/common/items'); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});

//========================================================================

//
// Сформировать и возвратить список Групп для выбора
//
router.get('/get_group_names', function(req, res, next) {
  db.any("SELECT item_name FROM item_list ORDER BY 1 ")
    .then (function (data) {
      var result = '';
      for (var i = 0; i < data.length; i++) {
        result = result + ' <option value="'+data[i].item_name+'">'+data[i].item_name+'</option>';
      }
      res.send(result);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Сформировать и возвратить список Справочников для выбора
//
router.get('/get_sprs', function(req, res, next) {
  db.any(
    "SELECT item_name " +
    "  FROM item_list " +
    "  WHERE (spr_rf = 3 OR item_id = 3)" +
    "  ORDER BY 1 ")
    .then (function (data) {
      var result = '';
      for (var i = 0; i < data.length; i++) {
        result = result + ' <option value="'+data[i].item_name+'">'+data[i].item_name+'</option>';
      }
      res.send(result);
    })
    .catch(function (error) {
      res.send(error);
    });
});



// Сформировать и возвратить список для выбора из справочника :spr
//
router.get('/get_spr_names/:spr', function(req, res, next) {
  var spr = req.params.spr;
  db.any(
    "SELECT item_name " +
    "  FROM item_list " +
    "  WHERE spr_rf = " +
    "    (SELECT item_id FROM item_list WHERE spr_rf = 3 AND item_name = $1)" +
    "  ORDER BY 1 ", [spr])
    .then (function (data) {
      var result = ' <option value=""></option>';
      for (var i = 0; i < data.length; i++) {
        result = result + ' <option value="'+data[i].item_name+'">'+data[i].item_name+'</option>';
      }
      res.send(result);
    })
    .catch(function (error) {
      res.send('get_spr_names: ОШИБКА: ' +error);
    });
});

//
// Сформировать и возвратить весь список для выбора (кроме названий справочников)
//
router.get('/get_all_items', function(req, res, next) {
  db.any(
     "SELECT item_name " +
     "  FROM item_list " +
     "  WHERE spr_rf != 3" +
     "  ORDER BY 1 ")
    .then (function (data) {
       var result = '';
       for (var i = 0; i < data.length; i++) {
         result = result + ' <option value="'+data[i].item_name+'">'+data[i].item_name+'</option>';
       }
       res.send(result);
     })
    .catch(function (error) {
       res.send('get_all_items: ОШИБКА: ' +error);
    });
});

//========================================================================

//
// Добавить содержимое в текстовый файл
//
router.post('/add_text_to_file', function(req, res, next) {
  var file_name = req.body.file_name;
  var text = req.body.text;

  fs.appendFile(file_name, text, function (err) {
    if (err)
      res.send('add_text_to_file: ОШИБКА: ' +err);
    else
      res.send('+1<br>');
});

});
















module.exports = router;