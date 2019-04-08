var express = require('express');
var router = express.Router();

var db = require("../db");


// ПЛАНИРОВАНИЕ И ОТСЛЕЖИВАНИЕ ВЫПОЛНЕНИЯ ПЛАНА

// Таблицы
//   plan_plan
//   plan_fact
//   sklad

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
// Показать список КАЛЕНДАРЕЙ по дням месяца
//
router.all('/plan_plan_dk_s', function(req, res, next) {
    var spr_name = 'Календари';
    var plan_name = req.body.plan_name;
    var sd_name = req.body.sd_name;

    var and_where_clause = '';
    var num_days = '';

//    if (plan_name == undefined)  plan_name = '';
    if (sd_name == undefined)  sd_name = '';


    if (plan_name == undefined) {
        var dtc = new Date();
        plan_name = dtc.getFullYear() + '-' + ("0" + (1 + dtc.getMonth())).slice(-2);
    }

    if (plan_name != '') {
        and_where_clause = ' AND plan.item_name = $1 ';
    }
    if (sd_name != '') {
        and_where_clause = and_where_clause + ' AND sd.item_name = $2 ';
    }

            num_days = '';
            for(var j = 1; j <=30; j++) {
                num_days = num_days + ' nums_plan['+j+'] AS np'+j+', ';
            }
            num_days = num_days + ' nums_plan[31] AS np31 ';

            db.any(
                "SELECT pp.plan_rf, plan.item_name AS plan_name, " +
                "    pp.sd_rf, sd.item_name AS sd_name, pp.item_rf, item.item_name AS item_name, num_plan, num_day, " + num_days +
                " FROM (((plan_plan pp " +
                "   LEFT JOIN item_list plan ON plan_rf = plan.item_id) " +
                "   LEFT JOIN item_list sd ON sd_rf = sd.item_id) " +
                "   LEFT JOIN item_list item ON item_rf = item.item_id) " +
                "  WHERE  item.spr_rf = 532 " +
                and_where_clause +
//              "    AND  plan.item_name = $1 " +
//              "    AND  sd.item_name = $2 " +
                " ORDER BY plan.item_name, sd.item_name, item.item_name ", [plan_name, sd_name])
                .then(function (data) {

                    for (var i = 0; i < data.length; i++) {
                        data[i].num_plan = Math.round(data[i].num_plan * 1000) / 1000;
                        data[i].num_day = Math.round(data[i].num_day * 1000) / 1000;

                        data[i].np1 = num2str (data[i].np1);
                        data[i].np2 = num2str (data[i].np2);
                        data[i].np3 = num2str (data[i].np3);
                        data[i].np4 = num2str (data[i].np4);
                        data[i].np5 = num2str (data[i].np5);
                        data[i].np6 = num2str (data[i].np6);
                        data[i].np7 = num2str (data[i].np7);
                        data[i].np8 = num2str (data[i].np8);
                        data[i].np9 = num2str (data[i].np9);
                        data[i].np10 = num2str (data[i].np10);
                        data[i].np11 = num2str (data[i].np11);
                        data[i].np12 = num2str (data[i].np12);
                        data[i].np13 = num2str (data[i].np13);
                        data[i].np14 = num2str (data[i].np14);
                        data[i].np15 = num2str (data[i].np15);
                        data[i].np16 = num2str (data[i].np16);
                        data[i].np17 = num2str (data[i].np17);
                        data[i].np18 = num2str (data[i].np18);
                        data[i].np19 = num2str (data[i].np19);
                        data[i].np20 = num2str (data[i].np20);
                        data[i].np21 = num2str (data[i].np21);
                        data[i].np22 = num2str (data[i].np22);
                        data[i].np23 = num2str (data[i].np23);
                        data[i].np24 = num2str (data[i].np24);
                        data[i].np25 = num2str (data[i].np25);
                        data[i].np26 = num2str (data[i].np26);
                        data[i].np27 = num2str (data[i].np27);
                        data[i].np28 = num2str (data[i].np28);
                        data[i].np29 = num2str (data[i].np29);
                        data[i].np30 = num2str (data[i].np30);
                        data[i].np31 = num2str (data[i].np31);

                    }

                    data.spr_name = spr_name;
                    data.plan_name = plan_name;
                    data.sd_name = sd_name;
                    res.render('plan2/plan_plan_dk_s', {data: data}); // Показ формы
                })
                .catch(function (error) {
                    res.send('ОШИБКА plan_plan_dk_s: '+error);
                });
});



//====== ПЛАН ======= таблица plan_plan ======== вариант 2 (по дням) =====
// То, что запланировано сделать. На месяц и по дням


// Возвращает ЧИСЛО последнего дня План-месяца, где План-месяц начинается с ГГГГ-ММ, например 2019-02
function PlanLastDay(plan_name)
{
    return 32 - new Date(plan_name.substr(0, 4),  plan_name.substr(5, 2)-1, 32).getDate();
}

//
// Показать список ПЛАН ЖБИ с кол-вом по дням месяца на выбранный План и Пролет
//
/*
router.get('/plan_plan_d2_sx/:spr_name/:plan_name/:sd_name', function(req, res, next) {
    var spr_name = req.params.spr_name;
    var plan_name = req.params.plan_name;
    var sd_name = req.params.sd_name;

//    request.post({url:'/plan2/plan_plan_d2_s', form: {key:'value'}}, function(err,httpResponse,body){ /* ... * / })


    var xhr = new XMLHttpRequest();

    var params =
        'spr_name=' + encodeURIComponent(spr_name) +
        '&plan_name=' + encodeURIComponent(plan_name)+
        '&sd_name=' + encodeURIComponent(sd_name);

 //   request.post({url:'/plan2/plan_plan_d2_s', form: {key:'value'}}, function(err,httpResponse,body){ /* ... * / })

    xhr.open("POST", '/plan_plan_d2_s', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);

});
*/


router.get('/plan_plan_d2_s/:spr_name/:plan_name/:sd_name', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var plan_name = req.params.plan_name;
  var sd_name = req.params.sd_name;
  var where_clause = '';
  var num_days = '';
  var month_days = 31;

//  month_days =  PlanLastDay(plan_name);

      num_days = '';
      for(var j = 1; j <= 30; j++) {
        num_days = num_days + ' nums_plan['+j+'] AS np'+j+', ';
      }
      num_days = num_days + ' nums_plan[31] AS np31 ';

      db.any(
        "SELECT pp.plan_rf, plan.item_name AS plan_name, " +
        "    pp.sd_rf, sd.item_name AS sd_name, pp.item_rf, item.item_name AS item_name, num_plan, num_day, " + num_days +
        " FROM ((((plan_plan pp " +
        "   LEFT JOIN item_list plan ON plan_rf = plan.item_id) " +
        "   LEFT JOIN item_list sd ON sd_rf = sd.item_id) " +
        "   LEFT JOIN item_list item ON item_rf = item.item_id) " +
        "   LEFT JOIN item_list spr ON item.spr_rf = spr.item_id) " +
        " WHERE  spr.item_name = $1 " +
        "   AND  plan.item_name = $2 " +
        "   AND  sd.item_name = $3 " +
        " ORDER BY plan.item_name, sd.item_name, item.item_name ", [spr_name, plan_name, sd_name])
        .then(function (data) {
          data.plan_name = plan_name;
          data.sd_name = sd_name;
//          res.send('xxx: '+sd_name +','+plan_name+data.sd_name);

          for (var i = 0; i < data.length; i++) {
            data[i].num_plan = Math.round(data[i].num_plan * 1000) / 1000
            data[i].num_day = Math.round(data[i].num_day * 1000) / 1000

            data[i].np1 = num2str (data[i].np1);
            data[i].np2 = num2str (data[i].np2);
            data[i].np3 = num2str (data[i].np3);
            data[i].np4 = num2str (data[i].np4);
            data[i].np5 = num2str (data[i].np5);
            data[i].np6 = num2str (data[i].np6);
            data[i].np7 = num2str (data[i].np7);
            data[i].np8 = num2str (data[i].np8);
            data[i].np9 = num2str (data[i].np9);
            data[i].np10 = num2str (data[i].np10);
            data[i].np11 = num2str (data[i].np11);
            data[i].np12 = num2str (data[i].np12);
            data[i].np13 = num2str (data[i].np13);
            data[i].np14 = num2str (data[i].np14);
            data[i].np15 = num2str (data[i].np15);
            data[i].np16 = num2str (data[i].np16);
            data[i].np17 = num2str (data[i].np17);
            data[i].np18 = num2str (data[i].np18);
            data[i].np19 = num2str (data[i].np19);
            data[i].np20 = num2str (data[i].np20);
            data[i].np21 = num2str (data[i].np21);
            data[i].np22 = num2str (data[i].np22);
            data[i].np23 = num2str (data[i].np23);
            data[i].np24 = num2str (data[i].np24);
            data[i].np25 = num2str (data[i].np25);
            data[i].np26 = num2str (data[i].np26);
            data[i].np27 = num2str (data[i].np27);
            data[i].np28 = num2str (data[i].np28);

//            if (month_days > 28)
                data[i].np29 = num2str (data[i].np29);
            data[i].np30 = num2str (data[i].np30);
            data[i].np31 = num2str (data[i].np31);

          }

          data.spr_name = spr_name;
          res.render('plan2/plan_plan_d2_s', {data: data}); // Показ формы
        })
        .catch(function (error) {
          res.send('ОШИБКА: '+error);
        });
});

