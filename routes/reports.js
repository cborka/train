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


// ========== ИНФОРМАЦИОННАЯ ПАНЕЛЬ 1 =============

router.get('/inform1', function(req, res, next) {

  var data = { };
  data.header = 'Информационная панель 1';

  res.render('reports/inform1.hbs', data);

});

// ========== ИНФОРМАЦИОННАЯ ПАНЕЛЬ 2 =============

router.get('/inform2', function(req, res, next) {

    var data = { };
    data.header = 'Пульс предприятия';

    res.render('reports/inform2.hbs', data);

});
// =================================================


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
router.post('/rep_formovka_fcv_daily', function(req, res, next) {
    var dtb = req.body.dtb;
    var dte = req.body.dte;
    var array_length = 0;

    db.any(
        "SELECT fc_v FROM rep_formovka_fcv_daily($1, $2)", [dtb, dte])
        .then (function (data) {

           res.send(data[1].fc_v);
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
    "   AND pp.item_rf IN (13, 112, 279, 635) " + // Пока работаем только с двумя ЖБИ
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


//
// Остатки МАТЕРИАЛОВ (арматура, бетон) по дням начиная от сегодня (на сколько дней хватит)
//
router.post('/get_mat_ost_daily', function(req, res, next) {
    var mat = req.body.mat;
    var array_length = 0;
    var an = 0;
    var sql = '';

    var mat_grp = 0; //арматура
    if (mat === 'АРМАТУРА') mat_grp = 18;
    else if (mat === 'БЕТОН') mat_grp = 4;
    else if (mat === 'МАТЕРИАЛЫ') mat_grp = 2643;

    if (mat_grp === 2643)
        sql = 'SELECT mat_name, days_num, mat_num FROM rep_mat_ost_daily4(2643, 2644) ORDER BY days_num, mat_name';
    else
        sql = "SELECT mat_name, days_num, mat_num FROM rep_mat_ost_daily3("+mat_grp+") ORDER BY days_num, mat_name";

    db.any(sql)
    .then (function (data) {

    var result = '';
    result = result +mat+': Прогноз остатков на складе по дням начиная от сегодня <br>(на сколько дней хватит)<br>';
    result = result + '<br><table class="report" align="left">';

    array_length = data[0].mat_num.length;

    // Первая строка - шапка
    result = result + '<thead><td  class="report left">' + data[0].mat_name + '</td><td class="report">Дней</td>';
    for(var j = 0; j < array_length; j++)
        result = result + '<td  class="report ">' + data[0].mat_num[j] + '</td>';
    result = result + '</thead>';

    // Строки данных
    for (var i = 1; i < data.length; i++) {

//        data[i].fc_num = Math.round(data[i].fc_num * 1000) / 1000 ;
//        data[i].mat_num = Math.round(data[i].mat_num);

        result = result + '<tr><td class="report left">' + data[i].mat_name + '</td><td class="report">' + data[i].days_num + '</td>';

        for(j = 0; j < array_length; j++) {
            an = Math.round(+data[i].mat_num[j]);
//            an = +data[i].mat_num[j];
            if (an == 0)  an= '';
            if (an < 0) an = '<span class="silver">' + an + '</span>';
            result = result + '<td  class="report right">' + an + '</td>';

//            if (data[i].arm_num[j] == 0)  data[i].arm_num[j] = '';
//            result = result + '<td  class="report ">' + data[i].arm_num[j] + '</td>';
        }

        result = result + '</tr>';
    }
    result = result +'</table>';
    res.send(result);
})
    .catch(function (error) {
        res.send('ОШИБКА: '+error);
    });

//  res.send('Здесь формовка за ' + dt+10000);

});


//
// Остатки МЕСТА НА СКЛАДЕ ЖБИ на сколько дней хватит)
//
router.post('/get_num_places_daily', function(req, res, next) {
    var array_length = 0;
    var an = 0;

    db.any(
        "SELECT sd_name, mat_name, days_num, num_fact, num_max, place_num  FROM rep_num_places_daily3() ORDER BY 1,3,2")
        .then (function (data) {

            var result = '';
            result = result + 'На сколько дней хватит МЕСТ НА СКЛАДЕ ЖБИ по дням начиная от сегодня<br>';
            result = result + '<br><table class="report" align="left">';

            array_length = data[0].place_num.length;

            // Первая строка - шапка
            result = result + '<thead><td  class="report left">Пролет</td><td class="report left">ЖБИ</td><td class="report">Дней</td>'+
                '<td class="report">Кол-во</td><td class="report">Мест</td>';
            for(var j = 0; j < array_length; j++)
                result = result + '<td  class="report ">' + data[0].place_num[j] + '</td>';
            result = result + '</thead>';

            // Строки данных
            for (var i = 1; i < data.length; i++) {

                result = result + '<tr>' +
                    '<td class="report left">' + data[i].sd_name + '</td>' +
                    '<td class="report left">' + data[i].mat_name + '</td>' +
                    '<td class="report right">' + Math.round(+data[i].days_num) + '</td>' +
                    '<td class="report right">' + Math.round(+data[i].num_fact) + '</td>' +
                    '<td class="report right">' + Math.round(+data[i].num_max) + '</td>'
                ;

                for(j = 0; j < array_length; j++) {
                    an = Math.round(+data[i].place_num[j]);
                    if (an == 0)  an= '';
                    if (an < 0) an = '<span class="silver">' + an + '</span>';
                    result = result + '<td  class="report right">' + an + '</td>';
                }
                result = result + '</tr>';
            }
            result = result +'</table>';
            res.send(result);
        })
        .catch(function (error) {
            res.send('ОШИБКА: '+error);
        });
});


// ========== СВОДНЫЙ ЛИСТОК =============

//
// Показать заметки
//
router.get('/svod', function(req, res, next) {
    res.render('reports/svod', { });
//    res.send('Users notes');
});

router.get('/get_sv_plan', function(req, res, next) {
    db.one(
        "SELECT SUM(fc.fc_v * pp.num_plan) AS sumv " +
        " FROM plan_plan pp " +
        " LEFT JOIN fc_s fc ON pp.item_rf = fc.fc_rf " +
        "   AND plan_rf = current_plan()") //749
        .then (function (data) {
            var result = '';
            data.sumv = Math.round(data.sumv * 1000) / 1000 ;
            result = result + data.sumv.toFixed(2);
            res.send(result);
        })
        .catch(function (error) {
            res.send("ОШИБКА: "+error);
        });
});

router.get('/get_sv_form', function(req, res, next) {
    db.one(
        "SELECT SUM(fc.fc_v * pp.num_fact) AS sumv " +
        " FROM plan_plan pp " +
        " LEFT JOIN fc_s fc ON pp.item_rf = fc.fc_rf " +
        "   AND plan_rf = current_plan()")
        .then (function (data) {
            var result = '';

            data.sumv = Math.round(data.sumv * 1000) / 1000 ;
            result = result + data.sumv.toFixed(2);
            res.send(result);
        })
        .catch(function (error) {
            res.send("ОШИБКА: "+error);
        });
});

router.get('/get_sv_prihod', function(req, res, next) {
    db.one(
        "SELECT SUM(p.fc_num * fc.fc_v ) AS sumv" +
        " FROM ((fcprihod_h ph " +
        "   LEFT JOIN fcprihod p ON ph.doc_id = p.doc_rf ) " +
        "   LEFT JOIN fc_s fc ON p.fc_rf = fc.fc_rf ) " +
        "   WHERE dt >= current_plan_begin() " + //'2019-07-01'
        "   AND fc_v IS NOT NULL ")
        .then (function (data) {
            var result = '';

            data.sumv = Math.round(data.sumv * 1000) / 1000 ;
            result = result + data.sumv.toFixed(2);
            res.send(result);
        })
        .catch(function (error) {
            res.send("ОШИБКА: "+error);
        });
});

router.get('/get_sv_prihod_pdn14', function(req, res, next) {
    db.one(
        "SELECT SUM(p.fc_num) AS sumv" +
        " FROM ((fcprihod_h ph " +
        "   LEFT JOIN fcprihod p ON ph.doc_id = p.doc_rf ) " +
        "   LEFT JOIN fc_s fc ON p.fc_rf = fc.fc_rf ) " +
        "   WHERE dt >= current_plan_begin() " +
        "   AND p.fc_rf = 13 ")
        .then (function (data) {
            var result = '';

            data.sumv = Math.round(data.sumv * 1000) / 1000 ;
            result = result + data.sumv.toFixed(0);
            res.send(result);
        })
        .catch(function (error) {
            res.send("ОШИБКА: "+error);
        });
});

router.get('/get_sv_prihod_pdnav', function(req, res, next) {
    db.one(
        "SELECT SUM(p.fc_num) AS sumv" +
        " FROM ((fcprihod_h ph " +
        "   LEFT JOIN fcprihod p ON ph.doc_id = p.doc_rf ) " +
        "   LEFT JOIN fc_s fc ON p.fc_rf = fc.fc_rf ) " +
        "   WHERE dt >= current_plan_begin() " +
        "   AND p.fc_rf = 279 ")
        .then (function (data) {
            var result = '';

            data.sumv = Math.round(data.sumv * 1000) / 1000 ;
            result = result + data.sumv.toFixed(0);
            res.send(result);
        })
        .catch(function (error) {
            res.send("ОШИБКА: "+error);
        });
});



router.get('/get_sv_rashod', function(req, res, next) {
    db.one(
        "SELECT SUM(p.fc_num * fc.fc_v ) AS sumv" +
        " FROM ((fcrashod_h ph " +
        "   LEFT JOIN fcrashod p ON ph.doc_id = p.doc_rf ) " +
        "   LEFT JOIN fc_s fc ON p.fc_rf = fc.fc_rf ) " +
        "   WHERE dt >= current_plan_begin() " +
        "   AND fc_v IS NOT NULL ")
        .then (function (data) {
            var result = '';

            data.sumv = Math.round(data.sumv * 1000) / 1000 ;
            result = result + data.sumv.toFixed(2);
            res.send(result);
        })
        .catch(function (error) {
            res.send("ОШИБКА: "+error);
        });
});

router.get('/get_sv_rashod_pdn14', function(req, res, next) {
    db.one(
        "SELECT SUM(p.fc_num) AS sumv" +
        " FROM ((fcrashod_h ph " +
        "   LEFT JOIN fcrashod p ON ph.doc_id = p.doc_rf ) " +
        "   LEFT JOIN fc_s fc ON p.fc_rf = fc.fc_rf ) " +
        "   WHERE dt >= current_plan_begin() " +
        "   AND p.fc_rf = 13 ")
        .then (function (data) {
            var result = '';

            data.sumv = Math.round(data.sumv * 1000) / 1000 ;
            result = result + data.sumv.toFixed(0);
            res.send(result);
        })
        .catch(function (error) {
            res.send("ОШИБКА: "+error);
        });
});

router.get('/get_sv_rashod_pdnav', function(req, res, next) {
    db.one(
        "SELECT SUM(p.fc_num) AS sumv" +
        " FROM ((fcrashod_h ph " +
        "   LEFT JOIN fcrashod p ON ph.doc_id = p.doc_rf ) " +
        "   LEFT JOIN fc_s fc ON p.fc_rf = fc.fc_rf ) " +
        "   WHERE dt >= current_plan_begin() " +
        "   AND p.fc_rf = 279 ")
        .then (function (data) {
            var result = '';

            data.sumv = Math.round(data.sumv * 1000) / 1000 ;
            result = result + data.sumv.toFixed(0);
            res.send(result);
        })
        .catch(function (error) {
            res.send("ОШИБКА: "+error);
        });
});

router.get('/get_sv_ost_pdn14', function(req, res, next) {
    db.one(
        "SELECT num_fact AS sumv" +
        " FROM sklad s " +
        "   WHERE sklad_rf = 25 " +
        "     AND item_rf = 13 ")
        .then (function (data) {
            var result = '';

            data.sumv = Math.round(data.sumv * 1000) / 1000 ;
            result = result + data.sumv.toFixed(0);
            res.send(result);
        })
        .catch(function (error) {
            res.send("ОШИБКА: "+error);
        });
});

router.get('/get_sv_ost_pdnav', function(req, res, next) {
    db.one(
        "SELECT num_fact AS sumv" +
        " FROM sklad s " +
        "   WHERE sklad_rf = 25 " +
        "     AND item_rf = 279 ")
        .then (function (data) {
            var result = '';

            data.sumv = Math.round(data.sumv * 1000) / 1000 ;
            result = result + data.sumv.toFixed(0);
            res.send(result);
        })
        .catch(function (error) {
            res.send("ОШИБКА: "+error);
        });
});


// =========================== ПУЛЬС ===============================
// =========================== ПУЛЬС ===============================
// =========================== ПУЛЬС ===============================

router.get('/get_puls_zakaz', function(req, res, next) {
    db.any(
        "SELECT sd_name, efficiency FROM rep_efficiency3() ORDER BY sd_name")
        .then (function (data) {
            var mindays = 100;

            var result = '<table class="svod w100">';

            result = result + '<tr><td class="svod_head1">Загрузка</td><td class="svod_digit "></td></tr>';

            // Строки данных
            for (var i = 0; i < data.length; i++) {

                data[i].efficiency = Math.round(data[i].efficiency * 100) / 100 ;

                result = result + '<tr><td  class="svod_label">' + data[i].sd_name + '</td><td class="svod_digit">' + data[i].efficiency + '%</td></tr>';

                if (mindays > +data[i].efficiency)
                    mindays = data[i].efficiency;


            }
//            result = result + '<tr><td class="svod_label">Эффективность <a href="/reports/inform_any?action=get_efficiency" title="Показать эффективность по каждому ЖБИ" target="_blank"> (подробнее)</a>' +
            result = result + '<tr><td class="svod_label">Минимальная эффективность' +
                '</td><td class="svod_digit"  id="mindays1">' + mindays + '%</td></tr>';
            result = result +'</table>';


            res.send(result);
        })
        .catch(function (error) {
            res.send("ОШИБКА: "+error);
        });
});

//
// На сколько дней хватит металл и бетона
//
router.get('/get_puls_mat', function(req, res, next) {
    db.one(
        "SELECT " +
       "    (select MIN(days_num) from rep_mat_ost_daily3(18) where mat_name != 'Материал') AS arm_days"
       + ", (select MIN(days_num) from rep_mat_ost_daily4(2643, 2644)  where mat_name != 'Материал') AS bet_days"
         )
        .then (function (data) {
            var result = '\
            \
                    <table class="svod w100">' +
                '            <tr>' +
                '                <td class="svod_head1">На сколько дней осталось </td>' +
                '                <td></td>' +
                '            </tr>' +//                '            <tr>' +
                '                <td class="svod_label"><a class="darkcyan" href="/reports/inform_any?action=show_mat_ost_daily" title="Показать по видам материалов" Xtarget="_blank">Материал</a></td>' +
                '                <td class="svod_digit" id="puls_t21">'+data.bet_days+'</td>' +
                '            </tr>' +
                '            <tr>' +
                '                <td class="svod_label"><a class="darkcyan" href="/reports/inform_any?action=show_arm_ost_daily" title="Показать по видам арматуры" Xtarget="_blank">Арматура</a></td>' +
                '                <td class="svod_digit" id="puls_t22">'+data.arm_days+'</td>' +
                '            </tr>' +
                '            <tr> <td id="sv_col2_error"></td> <td></td></tr>' +
                '        </table>';

            res.send(result);
        })
        .catch(function (error) {
            res.send("ОШИБКА: "+error);
        });
});

//
// На сколько дней хватит места на складе ЖБИ
//
router.get('/get_puls_otgr', function(req, res, next) {
    db.any(
        "select sd_name, MIN(days_num) AS days_num from rep_num_places_daily3() GROUP BY sd_name")
        .then (function (data) {
            var mindays = 100;

            var result = '<table class="svod w100">';

            result = result + '<tr><td class="svod_head1">На сколько дней осталось места на складе ЖБИ</td><td class="svod_digit "></td></tr>';

            // Строки данных
            for (var i = 1; i < data.length; i++) {

                result = result + '<tr><td  class="svod_label">' + data[i].sd_name + '</td><td class="svod_digit">' + data[i].days_num + '</td></tr>';

                if (mindays > +data[i].days_num)
                    mindays = data[i].days_num;

            }
            result = result + '<tr><td class="svod_label">Осталось дней <a href="/reports/inform_any?action=get_num_places_daily" title="Показать по каждому ЖБИ" target="_blank"> (подробнее)</a>' +
                '</td><td class="svod_digit"  id="mindays4">' + mindays + '</td></tr>';
            result = result +'</table>';

            res.send(result);
        })
        .catch(function (error) {
            res.send("ОШИБКА: "+error);
        });
});


//
// На сколько дней хватит места на складе ЖБИ
//
router.post('/get_help', function(req, res, next) {
    var filename = req.body.hlp;
    var text = '';

    // Считываем содержание файла в память
    fs.readFile('W:\\bor\\x321help\\'+filename, function (err, logData) {

        if (err) {
            text = 'get_help: ОШИБКА чтения файла ' + filename+'<br>';
        }
        else {
            text = logData.toString(); // logData это объект типа Buffer, переводим в строку
        }

        res.send(text);
    });
});




//
// Рандомная страница, содержимое зависит от переданного в неё GET-параметра
//
router.get('/inform_any', function(req, res, next) {

    res.render('reports/inform_any'); // Показ формы
//    res.render('/reports/inform_any', {data: data}); // Показ формы

});


module.exports = router;