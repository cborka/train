var express = require('express');
var router = express.Router();

var fs = require('fs');

var db = require("../db");


function ShowFolderList(path) {
  var s = "x";

  return (s);
}

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
// Показать список файлов в каталоге
//
router.get('/files', function(req, res, next) {

//  sss = ShowFolderList('c:');
  var dir = 'c:\\cborka';
//  var dir = 'U:\\BUH\\Обмен 1С\\2я площадка\\Выгрузка из 1С';
//  var dir = '\\\\10.0.0.10\\обменпризводство';
//  fs.readdir('U:\\BUH\\Обмен 1С\\2я площадка\\Выгрузка из 1С', (err, data) => {
  fs.readdir(dir, function(err, data) {
    var s = '';

    if (err) {
      s = 'Ошибка чтения из каталога.';
      res.send('Процедура /test/files: '+s+'<br>');
      return;
    }
//      throw err;
//    console.log(data);

    var content = '';
    for (var i = 0; i < data.length; i++) {
//      if (data[i].substring(17) == 'отгрузка ЖБИ.txt')
      if (data[i].slice(-5) == 'l.txt')  //логи )
      {
        content = fs.readFileSync(dir + '\\' + data[i]);

       s = s + data[i] + '<br>'+ SEL(content) + '<br>';
//       s = s + data[i] + '<br>';
      }
    }

    res.send('Процедура /test/files <br>'+s+'<br>');

  });


});

router.get('/fileio', function(req, res, next) {

  var data = { };
  data.dir = 'Каталог.';

  res.render('test/fileio', data);

});



// ===================================================================================
// ===================================================================================
// ===================================================================================




// ===================================================================================
// ===================================================================================
// ===================================================================================

//
// Загрузить список ЖБИ из файла с разделителями
//
router.get('/fc_load', function(req, res, next) {

  var file_name = 'c:\\cborka\\fcl.txt';


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

module.exports = router;