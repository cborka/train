var express = require('express');
var router = express.Router();

var fs = require('fs');
var db = require("../db");

//
//  Импорт данных в базу данных из других программ
//
function SEL(buf) {

  var text = buf.toString();
  var ret = '';

  // Разбиваем текст на массив из строчек
  var lines = text.split('\n');
//    var arr = ["Яблоко", "Апельсин", "Груша"];

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
  var dir = 'U:\\BUH\\Обмен 1С\\2я площадка\\Выгрузка из 1С';
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
      if (i > 25) break;
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
  var dir = 'U:\\BUH\\Обмен 1С\\2я площадка\\Выгрузка из 1С';

  content = fs.readFileSync(dir+'\\'+filename);
  s =  'Файл '+filename+' загружен.<br>'+ SEL(content) + '<br>';

  res.send(s);
//  res.send('Файл '+filename+' загружен.<br>');

});


















module.exports = router;