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


function num2str(num) {
  var str;
  if (num == null || num == 0) {str = ''} else str = Math.round(num * 1000) / 1000;
  return str;
}
function str2num(str) {
  var num;
  if (str == null || str == '') {num = 0} else num = +str;
  return num;
}



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

// ================== Формовка по дням за месяц =========================

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
// // План-факт ЖБИ
//
router.post('/get_plan_fact_fc', function(req, res, next) {
  var plan = req.body.plan;
  var day_plan = req.body.day_plan; // Выводим за день или накопительно на План-месяц
  var dt_now = new Date();

  var dt_now_year = dt_now.getFullYear();
  var dt_now_month = dt_now.getMonth() + 1;
  var dt_now_day = dt_now.getDate();
  //var is_current_month = false;
  //if (((plane.substr(0, 4)) == dt_now_year)) is_current_month = true; // && (+plan.substr(5, 2) == dt_now_month));
  var is_current_month = ((+plan.substr(0, 4) == dt_now_year) && (+plan.substr(5, 2) == dt_now_month));

  db.any(
    "SELECT pp.sd_rf, sd.item_name AS sd_name, " +
    "    pp.item_rf, item.item_name AS item_name, num_plan, num_fact, nums_plan, nums_fact " +
    " FROM ((plan_plan pp " +
    "   LEFT JOIN item_list sd ON pp.sd_rf = sd.item_id) " +
    "   LEFT JOIN item_list item ON pp.item_rf = item.item_id) " +
    " WHERE item.spr_rf = 9 " + // ЖБИ
    "   AND pp.item_rf IN (13, 112, 279) " + // Пока работаем только с двумя ЖБИ
    "   AND plan_rf = (SELECT item_id FROM item_list WHERE spr_rf= 6 AND item_name=$1)" +
    " ORDER BY sd.item_name, item.item_name ", [plan])
    .then (function (data) {

      var result = '';
//      result = result + plan.substr(0, 4)+' == ' + dt_now_year+') && ('+ plan.substr(5, 2)+ ' == ' + dt_now_month;
      result = result + 'План-месяц: '+plan+dt_now_day+'<br>'; // is_current_month = ' + is_current_month+'<br>';
      result = result + '<br><table class="report" align="left">';
      result = result + '<thead><td class="report left">Пролет</td>';
      result = result + '<td  class="report left">ЖБИ</td>';
      result = result + '<td  class="report left">План</td>';
      result = result + '<td  class="report left">Факт</td>';
      result = result + '<td  class="report right">По дням</td>';

      for (var j = 1; j <= 31; j++) {
        result = result + '<td  class="report right">'+j+'</td>';
      }
      result = result  + '</thead>';

      for (var i = 0; i < data.length; i++) {

//        data[i].fc_num = Math.round(data[i].fc_num * 1000) / 1000 ;
//        if (data[i].num_fact == 0)  data[i].num_fact = '';

        result = result + '<tr><td  class="report left">' + data[i].sd_name + '</td>';
        result = result + '<td  class="report left">' + data[i].item_name + '</td>';
        result = result + '<td  class="report left">' + str2num(data[i].num_plan) + '</td>';
        result = result + '<td  class="report left">' + str2num(data[i].num_fact) + '</td>';
//        result = result + '<td  class="report left">' +  (+data[i].num_fact - +data[i].num_plan) + '</td>';
        result = result + '<td  class="report left">План<br>Факт<br>Отклонение</td>';
        var n_pln = 0;
        var n_fct = 0;
        var n_otkl = 0;
        for (var j = 0; j <= 30; j++) {
//          result = result + '<td  class="report right">' + num2str(data[i].nums_plan[j]) + '/' +
//                            '<td  class="report right">' + num2str(data[i].nums_fact[j]) + '</td>';

          var pln = str2num(num2str(data[i].nums_plan[j]));
          var fct = str2num(num2str(data[i].nums_fact[j]));
          var otkl = fct - pln;

          n_pln = n_pln + pln;
          n_fct = n_fct + fct;
          n_otkl = n_fct - n_pln;

          // Раскраска цифр
          if (is_current_month && j > dt_now_day-1) { // будущее не определено, красим всё бледно-серым
            pln = '<span class="silver">'+pln+'</span>';
            fct = '<span class="silver">'+fct+'</span>';
            otkl = '<span class="silver">'+otkl+'</span>';
            otkl = '<span class="silver">'+otkl+'</span>';
            otkl = '<span class="silver">'+otkl+'</span>';
          }
          else {
            // день
            if (pln == 0)  pln = '<span class="silver">'+pln+'</span>';
            if (fct == 0)  fct = '<span class="silver">'+fct+'</span>';
            if (fct > 0)  fct = '<span class="blue">'+fct+'</span>';
            if (otkl == 0)  otkl = '<span class="silver">'+otkl+'</span>';
            if (otkl < 0)  otkl = '<span class="red">'+otkl+'</span>';
            if (otkl > 0)  otkl = '<span class="green">'+otkl+'</span>';
          }

          // план
          var sn_pln = n_pln; //В n_pln копится сумма, нельзя менять, поэтому ввёл переменную sn_pln (строка)
          var sn_fct = n_fct; // аналогично
          if (is_current_month && j > dt_now_day-1) { // будущее не определено, красим всё бледно-серым
            sn_pln = '<span class="silver">' + n_pln + '</span>';
            sn_fct = '<span class="silver">' + n_fct + '</span>';
            n_otkl = '<span class="silver">' + n_otkl + '</span>';
            n_otkl = '<span class="silver">' + n_otkl + '</span>';
            n_otkl = '<span class="silver">' + n_otkl + '</span>';
          }
          else {
            if (n_pln == 0) sn_pln = '<span class="silver">' + n_pln + '</span>';
            if (n_fct == 0) sn_fct = '<span class="silver">' + n_fct + '</span>';
            if (n_fct > 0) sn_fct = '<span class="blue">' + n_fct + '</span>';
            if (n_otkl == 0) n_otkl = '<span class="silver">' + n_otkl + '</span>';
            if (n_otkl < 0) n_otkl = '<span class="red">' + n_otkl + '</span>';
            if (n_otkl > 0) n_otkl = '<span class="green">' + n_otkl + '</span>';
          }
          if (day_plan == 'Day')
            result = result + '<td  class="report right">' + pln + '<br>' + fct + '<br>'+ otkl + '</td>';
          else
            result = result + '<td  class="report right">' + sn_pln + '<br>' + sn_fct + '<br>'+ n_otkl + '</td>';

//          result = result + '<td  class="report right">' + str2num(num2str(data[i].nums_plan[j])) + '/' + str2num(num2str(data[i].nums_fact[j])) + '</td>';
        }
//        result = result + '<td  class="report right">' + data[i].num_free + '</td></tr>';
      }
      result = result +'</table>';

      res.send(result);
    })
    .catch(function (error) {
      res.send('ОШИБКА: '+error);
    });
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
    "   AND pp.item_rf IN (13, 112, 279) " + // Пока работаем только с двумя ЖБИ
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
    "     SELECT DISTINCT component_rf FROM compositions WHERE product_rf IN (13, 112, 279) " +// Пока работаем только с двумя ЖБИ
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