router.all('/plan_plan_d2_s', function(req, res, next) {
    var spr_name = req.body.spr_name;
    var plan_name = req.body.plan_name;
    var sd_name = req.body.sd_name;
    var where_clause = '';
    var num_days = '';
    var month_days = 31;

    // Если не определены, то есть был GET запрос
//    if (!spr_name)   spr_name = 'ЖБИ';
//    if (!plan_name)  plan_name = '2019-02';
//    if (!sd_name)    sd_name = 'Пролет 33';

//  month_days =  PlanLastDay(plan_name);

    num_days = '';
    for(var j = 1; j <= 30; j++) {
        num_days = num_days + ' nums_plan['+j+'] AS np'+j+', ';
    }
    num_days = num_days + ' nums_plan[31] AS np31 ';

    db.any(
        "SELECT pp.plan_rf, plan.item_name AS plan_name, " +
        "    pp.sd_rf, sd.item_name AS sd_name, pp.item_rf, item.item_name AS item_name, num_plan, num_day, " + num_days +
        " FROM ((((plan_plan pp " +
        "   LEFT JOIN item_list plan ON plan_rf = plan.item_id) " +
        "   LEFT JOIN item_list sd ON sd_rf = sd.item_id) " +
        "   LEFT JOIN item_list item ON item_rf = item.item_id) " +
        "   LEFT JOIN item_list spr ON item.spr_rf = spr.item_id) " +
        " WHERE  spr.item_name = $1 " +
        "   AND  plan.item_name = $2 " +
        "   AND  sd.item_name = $3 " +
        " ORDER BY plan.item_name, sd.item_name, item.item_name ", [spr_name, plan_name, sd_name])
        .then(function (data) {
            data.plan_name = plan_name;
            data.sd_name = sd_name;
//          res.send('xxx: '+sd_name +','+plan_name+data.sd_name);

            for (var i = 0; i < data.length; i++) {
                data[i].num_plan = Math.round(data[i].num_plan * 1000) / 1000;
                data[i].num_day = Math.round(data[i].num_day * 1000) / 1000;

                data[i].np1 = num2str (data[i].np1);
                data[i].np2 = num2str (data[i].np2);
                data[i].np3 = num2str (data[i].np3);
                data[i].np4 = num2str (data[i].np4);
                data[i].np5 = num2str (data[i].np5);
                data[i].np6 = num2str (data[i].np6);
                data[i].np7 = num2str (data[i].np7);
                data[i].np8 = num2str (data[i].np8);
                data[i].np9 = num2str (data[i].np9);
                data[i].np10 = num2str (data[i].np10);
                data[i].np11 = num2str (data[i].np11);
                data[i].np12 = num2str (data[i].np12);
                data[i].np13 = num2str (data[i].np13);
                data[i].np14 = num2str (data[i].np14);
                data[i].np15 = num2str (data[i].np15);
                data[i].np16 = num2str (data[i].np16);
                data[i].np17 = num2str (data[i].np17);
                data[i].np18 = num2str (data[i].np18);
                data[i].np19 = num2str (data[i].np19);
                data[i].np20 = num2str (data[i].np20);
                data[i].np21 = num2str (data[i].np21);
                data[i].np22 = num2str (data[i].np22);
                data[i].np23 = num2str (data[i].np23);
                data[i].np24 = num2str (data[i].np24);
                data[i].np25 = num2str (data[i].np25);
                data[i].np26 = num2str (data[i].np26);
                data[i].np27 = num2str (data[i].np27);
                data[i].np28 = num2str (data[i].np28);

//            if (month_days > 28)
                data[i].np29 = num2str (data[i].np29);
                data[i].np30 = num2str (data[i].np30);
                data[i].np31 = num2str (data[i].np31);

            }

            data.spr_name = spr_name;
            data.plan_name = plan_name;
            data.sd_name = sd_name;

            res.render('plan2/plan_plan_d2_s', {data: data}); // Показ формы
        })
        .catch(function (error) {
            res.send('ОШИБКА: '+error);
        });
});

router.get('/plan_plan_d2_sxxx', function(req, res, next) {
    var spr_name = req.params.spr_name;
    var plan_name = req.params.plan_name;
    var sd_name = req.params.sd_name;

    res.send('plan_plan_d2_s: ');

});

//
// Добавить новую строку в ПЛАН
//
router.get('/plan_plan_d_addnew/:spr_name', function(req, res, next) {
  var spr_name = req.params.spr_name;
  db.one("SELECT 0 AS plan_rf, '' AS plan_name, 0 AS sd_rf, '' AS sd_name, 0 AS item_rf, '' AS item_name, 0 AS num_plan, " +
    " 0 AS num_day, " +
    " 0 AS np1, 0 AS np2, 0 AS np3, 0 AS np4, 0 AS np5, 0 AS np6, 0 AS np7, 0 AS np8, 0 AS np9, 0 AS np10," +
    " 0 AS np11, 0 AS np12, 0 AS np13, 0 AS np14, 0 AS np15, 0 AS np16, 0 AS np17, 0 AS np18, 0 AS np19, 0 AS np20," +
    " 0 AS np21, 0 AS np22, 0 AS np23, 0 AS np24, 0 AS np25, 0 AS np26, 0 AS np27, 0 AS np28, 0 AS np29, 0 AS np30," +
    " 0 AS np31 " )
    .then(function (data) {

      data.spr_name = spr_name;

        if (spr_name == 'ЖБИ')
            res.render('plan2/plan_plan_d_fc', data); // Показ формы
        if (spr_name == 'Календари')
            res.render('plan2/plan_plan_d_kal', data); // Показ формы

//        res.render('plan2/plan_plan_d', data);
    })
    .catch(function (error) {
      res.send('ОШИБКА: '+error);
    });
});


