var express = require('express');
var router = express.Router();

var fs = require('fs');
var db = require("../db");

// Каталог в котором появляются файлы с информацией (текстовые файлы с разделителями)
var dir = '\\\\10.0.0.10\\обменпризводство';
//var archive_dir = '\\\\10.0.0.33\\Common\\x321\\loaded_files';


function str2num(str) {

  ret = '';
  for (var i = 0; i < str.length; i++) {
    s = str.substr(i,1);
    if ((s == '0') ||  (s == '1') ||  (s == '2') ||  (s == '3') ||  (s == '4') ||  (s == '5') ||  (s == '6') ||
        (s == '7') ||  (s == '8') ||  (s == '9') ||  (s == '.')
    )
    ret = ret + s;
  }
  return (ret);
}


//
//  Пример разбиения файла на строки и дальше этих строк на поля
//
function SEL(buf) {

  var text = buf.toString();
  var ret = '';

  // Разбиваем текст на массив из строчек
  var lines = text.split('\n');

  for (var i = 0; i < lines.length; i++) {
    var parts = lines[i].split('\t');

    for (var j = 0; j < parts.length; j++) {
      ret = ret + 'p[' + j + ']="'+ parts[j] + '", ';
    }
    ret = ret + '<br>';
  }

  return (ret);
}


//
// Импорт данных, ГЛАВНАЯ СТРАНИЦА
//
router.get('/from1c', function(req, res, next) {
  var data = { };
  res.render('import/from1c', data);
});

//
// Возвратить список файлов с загружаемыми данными
//
router.get('/1c8filenames', function(req, res, next) {

  fs.readdir(dir, function(err, data) {
    var s = '';

    if (err) {
      s = 'ОШИБКА чтения из каталога.';
      res.send('from1c: '+s+'<br>');
      return;
    }

    // Цикл по файлам каталога
    for (var i = 0; i < data.length; i++) {
      if ((data[i].substring(17) == 'формовка ЖБИ.txt')
        || (data[i].substring(17) == 'сдача ЖБИ.txt')
        || (data[i].substring(17) == 'отгрузка ЖБИ.txt')
        || (data[i].substring(17) == 'арматура в пролет.txt')
        || (data[i].substring(17) == 'выдача бетона.txt')
    )
//      if (data[i].slice(-4) == '.txt')
      {
        s = s + data[i] + '\n<br>';
        break;
      }

//      if (i > 7) break;
    }

    res.send(s);
  });

});

//
// Удаление файла,
// вернее файл перемещается в подкаталог ./111,
// и затем уже оттуда перемещается в другое место другоими средствами
//
router.post('/remove_file', function(req, res, next) {
  var filename = req.body.filename;

  fs.rename(dir+'\\'+filename, dir+'\\111\\'+filename,  function (err) {
    var s = 'x';
    if (err)
      s = 'ОШИБКА: Не смог удалить файл '+filename+'---'+dir+'\\'+filename +' --> '+ dir+'\\111\\'+filename+'.<br>';
    else
      s =  'Файл '+filename+' удалён!<br>';

    res.send(s);
  });

});

//
// Вернуть содержимое файла
//
router.post('/get_data', function(req, res, next) {
  var filename = req.body.filename;
  var text = '';

  // Считываем содержание файла в память
  fs.readFile(dir+'\\'+filename, function (err, logData) {

    if (err) {
      text = 'get_data: ОШИБКА чтения файла ' + filename+'<br>';
    }
    else {
      text = logData.toString(); // logData это объект типа Buffer, переводим в строку
    }

    res.send(text);
  });

});


