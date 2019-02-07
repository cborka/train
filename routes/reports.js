var express = require('express');
var router = express.Router();

var fs = require('fs');
var db = require("../db");

router.get('/', function(req, res, next) {

  var data = { };
  data.dir = 'Каталог.';

  res.render('reports/r_pro.hbs', data);

});


router.get('/fcrashod', function(req, res, next) {

  var data = { };
  data.dir = 'Каталог.';

  res.render('reports/rp_fcrashod.hbs', data);

});

//
// Показать выборку из таблицы БД fcrashod_1c
//
router.post('/get_fcrashod_table', function(req, res, next) {
  var cust_name = req.body.cust_name;
  var custb_name = req.body.custb_name;
  var fc_name = req.body.fc_name;
  var fcb_name = req.body.fcb_name;
  var dtb = req.body.dtb;
  var dte = req.body.dte;

  var where_date = "";

  if (dtb != '')
    var where_date = " AND dt >= '" + dtb + "' ";
  if (dte != '')
    var where_date = where_date + " AND dt <= '" + dte + "' ";


  db.any(
    "SELECT cust_name, fc_name, SUM(fc_num) AS fc_num " +
    "  FROM fcrashod_1c " +
    "  WHERE cust_name LIKE $1 " +
    "    AND cust_name LIKE $2 " +
    "    AND fc_name LIKE $3 " +
    "    AND fc_name LIKE $4 " + where_date +
    "  GROUP BY cust_name, fc_name " +
    "  ORDER BY cust_name, fc_name ", [cust_name+'%', custb_name+'%', fc_name+'%', fcb_name+'%'])
    .then (function (data) {

      var result = '';
//      result = result + 'С даты <b>' + dtb + '</b> по дату <b>' + dte +'</b>.<br>';
//      result = result + 'where_date = [' + where_date + ']<br>';
      result = result + '<br><table class="report" align="left">';
      for (var i = 0; i < data.length; i++) {

        data[i].fc_num = Math.round(data[i].fc_num * 1000) / 1000 ;

        result = result + '<tr><td  class="report left">' + data[i].cust_name + '</td>';
        result = result + '<td  class="report left">' + data[i].fc_name + '</td>';
        result = result + '<td  class="report right">' + data[i].fc_num + '</td></tr>';
      }
      result = result +'</table>';

      res.send(result);
    })
    .catch(function (error) {
      res.send(error);
    });
});


// ========== ИНФОРМАЦИОННАЯ ПАНЕЛЬ УПРАВЛЕНИЯ =============


router.get('/inform1', function(req, res, next) {

  var data = { };
  data.header = 'Информационная панель 1';

  res.render('reports/inform1.hbs', data);

});


router.post('/get_formovka_day', function(req, res, next) {
  var dt = req.body.dt;

//  res.send(dt + (dt+1000*60*60*24));   return;

  db.any(
    "SELECT sd.item_name AS sd_name, fc.item_name AS fc_name, SUM(t.fc_num) AS fc_num "+
  " FROM (((fcformovka_h h "+
  "  LEFT JOIN fcformovka t ON h.doc_id = t.doc_rf) "+
  "  LEFT JOIN item_list sd ON h.sd_rf = sd.item_id) "+
  "  LEFT JOIN item_list fc ON t.fc_rf = fc.item_id) "+
  "  WHERE h.dt >= $1 "+
  "    AND h.dt < (CAST($1 AS date) + interval '1 day') "+
  "    AND t.fc_rf IN (13, 112)"+
  "  GROUP BY sd.item_name, fc.item_name "+
  "  ORDER BY 1, 2 ", [dt, dt+1000*60*60*24])
    .then (function (data) {

      var result = '';
        result = result + 'Формовка за <b>' + dt + '</b><br>';
        result = result + '<br><table class="report" align="left">';
      result = result + '<thead><td class="report left">Пролёт</td>';
      result = result + '<td  class="report left">ЖБИ</td>';
      result = result + '<td  class="report right">Кол-во</td></thead>';

      for (var i = 0; i < data.length; i++) {

        data[i].fc_num = Math.round(data[i].fc_num * 1000) / 1000 ;

        result = result + '<tr><td  class="report left">' + data[i].sd_name + '</td>';
        result = result + '<td  class="report left">' + data[i].fc_name + '</td>';
        result = result + '<td  class="report right">' + data[i].fc_num + '</td></tr>';
      }
      result = result +'</table>';

      res.send(result);
    })
    .catch(function (error) {
      res.send(error);
    });

//  res.send('Здесь формовка за ' + dt+10000);

});



//select * from rep_formovka_daily('2019-01-01', '2019-01-31')

// Формовка по дням за месяц

