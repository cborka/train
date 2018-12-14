var express = require('express');
var router = express.Router();

var fs = require('fs');
var db = require("../db");
var dir = '\\\\10.0.0.10\\обменпризводство';

//
//  Импорт данных в базу данных из других программ
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
// Импорт данных, выгружаемых из 1С8-Производство
//
router.get('/from1c', function(req, res, next) {

  var data = { };

  res.render('import/from1c', data);

});

// Возвратить список файлов
router.get('/1c8filenames', function(req, res, next) {

  //  В этом каталоге появляются файлы с новыми текущими данными
//  var dir = 'U:\\BUH\\Обмен 1С\\2я площадка\\Выгрузка из 1С';
  fs.readdir(dir, (err, data) => {
    var s = '';

    if (err) {
      s = 'Ошибка чтения из каталога.';
      res.send('from1c: '+s+'<br>');
      return;
    }

    // Цикл по файлам каталога
    var content = '';
    for (var i = 0; i < data.length; i++) {
      if (data[i].substring(17) == 'отгрузка ЖБИ.txt')
      {
//      content = fs.readFileSync(dir + '\\' + data[i]);
//      s = s + data[i] + '<br>'+ SEL(content) + '<br>';
      s = s + data[i] + '\n<br>';
      }
      if (i > 15) break;
    }

    res.send(s);

  });
});


//
// Загрузка файла
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
        ret = ret + ' плохая строка ['+ lines[i] + ']<br>';
      else
        ret = ret + 'name='+fields[0]+', dt='+fields[1]+', sklad='+fields[2]+', cust='+fields[3]+', fc='+fields[4]+', num='+fields[5]+ '<br>';

      db.any(
        "SELECT item_id FROM item_list WHERE item_name = 'Заказчики' AND spr_rf = 3")
        .then (function (data) {
          if (data.length = 1)
            gdata.spr_cust_rf = data[0].item_id;
          else
            gdata.spr_cust_rf = '0';

          ret = ret + 'xИД справочника Заказчики =  ' + gdata.spr_cust_rf + '.<br>'
          res.send(ret);

        })
        .then(function () {
          db.one(
            "SELECT SUM(pp.fc_num * sf.trk) AS trk_sum " +
            " FROM (plan_fc_pro pp " +
            "   LEFT JOIN sd_fc sf ON pp.fc_rf = sf.fc_rf) " )
            .then(function (data) {
              gdata.trk_sum = data.trk_sum;
             })
        })
        .catch(function (error) {
          res.send(error);
        });

      ret = ret + 'ИД справочника Заказчики =  ' + gdata.spr_cust_rf + '.<br>'

    }
//    res.send(ret);
  });

});

















module.exports = router;