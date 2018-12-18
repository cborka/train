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
 //     if (i > 35) break;
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
// Вернуть содержимое файла
//
router.post('/get_data', function(req, res, next) {
  var filename = req.body.filename;

  // Считываем содержание файла в память
  fs.readFile(dir+'\\'+filename, function (err, logData) {

    if (err) {
      s = 'Ошибка чтения файла ' + filename;
      res.send('get_data: '+s+'<br>');
      return;
    }

    // logData это объект типа Buffer, переводим в строку
    var text = logData.toString();

    res.send(text);
  });
});

//
// Загрузить строку файла fcprihod
//
router.post('/load_string', function(req, res, next) {
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





module.exports = router;