router.post('/get_formovka_plan', function(req, res, next) {
  var dtb = req.body.dtb;
  var dte = req.body.dte;
  var array_length = 0;

  db.any(
    "SELECT sd_name, fc_name, fc_num FROM rep_formovka_daily($1, $2)", [dtb, dte])
    .then (function (data) {

      var result = '';
      result = result + 'Формовка c <b>' + dtb + ' по ' + dte + '</b><br>';
      result = result + '<br><table class="report" align="left">';

      array_length = data[0].fc_num.length;


      result = result + '<thead><td  class="report left">' + data[0].sd_name + '</td>';
      result = result + '<td  class="report left">' + data[0].fc_name + '</td>';
      for(var j = 0; j < array_length; j++)
        result = result + '<td  class="report ">' + data[0].fc_num[j] + '</td>';

      result = result + '</thead>';



      for (var i = 1; i < data.length; i++) {

//        data[i].fc_num = Math.round(data[i].fc_num * 1000) / 1000 ;

        result = result + '<tr><td  class="report left">' + data[i].sd_name + '</td>';
        result = result + '<td  class="report left">' + data[i].fc_name + '</td>';

        for(var j = 0; j < array_length; j++) {
          if (data[i].fc_num[j] == 0)  data[i].fc_num[j] = '';

          result = result + '<td  class="report ">' + data[i].fc_num[j] + '</td>';
        }

         result = result + '</tr>';
      }
      result = result +'</table>';

      res.send(result);
    })
    .catch(function (error) {
      res.send(error);
    });

//  res.send('Здесь формовка за ' + dt+10000);

});



//
// СГП (Склад ЖБИ)
//
router.post('/get_sklad_fc', function(req, res, next) {

  db.any(
    "SELECT pp.sklad_rf, sklad.item_name AS sklad_name, " +
    "    pp.item_rf, item.item_name AS item_name, num_fact, num_max, (num_max - num_fact) AS num_free " +
    " FROM ((sklad pp " +
    "   LEFT JOIN item_list sklad ON pp.sklad_rf = sklad.item_id) " +
    "   LEFT JOIN item_list item ON pp.item_rf = item.item_id) " +
    " WHERE item.spr_rf = 9 " + // ЖБИ
    "   AND pp.item_rf IN (13, 112) " + // Пока работаем только с двумя ЖБИ
    " ORDER BY sklad.item_name, item.item_name ")
    .then (function (data) {

      var result = '';
//      result = result + 'Склад ЖБИ <br>';
      result = result + '<br><table class="report" align="left">';
      result = result + '<thead><td class="report left">Склад</td>';
      result = result + '<td  class="report left">ЖБИ</td>';
      result = result + '<td  class="report right">Кол-во ЖБИ на складе</td>';
      result = result + '<td  class="report right">Макс. кол-во</td>';
      result = result + '<td  class="report right">Осталось мест</td></thead>';

      for (var i = 0; i < data.length; i++) {

        data[i].fc_num = Math.round(data[i].fc_num * 1000) / 1000 ;
        if (data[i].num_fact == 0)  data[i].num_fact = '';
        if (data[i].num_max == 0)  data[i].num_max = '';
        if (data[i].num_free == 0)  data[i].num_free = '';

        result = result + '<tr><td  class="report left">' + data[i].sklad_name + '</td>';
        result = result + '<td  class="report left">' + data[i].item_name + '</td>';
        result = result + '<td  class="report right"><b>' + data[i].num_fact + '</b></td>';
        result = result + '<td  class="report right">' + data[i].num_max + '</td>';
        result = result + '<td  class="report right">' + data[i].num_free + '</td></tr>';
      }
      result = result +'</table>';

      res.send(result);
    })
    .catch(function (error) {
      res.send(error);
    });
});



//
// Склад АРМАТУРЫ
//
router.post('/get_sklad_arm', function(req, res, next) {

  db.any(
    "SELECT pp.sklad_rf, sklad.item_name AS sklad_name, " +
    "    pp.item_rf, item.item_name AS item_name, num_fact, num_max, (num_max - num_fact) AS num_free " +
    " FROM ((sklad pp " +
    "   LEFT JOIN item_list sklad ON pp.sklad_rf = sklad.item_id) " +
    "   LEFT JOIN item_list item ON pp.item_rf = item.item_id) " +
    " WHERE item.spr_rf = 18 " + // Арматуры
    "   AND pp.item_rf IN ( " +
    "     SELECT DISTINCT component_rf FROM compositions WHERE product_rf IN (13, 112) " +// Пока работаем только с двумя ЖБИ
    "   ) " + // Пока работаем только с двумя ЖБИ
    " ORDER BY sklad.item_name, item.item_name ")
    .then (function (data) {

      var result = '';
//      result = result + 'Склад МЕТАЛЛА <br>';
      result = result + '<br><table class="report" align="left">';
      result = result + '<thead><td class="report left">Склад</td>';
      result = result + '<td  class="report left">Металл</td>';
      result = result + '<td  class="report right">Кол-во на складе</td>';
      result = result + '<td  class="report right">Макс. кол-во</td>';
      result = result + '<td  class="report right">Осталось мест</td></thead>';

      for (var i = 0; i < data.length; i++) {

        data[i].fc_num = Math.round(data[i].fc_num * 1000) / 1000 ;
        if (data[i].num_fact == 0)  data[i].num_fact = '';
        if (data[i].num_max == 0)  data[i].num_max = '';
        if (data[i].num_free == 0)  data[i].num_free = '';

        result = result + '<tr><td  class="report left">' + data[i].sklad_name + '</td>';
        result = result + '<td  class="report left">' + data[i].item_name + '</td>';
        result = result + '<td  class="report right"><b>' + data[i].num_fact + '</b></td>';
        result = result + '<td  class="report right">' + data[i].num_max + '</td>';
        result = result + '<td  class="report right">' + data[i].num_free + '</td></tr>';
      }
      result = result +'</table>';

      res.send(result);
    })
    .catch(function (error) {
      res.send(error);
    });
});

















module.exports = router;