//===========================================================
//                  РАСХОД ЖБИ
//===========================================================
//
// Показать загруженный из 1С расход ЖБИ
//
router.get('/fcrashod1c', function(req, res, next) {
  var data = { };
  res.render('import/fcrashod1c', data);

});
//
// Сформировать и возвратить список заказчиков из таблицы fcrashod1c
//
router.get('/get_fcrashod_cust_names', function(req, res, next) {
  db.any(
    "SELECT DISTINCT cust_name " +
    "  FROM fcrashod_1c " +
    "  ORDER BY 1 ")
    .then (function (data) {
      var result = ' <option value=""> </option>';
      for (var i = 0; i < data.length; i++) {
        result = result + ' <option value="'+data[i].cust_name+'">'+data[i].cust_name+'</option>';
      }
      res.send(result);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать выборку из таблицыБД fcrashod_1c
//
router.post('/get_fcrashod_table', function(req, res, next) {
  var cust_name = req.body.cust_name;

  db.any(
    "SELECT fc_name, SUM(fc_num) AS fc_num " +
    "  FROM fcrashod_1c " +
    "  WHERE cust_name = $1 " +
    "  GROUP BY fc_name " +
    "  ORDER BY fc_name ", [cust_name])
    .then (function (data) {

      var result = ' <table class="list">';
      for (var i = 0; i < data.length; i++) {
        result = result + '<tr><td>' + data[i].fc_name + '</td>';
        result = result + '<td>' + data[i].fc_num + '</td></tr>';
      }
      result = result +'</table>';

      res.send(result);
    })
    .catch(function (error) {
      res.send(error);
    });
});



// ==================================== ЗАГРУЗКА ====================================

//
// Загрузить строку таблицы fcrashod_1c
//
router.post('/load_string_fcrashod', function(req, res, next) {
  var string_no = req.body.string_no;
  var id1c = req.body.id1c;
  var dt = req.body.dt;
  var sklad_name = req.body.sklad_name;
  var cust_name = req.body.cust_name;
  var fc_name = req.body.fc_name;
  var fc_num = req.body.fc_num;

  db.none(
    "INSERT INTO fcrashod_1c(id1c, dt, sklad_name, cust_name, fc_name, fc_num, string_no) VALUES ($1, $2, $3, $4, $5, $6, $7) ",
    [id1c, dt, sklad_name, cust_name, fc_name, fc_num, string_no] )
    .then (function (data) {
      res.send(string_no+','+id1c+','+dt+','+sklad_name+','+cust_name+','+fc_name+','+fc_num+' загружено<br>');

    })
    .catch(function (error) {
      res.send(string_no+','+id1c+' не удалось загрузить, вероятно уже было загружено<br>');
    });

});

//
// Загрузить строку таблицы fcprihod_1c
//
router.post('/load_string_fcprihod', function(req, res, next) {
  var string_no = req.body.string_no;
  var id1c = req.body.id1c;
  var dt = req.body.dt;
  var sd_name = req.body.sd_name;
  var fc_name = req.body.fc_name;
  var fc_num = req.body.fc_num;

  db.none(
    "INSERT INTO fcprihod_1c(id1c, dt, sd_name, fc_name, fc_num, string_no) VALUES ($1, $2, $3, $4, $5, $6) ",
    [id1c, dt, sd_name, fc_name, fc_num, string_no] )
    .then (function (data) {
      res.send(string_no+','+id1c+','+dt+','+sd_name+','+fc_name+','+fc_num+' загружено<br>');

    })
    .catch(function (error) {
      res.send(string_no+','+id1c+' не удалось загрузить, вероятно уже было загружено<br>');
    });

});

//
// Загрузить строку таблицы fcformovka_1c
//
router.post('/load_string_fcformovka', function(req, res, next) {
  var string_no = req.body.string_no;
  var id1c = req.body.id1c;
  var dt = req.body.dt;
  var sd_name = req.body.sd_name;
  var fc_name = req.body.fc_name;
  var fc_num = req.body.fc_num;

  db.none(
    "INSERT INTO fcformovka_1c(id1c, dt, sd_name, fc_name, fc_num, string_no) VALUES ($1, $2, $3, $4, $5, $6) ",
    [id1c, dt, sd_name, fc_name, fc_num, string_no] )
    .then (function (data) {
      res.send(string_no+','+id1c+','+dt+','+sd_name+','+fc_name+','+fc_num+' загружено<br>');

    })
    .catch(function (error) {
      res.send(string_no+','+id1c+' не удалось загрузить, вероятно уже было загружено<br>');
    });

});

//
// Загрузить строку таблицы armrashod_1c
//
router.post('/load_string_armrashod_1c', function(req, res, next) {
  var string_no = req.body.string_no;
  var id1c = req.body.id1c;
  var dt = req.body.dt;
  var sklad_name = req.body.sklad_name;
  var sd_name = req.body.sd_name;
  var arm_name = req.body.arm_name;
  var arm_num = str2num(req.body.arm_num.trim().replace(',','.'));

  db.none(
    "INSERT INTO armrashod_1c (id1c, dt, sklad_name, sd_name, arm_name, arm_num, string_no) VALUES ($1, $2, $3, $4, $5, $6, $7) ",
    [id1c, dt, sklad_name, sd_name, arm_name, arm_num, string_no] )
    .then (function (data) {
      res.send(string_no+','+id1c+','+dt+','+sklad_name+','+sd_name+','+arm_name+','+arm_num+' загружено<br>');

    })
    .catch(function (error) {
      res.send(string_no+','+id1c+' не удалось загрузить, вероятно уже было загружено или '+error+'<br>');
    });

});

//
// Загрузить строку таблицы betrashod_1c
//
router.post('/load_string_betrashod_1c', function(req, res, next) {
  var string_no = req.body.string_no;
  var id1c = req.body.id1c;
  var dt = req.body.dt;
  var sd_name = req.body.sd_name;
  var bet_name = req.body.bet_name;
  var bet_num = str2num(req.body.bet_num.trim().replace(',','.'));

  db.none(
    "INSERT INTO betrashod_1c (id1c, dt, sd_name, bet_name, bet_num, string_no) VALUES ($1, $2, $3, $4, $5, $6) ",
    [id1c, dt, sd_name, bet_name, bet_num, string_no] )
    .then (function (data) {
      res.send(string_no+','+id1c+','+dt+','+sd_name+','+bet_name+','+bet_num+' загружено<br>');

    })
    .catch(function (error) {
      res.send(string_no+','+id1c+' не удалось загрузить, вероятно уже было загружено или '+error+'<br>');
    });

});


// ========================= однако это уже не надо =============================

//
// Проверить наличие документа а таблице и очистить если что
//
/*
router.post('/clear_doc', function(req, res, next) {
  var filename = req.body.filename;
  var gdata = {};
//  var content = '';

  // Считываем содержание файла в память
  fs.readFile(dir+'\\'+filename, function (err, logData) {

    if (err) {
      res.send('clear_doc: Ошибка чтения файла ' +dir+'\\'+filename + '<br>');
      return;
    }

    var text = logData.toString();  // logData это объект типа Buffer, переводим в строку
    var lines = text.split('\n');   // Разбиваем текст на массив из строчек

    var ret = '';

    // Цикл по строкам
    for (var i = 0; i < 1; i++) {
//    for (var i = 0; i < lines.length; i++) {

      var fields = lines[i].split('\t');  // Разбиваем строку на поля

      var id1c = fields[0].trim();

      if (fields.length < 2) {
        ret = ret + ' плохая строка [' + lines[i] + ']<br>';
      }
      else {
        db.one(
          "SELECT count(*) AS cnt FROM fcformovka_1c WHERE id1c = $1", [id1c])
          .then(function (data) {
            if (data.cnt == '0') {
              res.send(filename + ': Документа (' + fields[0] + ') нет в таблице ');
            }
            else {
              db.none(
                " DELETE FROM fcformovka_1c WHERE id1c = $1 ", [id1c] )
                .then (function (data2) {
                  res.send(filename+': Очищено '+data.cnt+' строк документа ('+id1c+')');
                })
                .catch(function (error) {
                  res.send('clear_doc: Ошибка DELETE SQL');
                });
            }
          })
          .catch(function (error) {
            res.send('clear_doc: Ошибка SELECT SQL');
          });
      }
    }

//    res.send('x'+ret);
  });

});
*/

//
// Проверить наличие документа а таблице и очистить если что
//
router.post('/clear_doc2', function(req, res, next) {
  var table_name = req.body.table_name;
  var id1c = req.body.id1c;

  db.one(
    "SELECT count(*) AS cnt FROM " + table_name+ " WHERE id1c = $1", [id1c])
    .then(function (data) {
      if (data.cnt == '0')
      {
        res.send('Документа (' + id1c + ') нет в таблице '+ table_name + '<br>');
      }
      else {
        db.none(
          " DELETE FROM " + table_name +" WHERE id1c = $1 ", [id1c] )
          .then (function (data2) {
            res.send('Очищено '+data.cnt+' строк документа ('+id1c+') из таблицы '+ table_name + '<br>');
          })
          .catch(function (error) {
            res.send('clear_doc: ОШИБКА DELETE SQL: '+error);
          });
      }
    })
    .catch(function (error) {

      res.send('clear_doc: ОШИБКА SELECT SQL: '+error);
    });
});

//
// Загрузка в основные таблицы
//
router.post('/load_doc', function(req, res, next) {
  var table_name = req.body.table_name;
  var id1c = req.body.id1c;

  db.one(
    "SELECT count(*) AS cnt FROM docs_1c WHERE id1c = $1 AND doc_name = $2", [id1c, table_name])
    .then(function (data) {
      if (data.cnt == '0')
      {
        db.none(
          " INSERT INTO docs_1c (id1c, doc_name) VALUES ($1, $2) ", [id1c, table_name] )
          .then (function (data2) {
            res.send('load_doc: Вставлена строка ('+id1c+','+table_name+') в таблицу docs_1c, cnt = '+ data.cnt +' <br>');
          })
          .catch(function (error) {
            res.send('load_doc: ОШИБКА INSERT SQL: '+error);
          });
      }
      else {
        db.none(
          " UPDATE docs_1c SET dt = now() WHERE id1c = $1 AND doc_name = $2", [id1c, table_name] )
          .then (function (data2) {
            res.send('load_doc: Обновлена строка документа '+id1c+', '+table_name+' таблицы docs_1c, cnt = '+ data.cnt +' <br>');
          })
          .catch(function (error) {
            res.send('load_doc: ОШИБКА UPDATE SQL: '+error);
          });
      }
    })
    .catch(function (error) {
      res.send('load_doc: ОШИБКА SELECT SQL: '+error);
    });
});

// =====================================
/*
//
// Загрузка файла // однако это уже не надо
//
router.post('/load_file', function(req, res, next) {
  var filename = req.body.filename;
  var content = '';
//  var dir = 'U:\\BUH\\Обмен 1С\\2я площадка\\Выгрузка из 1С';
//  var dir = '\\\\10.0.0.10\\обменпризводство';

  content = fs.readFileSync(dir+'\\'+filename);
  s =  'Файл '+filename+' загружен.<br>'+ SEL(content) + '<br>';

  res.send(s);
//  res.send('Файл '+filename+' загружен.<br>');

});

//
// Загрузить список ЖБИ из файла с разделителями
//
router.post('/load_fcrashod', function(req, res, next) {
  var filename = req.body.filename;
  var gdata = {};
//  var content = '';

  // Считываем содержание файла в память
  fs.readFile(dir+'\\'+filename, function (err, logData) {

    if (err) {
      s = 'Ошибка чтения файла ' + filename;
      res.send('load_fcrashod: '+s+'<br>');
      return;
    }

    // logData это объект типа Buffer, переводим в строку
    var text = logData.toString();

    var ret = '';

    // Разбиваем текст на массив из строчек
    var lines = text.split('\n');

    // Цикл по строкам
    for (var i = 0; i < lines.length; i++) {

      // Разбиваем строку на поля
      var fields = lines[i].split('\t');

      if (fields.length != 6)
      {
        ret = ret + ' плохая строка [' + lines[i] + ']<br>';
      }
      else
//       ret = ret + lines[i]+'<br>';

        db.one(
          //     "SELECT '-ok-' AS ret " )
//      "INSERT INTO public.test1(col1) VALUES ('"+lines[i]+"')")
//      "INSERT INTO public.test1(col1) VALUES ($1)", [fields[0]+fields[1]+fields[2]+fields[3]+fields[4]+fields[5]])
          "INSERT INTO public.test1(col1) VALUES ($7); SELECT ret FROM load_fcrashod($1, $2, $3, $4, $5, $6)", [fields[0],fields[1],fields[2],fields[3],fields[4],fields[5],lines[i]] )
          .then (function (data) {
            ret = ret +  data.ret + '<br>';
//          ret = ret + ' i'+i;
//          res.send(ret);

          })
          .catch(function (error) {
//          res.send(error);
            ret = ret + '3';
//          res.send(ret);

          });

      //      ret = ret + 'ИД справочника Заказчики =  ' + gdata.spr_cust_rf + '.<br>'
    }

    db.one(
      "SELECT count(*) AS ret FROM test1 " )
      .then (function (data) {
        ret = ret + 'count='+ data.ret+'<br>';
        res.send(ret+'1<br>');
      })
      .catch(function (error) {
//        res.send(ret+'3<br>');
      });

//    res.send(ret+'+++<br>');
  });

});

*/



module.exports = router;