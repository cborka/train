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
//  var content = '';

    // Считываем содержание файла в память
  fs.readFile(filename, function (err, logData) {
    // Если возникла ошибка, мы кидаем исключение
    // и программа заканчивается
//    if (err) throw err;
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

    for (var i = 0; i < lines.length; i++) {
      var parts = lines[i].split('\t');
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

















module.exports = router;