//
// Показать/обновить строку ПЛАНа
//
router.get('/plan_plan_d/:spr_name/:plan_rf/:sd_rf/:item_rf', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  var item_rf = req.params.item_rf;
  db.one(
    "SELECT pp.plan_rf, plan.item_name AS plan_name, " +
    "    pp.sd_rf, sd.item_name AS sd_name, pp.item_rf, item.item_name AS item_name, num_plan, num_day, " +
    "    nums_plan[1] AS np1, " +
    "    nums_plan[2] AS np2, " +
    "    nums_plan[3] AS np3, " +
    "    nums_plan[4] AS np4, " +
    "    nums_plan[5] AS np5, " +
    "    nums_plan[6] AS np6, " +
    "    nums_plan[7] AS np7, " +
    "    nums_plan[8] AS np8, " +
    "    nums_plan[9] AS np9, " +
    "    nums_plan[10] AS np10, " +
    "    nums_plan[11] AS np11, " +
    "    nums_plan[12] AS np12, " +
    "    nums_plan[13] AS np13, " +
    "    nums_plan[14] AS np14, " +
    "    nums_plan[15] AS np15, " +
    "    nums_plan[16] AS np16, " +
    "    nums_plan[17] AS np17, " +
    "    nums_plan[18] AS np18, " +
    "    nums_plan[19] AS np19, " +
    "    nums_plan[20] AS np20, " +
    "    nums_plan[21] AS np21, " +
    "    nums_plan[22] AS np22, " +
    "    nums_plan[23] AS np23, " +
    "    nums_plan[24] AS np24, " +
    "    nums_plan[25] AS np25, " +
    "    nums_plan[26] AS np26, " +
    "    nums_plan[27] AS np27, " +
    "    nums_plan[28] AS np28, " +
    "    nums_plan[29] AS np29, " +
    "    nums_plan[30] AS np30, " +
    "    nums_plan[31] AS np31 " +
    " FROM (((plan_plan pp " +
    "   LEFT JOIN item_list plan ON plan_rf = plan.item_id) " +
    "   LEFT JOIN item_list sd ON sd_rf = sd.item_id) " +
    "   LEFT JOIN item_list item ON item_rf = item.item_id) " +
    " WHERE plan_rf=$1 AND sd_rf=$2 AND item_rf=$3", [plan_rf, sd_rf, item_rf])
    .then(function (data) {

      data.num_plan = Math.round(data.num_plan * 1000) / 1000
      data.num_day = Math.round(data.num_day * 1000) / 1000

      data.np1 = num2str (data.np1);
      data.np2 = num2str (data.np2);
      data.np3 = num2str (data.np3);
      data.np4 = num2str (data.np4);
      data.np5 = num2str (data.np5);
      data.np6 = num2str (data.np6);
      data.np7 = num2str (data.np7);
      data.np8 = num2str (data.np8);
      data.np9 = num2str (data.np9);
      data.np10 = num2str (data.np10);
      data.np11 = num2str (data.np11);
      data.np12 = num2str (data.np12);
      data.np13 = num2str (data.np13);
      data.np14 = num2str (data.np14);
      data.np15 = num2str (data.np15);
      data.np16 = num2str (data.np16);
      data.np17 = num2str (data.np17);
      data.np18 = num2str (data.np18);
      data.np19 = num2str (data.np19);
      data.np20 = num2str (data.np20);
      data.np21 = num2str (data.np21);
      data.np22 = num2str (data.np22);
      data.np23 = num2str (data.np23);
      data.np24 = num2str (data.np24);
      data.np25 = num2str (data.np25);
      data.np26 = num2str (data.np26);
      data.np27 = num2str (data.np27);
      data.np28 = num2str (data.np28);
      data.np29 = num2str (data.np29);
      data.np30 = num2str (data.np30);
      data.np31 = num2str (data.np31);


      data.spr_name = spr_name;


        if (spr_name == 'ЖБИ')
            res.render('plan2/plan_plan_d_fc', data); // Показ формы
        if (spr_name == 'Календари')
            res.render('plan2/plan_plan_d_kal', data); // Показ формы


//        res.render('plan2/plan_plan_d_fc', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});


//
// Добавление и корректировка строки ПЛАНа
//
router.post('/plan_plan_d/update', function(req, res, next) {
  var spr_name = req.body.spr_name;
  var plan_rf = req.body.plan_rf;
  var sd_rf = req.body.sd_rf;
  var item_rf = req.body.item_rf;
  var plan_name = req.body.plan_name2;
  var sd_name = req.body.sd_name2;
  var item_name = req.body.item_name;
  var num_plan = req.body.num_plan;
  var num_day = req.body.num_day;
  var np = [req.body.np1, req.body.np2];
  var nps = '';
  var old_plan_rf = req.body.old_plan_rf;
  var old_sd_rf = req.body.old_sd_rf;
  var old_item_rf = req.body.old_item_rf;
  var doc_list_form = req.body.doc_list_form;
  var spr_rf = 0;
  var where_spr_clause = 'spr_rf > 0';

  db.any(
    "SELECT item_id " +
    "  FROM item_list " +
    "  WHERE  item_name = $1 ", [spr_name])
    .then(function (data) {

      if (data.length == 1) {
        where_spr_clause = " spr_rf = " + data[0].item_id;
      }
      else
        where_spr_clause = " spr_rf > 0 ";


      np = [
        req.body.np1,
        req.body.np2,
        req.body.np3,
        req.body.np4,
        req.body.np5,
        req.body.np6,
        req.body.np7,
        req.body.np8,
        req.body.np9,
        req.body.np10,
        req.body.np11,
        req.body.np12,
        req.body.np13,
        req.body.np14,
        req.body.np15,
        req.body.np16,
        req.body.np17,
        req.body.np18,
        req.body.np19,
        req.body.np20,
        req.body.np21,
        req.body.np22,
        req.body.np23,
        req.body.np24,
        req.body.np25,
        req.body.np26,
        req.body.np27,
        req.body.np28,
        req.body.np29,
        req.body.np30,
        req.body.np31
      ];

      nps = '{';
      for(var j = 0; j <=29; j++) {
        nps = nps + str2num(np[j]) +',';
      }
      nps = nps + str2num(np[30]) +'}';


//      res.send('/plan2/plan_plan_d2_s/'+spr_name+'/'+plan_name+'/'+sd_name+'?'+doc_list_form);
//      return;

//      res.render('plan2/sklad_s', {data: data}); // Показ формы

    })
    .then(function () {

      if (sd_rf > 0 ) {
//  Обновление
        db.none(
          "UPDATE plan_plan " +
          "SET plan_rf=(SELECT item_id FROM item_list WHERE spr_rf= 6 AND item_name=$1), " +
          "    sd_rf=(SELECT item_id FROM item_list WHERE spr_rf= 8 AND item_name=$2), " +
          "    item_rf=(SELECT item_id FROM item_list WHERE "+ where_spr_clause + " AND item_name=$3), " +
          "    num_plan=$4, num_day=$5, nums_plan = $9 " +
          "WHERE plan_rf=$6 AND sd_rf=$7 AND item_rf=$8",
          [plan_name, sd_name, item_name, num_plan, 0, old_plan_rf, old_sd_rf, old_item_rf, nps])
          .then (function () {
              if (doc_list_form != 'plan_plan_d2_s')
                  res.redirect('/plan2/'+doc_list_form);
              else
                  res.redirect('/plan2/plan_plan_d2_s/'+spr_name+'/'+plan_name+'/'+sd_name);
//              res.redirect('/plan2/'+doc_list_form);
//              res.redirect('/plan2/'+doc_list_form+'/'+spr_name+'/'+plan_name+'/'+sd_name);
//              res.redirect('/plan2/plan_plan_d2_s/'+spr_name+'/'+plan_name+'/'+sd_name);
//              res.send('/plan2/plan_plan_d2_s/'+spr_name+'/'+plan_name+'/'+sd_name);
//              http://127.0.0.1/plan2/plan_plan_dk_s/Календари/2018-07/Пролет%2033
          })
          .catch(function (error) {
            res.send('ОШИБКА: /plan_plan_d/update UPDATE: '+spr_name+'/'+plan_name+'/'+sd_name+'/'+error);
          });
      }
      else {
//  Добавление
        db.none(
          "INSERT INTO  plan_plan (plan_rf, sd_rf, item_rf, num_plan, num_day, nums_plan) " +
          "VALUES ((SELECT item_id FROM item_list WHERE spr_rf= 6 AND item_name=$1), " +
          "  (SELECT item_id FROM item_list WHERE spr_rf= 8 AND  item_name=$2), " +
          "  (SELECT item_id FROM item_list WHERE "+ where_spr_clause + " AND  item_name=$3), $4, $5, $6)",
          [plan_name, sd_name, item_name, num_plan, 0, nps])
          .then (function (data) {
              if (doc_list_form != 'plan_plan_d2_s')
                  res.redirect('/plan2/'+doc_list_form)
              else
                 res.redirect('/plan2/plan_plan_d2_s/'+spr_name+'/'+plan_name+'/'+sd_name);
          })
          .catch(function (error) {
            res.send('ОШИБКА: /plan_plan_d/update INSERT ('+plan_name+','+ sd_name+','+item_name+','+ num_plan+','+ num_day+'): '+error);
          });
      }

    });
});



// Удалить  ПЛАН ПРОИЗВОДСТВА ЖБИ
router.get('/plan_plan_delete/:spr_name/:plan_rf/:sd_rf/:item_rf/:plan_name/:sd_name', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  var item_rf = req.params.item_rf;
  var plan_name = req.params.plan_name;
  var sd_name = req.params.sd_name;
  db.none("DELETE FROM plan_plan WHERE plan_rf=$1 AND sd_rf=$2 AND item_rf=$3", [plan_rf, sd_rf, item_rf])
    .then(function () {
      res.redirect('/plan2/plan_plan_d2_s/'+spr_name+'/'+plan_name+'/'+sd_name);
    })
    .catch(function (error) {
      res.send('ОШИБКА: '+error);
    });
});







//====== ПЛАН ======= таблица plan_plan =============
// То, что запланировано сделать за месяц

//
// Показать список ПЛАН
//
router.get('/plan_plan_s/:spr_name', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var where_clause = '';

  db.any(
    "SELECT item_id " +
    "  FROM item_list " +
    "  WHERE  item_name = $1 ", [spr_name])
    .then(function (data) {

      if (data.length == 1) {
        where_clause = " WHERE item.spr_rf = " + data[0].item_id;
      }
      else
        where_clause = " WHERE item.spr_rf = 0 ";

//      res.render('plan2/sklad_s', {data: data}); // Показ формы

    })
    .then(function () {
  db.any(
    "SELECT pp.plan_rf, plan.item_name AS plan_name, " +
    "    pp.sd_rf, sd.item_name AS sd_name, pp.item_rf, item.item_name AS item_name, num_plan, num_day " +
    " FROM (((plan_plan pp " +
    "   LEFT JOIN item_list plan ON plan_rf = plan.item_id) " +
    "   LEFT JOIN item_list sd ON sd_rf = sd.item_id) " +
    "   LEFT JOIN item_list item ON item_rf = item.item_id) " +
    where_clause +
    " ORDER BY plan.item_name, sd.item_name, item.item_name ")
    .then(function (data) {

      for (var i = 0; i < data.length; i++) {
        data[i].num_plan = Math.round(data[i].num_plan * 1000) / 1000
        data[i].num_day = Math.round(data[i].num_day * 1000) / 1000
      }

      data.spr_name = spr_name;
      res.render('plan2/plan_plan_s', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
  });
});

//
// Добавить новую строку в ПЛАН
//
router.get('/plan_plan_addnew/:spr_name', function(req, res, next) {
  var spr_name = req.params.spr_name;
  db.one("SELECT 0 AS plan_rf, '' AS plan_name, 0 AS sd_rf, '' AS sd_name, 0 AS item_rf, '' AS item_name, 0 AS num_plan, 0 AS num_day ")
    .then(function (data) {

      data.spr_name = spr_name;

      res.render('plan2/plan_plan', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить строку ПЛАНа
//
router.get('/plan_plan/:spr_name/:plan_rf/:sd_rf/:item_rf', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  var item_rf = req.params.item_rf;
  db.one(
    "SELECT pp.plan_rf, plan.item_name AS plan_name, " +
    "    pp.sd_rf, sd.item_name AS sd_name, pp.item_rf, item.item_name AS item_name, num_plan, num_day " +
    " FROM (((plan_plan pp " +
    "   LEFT JOIN item_list plan ON plan_rf = plan.item_id) " +
    "   LEFT JOIN item_list sd ON sd_rf = sd.item_id) " +
    "   LEFT JOIN item_list item ON item_rf = item.item_id) " +
    " WHERE plan_rf=$1 AND sd_rf=$2 AND item_rf=$3", [plan_rf, sd_rf, item_rf])
    .then(function (data) {

      data.num_plan = Math.round(data.num_plan * 1000) / 1000
      data.num_day = Math.round(data.num_day * 1000) / 1000

      data.spr_name = spr_name;

      res.render('plan2/plan_plan', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавление и корректировка строки ПЛАНа
//
router.post('/plan_plan/update', function(req, res, next) {
  var spr_name = req.body.spr_name;
  var plan_rf = req.body.plan_rf;
  var sd_rf = req.body.sd_rf;
  var item_rf = req.body.item_rf;
  var plan_name = req.body.plan_name;
  var sd_name = req.body.sd_name;
  var item_name = req.body.item_name;
  var num_plan = req.body.num_plan;
  var num_day = req.body.num_day;
  var old_plan_rf = req.body.old_plan_rf;
  var old_sd_rf = req.body.old_sd_rf;
  var old_item_rf = req.body.old_item_rf;
  var spr_rf = 0;
  var where_spr_clause = 'spr_rf > 0';

  db.any(
    "SELECT item_id " +
    "  FROM item_list " +
    "  WHERE  item_name = $1 ", [spr_name])
    .then(function (data) {

      if (data.length == 1) {
        where_spr_clause = " spr_rf = " + data[0].item_id;
      }
      else
        where_spr_clause = " spr_rf > 0 ";

//      res.render('plan2/sklad_s', {data: data}); // Показ формы

    })
    .then(function () {

      if (sd_rf > 0 ) {
//  Обновление
    db.none(
      "UPDATE plan_plan " +
      "SET plan_rf=(SELECT item_id FROM item_list WHERE spr_rf= 6 AND item_name=$1), " +
      "    sd_rf=(SELECT item_id FROM item_list WHERE spr_rf= 8 AND item_name=$2), " +
      "    item_rf=(SELECT item_id FROM item_list WHERE "+ where_spr_clause + " AND item_name=$3), " +
      "    num_plan=$4, num_day=$5 " +
      "WHERE plan_rf=$6 AND sd_rf=$7 AND item_rf=$8",
      [plan_name, sd_name, item_name, num_plan, num_day, old_plan_rf, old_sd_rf, old_item_rf])
      .then (function () {
        res.redirect('/plan2/plan_plan_s/'+spr_name);
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO  plan_plan (plan_rf, sd_rf, item_rf, num_plan, num_day) " +
      "VALUES ((SELECT item_id FROM item_list WHERE spr_rf= 6 AND item_name=$1), " +
      "  (SELECT item_id FROM item_list WHERE spr_rf= 8 AND  item_name=$2), " +
      "  (SELECT item_id FROM item_list WHERE "+ where_spr_clause + " AND  item_name=$3), $4, $5)",
      [plan_name, sd_name, item_name, num_plan, num_day])
      .then (function (data) {
        res.redirect('/plan2/plan_plan_s/'+spr_name);
      })
      .catch(function (error) {
        res.send('ОШИБКА: INSERT ('+plan_name+','+ sd_name+','+item_name+','+ num_plan+','+ num_day+'): '+error);
      });
  }

  });
});

// Удалить  ПЛАН ПРОИЗВОДСТВА ЖБИ
router.get('/plan_plan_delete/:spr_name/:plan_rf/:sd_rf/:item_rf', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  var item_rf = req.params.item_rf;
  db.none("DELETE FROM plan_plan WHERE plan_rf=$1 AND sd_rf=$2 AND item_rf=$3", [plan_rf, sd_rf, item_rf])
    .then(function () {
      res.redirect('/plan2/plan_plan_s/'+spr_name); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});


//====== ФАКТ ======= таблица plan_fact =========================================================
// То, что сделано

//
// Показать список ФАКТ
//
router.get('/plan_fact_s/:spr_name', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var where_clause = '';

  db.any(
    "SELECT item_id " +
    "  FROM item_list " +
    "  WHERE  item_name = $1 ", [spr_name])
    .then(function (data) {

      if (data.length == 1) {
        where_clause = " WHERE item.spr_rf = " + data[0].item_id;
      }
      else
        where_clause = " WHERE item.spr_rf = 0 ";

//      res.render('plan2/sklad_s', {data: data}); // Показ формы

    })
    .then(function () {
  db.any(
    "SELECT pp.plan_rf, plan.item_name AS plan_name, " +
    "    pp.sd_rf, sd.item_name AS sd_name, pp.item_rf, item.item_name AS item_name, CAST(pp.dt AS VARCHAR) AS dt, num_fact, doc_rf " +
    " FROM (((plan_fact pp " +
    "   LEFT JOIN item_list plan ON plan_rf = plan.item_id) " +
    "   LEFT JOIN item_list sd ON sd_rf = sd.item_id) " +
    "   LEFT JOIN item_list item ON item_rf = item.item_id) " +
    where_clause +
    " ORDER BY plan.item_name, pp.dt, sd.item_name, item.item_name ")
    .then(function (data) {

      for (var i = 0; i < data.length; i++) {
        data[i].num_fact = Math.round(data[i].num_fact * 1000) / 1000
      }

      data.spr_name = spr_name;

      res.render('plan2/plan_fact_s', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
  });
});

//
// Добавить новую строку в ФАКТ
//
router.get('/plan_fact_addnew/:spr_name', function(req, res, next) {
  var spr_name = req.params.spr_name;
  db.one("SELECT 0 AS plan_rf, '' AS plan_name, 0 AS sd_rf, '' AS sd_name, 0 AS item_rf, '' AS item_name, CAST(CURRENT_TIMESTAMP AS VARCHAR) AS dt, 0 AS num_fact ")
    .then(function (data) {

      data.spr_name = spr_name;

      res.render('plan2/plan_fact', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить строку ФАКТа
//
router.get('/plan_fact/:spr_name/:plan_rf/:sd_rf/:item_rf', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  var item_rf = req.params.item_rf;
  db.one(
    "SELECT pp.plan_rf, plan.item_name AS plan_name, " +
    "    pp.sd_rf, sd.item_name AS sd_name, pp.item_rf, item.item_name AS item_name, CAST(pp.dt AS VARCHAR) AS dt, num_fact " +
    " FROM (((plan_fact pp " +
    "   LEFT JOIN item_list plan ON plan_rf = plan.item_id) " +
    "   LEFT JOIN item_list sd ON sd_rf = sd.item_id) " +
    "   LEFT JOIN item_list item ON item_rf = item.item_id) " +
    " WHERE plan_rf=$1 AND sd_rf=$2 AND item_rf=$3", [plan_rf, sd_rf, item_rf])
    .then(function (data) {

      data.num_fact = Math.round(data.num_fact * 1000) / 1000

      data.spr_name = spr_name;

      res.render('plan2/plan_fact', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавление и корректировка строки ФАКТа
//
router.post('/plan_fact/update', function(req, res, next) {
  var spr_name = req.body.spr_name;
  var plan_rf = req.body.plan_rf;
  var sd_rf = req.body.sd_rf;
  var item_rf = req.body.item_rf;
  var plan_name = req.body.plan_name;
  var sd_name = req.body.sd_name;
  var item_name = req.body.item_name;
  var dt = req.body.dt;
  var num_fact = req.body.num_fact;
  var old_plan_rf = req.body.old_plan_rf;
  var old_sd_rf = req.body.old_sd_rf;
  var old_item_rf = req.body.old_item_rf;
  if (sd_rf > 0 ) {
//  Обновление
    db.none(
      "UPDATE plan_fact " +
      "SET plan_rf=(SELECT item_id FROM item_list WHERE spr_rf = 6 AND item_name=$1), " +
      "    sd_rf=(SELECT item_id FROM item_list WHERE spr_rf = 8 AND item_name=$2), " +
      "    item_rf=(SELECT item_id FROM item_list WHERE spr_rf = 9 AND item_name=$3), " +
      "    dt=$4, num_fact=$5 " +
      "WHERE plan_rf=$6 AND sd_rf=$7 AND item_rf=$8",
      [plan_name, sd_name, item_name, dt, num_fact, old_plan_rf, old_sd_rf, old_item_rf])
      .then (function () {
        res.redirect('/plan2/plan_fact_s/'+spr_name);
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO  plan_fact (plan_rf, sd_rf, item_rf, dt, num_fact) " +
      "VALUES ((SELECT item_id FROM item_list WHERE spr_rf = 6 AND item_name=$1), " +
      "  (SELECT item_id FROM item_list WHERE spr_rf = 8 AND item_name=$2), " +
      "  (SELECT item_id FROM item_list WHERE spr_rf = 9 AND item_name=$3), $4, $5)",
      [plan_name, sd_name, item_name, dt, num_fact])
      .then (function (data) {
        res.redirect('/plan2/plan_fact_s/'+spr_name);
      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить ФАКТ
router.get('/plan_fact_delete/:spr_name/:plan_rf/:sd_rf/:item_rf', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  var item_rf = req.params.item_rf;
  db.none("DELETE FROM plan_fact WHERE plan_rf=$1 AND sd_rf=$2 AND item_rf=$3", [plan_rf, sd_rf, item_rf])
    .then(function () {
      res.redirect('/plan2/plan_fact_s/'+spr_name); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});


//====== СКЛАД ======= таблица sklad ===========================================

//
// Показать список СКЛАД
//
router.get('/sklad_s', function(req, res, next) {
  res.redirect('/plan2/sklad_s/all');
});

router.get('/sklad_s/:spr_name', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var where_clause = '';

//  if (spr_name != '0')
//    where_clause = " WHERE item.spr_rf = " + spr_name;

  db.any(
    "SELECT item_id " +
    "  FROM item_list " +
    "  WHERE  item_name = $1 ", [spr_name])
    .then(function (data) {

      if (data.length == 1) {
        where_clause = " WHERE item.spr_rf = " + data[0].item_id;
      }
      else
        where_clause = " WHERE item.spr_rf = 0 ";

//      res.render('plan2/sklad_s', {data: data}); // Показ формы

    })
    .then(function () {
      db.any(
    "SELECT pp.sklad_rf, sklad.item_name AS sklad_name, " +
    "    pp.item_rf, item.item_name AS item_name, num_fact, num_max, (num_max - num_fact) AS num_free " +
    " FROM ((sklad pp " +
    "   LEFT JOIN item_list sklad ON sklad_rf = sklad.item_id) " +
    "   LEFT JOIN item_list item ON item_rf = item.item_id) " +
      where_clause +
    " ORDER BY sklad.item_name, item.item_name ")
    .then(function (data) {

      for (var i = 0; i < data.length; i++) {
        data[i].num_fact = Math.round(data[i].num_fact * 1000) / 1000
        data[i].num_max = Math.round(data[i].num_max * 1000) / 1000
        data[i].num_free = Math.round(data[i].num_free * 1000) / 1000
      }

      data.spr_name = spr_name;
      res.render('plan2/sklad_s', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });

  });

});

//
// Добавить новую строку в СКЛАД
//sklad_addnew
router.get('/sklad_addnew/:spr_name', function(req, res, next) {
  var spr_name = req.params.spr_name;
  db.one("SELECT 0 AS sklad_rf, '' AS sklad_name, 0 AS item_rf, '' AS item_name, 0 AS num_fact, 0 AS num_max, 0 AS num_free ")
    .then(function (data) {

      data.spr_name = spr_name;

      res.render('plan2/sklad', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить строку СКЛАДа
//
router.get('/sklad/:spr_name/:sklad_rf/:item_rf', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var sklad_rf = req.params.sklad_rf;
  var item_rf = req.params.item_rf;
  db.one(
    "SELECT pp.sklad_rf, sklad.item_name AS sklad_name, " +
    "    pp.item_rf, item.item_name AS item_name, num_fact, num_max, (num_max - num_fact) AS num_free " +
    " FROM ((sklad pp " +
    "   LEFT JOIN item_list sklad ON sklad_rf = sklad.item_id) " +
    "   LEFT JOIN item_list item ON item_rf = item.item_id) " +
    " WHERE sklad_rf=$1 AND item_rf=$2", [sklad_rf, item_rf])
    .then(function (data) {

      data.num_fact = Math.round(data.num_fact * 1000) / 1000
      data.num_max = Math.round(data.num_max * 1000) / 1000
      data.num_free = Math.round(data.num_free * 1000) / 1000

      data.spr_name = spr_name;

      res.render('plan2/sklad', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавление и корректировка строки СКЛАДа
//
router.post('/sklad/update', function(req, res, next) {
  var spr_name = req.body.spr_name;
  var sklad_rf = req.body.sklad_rf;
  var item_rf = req.body.item_rf;
  var sklad_name = req.body.sklad_name;
  var item_name = req.body.item_name;
  var num_fact = req.body.num_fact;
  var num_max = req.body.num_max;
  var old_sklad_rf = req.body.old_sklad_rf;
  var old_item_rf = req.body.old_item_rf;
  if (item_rf > 0 ) {
//  Обновление
    db.none(
      "UPDATE sklad " +
      "SET sklad_rf=(SELECT item_id FROM item_list WHERE spr_rf = 8 AND item_name=$1), " +
      "    item_rf=(SELECT item_id FROM item_list WHERE item_name=$2 AND " +
        "    spr_rf = (SELECT item_id FROM item_list WHERE spr_rf = 3 AND item_name=$7)  ), " +
      "    num_fact=$3, num_max=$4 " +
      "WHERE sklad_rf=$5 AND item_rf=$6",
      [sklad_name, item_name, num_fact, num_max, old_sklad_rf, old_item_rf, spr_name])
      .then (function () {
        res.redirect('/plan2/sklad_s/'+spr_name);
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO sklad (sklad_rf, item_rf, num_fact, num_max) " +
      "VALUES ((SELECT item_id FROM item_list WHERE spr_rf = 8 AND item_name=$1), " +
      "  (SELECT item_id FROM item_list WHERE " +
        " spr_rf = (SELECT item_id FROM item_list WHERE spr_rf = 3 AND item_name=$5) AND item_name=$2), " +
        "$3, $4)", //
      [sklad_name, item_name, num_fact, num_max, spr_name])
      .then (function (data) {
        res.redirect('/plan2/sklad_s/'+spr_name);
      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить предмет со СКЛАДа
router.get('/sklad_delete/:spr_name/:sklad_rf/:item_rf', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var sklad_rf = req.params.sklad_rf;
  var item_rf = req.params.item_rf;
  db.none("DELETE FROM sklad WHERE sklad_rf=$1 AND item_rf=$2", [sklad_rf, item_rf])
    .then(function () {
      res.redirect('/plan2/sklad_s/'+spr_name); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});


//====== ПРИХОД АРМАТУРЫ ======= таблицы armprihod_h и armprihod ===========================================

//
// Показать список документов ПРИХОД АРМАТУРЫ
//
router.get('/armprihod', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var where_clause = '';

  db.any(
    "SELECT h.doc_id, SUBSTRING(CAST(h.dt AS VARCHAR), 1, 16) AS dt, i.item_name AS sd_name " +
    " FROM (armprihod_h h " +
    "   LEFT JOIN item_list i ON h.sd_rf = i.item_id) " +
    " ORDER BY 2 ")
    .then(function (data) {

      data.spr_name = spr_name;
      res.render('plan2/armprihod_h', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});


//
// Добавить новый документ ПРИХОД АРМАТУРЫ
//
router.get('/armprihod_addnew', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var gdata;

  db.one(
    "SELECT 0 AS doc_id, " +
    " SUBSTRING(CAST(CURRENT_TIMESTAMP AS VARCHAR), 1, 16) AS dt, " +
    " 441 AS sd_rf, " +
    " (SELECT item_name FROM item_list WHERE item_id=441) AS sd_name"
  )
    .then(function (data) {
      gdata = data;
      db.any(
        "SELECT t.doc_rf, t.arm_rf, arm.item_name AS arm_name, t.arm_num " +
        " FROM (armprihod t " +
        "   LEFT JOIN item_list arm ON t.arm_rf = arm.item_id) " +
        " WHERE t.doc_rf=0")
        .then(function (data) {

          data.doc_id = gdata.doc_id;
          data.dt = gdata.dt;
          data.sd_rf = gdata.sd_rf;
          data.sd_name = gdata.sd_name;

//          res.send(data.sd_name + ',' + data[1].arm_name);
          res.render('plan2/armprihod', {data: data}); // Показ формы
//          res.render('plan2/armprihod', data);
        })
        .catch(function (error) {
          res.send(error);
        });

//      data.doc_id = "0";
//      data.dt = SUBSTRING(CAST(CURRENT_TIMESTAMP AS VARCHAR), 1, 16);
//      data.sd_rf = "441";
//      data.sd_name = 'Склад арматуры №2';

//      res.render('plan2/armprihod', {data: data}); // Показ формы
//      res.render('plan2/armprihod', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить документ ПРИХОД АРМАТУРЫ
//
router.get('/armprihod/:doc_rf', function(req, res, next) {
  var doc_rf = req.params.doc_rf;
  var gdata;
  db.one(
    "SELECT h.doc_id, SUBSTRING(CAST(h.dt AS VARCHAR), 1, 16) AS dt, h.sd_rf, sd.item_name AS sd_name " +
//    "SELECT h.doc_id, CAST(h.dt AS VARCHAR) AS dt, h.sd_rf, sd.item_name AS sd_name " +
    " FROM (armprihod_h h " +
    "   LEFT JOIN item_list sd ON h.sd_rf = sd.item_id) " +
    " WHERE h.doc_id=$1", [doc_rf])
    .then(function (data) {
      gdata = data;
      db.any(
        "SELECT t.doc_rf, t.arm_rf, arm.item_name AS arm_name, t.arm_num " +
        " FROM (armprihod t " +
        "   LEFT JOIN item_list arm ON t.arm_rf = arm.item_id) " +
        " WHERE t.doc_rf=$1" +
        " ORDER BY 3 ", [doc_rf])
        .then(function (data) {

          data.doc_id = gdata.doc_id;
          data.dt = gdata.dt;
          data.sd_rf = gdata.sd_rf;
          data.sd_name = gdata.sd_name;

//          res.send(data.sd_name + ',' + data[1].arm_name);
          res.render('plan2/armprihod', {data: data}); // Показ формы
//          res.render('plan2/armprihod', data);
        })
        .catch(function (error) {
          res.send(error);
        });

//      data.num_fact = Math.round(data.num_fact * 1000) / 1000
//      data.spr_name = spr_name;
      //res.send(doc_rf);
//      res.render('plan2/armprihod', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});


//
// Добавление и корректировка строки документа ПРИХОД АРМАТУРЫ
//
router.post('/armprihod_save_row', function(req, res, next) {
  var doc_id = req.body.doc_id;
  var old_arm_name = req.body.old_arm_name;
  var arm_name = req.body.arm_name;
  var arm_num = req.body.arm_num;

  if (old_arm_name.trim() != "") {
//  Обновление
    db.none(
      "UPDATE armprihod " +
      "SET arm_rf=(SELECT item_id FROM item_list WHERE item_name=$1), " +
      "    arm_num=$2 " +
      "WHERE doc_rf=$3 AND arm_rf=(SELECT item_id FROM item_list WHERE item_name=$4)",
      [arm_name, arm_num, doc_id, old_arm_name])
      .then (function () {
        res.send("+Строка ["+arm_name+","+arm_num+"] обновлена.");
      })
      .catch(function (error) {
        res.send('x-->'+arm_name+","+arm_num+","+ doc_id+","+ old_arm_name+","+error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO armprihod (doc_rf, arm_rf, arm_num) " +
      " VALUES ($1, (SELECT item_id FROM item_list WHERE item_name=$2), $3)",
      [doc_id, arm_name, arm_num])
      .then (function (data) {
        res.send("+Строка ["+doc_id+","+arm_name+","+arm_num+"] добавлена.");
      })
      .catch(function (error) {
        res.send("-Строка ["+doc_id+","+arm_name+","+arm_num+"] не добавлена."+error);
      });
  }
});


//
// Добавление и корректировка ШАПКИ документа ПРИХОД АРМАТУРЫ
//
router.post('/armprihod_save_head', function(req, res, next) {
  var doc_id = req.body.doc_id;
  var dt = req.body.dt;
  var sd_name = req.body.sd_name;

  if (doc_id != "0") {
//  Обновление
    db.none(
      "UPDATE armprihod_h " +
      "SET sd_rf=(SELECT item_id FROM item_list WHERE item_name=$1), " +
      "    dt=$2 " +
      "WHERE doc_id=$3",
      [sd_name, dt, doc_id])
      .then (function () {
        res.send("+Шапка документа ["+doc_id+"] обновлена.");
      })
      .catch(function (error) {
        res.send("armprihod_save_head("+doc_id+ ") UPDATE: "+error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO armprihod_h (dt, sd_rf) " +
      " VALUES ($1, (SELECT item_id FROM item_list WHERE item_name=$2))",
      [dt, sd_name])
      .then (function (data) {
        res.send("+Шапка документа ["+doc_id+"] добавлена.");
      })
      .catch(function (error) {
        res.send("armprihod_save_head("+doc_id+ ") INSERT: "+error);
      });
  }
});

//
// Удаление строки документа ПРИХОД АРМАТУРЫ
//
router.post('/armprihod_delete_row', function(req, res, next) {
  var doc_id = req.body.doc_id;
  var old_arm_name = req.body.old_arm_name;

  db.none(
    "DELETE FROM armprihod " +
    " WHERE doc_rf=$1 AND arm_rf=(SELECT item_id FROM item_list WHERE item_name=$2)",
      [doc_id, old_arm_name])
      .then (function () {
        res.send("+Строка ["+doc_id+","+old_arm_name+"] удалена.");
      })
      .catch(function (error) {
        res.send('ОШИБКА armprihod_delete_row('+ doc_id+","+ old_arm_name+"): "+error);
      });
});

//
// Удаление всего документа ПРИХОД АРМАТУРЫ
//
router.post('/armprihod_delete', function(req, res, next) {
  var doc_id = req.body.doc_id;

  db.none(
    "DELETE FROM armprihod WHERE doc_rf=$1;DELETE FROM armprihod_h WHERE doc_id=$1",
    [doc_id])
    .then (function () {
      res.send("+Документ ["+doc_id+"] удален.");
    })
    .catch(function (error) {
      res.send('ОШИБКА armprihod_delete('+ doc_id+"): "+error);
    });
});

//
// Вернуть ИД документа ПРИХОД АРМАТУРЫ
//
router.post('/armprihod_get_doc_id', function(req, res, next) {
  var dt = req.body.dt;
  var sd_name = req.body.sd_name;

  db.one(
    "SELECT doc_id " +
    " FROM armprihod_h  " +
    " WHERE SUBSTRING(CAST(dt AS VARCHAR), 1, 16) = $1 " +
    "   AND sd_rf = (SELECT item_id FROM item_list WHERE item_name=$2) ", [dt, sd_name])
    .then(function (data) {

      res.send(data.doc_id.toString());
    })
    .catch(function (error) {
      res.send("armprihod_get_doc_id: "+error);
    });
});


//====== ПРИХОД БЕТОНА ======= таблицы betprihod_h и betprihod ===========================================

//
// Показать список документов ПРИХОД БЕТОНА
//
router.get('/betprihod', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var where_clause = '';

  db.any(
    "SELECT h.doc_id, SUBSTRING(CAST(h.dt AS VARCHAR), 1, 16) AS dt, i.item_name AS sd_name " +
    " FROM (betprihod_h h " +
    "   LEFT JOIN item_list i ON h.sd_rf = i.item_id) " +
    " ORDER BY 2 ")
    .then(function (data) {

      data.spr_name = spr_name;
      res.render('plan2/betprihod_h', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});


//
// Добавить новый документ ПРИХОД БЕТОНА
//
router.get('/betprihod_addnew', function(req, res, next) {
  var spr_name = req.params.spr_name;
  var gdata;

  db.one(
    "SELECT 0 AS doc_id, " +
    " SUBSTRING(CAST(CURRENT_TIMESTAMP AS VARCHAR), 1, 16) AS dt, " +
    " 441 AS sd_rf, " +
    " (SELECT item_name FROM item_list WHERE item_id=452) AS sd_name"
  )
    .then(function (data) {
      gdata = data;
      db.any(
        "SELECT t.doc_rf, t.bet_rf, bet.item_name AS bet_name, t.bet_num " +
        " FROM (betprihod t " +
        "   LEFT JOIN item_list bet ON t.bet_rf = bet.item_id) " +
        " WHERE t.doc_rf=0")
        .then(function (data) {

          data.doc_id = gdata.doc_id;
          data.dt = gdata.dt;
          data.sd_rf = gdata.sd_rf;
          data.sd_name = gdata.sd_name;

          res.render('plan2/betprihod', {data: data}); // Показ формы
        })
        .catch(function (error) {
          res.send(error);
        });

    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить документ ПРИХОД БЕТОНА
//
router.get('/betprihod/:doc_rf', function(req, res, next) {
  var doc_rf = req.params.doc_rf;
  var gdata;
  db.one(
    "SELECT h.doc_id, SUBSTRING(CAST(h.dt AS VARCHAR), 1, 16) AS dt, h.sd_rf, sd.item_name AS sd_name " +
    " FROM (betprihod_h h " +
    "   LEFT JOIN item_list sd ON h.sd_rf = sd.item_id) " +
    " WHERE h.doc_id=$1", [doc_rf])
    .then(function (data) {
      gdata = data;
      db.any(
        "SELECT t.doc_rf, t.bet_rf, bet.item_name AS bet_name, t.bet_num " +
        " FROM (betprihod t " +
        "   LEFT JOIN item_list bet ON t.bet_rf = bet.item_id) " +
        " WHERE t.doc_rf=$1" +
        " ORDER BY 3 ", [doc_rf])
        .then(function (data) {

          data.doc_id = gdata.doc_id;
          data.dt = gdata.dt;
          data.sd_rf = gdata.sd_rf;
          data.sd_name = gdata.sd_name;

          res.render('plan2/betprihod', {data: data}); // Показ формы
        })
        .catch(function (error) {
          res.send(error);
        });

//      data.num_fact = Math.round(data.num_fact * 1000) / 1000
    })
    .catch(function (error) {
      res.send(error);
    });
});


//
// Добавление и корректировка строки документа ПРИХОД БЕТОНА
//
router.post('/betprihod_save_row', function(req, res, next) {
  var doc_id = req.body.doc_id;
  var old_bet_name = req.body.old_bet_name;
  var bet_name = req.body.bet_name;
  var bet_num = req.body.bet_num;

  if (old_bet_name.trim() != "") {
//  Обновление
    db.none(
      "UPDATE betprihod " +
      "SET bet_rf=(SELECT item_id FROM item_list WHERE item_name=$1), " +
      "    bet_num=$2 " +
      "WHERE doc_rf=$3 AND bet_rf=(SELECT item_id FROM item_list WHERE item_name=$4)",
      [bet_name, bet_num, doc_id, old_bet_name])
      .then (function () {
        res.send("+Строка ["+bet_name+","+bet_num+"] обновлена.");
      })
      .catch(function (error) {
        res.send('x-->'+bet_name+","+bet_num+","+ doc_id+","+ old_bet_name+","+error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO betprihod (doc_rf, bet_rf, bet_num) " +
      " VALUES ($1, (SELECT item_id FROM item_list WHERE item_name=$2), $3)",
      [doc_id, bet_name, bet_num])
      .then (function (data) {
        res.send("+Строка ["+doc_id+","+bet_name+","+bet_num+"] добавлена.");
      })
      .catch(function (error) {
        res.send("-Строка ["+doc_id+","+bet_name+","+bet_num+"] не добавлена."+error);
      });
  }
});


//
// Добавление и корректировка ШАПКИ документа ПРИХОД БЕТОНА
//
router.post('/betprihod_save_head', function(req, res, next) {
  var doc_id = req.body.doc_id;
  var dt = req.body.dt;
  var sd_name = req.body.sd_name;

  if (doc_id != "0") {
//  Обновление
    db.none(
      "UPDATE betprihod_h " +
      "SET sd_rf=(SELECT item_id FROM item_list WHERE item_name=$1), " +
      "    dt=$2 " +
      "WHERE doc_id=$3",
      [sd_name, dt, doc_id])
      .then (function () {
        res.send("+Шапка документа ["+doc_id+"] обновлена.");
      })
      .catch(function (error) {
        res.send("betprihod_save_head("+doc_id+ ") UPDATE: "+error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO betprihod_h (dt, sd_rf) " +
      " VALUES ($1, (SELECT item_id FROM item_list WHERE item_name=$2))",
      [dt, sd_name])
      .then (function (data) {
        res.send("+Шапка документа ["+doc_id+"] добавлена.");
      })
      .catch(function (error) {
        res.send("betprihod_save_head("+doc_id+ ") INSERT: "+error);
      });
  }
});

//
// Удаление строки документа ПРИХОД БЕТОНА
//
router.post('/betprihod_delete_row', function(req, res, next) {
  var doc_id = req.body.doc_id;
  var old_bet_name = req.body.old_bet_name;

  db.none(
    "DELETE FROM betprihod " +
    " WHERE doc_rf=$1 AND bet_rf=(SELECT item_id FROM item_list WHERE item_name=$2)",
    [doc_id, old_bet_name])
    .then (function () {
      res.send("+Строка ["+doc_id+","+old_bet_name+"] удалена.");
    })
    .catch(function (error) {
      res.send('ОШИБКА betprihod_delete_row('+ doc_id+","+ old_bet_name+"): "+error);
    });
});

//
// Удаление всего документа ПРИХОД БЕТОНА
//
router.post('/betprihod_delete', function(req, res, next) {
  var doc_id = req.body.doc_id;

  db.none(
    "DELETE FROM betprihod WHERE doc_rf=$1;DELETE FROM betprihod_h WHERE doc_id=$1",
    [doc_id])
    .then (function () {
      res.send("+Документ ["+doc_id+"] удален.");
    })
    .catch(function (error) {
      res.send('ОШИБКА betprihod_delete('+ doc_id+"): "+error);
    });
});

//
// Вернуть ИД документа ПРИХОД БЕТОНА
//
router.post('/betprihod_get_doc_id', function(req, res, next) {
  var dt = req.body.dt;
  var sd_name = req.body.sd_name;

  db.one(
    "SELECT doc_id " +
    " FROM betprihod_h  " +
    " WHERE SUBSTRING(CAST(dt AS VARCHAR), 1, 16) = $1 " +
    "   AND sd_rf = (SELECT item_id FROM item_list WHERE item_name=$2) ", [dt, sd_name])
    .then(function (data) {

      res.send(data.doc_id.toString());
    })
    .catch(function (error) {
      res.send("betprihod_get_doc_id: "+error);
    });
});


//=================== ПЛАНЫ (периоды планирования) =====================

//
// Показать список ПЛАНОВ
//
router.get('/plan_s_s', function(req, res, next) {
  db.any(
    " INSERT INTO public.plan_s(plan_rf, date_begin, date_end) " +
    "   SELECT item_id, '1970-01-01', '1970-01-31'  FROM item_list " +
    " WHERE spr_rf = 6  AND item_id NOT IN (SELECT plan_rf FROM plan_s); " +

    "SELECT p.plan_rf, i.item_name AS plan_name, CAST(p.date_begin AS VARCHAR) AS dtb, CAST(p.date_end AS VARCHAR) AS dte" +
    " FROM plan_s p " +
    "   LEFT JOIN item_list i ON p.plan_rf = i.item_id " +
    " ORDER BY plan_name")
    .then(function (data) {

      res.render('plan2/plan_s_s', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавить новый ПЛАН
//
router.get('/plan_s_addnew', function(req, res, next) {
  db.one("SELECT 0 AS plan_rf, '' AS plan_name, CAST(CURRENT_DATE AS varchar) AS dtb, CAST(CURRENT_DATE+30 AS varchar) AS dte ")
    .then(function (data) {
      res.render('plan2/plan_s', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить ПЛАН
//
router.get('/plan_s/:plan_rf', function(req, res, next) {
  var plan_rf = req.params.plan_rf;
  db.one(
    "SELECT p.plan_rf, i.item_name AS plan_name, CAST(p.date_begin AS VARCHAR) AS dtb, CAST(p.date_end AS VARCHAR) AS dte" +
    " FROM plan_s p " +
    "   LEFT JOIN item_list i ON p.plan_rf = i.item_id " +
    " WHERE p.plan_rf = $1", [plan_rf])
    .then(function (data) {
      res.render('plan2/plan_s', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавление и корректировка ПЛАНА
//
router.post('/plan_s_update', function(req, res, next) {
  var plan_rf = req.body.plan_rf;
  var plan_name = req.body.plan_name;
  var dtb = req.body.dtb;
  var dte = req.body.dte;
  if (plan_rf > 0 ) {
//  Обновление
    db.none(
      "UPDATE item_list " +
      "SET item_name = $1 " +
      "WHERE item_id = $4 " +
      " ; " +
      "UPDATE plan_s " +
      "SET date_begin=$2, " +
      "    date_end=$3 " +
      "WHERE plan_rf=$4",
      [plan_name, dtb, dte, plan_rf])
      .then (function () {
        res.redirect('/plan2/plan_s_s');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO plan_s (plan_rf, date_begin, date_end) " +
      "VALUES (add2spr('Планы','Планы', $1), $2, $3)",
      [plan_name, dtb, dte])
      .then (function (data) {
        res.redirect('/plan2/plan_s_s');

      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить ПЛАН
router.get('/plan_s_delete/:plan_rf', function(req, res, next) {
  var plan_rf = req.params.plan_rf;
  db.none("DELETE FROM plan_s WHERE plan_rf=$1 ; DELETE FROM item_list WHERE item_id=$1 ", plan_rf)
    .then(function () {
      res.redirect('/plan2/plan_s_s'); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});


//=================== ПОЛУЧЕНИЕ ПАРАМЕТРОВ РАСЧЕТА ПЛАНА ЖБИ =====================


// Рабочие часы по дням месяца
router.post('/get_working_hours', function(req, res, next) {
    var plan_name = req.body.plan_name;
    var sd_name = req.body.sd_name;
    db.any(
        "SELECT nums_plan " +
        " FROM (plan_plan pp " +
        "   LEFT JOIN item_list item ON item_rf = item.item_id) " +
        " WHERE plan_rf=(SELECT item_id FROM item_list WHERE spr_rf = 6 AND item_name=$1)  " +
        "   AND sd_rf=(SELECT item_id FROM item_list WHERE spr_rf = 8 AND item_name=$2) "+
        "   AND item.item_name = $3", [plan_name, sd_name, "Рабочие часы"])
        .then(function (data) {

            if (data.length > 0)
                res.send(data[0].nums_plan+','+plan_name+','+sd_name);
            else
                res.send('0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0');
        })
        .catch(function (error) {
            res.send('ОШИБКА (get_working_hours): '+error);
        });
});

// Получение параметров ПЛАН-ПРОЛЕТ
router.post('/get_plan_plan_d_sd_params', function(req, res, next) {
    var plan_name = req.body.plan_name;
    var sd_name = req.body.sd_name;
    db.one(
        "SELECT m.plan_rf, plan.item_name AS plan_name, m.sd_rf, sd.item_name AS sd_name, m.days_num, m.workers_num, " +
        "  CAST(m.date_begin AS VARCHAR) AS dtb, CAST(m.date_end AS VARCHAR) AS dte, " +
        "  m.rem_day_rf, wd.item_name AS rem_day_name, rem_time_proc" +
        " FROM (((plan_sd m " +
        "   LEFT JOIN item_list plan ON m.plan_rf = plan.item_id) " +
        "   LEFT JOIN item_list sd ON m.sd_rf = sd.item_id) " +
        "   LEFT JOIN item_list wd ON m.rem_day_rf = wd.item_id) " +
        " WHERE plan.item_name = $1 AND sd.item_name = $2", [plan_name, sd_name])
        .then(function (data) {

            data.days_num = Math.round(data.days_num * 1000) / 1000;
            data.workers_num = Math.round(data.workers_num * 1000) / 1000;
            data.rem_time_proc = Math.round(data.rem_time_proc * 1000) / 1000;
            data.days_num = Math.round(data.days_num * 1000) / 1000;

            res.send(data.plan_name+'|'+data.sd_name+'|'+data.days_num+'|'+data.workers_num+'|'+data.rem_day_name+'|'+data.rem_time_proc+'|'+data.plan_rf+'|'+data.sd_rf );
        })
        .catch(function (error) {
            res.send('ОШИБКА (get_plan_plan_d_params): '+error);
        });
});

// Получение параметров ФОРМА-ЖБИ
router.post('/get_plan_plan_d_form_fc_params', function(req, res, next) {
    var fc_rf = req.body.fc_rf;
    db.one(
        "SELECT ff.form_rf, frm.item_name AS form_name, ff.fc_num AS form_fc_num, ff.forming_time " +
        " FROM (form_fc ff " +
        "   LEFT JOIN item_list frm ON ff.form_rf = frm.item_id) " +
        " WHERE ff.fc_rf = $1", [fc_rf])
        .then(function (data) {

            data.form_fc_num = Math.round(data.form_fc_num * 1000) / 1000;
            data.forming_time = Math.round(data.forming_time * 1000) / 1000;

            res.send(data.form_rf+'|'+data.form_name+'|'+data.form_fc_num+'|'+data.forming_time);
        })
        .catch(function (error) {
            res.send('ОШИБКА (get_plan_plan_d_form_fc_params): '+error);
        });
});

// Получение параметров ПРОЛЕТ-ФОРМА
router.post('/get_plan_plan_d_sd_form_params', function(req, res, next) {
    var form_name = req.body.form_name;
    var sd_rf = req.body.sd_rf;
    db.one(
        "SELECT form_num AS sd_form_num, form_num_max AS sd_form_num_max " +
        " FROM sd_form  " +
        " WHERE sd_rf = $2" +
        "   AND form_rf = (SELECT item_id FROM item_list WHERE spr_rf = 464 AND item_name=$1)",
        [form_name, sd_rf])
        .then(function (data) {

//            data.sd_form_num = Math.round(data.sd_form_num * 1000) / 1000;
//            data.sd_form_num_max = Math.round(data.sd_form_num_max * 1000) / 1000;

            res.send(data.sd_form_num+'|'+data.sd_form_num_max);
        })
        .catch(function (error) {
            res.send('ОШИБКА (get_plan_plan_d_sd_form_params): '+error);
        });
});


// Сохранение параметров пролёта
router.post('/save_sd_params', function(req, res, next) {
    var sd_params_exists = req.body.sd_params_exists;

    var plan_name = req.body.plan_name;
    var sd_name = req.body.sd_name;
    var days_num = req.body.days_num;
    var workers_num = req.body.workers_num;
    var dtb = req.body.dtb;
    var dte = req.body.dte;
    var rem_day_name = req.body.rem_day_name;
    var rem_time_proc = req.body.rem_time_proc;

    if (sd_params_exists == 'true') {
//  Обновление
        db.none(
            "UPDATE plan_sd " +
            "SET days_num=$3, " +
            "  workers_num=$4, " +
            "  rem_day_rf=(SELECT item_id FROM item_list WHERE spr_rf = 561 AND item_name=$5), " +
            "  rem_time_proc=$6 " +
            " WHERE plan_rf=(SELECT item_id FROM item_list WHERE spr_rf = 6 AND item_name=$1)  " +
            "   AND sd_rf=(SELECT item_id FROM item_list WHERE spr_rf = 8 AND item_name=$2) ",
            [plan_name, sd_name, days_num, workers_num, rem_day_name, rem_time_proc])
            .then (function () {
                res.send('OK');
            })
            .catch(function (error) {
                res.send('ОШИБКА UPDATE (save_sd_params): '+error);
            });
    }
    else {
//  Добавление
        db.none(
            "INSERT INTO  plan_sd (plan_rf, sd_rf, days_num, workers_num, date_begin, date_end, rem_day_rf, rem_time_proc ) " +
            "VALUES (" +
            "  (SELECT item_id FROM item_list WHERE spr_rf = 6 AND item_name=$1), " +
            "  (SELECT item_id FROM item_list WHERE spr_rf = 8 AND item_name=$2), " +
            "  $3, $4, $5, $6, " +
            "  (SELECT item_id FROM item_list WHERE spr_rf = 561 AND item_name=$7)," +
            "  $8 " +
            ")",
            [plan_name, sd_name, days_num, workers_num, dtb, dte, rem_day_name, rem_time_proc])
            .then (function (data) {
                res.send('OK');
            })
            .catch(function (error) {
                res.send('ОШИБКА INSERT (save_sd_params): '+error);
            });
    }
});


// Сохранение параметров ФОРМА-ЖБИ
router.post('/save_form_fc_params', function(req, res, next) {
    var form_fc_params_exists = req.body.form_fc_params_exists;

    var form_name = req.body.form_name;
    var fc_name = req.body.fc_name;
    var fc_num = req.body.fc_num;
    var forming_time = req.body.forming_time;

    if (form_fc_params_exists == 'true') {
//  Обновление
        db.none(
            "UPDATE form_fc " +
            "SET form_rf=(SELECT item_id FROM item_list WHERE spr_rf = 561 AND item_name=$1), " +
            "  fc_num=$2, " +
            "  forming_time=$3 " +
            " WHERE fc_rf=(SELECT item_id FROM item_list WHERE spr_rf = 9 AND item_name=$4)  ",
            [form_name, fc_num, forming_time, fc_name])
            .then (function () {
                res.send('OK');
            })
            .catch(function (error) {
                res.send('ОШИБКА UPDATE (save_form_fc_params): '+error);
            });
    }
    else {
//  Добавление
        db.none(
            "INSERT INTO  form_fc (plan_rf, sd_rf, days_num, workers_num, date_begin, date_end, rem_day_rf, rem_time_proc ) " +
            "VALUES (" +
            "  (SELECT item_id FROM item_list WHERE spr_rf = 6 AND item_name=$1), " +
            "  (SELECT item_id FROM item_list WHERE spr_rf = 8 AND item_name=$2), " +
            "  $3, $4, $5, $6, " +
            "  (SELECT item_id FROM item_list WHERE spr_rf = 561 AND item_name=$7)," +
            "  $8 " +
            ")",
            [plan_name, sd_name, days_num, workers_num, dtb, dte, rem_day_name, rem_time_proc])
            .then (function (data) {
                res.send('OK');
            })
            .catch(function (error) {
                res.send('ОШИБКА INSERT (save_sd_params): '+error);
            });
    }
});

module.exports = router;