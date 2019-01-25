var express = require('express');
var router = express.Router();
var fs = require('fs');

var db = require("../db");

//
// Показать список ПОДРАЗДЕЛЕНИЙ
//
router.get('/sds', function(req, res, next) {
  db.any(
    "SELECT sd.sd_id, sd.sd_name, sd.psd_rf, psd.sd_name AS psd_name, sd.sd_short_name, sd.sd_full_name " +
      " FROM sd_list sd LEFT JOIN sd_list psd ON sd.psd_rf = psd.sd_id " +
      " WHERE sd.sd_id > 1" +
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

// Сформировать и возвратить список ПРОЛЕТОВ для выбора
  router.get('/get_prolet_names', function(req, res, next) {
    db.any(
      "SELECT sd_name " +
      "  FROM sd_list " +
      "  WHERE sd_id = 1 OR sd_name LIKE 'Пролет%'" +
      "  ORDER BY 1 ")
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

//
// Сформировать и возвратить список ЖБИ для выбора
//
  router.get('/get_fc_names', function(req, res, next) {
    db.any("SELECT fc_name FROM fc_list ORDER BY 1 ")
      .then (function (data) {
        var result = '';
        for (var i = 0; i < data.length; i++) {
          result = result + ' <option value="'+data[i].fc_name+'">'+data[i].fc_name+'</option>';
        }
        res.send(result);
      })
      .catch(function (error) {
        res.send(error);
      });
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

//
// Сформировать и возвратить список ФОРМ для выбора
//
router.get('/get_form_names', function(req, res, next) {
  db.any("SELECT form_name FROM form_list ORDER BY 1 ")
    .then (function (data) {
      var result = '';
      for (var i = 0; i < data.length; i++) {
        result = result + ' <option value="'+data[i].form_name+'">'+data[i].form_name+'</option>';
      }
      res.send(result);
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
    "SELECT plan_id, plan_name, CAST(date_begin AS VARCHAR) AS dtb, CAST(date_end AS VARCHAR) AS dte" +
    " FROM plan_list " +
    " WHERE plan_id > 1 " +
    " ORDER BY plan_name")
    .then(function (data) {

//      for (var i = 0; i < data.length; i++) {
//        data[i].dtb = data[i].date_begin.toISOString().slice(0, 10);
//        data[i].dte = data[i].date_end.toISOString().slice(0, 10);
//      }

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
  db.one("SELECT 0 AS plan_id, '' AS plan_name, CAST(CURRENT_DATE AS varchar) AS dtb, CAST(CURRENT_DATE+30 AS varchar) AS dte ")
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
    "SELECT plan_id, plan_name, CAST(date_begin AS VARCHAR) AS dtb, CAST(date_end AS VARCHAR) AS dte " +
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
  var dtb = req.body.dtb;
  var dte = req.body.dte;
  if (plan_id > 0 ) {
//  Обновление
    db.none(
      "UPDATE plan_list " +
      "SET plan_name=$1, " +
      "    date_begin=$2, " +
      "    date_end=$3 " +
      "WHERE plan_id=$4",
      [plan_name, dtb, dte, plan_id])
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
      "INSERT INTO plan_list (plan_name, date_begin, date_end) " +
      "VALUES ($1, $2, $3)",
      [plan_name, dtb, dte])
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

//
// Сформировать и возвратить список ПЛАНОВ для выбора
//
router.get('/get_plan_names', function(req, res, next) {
  db.any("SELECT plan_name FROM plan_list ORDER BY 1 ")
    .then (function (data) {
      var result = '';
      for (var i = 0; i < data.length; i++) {
        result = result + ' <option value="'+data[i].plan_name+'">'+data[i].plan_name+'</option>';
      }
      res.send(result);
    })
    .catch(function (error) {
      res.send(error);
    });
});


//=================== ПРОЛЁТ-ЖБИ-ТРУДОЁМКОСТЬ-ВРЕМЯ ФОРМОВКИ-КОЭФ.ОБОРАЧИВАЕМОСТИ =====================

//
// Показать список ПРОЛЁТ-ЖБИ
//
router.get('/sd_fc_s', function(req, res, next) {
  db.any(
    "SELECT m.sd_rf, sd.item_name AS sd_name, m.fc_rf, fc.item_name AS fc_name, trk, trkk, forming_time, kob " +
    " FROM ((sd_fc m " +
    "   LEFT JOIN item_list sd ON sd_rf = sd.item_id) " +
    "   LEFT JOIN item_list fc ON fc_rf = fc.item_id) " +
    " ORDER BY 2, 4 ")
    .then(function (data) {
      res.render('pro/sd_fc_s', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавить новый ПРОЛЁТ-ЖБИ
//
router.get('/sd_fc_addnew', function(req, res, next) {
  db.one("SELECT 0 AS sd_rf, '' AS sd_name, 0 AS fc_rf, '' AS fc_name, 11 AS forming_time, 2 AS kob ")
    .then(function (data) {
      res.render('pro/sd_fc', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить ПРОЛЁТ-ЖБИ
//
router.get('/sd_fc/:sd_rf/:fc_rf', function(req, res, next) {
  var sd_rf = req.params.sd_rf;
  var fc_rf = req.params.fc_rf;
  db.one(
    "SELECT m.sd_rf, sd.item_name AS sd_name, m.fc_rf, fc.item_name AS fc_name, trk, trkk, forming_time, kob " +
    " FROM ((sd_fc m " +
    "   LEFT JOIN item_list sd ON sd_rf = sd.item_id) " +
    "   LEFT JOIN item_list fc ON fc_rf = fc.item_id) " +
    " WHERE m.sd_rf = $1 AND m.fc_rf = $2", [sd_rf, fc_rf])
    .then(function (data) {
      res.render('pro/sd_fc', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавление и корректировка ПРОЛЁТ-ЖБИ
//
router.post('/sd_fc/update', function(req, res, next) {
  var sd_rf = req.body.sd_rf;
  var fc_rf = req.body.fc_rf;
  var sd_name = req.body.sd_name;
  var fc_name = req.body.fc_name;
  var trk = req.body.trk;
  var trkk = req.body.trkk;
  var forming_time = req.body.forming_time;
  var kob = req.body.kob;
  var old_sd_rf = req.body.old_sd_rf;
  var old_fc_rf = req.body.old_fc_rf;
  if (sd_rf > 0 ) {
//  Обновление
    db.none(
      "UPDATE sd_fc " +
      "SET sd_rf=(SELECT item_id FROM item_list WHERE item_name=$1), " +
      "    fc_rf=(SELECT item_id FROM item_list WHERE item_name=$2 AND spr_rf = 9), " +
      "    trk=$3, trkk=$4, forming_time=$5, kob=$6 " +
      "WHERE sd_rf=$7 AND fc_rf=$8",
      [sd_name, fc_name, trk, trkk, forming_time, kob, old_sd_rf, old_fc_rf])
      .then (function () {
        res.redirect('/pro/sd_fc_s');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO  sd_fc (sd_rf, fc_rf, trk, trkk,  forming_time, kob) " +
      "VALUES (" +
      "  (SELECT item_id FROM item_list WHERE item_name=$1), " +
      "  (SELECT item_id FROM item_list WHERE item_name=$2 AND spr_rf = 9), $3, $4, $5, $6)",
      [sd_name, fc_name, trk, trkk, forming_time, kob])
      .then (function (data) {
        res.redirect('/pro/sd_fc_s');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить  ПРОЛЁТ-ЖБИ
router.get('/sd_fc_delete/:sd_rf/:fc_rf', function(req, res, next) {
  var sd_rf = req.params.sd_rf;
  var fc_rf = req.params.fc_rf;
  db.none("DELETE FROM sd_fc WHERE sd_rf=$1 AND fc_rf=$2", [sd_rf, fc_rf])
    .then(function () {
      res.redirect('/pro/sd_fc_s'); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});

//=================== ПРОЛЁТ-ФОРМА (ОСНАСТКА) =====================

//
// Показать список ПРОЛЁТ-ФОРМА
//
router.get('/sd_form_s', function(req, res, next) {
  db.any(
    "SELECT sd_rf, sd_name, form_rf, form_name, form_num, form_num_max " +
    " FROM ((sd_form sf " +
    "   LEFT JOIN sd_list sd ON sd_rf = sd_id) " +
    "   LEFT JOIN form_list frm ON form_rf = form_id) " +
    " ORDER BY sd_name, form_name ")
    .then(function (data) {
      res.render('pro/sd_form_s', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавить новый ПРОЛЁТ-ФОРМА
//
router.get('/sd_form_addnew', function(req, res, next) {
  db.one("SELECT 0 AS sd_rf, '' AS sd_name, 0 AS form_rf, '' AS form_name ")
    .then(function (data) {
      res.render('pro/sd_form', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить ПРОЛЁТ-ФОРМА
//
router.get('/sd_form/:sd_rf/:form_rf', function(req, res, next) {
  var sd_rf = req.params.sd_rf;
  var form_rf = req.params.form_rf;
  db.one(
    "SELECT sd_rf, sd_name, form_rf, form_name, form_num, form_num_max " +
    " FROM ((sd_form sf " +
    "   LEFT JOIN sd_list sd ON sd_rf = sd_id) " +
    "   LEFT JOIN form_list frm ON form_rf = form_id) " +
    " WHERE sd_rf = $1 AND form_rf = $2", [sd_rf, form_rf])
    .then(function (data) {
      res.render('pro/sd_form', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавление и корректировка ПРОЛЁТ-ФОРМА
//
router.post('/sd_form/update', function(req, res, next) {
  var sd_rf = req.body.sd_rf;
  var form_rf = req.body.form_rf;
  var sd_name = req.body.sd_name;
  var form_name = req.body.form_name;
  var form_num = req.body.form_num;
  var form_num_max = req.body.form_num_max;
  var old_sd_rf = req.body.old_sd_rf;
  var old_form_rf = req.body.old_form_rf;
  if (sd_rf > 0 ) {
//  Обновление
    db.none(
      "UPDATE sd_form " +
      "SET sd_rf=(SELECT sd_id FROM sd_list WHERE sd_name=$1), form_rf=(SELECT form_id FROM form_list WHERE form_name=$2), form_num=$3, form_num_max=$4 " +
      "WHERE sd_rf=$5 AND form_rf=$6",
      [sd_name, form_name, form_num, form_num_max, old_sd_rf, old_form_rf])
      .then (function () {
        res.redirect('/pro/sd_form_s');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO  sd_form (sd_rf, form_rf, form_num, form_num_max) " +
      "VALUES ((SELECT sd_id FROM sd_list WHERE sd_name=$1), (SELECT form_id FROM form_list WHERE form_name=$2), $3, $4)",
      [sd_name, form_name, form_num, form_num_max])
      .then (function (data) {
        res.redirect('/pro/sd_form_s');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить  ПРОЛЁТ-ФОРМА
router.get('/sd_form_delete/:sd_rf/:form_rf', function(req, res, next) {
  var sd_rf = req.params.sd_rf;
  var form_rf = req.params.form_rf;
  db.none("DELETE FROM sd_form WHERE sd_rf=$1 AND form_rf=$2", [sd_rf, form_rf])
    .then(function () {
      res.redirect('/pro/sd_form_s'); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});

//=================== ФОРМА-ЖБИ =====================

//
// Показать список ФОРМА-ЖБИ
//
router.get('/form_fc_s', function(req, res, next) {
  db.any(
    "SELECT form_rf, form_name, fc_rf, fc_name,  cast(fc_num AS float), forming_time " +
    " FROM ((form_fc ff " +
    "   LEFT JOIN form_list frm ON form_rf = form_id) " +
    "   LEFT JOIN fc_list fc ON fc_rf = fc_id) " +
    " ORDER BY form_name, fc_name ")
    .then(function (data) {
      res.render('pro/form_fc_s', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавить новый ФОРМА-ЖБИ
//
router.get('/form_fc_addnew', function(req, res, next) {
  db.one("SELECT 0 AS form_rf, '' AS form_name, 0 AS fc_rf, '' AS fc_name, 0 AS forming_time ")
    .then(function (data) {
      res.render('pro/form_fc', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить ФОРМА-ЖБИ
//
router.get('/form_fc/:form_rf/:fc_rf', function(req, res, next) {
  var form_rf = req.params.form_rf;
  var fc_rf = req.params.fc_rf;
  db.one(
    "SELECT form_rf, form_name, fc_rf, fc_name,  cast(fc_num AS float), forming_time " +
    " FROM ((form_fc ff " +
    "   LEFT JOIN form_list frm ON form_rf = form_id) " +
    "   LEFT JOIN fc_list fc ON fc_rf = fc_id) " +
    " WHERE form_rf = $1 AND fc_rf = $2", [form_rf, fc_rf])
    .then(function (data) {
      res.render('pro/form_fc', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавление и корректировка ФОРМА-ЖБИ
//
router.post('/form_fc/update', function(req, res, next) {
  var form_rf = req.body.form_rf;
  var forming_time = req.body.forming_time;
  var form_name = req.body.form_name;
  var fc_name = req.body.fc_name;
  var fc_num = req.body.fc_num;
  var old_form_rf = req.body.old_form_rf;
  var old_fc_rf = req.body.old_fc_rf;
  if (form_rf > 0 ) {
//  Обновление
    db.none(
      "UPDATE form_fc " +
      "SET form_rf=(SELECT form_id FROM form_list WHERE form_name=$1), fc_rf=(SELECT fc_id FROM fc_list WHERE fc_name=$2), fc_num=$3, forming_time=$4 " +
      "WHERE form_rf=$5 AND fc_rf=$6",
      [form_name, fc_name, fc_num, forming_time, old_form_rf, old_fc_rf])
      .then (function () {
        res.redirect('/pro/form_fc_s');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO  form_fc (form_rf, fc_rf, fc_num, forming_time) " +
      "VALUES ((SELECT form_id FROM form_list WHERE form_name=$1), (SELECT fc_id FROM fc_list WHERE fc_name=$2), $3, $4)",
      [form_name, fc_name, fc_num, forming_time])
      .then (function (data) {
        res.redirect('/pro/form_fc_s');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить ФОРМА-ЖБИ
router.get('/form_fc_delete/:form_rf/:fc_rf', function(req, res, next) {
  var form_rf = req.params.form_rf;
  var fc_rf = req.params.fc_rf;
  db.none("DELETE FROM form_fc WHERE form_rf=$1 AND fc_rf=$2", [form_rf, fc_rf])
    .then(function () {
      res.redirect('/pro/form_fc_s'); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});



//=================== ЧАСТИ форма для формовки ЖБИ и просто ЧАСТИ чего-то =====================

//
// Показать список ЧАСТЕЙ
//
router.get('/parts', function(req, res, next) {
  db.any(
    "SELECT part_id, part_name " +
    " FROM part_list " +
    " WHERE part_id > 1 " +
    " ORDER BY part_name")
    .then(function (data) {
      res.render('pro/parts', {data: data}); // Показ части
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавить новую ЧАСТЬ
//
router.get('/part_addnew', function(req, res, next) {
  db.one("SELECT 0 AS part_id, '' AS part_name ")
    .then(function (data) {
      res.render('pro/part', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить ЧАСТЬ
//
router.get('/part/:part_id', function(req, res, next) {
  var part_id = req.params.part_id;
  db.one(
    "SELECT part_id, part_name " +
    " FROM part_list " +
    " WHERE part_id = $1", part_id)
    .then(function (data) {
      res.render('pro/part', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});
//
// Добавление и корректировка ЧАСТИ
//
router.post('/part_update', function(req, res, next) {
  var part_id = req.body.part_id;
  var part_name = req.body.part_name;
  if (part_id > 0 ) {
//  Обновление
    db.none(
      "UPDATE part_list " +
      "SET part_name=$1 " +
      "WHERE part_id=$2",
      [part_name, part_id])
      .then (function () {
        res.redirect('/pro/parts');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO part_list (part_name) " +
      "VALUES ($1)",
      [part_name])
      .then (function (data) {
        res.redirect('/pro/parts');

      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить ЧАСТЬ
router.get('/part_delete/:part_id', function(req, res, next) {
  var part_id = req.params.part_id;
  db.none("DELETE FROM part_list WHERE part_id=$1", part_id)
    .then(function () {
      res.redirect('/pro/parts'); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Сформировать и возвратить список ЧАСТЕЙ для выбора
//
router.get('/get_part_names', function(req, res, next) {
  db.any("SELECT part_name FROM part_list ORDER BY 1 ")
    .then (function (data) {
      var result = '';
      for (var i = 0; i < data.length; i++) {
        result = result + ' <option value="'+data[i].part_name+'">'+data[i].part_name+'</option>';
      }
      res.send(result);
    })
    .catch(function (error) {
      res.send(error);
    });
});


//=================== ФОРМА-ЧАСТЬ (СОСТАВНЫЕ ФОРМЫ) =====================

//
// Показать список ФОРМА-ЧАСТЬ
//
router.get('/form_part_s', function(req, res, next) {
  db.any(
    "SELECT form_rf, form_name, part_rf, part_name,  cast(part_num AS float) " +
    " FROM ((form_part m " +
    "   LEFT JOIN item_list frm ON m.form_rf = form_id) " +
    "   LEFT JOIN item_list fc ON m.part_rf = part_id) " +
    " ORDER BY form_name, part_name ")
    .then(function (data) {
      res.render('pro/form_part_s', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавить новый ФОРМА-ЧАСТЬ
//
router.get('/form_part_addnew', function(req, res, next) {
  db.one("SELECT 0 AS form_rf, '' AS form_name, 0 AS part_rf, '' AS part_name, 0 AS part_num ")
    .then(function (data) {
      res.render('pro/form_part', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить ФОРМА-ЧАСТЬ
//
router.get('/form_part/:form_rf/:part_rf', function(req, res, next) {
  var form_rf = req.params.form_rf;
  var part_rf = req.params.part_rf;
  db.one(
    "SELECT form_rf, form_name, part_rf, part_name,  cast(part_num AS float) " +
    " FROM ((form_part ff " +
    "   LEFT JOIN form_list frm ON form_rf = form_id) " +
    "   LEFT JOIN part_list fc ON part_rf = part_id) " +
    " WHERE form_rf = $1 AND part_rf = $2", [form_rf, part_rf])
    .then(function (data) {
      res.render('pro/form_part', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавление и корректировка ФОРМА-ЧАСТЬ
//
router.post('/form_part/update', function(req, res, next) {
  var form_rf = req.body.form_rf;
  var form_name = req.body.form_name;
  var part_name = req.body.part_name;
  var part_num = req.body.part_num;
  var old_form_rf = req.body.old_form_rf;
  var old_part_rf = req.body.old_part_rf;
  if (form_rf > 0 ) {
//  Обновление
    db.none(
      "UPDATE form_part " +
      "SET form_rf=(SELECT form_id FROM form_list WHERE form_name=$1), part_rf=(SELECT part_id FROM part_list WHERE part_name=$2), part_num=$3 " +
      "WHERE form_rf=$4 AND part_rf=$5",
      [form_name, part_name, part_num, old_form_rf, old_part_rf])
      .then (function () {
        res.redirect('/pro/form_part_s');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO  form_part (form_rf, part_rf, part_num) " +
      "VALUES ((SELECT form_id FROM form_list WHERE form_name=$1), (SELECT part_id FROM part_list WHERE part_name=$2), $3)",
      [form_name, part_name, part_num])
      .then (function (data) {
        res.redirect('/pro/form_part_s');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить ФОРМА-ЧАСТЬ
router.get('/form_part_delete/:form_rf/:part_rf', function(req, res, next) {
  var form_rf = req.params.form_rf;
  var part_rf = req.params.part_rf;
  db.none("DELETE FROM form_part WHERE form_rf=$1 AND part_rf=$2", [form_rf, part_rf])
    .then(function () {
      res.redirect('/pro/form_part_s'); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});


//=================== ПРОЛЁТ-ЧАСТИ (ФОРМ) =====================

//
// Показать список ПРОЛЁТ-ЧАСТЬ
//
router.get('/sd_part_s', function(req, res, next) {
  db.any(
    "SELECT m.sd_rf, sd.item_name AS sd_name, m.part_rf, p.item_name AS part_name, m.part_num " +
    " FROM ((sd_part m " +
    "   LEFT JOIN item_list sd ON m.sd_rf = sd.item_id) " +
    "   LEFT JOIN item_list p ON m.part_rf = p.item_id) " +
    " ORDER BY 2, 4 ")
    .then(function (data) {

      // Убираю конечные нули в дробной части
      for (var i = 0; i < data.length; i++) {
        data[i].part_num = Math.round(data[i].part_num * 1000) / 1000
      }

      res.render('pro/sd_part_s', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавить новый ПРОЛЁТ-ЧАСТЬ
//
router.get('/sd_part_addnew', function(req, res, next) {
  db.one("SELECT 0 AS sd_rf, '' AS sd_name, 0 AS part_rf, '' AS part_name, 0 AS part_num ")
    .then(function (data) {
      res.render('pro/sd_part', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить ПРОЛЁТ-ЧАСТЬ
//
router.get('/sd_part/:sd_rf/:part_rf', function(req, res, next) {
  var sd_rf = req.params.sd_rf;
  var part_rf = req.params.part_rf;
  db.one(
    "SELECT m.sd_rf, sd.item_name AS sd_name, m.part_rf, p.item_name AS part_name, m.part_num " +
    " FROM ((sd_part m " +
    "   LEFT JOIN item_list sd ON m.sd_rf = sd.item_id) " +
    "   LEFT JOIN item_list p ON m.part_rf = p.item_id) " +
    " WHERE m.sd_rf = $1 AND m.part_rf = $2", [sd_rf, part_rf])
    .then(function (data) {
      res.render('pro/sd_part', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавление и корректировка ПРОЛЁТ-ЧАСТЬ
//
router.post('/sd_part/update', function(req, res, next) {
  var sd_rf = req.body.sd_rf;
  var part_rf = req.body.part_rf;
  var sd_name = req.body.sd_name;
  var part_name = req.body.part_name;
  var part_num = req.body.part_num;
  var old_sd_rf = req.body.old_sd_rf;
  var old_part_rf = req.body.old_part_rf;
  if (sd_rf > 0 ) {
//  Обновление
    db.none(
      "UPDATE sd_part " +
      "SET sd_rf=(SELECT item_id FROM item_list WHERE item_name=$1), " +
      "  part_rf=(SELECT item_id FROM item_list WHERE item_name=$2), part_num=$3 " +
      "WHERE sd_rf=$4 AND part_rf=$5",
      [sd_name, part_name, part_num, old_sd_rf, old_part_rf])
      .then (function () {
        res.redirect('/pro/sd_part_s');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO  sd_part (sd_rf, part_rf, part_num) " +
      " VALUES (" +
      " (SELECT item_id FROM item_list WHERE item_name=$1), " +
      " (SELECT item_id FROM item_list WHERE item_name=$2), " +
      "  $3)",
      [sd_name, part_name, part_num])
      .then (function (data) {
        res.redirect('/pro/sd_part_s');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить  ПРОЛЁТ-ЧАСТЬ
router.get('/sd_part_delete/:sd_rf/:part_rf', function(req, res, next) {
  var sd_rf = req.params.sd_rf;
  var part_rf = req.params.part_rf;
  db.none("DELETE FROM sd_part WHERE sd_rf=$1 AND part_rf=$2", [sd_rf, part_rf])
    .then(function () {
      res.redirect('/pro/sd_part_s'); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});













module.exports = router;