var express = require('express');
var router = express.Router();

var db = require("../db");


//=================== ПЛАН ПРОИЗВОДСТВА ЖБИ =====================

//
// Показать список ПЛАН ПРОИЗВОДСТВА ЖБИ
//
router.get('/plan_sd_fc_s', function(req, res, next) {
  db.any(
    "SELECT pp.plan_rf, p.item_name AS plan_name, " +
    "       pp.sd_rf,  sd.item_name AS sd_name, " +
    "       pp.fc_rf,  fc.item_name AS fc_name, pp.fc_num, pp.fc_v " +
    " FROM (((plan_fc_pro pp " +
    "   LEFT JOIN item_list p ON pp.plan_rf = p.item_id) " +
    "   LEFT JOIN item_list sd ON pp.sd_rf = sd.item_id) " +
    "   LEFT JOIN item_list fc ON pp.fc_rf = fc.item_id) " +
    " ORDER BY 2, 4, 6 ")
    .then(function (data) {
      res.render('plan/plan_sd_fc_s', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавить новый ПЛАН ПРОИЗВОДСТВА ЖБИ
//
router.get('/plan_sd_fc_addnew', function(req, res, next) {
  db.one("SELECT 0 AS plan_rf, '' AS plan_name, 0 AS sd_rf, '' AS sd_name, 0 AS fc_rf, '' AS fc_name, 0 AS fc_num, 0 AS fc_v ")
    .then(function (data) {
      res.render('plan/plan_sd_fc', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить ПЛАН ПРОИЗВОДСТВА ЖБИ
//
router.get('/plan_sd_fc/:plan_rf/:sd_rf/:fc_rf', function(req, res, next) {
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  var fc_rf = req.params.fc_rf;
  db.one(
    "SELECT pp.plan_rf, p.item_name AS plan_name, " +
    "       pp.sd_rf,  sd.item_name AS sd_name, " +
    "       pp.fc_rf,  fc.item_name AS fc_name, pp.fc_num, pp.fc_v " +
    " FROM (((plan_fc_pro pp " +
    "   LEFT JOIN item_list p ON pp.plan_rf = p.item_id) " +
    "   LEFT JOIN item_list sd ON pp.sd_rf = sd.item_id) " +
    "   LEFT JOIN item_list fc ON pp.fc_rf = fc.item_id) " +
    " WHERE plan_rf=$1 AND sd_rf = $2 AND fc_rf = $3", [plan_rf, sd_rf, fc_rf])
    .then(function (data) {
      res.render('plan/plan_sd_fc', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавление и корректировка ПЛАН ПРОИЗВОДСТВА ЖБИ
//
router.post('/plan_sd_fc/update', function(req, res, next) {
  var plan_rf = req.body.plan_rf;
  var sd_rf = req.body.sd_rf;
  var fc_rf = req.body.fc_rf;
  var plan_name = req.body.plan_name;
  var sd_name = req.body.sd_name;
  var fc_name = req.body.fc_name;
  var fc_num = req.body.fc_num;
  var fc_v = req.body.fc_v;
  var old_plan_rf = req.body.old_plan_rf;
  var old_sd_rf = req.body.old_sd_rf;
  var old_fc_rf = req.body.old_fc_rf;
  if (sd_rf > 0 ) {
//  Обновление
    db.none(
      "UPDATE plan_fc_pro " +
      "SET plan_rf=(SELECT item_id FROM item_list WHERE spr_rf =  6 AND item_name=$1), " +
      "    sd_rf=(SELECT item_id FROM item_list WHERE spr_rf =  8 AND item_name=$2), " +
      "    fc_rf=(SELECT item_id FROM item_list WHERE spr_rf =  9 AND item_name=$3), " +
      "    fc_num=$4, fc_v=$5 " +
      "WHERE plan_rf=$6 AND sd_rf=$7 AND fc_rf=$8",
      [plan_name, sd_name, fc_name, fc_num, fc_v, old_plan_rf, old_sd_rf, old_fc_rf])
      .then (function () {
        res.redirect('/plan/plan_sd_fc_s');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
  else {
//  Добавление
    db.none(
      "INSERT INTO  plan_fc_pro (plan_rf, sd_rf, fc_rf, fc_num, fc_v) " +
      "VALUES (" +
      " (SELECT item_id FROM item_list WHERE spr_rf =  6 AND item_name=$1), " +
      " (SELECT item_id FROM item_list WHERE spr_rf =  8 AND item_name=$2), " +
      " (SELECT item_id FROM item_list WHERE spr_rf =  9 AND item_name=$3), " +
      " $4, $5)",
      [plan_name, sd_name, fc_name, fc_num, fc_v])
      .then (function (data) {
        res.redirect('/plan/plan_sd_fc_s');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить  ПЛАН ПРОИЗВОДСТВА ЖБИ
router.get('/plan_sd_fc_delete/:plan_rf/:sd_rf/:fc_rf', function(req, res, next) {
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  var fc_rf = req.params.fc_rf;
  db.none("DELETE FROM plan_fc_pro WHERE plan_rf=$1 AND sd_rf=$2 AND fc_rf=$3", [plan_rf, sd_rf, fc_rf])
    .then(function () {
      res.redirect('/plan/plan_sd_fc_s'); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});

//=====================================================================
// РАСЧЁТ ПЛАНА ПРОИЗВОДСТВА В ЗАВИСИМОСТИ ОТ МОЩНОСТЕЙ ПОДРАЗДЕЛЕНИЙ
//=====================================================================
router.get('/plan_pro_calc/:plan_rf/:sd_rf', function(req, res, next) {
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  var ret = '<br>';
  var ret1 = '';
  var ret2 = '<br>';
  var ret3 = '<br>';
  var ret_trk = '<br>';
  var time_all = 0;
  var trk_all = 0;
  var gdata;

  // !!! Формы берутся и из других пролётов, что дублирует строки, ИСПРАВИТЬ !!!

  db.any(
    "SELECT pp.plan_rf, p.plan_name, pp.sd_rf, sd.sd_name, pp.fc_rf, fc.fc_name, pp.fc_num, fc.fc_v, " +
    " ff.fc_num AS ffc_num, ff.forming_time,  ps.days_num, ps.workers_num, sf.form_num, sdf.trk, sdf.trk*pp.fc_num AS sum_trk, " +
    " (ceil(ceil(pp.fc_num / ff.fc_num) / sf.form_num) * ff.forming_time) AS sum_forming_time" +
    " FROM (((((((plan_fc_pro pp " +
    "   LEFT JOIN plan_list p ON pp.plan_rf = p.plan_id) " +
    "   LEFT JOIN form_fc ff ON pp.fc_rf = ff.fc_rf) " +
    "   LEFT JOIN sd_form sf ON ff.form_rf = sf.form_rf AND pp.sd_rf = sf.sd_rf) " +
    "   LEFT JOIN plan_sd ps ON pp.plan_rf = ps.plan_rf AND pp.sd_rf = ps.sd_rf) " +
    "   LEFT JOIN sd_list sd ON pp.sd_rf = sd.sd_id) " +
    "   LEFT JOIN fc_list fc ON pp.fc_rf = fc.fc_id) " +
    "   LEFT JOIN sd_fc sdf ON pp.fc_rf = sdf.fc_rf) " +
    " WHERE pp.plan_rf = $1 AND pp.sd_rf = $2 " +
    " ORDER BY fc.fc_name ",
    [plan_rf, sd_rf])
    .then(function (data) {

      for (var i = 0; i < data.length; i++) {
        ret = ret + data[i].fc_name+' ---  '+data[i].fc_num+
          '--жб/форму='+data[i].ffc_num+
          '-- время формовки одного изделия='+data[i].forming_time+
          '--дней/часов='+data[i].days_num+'/'+data[i].days_num*24+
          '--рабочих в смене='+data[i].workers_num+'|||||'+
          '-- итого время формовки на ПЛАН=кол-воЖБИ*Кол-воФорм*ВремяПропарки/Кол-воЖБИв1форме=='+
                data[i].fc_num+'*'+data[i].ffc_num+'*'+data[i].forming_time+'/'+data[i].form_num+'='+
                data[i].forming_time * data[i].fc_num * data[i].ffc_num / data[i].form_num +
          '<br>';

        data.plan_name = data[i].plan_name;
        data.sd_name = data[i].sd_name;
        data.days_num = data[i].days_num;
        data.workers_num = data[i].workers_num;
        data.time_all = data[i].days_num*24;
        data.trk_all = data[i].days_num*24*data[i].workers_num;

        gdata = data;

      }
    })
    .then(function () {
      db.one(
        "SELECT SUM(pp.fc_num * sf.trk) AS trk_sum " +
        " FROM (plan_fc_pro pp " +
        "   LEFT JOIN sd_fc sf ON pp.fc_rf = sf.fc_rf) " )
        .then(function (data) {
          gdata.trk_sum = data.trk_sum;

          ret_trk = '<br><br>Итого трудоёмкость производства ЖБИ на план = '+data.trk_sum + ' человеко-часов <br>'+
                    'Общее кол-во человеко-часов за месяц = '+trk_all + ' человеко-часов <br>';
        })
    })
     .then(function (r1) {

      return(
        db.any(
          "SELECT plan_rf, plan_name, sd_rf, sd_name, fc_rf, fc_name, fc_num, pp.fc_v " +
          " FROM (((plan_fc_pro pp " +
          "   LEFT JOIN plan_list p ON plan_rf = plan_id) " +
          "   LEFT JOIN sd_list sd ON sd_rf = sd_id) " +
          "   LEFT JOIN fc_list fc ON fc_rf = fc_id) " +
          " ORDER BY plan_name, sd_name, fc_name ")
        .then(function (data) {
            for (var i = 0; i < data.length; i++) {
              ret2 = ret2 + data[i].fc_name+' *2*  '+data[i].fc_num+'<br>';


              db.one("SELECT fullname FROM users WHERE login = 'bororo'")
                .then(function (data) {
                   ret3 = ret3 + data.fullname+ '<br>';
//                  console.log(ret3);
                })
                .then(ret3 = ret3 + 'zxcv-')
                .then(ret3 = ret3 + 'asdf-')
                .then(console.log(ret3))
                .catch(function (error) {
                  console.log(":"+error);
                });

//                .catch(console.log('Ошибочка вышла!'));

            }
        })
      )

    })
    .then(function () {

      // Обработка всех полученных последовательно результатов
//      res.send(ret+'<<<<br>ret1='+ret1+'<br>ret2='+ret2+'<br>'+ret_trk);
//      res.send(ret+ret1+ret_trk);

      res.render('plan/plan_fc_pro_report', {data: gdata});

    })
    .catch(function (error) {
//      res.send(error);
      res.send(":"+error);
    });
});




//=================== ПЛАН-ПРОЛЁТ =====================

//
// Показать список ПЛАН-ПРОЛЁТ
//
router.get('/plan_sd_s', function(req, res, next) {
  db.any(
    "SELECT m.plan_rf, plan.item_name AS plan_name, m.sd_rf, sd.item_name AS sd_name, m.days_num, m.workers_num, " +
    "  CAST(m.date_begin AS VARCHAR) AS dtb, CAST(m.date_end AS VARCHAR) AS dte," +
    "  m.rem_day_rf, wd.item_name AS rem_day_name, rem_time_proc" +
    " FROM (((plan_sd m " +
    "   LEFT JOIN item_list plan ON m.plan_rf = plan.item_id) " +
    "   LEFT JOIN item_list sd ON m.sd_rf = sd.item_id) " +
    "   LEFT JOIN item_list wd ON m.rem_day_rf = wd.item_id) " +
    " ORDER BY 2, 4 ")
    .then(function (data) {
      res.render('plan/plan_sd_s', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Добавить новый ПЛАН-ПРОЛЁТ
//
router.get('/plan_sd_addnew', function(req, res, next) {
  db.one("SELECT 0 AS plan_rf, '' AS plan_name, 0 AS sd_rf, '' AS sd_name, " +
         "CAST(CURRENT_DATE AS varchar) AS dtb, CAST(CURRENT_DATE+30 AS varchar) AS dte, " +
         "565 AS rem_day_rf, 25 S rem_time_proc ")
    .then(function (data) {
      res.render('plan/plan_sd', data);
    })
    .catch(function (error) {
      res.send(error);
    });
});

//
// Показать/обновить ПЛАН-ПРОЛЁТ
//
router.get('/plan_sd/:plan_rf/:sd_rf', function(req, res, next) {
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  db.one(
    "SELECT m.plan_rf, plan.item_name AS plan_name, m.sd_rf, sd.item_name AS sd_name, m.days_num, m.workers_num, " +
    "  CAST(m.date_begin AS VARCHAR) AS dtb, CAST(m.date_end AS VARCHAR) AS dte, " +
      "  m.rem_day_rf, wd.item_name AS rem_day_name, rem_time_proc" +
    " FROM (((plan_sd m " +
    "   LEFT JOIN item_list plan ON m.plan_rf = plan.item_id) " +
    "   LEFT JOIN item_list sd ON m.sd_rf = sd.item_id) " +
    "   LEFT JOIN item_list wd ON m.rem_day_rf = wd.item_id) " +
    " WHERE plan_rf = $1 AND sd_rf = $2", [plan_rf, sd_rf])
    .then(function (data) {
      res.render('plan/plan_sd', data);
    })
    .catch(function (error) {
      res.send('ОШИБКА (/plan_sd/:plan_rf/:sd_rf): '+error);
    });
});

//
// Добавление и корректировка ПЛАН-ПРОЛЁТ
//
router.post('/plan_sd/update', function(req, res, next) {
  var plan_rf = req.body.plan_rf;
  var sd_rf = req.body.sd_rf;
  var plan_name = req.body.plan_name;
  var sd_name = req.body.sd_name;
  var days_num = req.body.days_num;
  var workers_num = req.body.workers_num;
  var dtb = req.body.dtb;
  var dte = req.body.dte;
  var old_plan_rf = req.body.old_plan_rf;
  var old_sd_rf = req.body.old_sd_rf;
  var rem_day_name = req.body.rem_day_name;
  var rem_time_proc = req.body.rem_time_proc;
  if (plan_rf > 0 ) {
//  Обновление
    db.none(
      "UPDATE plan_sd " +
      "SET plan_rf=(SELECT item_id FROM item_list WHERE spr_rf = 6 AND item_name=$1), " +
      "  sd_rf=(SELECT item_id FROM item_list WHERE spr_rf = 8 AND item_name=$2), " +
      "  days_num=$3, " +
      "  workers_num=$4, " +
      "  date_begin=$5, " +
      "  date_end=$6, " +
      "  rem_day_rf=(SELECT item_id FROM item_list WHERE spr_rf = 561 AND item_name=$9), " +
      "  rem_time_proc=$10 " +
      "WHERE plan_rf=$7 AND sd_rf=$8",
      [plan_name, sd_name, days_num, workers_num, dtb, dte, old_plan_rf, old_sd_rf, rem_day_name, rem_time_proc])
      .then (function () {
        res.redirect('/plan/plan_sd_s');
      })
      .catch(function (error) {
        res.send(error);
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
      "  (SELECT item_id FROM item_list WHERE spr_rf = 561 AND item_name=$7)" +
      "  $8 " +
      ")",
      [plan_name, sd_name, days_num, workers_num, dtb, dte, rem_day_name, rem_time_proc])
      .then (function (data) {
        res.redirect('/plan/plan_sd_s');
      })
      .catch(function (error) {
        res.send(error);
      });
  }
});

// Удалить  ПЛАН-ПРОЛЁТ
router.get('/plan_sd_delete/:plan_rf/:sd_rf', function(req, res, next) {
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  db.none("DELETE FROM plan_sd WHERE plan_rf=$1 AND sd_rf=$2", [plan_rf, sd_rf])
    .then(function () {
      res.redirect('/plan/plan_sd_s'); // Обновление списка
    })
    .catch(function (error) {
      res.send(error);
    });
});


//=====================================================================
//     РАСЧЁТ ПЛАНА ПРОИЗВОДСТВА В ЗАВИСИМОСТИ ОТ ПОДРАЗДЕЛЕНИЙ
// для каждого пролёта свой отчёт
//=====================================================================
router.get('/plan_pro_calc2/:plan_rf/:sd_rf', function(req, res, next) {
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  db.one(
    "SELECT item_name AS sd_name FROM item_list WHERE spr_rf = 8 AND item_id = $1 ",
    [sd_rf])
    .then(function (data) {
      var report_url = '/plan/plan_pro_calc33/'+ plan_rf + '/' + sd_rf;
      if (data.sd_name == 'Пролет 33')  res.redirect('/plan/plan_pro_calc33/'+ plan_rf + '/' + sd_rf);
      if (data.sd_name == 'Пролет 34')  res.redirect('/plan/plan_pro_calc33/'+ plan_rf + '/' + sd_rf);

      res.send("Нет отчёта для пролёта <b>" + data.sd_name + "</b>");
    })
    .catch(function (error) {
      res.send(error);
    });
});

//=====================================================================
// РАСЧЁТ ПЛАНА ПРОИЗВОДСТВА В ЗАВИСИМОСТИ ОТ МОЩНОСТЕЙ ПОДРАЗДЕЛЕНИЙ
// Вариант 2 демо
// Вариант когда в одном пролёте формуется ОДИН вид изделий
// Работа в 2 смены по 11 часов
//
//                       Пролёт 33
//=====================================================================
router.get('/plan_pro_calc33/:plan_rf/:sd_rf', function(req, res, next) {
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  var ret = '<br>';
  var ret1 = '';
  var ret2 = '<br>';
  var ret3 = '<br>';
  var ret_trk = '<br>';
  var time_all = 0;
  var trk_all = 0;
  var gdata;

  db.one(
    "SELECT pp.plan_rf, p.item_name AS plan_name, pp.sd_rf, sd.item_name AS sd_name, pp.item_rf AS fc_rf, fc.item_name AS fc_name, " +
    " pp.num_plan AS fc_num, 0 AS fc_v, " +
    " ff.fc_num AS ffc_num, sdf.forming_time,  ps.days_num, ps.workers_num, ps.date_begin, ps.date_end, " +
    " sf.form_num, sf.form_num_max, sdf.trk, sdf.trkk, sdf.kob " +
    " FROM (((((((plan_plan pp " +
    "   LEFT JOIN item_list p ON p.spr_rf = 6 AND pp.plan_rf = p.item_id) " +
    "   LEFT JOIN form_fc ff ON pp.item_rf = ff.fc_rf) " +
    "   LEFT JOIN sd_form sf ON ff.form_rf = sf.form_rf AND pp.sd_rf = sf.sd_rf) " +
    "   LEFT JOIN plan_sd ps ON pp.plan_rf = ps.plan_rf AND pp.sd_rf = ps.sd_rf) " +
    "   LEFT JOIN item_list sd ON sd.spr_rf = 8 AND pp.sd_rf = sd.item_id) " +
    "   LEFT JOIN item_list fc ON fc.spr_rf = 9 AND pp.item_rf = fc.item_id) " +
    "   LEFT JOIN sd_fc sdf ON pp.item_rf = sdf.fc_rf) " +
    " WHERE pp.plan_rf = $1 AND pp.sd_rf = $2 " +
    " ORDER BY fc.item_name " +
    " LIMIT 1 ",
    [plan_rf, sd_rf])
    .then(function (data) {
      ret = '';

      // Считаю кол-во четвергов (рем. дней) за период

      var day_length = 1000*60*60*24; // Миллисекунд в сутках
      var db = data.date_begin;
      var de = data.date_end;
      var rem_days_num = 0;

      // Цикл по дням
      var dw = ': '; // Даты рем. дней (числа месяца)
      while(db.getTime() <= de.getTime()){

        if(db.getDay() == 4) {// если четверг, то рем.день
          rem_days_num++;
          dw = dw + db.getDate() + ' ';
        }

        db.setTime(db.getTime() + day_length); // Следующий день
      }
      data.days_rem = rem_days_num;
      data.dw = dw; // Даты рем. дней (числа месяца)


      data.days_num = Math.round(data.days_num) ;
      data.days_num_cal = 31;

      data.workers_num = Math.round(data.workers_num*10)/10 ;0

      data.trk0 = data.trk;
      data.trk = data.trk * data.trkk;
      data.trk = Math.round(data.trk * 100) / 100 ;

//      data.sum_forming_time = data.forming_time * data.fc_num; //
      // Итого трудоёмкость на план
      data.sum_trk0 = data.trk0 * data.fc_num; //
      data.sum_trk = data.trk * data.fc_num; //

      // Нужно рабочих в смене = Итого трудоёмкость / (11 * 2 * Кол-во рабочих дней)
      data.need_workers_num = Math.round(data.sum_trk / (22 * data.days_num)*10) / 10;

      // Округляю до двух цифр после запятой для вывода на экран
      data.sum_trk0 = Math.round(data.sum_trk0 * 100) / 100 ;
      data.sum_trk = Math.round(data.sum_trk * 100) / 100 ;

      data.max_workers_num = 17;
      // Округляю и проверяю на минимальное и максимальное кол-во рабочих
      data.fact_workers_num  = Math.round(data.need_workers_num);
      if (data.need_workers_num < 3)  data.fact_workers_num = 3;
      if (data.need_workers_num > data.max_workers_num) data.fact_workers_num = data.max_workers_num;


      // мощность за сутки = кол-во форм * кол-во ЖБИ в одной форме * Коэф-т оборачиваемости
      data.day_power = data.form_num * data.ffc_num * data.kob;
      data.day_power_max = data.form_num_max * data.ffc_num * data.kob;

      // мощность за месяц с учётом рем.дней,
      // рем.день - один раз в неделю, в дальнейшем надо будет поставить конкретно ЧЕТВЕРГ и считать кол-во четвергов
//      data.days_rem = Math.floor(data.days_num/7); // Посчитали выше кол-во четвергов
      data.month_power =  data.day_power * (data.days_num - data.days_rem) +  (data.days_rem * data.day_power*0.25);
      // Максимальная мощность, берём КАЛЕНДАРНЫЕ ДНИ
      data.days_rem_cal = data.days_rem; // Неважно, берём рабочие дни или календарные, кол-во четвергов от этого не меняется
//      data.days_rem_cal = Math.floor(data.days_num_cal/7);
      data.month_power_max =  data.day_power_max * (data.days_num_cal - data.days_rem_cal) +  (data.days_rem_cal * data.day_power_max*0.25);

      // Расчётное кол-во дней без учёта рем дней
      data.days_num_clc = data.fc_num / (data.form_num * data.ffc_num * data.kob);
      data.days_num_clc = Math.round(data.days_num_clc*10)/10 ;


      // Эффективность работы пролёта
      data.efficiency =  Math.round((data.fc_num /  data.month_power_max) * 10000) / 100;

      // Округляю до двух цифр после запятой для вывода на экран
      data.day_power = Math.round(data.day_power * 100) / 100 ;
      data.day_power_max = Math.round(data.day_power_max * 100) / 100 ;
      data.month_power = Math.round(data.month_power * 100) / 100 ;
      data.month_power_max = Math.round(data.month_power_max * 100) / 100 ;

      // Требуется форм на план с учётом рем.дней
      data.need_form_num_clc = data.fc_num / (data.kob * ((data.days_num - 0.75*data.days_rem))) ;
      // Округляю в верхнюю сторону
      data.need_form_num = Math.ceil(data.need_form_num_clc) ;

      // Форматирую для вывода, оставляю две цифры после запятой
      data.need_form_num_clc = Math.round(data.need_form_num_clc*10) /10 ;

      // Если не можем сделать нужное по плану кол-во ЖБИ, то выводим красным цветом (пока ставлю !!!)
      if (data.fc_num > data.month_power) data.fc_num = '(!!!)' + data.fc_num;

      data.fc_num = Math.round(data.fc_num * 1000) / 1000 ;

      gdata = data;

    })
    .then(function () {
//      res.send(plan_rf+":"+sd_rf);
       res.render('plan/plan_fc_pro_report33', {data: gdata});
    })
    .catch(function (error) {
//      res.send(error);
      res.send(":"+error);
    });
});


//=====================================================================
// РАСЧЁТ ПЛАНА ПРОИЗВОДСТВА В ЗАВИСИМОСТИ ОТ МОЩНОСТЕЙ ПОДРАЗДЕЛЕНИЙ
// Вариант 2 демо
// Вариант когда в одном пролёте формуется ОДИН вид изделий
// Работа в 2 смены по 11 часов
//
//                       Пролёт 34
//=====================================================================
router.get('/plan_pro_calc34/:plan_rf/:sd_rf', function(req, res, next) {
  var plan_rf = req.params.plan_rf;
  var sd_rf = req.params.sd_rf;
  var ret = '<br>';
  var ret1 = '';
  var ret2 = '<br>';
  var ret3 = '<br>';
  var ret_trk = '<br>';
  var time_all = 0;
  var trk_all = 0;
  var gdata;

  db.one(
    "SELECT pp.plan_rf, p.plan_name, pp.sd_rf, sd.sd_name, pp.fc_rf, fc.fc_name, pp.fc_num, fc.fc_v, " +
    " ff.fc_num AS ffc_num, sdf.forming_time,  ps.days_num, ps.workers_num, sf.form_num, sf.form_num_max, sdf.trk, sdf.kob " +
    " FROM (((((((plan_fc_pro pp " +
    "   LEFT JOIN plan_list p ON pp.plan_rf = p.plan_id) " +
    "   LEFT JOIN form_fc ff ON pp.fc_rf = ff.fc_rf) " +
    "   LEFT JOIN sd_form sf ON ff.form_rf = sf.form_rf AND pp.sd_rf = sf.sd_rf) " +
    "   LEFT JOIN plan_sd ps ON pp.plan_rf = ps.plan_rf AND pp.sd_rf = ps.sd_rf) " +
    "   LEFT JOIN sd_list sd ON pp.sd_rf = sd.sd_id) " +
    "   LEFT JOIN fc_list fc ON pp.fc_rf = fc.fc_id) " +
    "   LEFT JOIN sd_fc sdf ON pp.fc_rf = sdf.fc_rf) " +
    " WHERE pp.plan_rf = $1 AND pp.sd_rf = $2 " +
    " ORDER BY fc.fc_name " +
    " LIMIT 1 ",
    [plan_rf, sd_rf])
    .then(function (data) {
      ret = '';

      data.days_num = Math.round(data.days_num) ;

      data.workers_num = Math.round(data.workers_num*100)/100 ;

//      data.sum_forming_time = data.forming_time * data.fc_num; //
      // Итого трудоёмкость на план
      data.sum_trk = data.trk * data.fc_num; //

      // Нужно рабочих в смене = Итого трудоёмкость / (11 * 2 * Кол-во рабочих дней)
      data.need_workers_num = Math.round(data.sum_trk / (22 * data.days_num)*10) / 10;
//      data.need_workers_num = data.sum_trk / (22 * data.days_num);
      // Округляю и проверяю на минимальное и максимальное кол-во рабочих
      data.fact_workers_num  = Math.round(data.need_workers_num);
      if (data.need_workers_num < 10)  data.fact_workers_num = 10;
      if (data.need_workers_num > 19) data.fact_workers_num = 19;


      // мощность за сутки = кол-во форм * кол-во ЖБИ в одной форме * Коэф-т оборачиваемости
      data.day_power = data.form_num * data.ffc_num * data.kob;
      data.day_power_max = 66; // Ограничение пропарочной камеры, 1 изделие за 20 минут
      if (data.day_power > 66) data.day_power = 66;

//      data.day_power_max_form = data.form_num_max * data.ffc_num * data.kob;
//      data.day_power_max = data.day_power_max_form;
//      if (data.day_power_max > 66) data.day_power_max = 66;

      // мощность за месяц с учётом рем.дней,
      // рем.день - один раз в неделю, в дальнейшем надо будет поставить конкретно ЧЕТВЕРГ и считать кол-во четвергов
      data.days_rem = Math.floor(data.days_num/7);
      data.month_power =  data.day_power * (data.days_num - data.days_rem) +  (data.days_rem * data.day_power*0.25);
      data.month_power_max =  data.day_power_max * (data.days_num - data.days_rem) +  (data.days_rem * data.day_power_max*0.25);

      // Эффективность работы пролёта
      data.efficiency =  Math.round((data.fc_num /  data.month_power_max) * 10000) / 100;

      // Округляю до двух цифр после запятой для вывода на экран
      data.month_power = Math.round(data.month_power * 100) / 100 ;
      data.month_power_max = Math.round(data.month_power_max * 100) / 100 ;

      // Требуется форм на план с учётом рем.дней
      data.need_form_num_clc = data.fc_num / (data.kob * ((data.days_num - 0.75*data.days_rem))) ;
      // Округляю в верхнюю сторону
      data.need_form_num = Math.ceil(data.need_form_num_clc) ;

      // Форматирую для вывода, оставляю две цифры после запятой
      data.need_form_num_clc = Math.round(data.need_form_num_clc*100) /100 ;

      // Если не можем сделать нужное по плану кол-во ЖБИ, то выводим красным цветом (пока ставлю !!!)
      if (data.fc_num > data.month_power) data.fc_num = '(!!!)' + data.fc_num;


      gdata = data;
    })
    .then(function () {
      db.one(
        "SELECT SUM(pp.fc_num * sf.trk) AS trk_sum " +
        " FROM (plan_fc_pro pp " +
        "   LEFT JOIN sd_fc sf ON pp.fc_rf = sf.fc_rf) " )
        .then(function (data) {
          gdata.trk_sum = data.trk_sum;

          ret_trk = '<br><br>Итого трудоёмкость производства ЖБИ на план = '+data.trk_sum + ' человеко-часов <br>'+
            'Общее кол-во человеко-часов за месяц = '+trk_all + ' человеко-часов <br>';
        })
    })
    .then(function () {
      res.render('plan/plan_fc_pro_report34', {data: gdata});
    })
    .catch(function (error) {
//      res.send(error);
      res.send(":"+error);
    });
});



//=================== ПРОЛЁТ 34 - ЧАСТИ ФОРМЫ 17-ПТ-32.61 =====================

//
// Показать список ПРОЛЁТ-ЧАСТЬ
//
router.get('/sd34_form_part', function(req, res, next) {
  db.any(
    " SELECT row_number() OVER (), " +
    " sp.sd_rf, sd.item_name AS sd_name, " +
    " fp.product_rf, sp.part_rf, pt.item_name AS part_name, " +
    " sp.part_num AS part_num_all, fp.amount,  (sp.part_num / fp.amount) AS form_num " +
    " FROM ((((sd_part sp " +
    "  LEFT JOIN item_list sd ON sp.sd_rf = sd.item_id) " +
    "  LEFT JOIN item_list pt ON sp.part_rf = pt.item_id) " +
    "  LEFT JOIN compositions fp ON sp.part_rf = fp.component_rf) " +
    "  LEFT JOIN item_list frm ON fp.product_rf = frm.item_id) " +
    "  WHERE sd.item_name = 'Пролет 34' " +
    "  AND frm.item_name = '17ПТ-32.61' " +
    "  ORDER BY pt.item_name  ")
    .then(function (data) {

      // Убираю конечные нули в дробной части и ищу наименьшее
      data.form_num_min = 100000;
      for (var i = 0; i < data.length; i++) {
        data[i].form_num = Math.round(data[i].form_num * 1000) / 1000

        if (data.form_num_min > data[i].form_num) data.form_num_min = data[i].form_num;

      }
      data.form_num_min = Math.floor(data.form_num_min);

      // Для обращения к данным вне таблицы
      data.form_id = data[0].product_rf;
      data.sd_id = data[0].sd_rf;

      res.render('plan/sd34_form_part', {data: data}); // Показ формы
    })
    .catch(function (error) {
      res.send(error);
    });
});
//
// Запись в sd_part
//
router.post('/save_sd34_form_part', function(req, res, next) {
  var part_rf = req.body.part_rf;
  var sd_rf = req.body.sd_rf;
  var part_num = req.body.part_num;

  db.none(
    "UPDATE sd_part " +
    "SET part_num = $1 " +
    "WHERE sd_rf=$2 AND part_rf=$3",
    [part_num, sd_rf, part_rf])
    .then (function () {
//      res.send('xx'+part_num +','+sd_rf+','+part_rf);
//      res.redirect('/');
      res.redirect(200, '/plan/sd34_form_part');
    })
    .catch(function (error) {
      res.send(error);
    });

});
//
// Обновление записи в таблице sd_form
//
router.post('/save_sd34_form_num', function(req, res, next) {
  var form_rf = req.body.form_rf;
  var sd_rf = req.body.sd_rf;
  var form_num = req.body.form_num;

  db.none(
    "UPDATE sd_form " +
    "SET form_num = $1 " +
    "WHERE sd_rf=$2 AND form_rf=$3",
    [form_num, sd_rf, form_rf])
    .then (function () {
      res.send('Записано!');
//      res.redirect(200, '/plan/sd34_form_part');
    })
    .catch(function (error) {
      res.send(error);
    });

});




module.exports = router;