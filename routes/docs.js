var express = require('express');
var router = express.Router();

var fs = require('fs');
var db = require("../db");

var global_test = 'xxx';


//
// Common
//
router.get('/common', function(req, res, next) {

    res.send('/docs/common <br>');

});

//
// Список таблиц БД
//
router.get('/tables', function(req, res, next) {

    res.render('docs/table'); // Показ формы
//    res.render('/reports/inform_any', {data: data}); // Показ формы
});

router.get('/get_tables', function(req, res, next) {
    db.any(
        "SELECT table_rf, item_name AS table_name, t_label, t_info" +
        " FROM table_s t LEFT JOIN item_list i ON t.table_rf = i.item_id" +
        " ORDER BY 2")
        .then (function (data) {
            var mindays = 100;

            var result = '<table class="svod w100">';

            result = result +
                '<thead><tr>' +
                '<td class="report right">ID</td>' +
                '<td class="report left">Название</td>' +
                '<td class="report left">Метка</td>' +
                '<td class="report left">Описание</td>' +
                '<td class="report left">Действия</td>' +
                '</tr></thead>>';

            // Строки данных
            for (var i = 0; i < data.length; i++) {

                result = result +
                    '<tr>' +
                    '<td class="report right">' + data[i].table_rf + '</td>' +
                    '<td class="report left">' + data[i].table_name + '</td>' +
                    '<td class="report left">' + data[i].t_label + '</td>' +
                    '<td class="report left">' + data[i].t_info + '</td>' +
                    '<td class="report left">' +
                        '<button type="button" onclick="get_table_fields('+ data[i].table_rf +')"> Поля таблицы </button>' +
                        '<button type="button" onclick="get_table('+ data[i].table_rf +')"> Таблица </button>' +
                    '</td>' +
                    '</tr>';
            }

            result = result +'</table>';

            res.send(result);
        })
        .catch(function (error) {
            res.send("ОШИБКА: "+error);
        });
});

//
// Список полей таблицы БД
//
router.post('/get_table_fields', function(req, res, next) {
    var t_rf = req.body.t_rf;

    db.any(
        "SELECT table_rf, f_no, f_name, f_label, f_type_rf, t.item_name AS f_type_name, f_length, f_prec, " +
        "       f_null, f_indexes, f_spr_rf, s.item_name AS f_spr_name, f_group_rf, g.item_name AS f_group_name, f_params, f_default, f_info " +
        "  FROM (((table_f f " +
        "    LEFT JOIN item_list t ON f.f_type_rf = t.item_id)" +
        "    LEFT JOIN item_list s ON f.f_spr_rf = s.item_id)" +
        "    LEFT JOIN item_list g ON f.f_group_rf = g.item_id)" +
        "  WHERE table_rf = " + t_rf +
        "  ORDER BY f_no"
        )
        .then (function (data) {

            var result = '<table class="svod w100">';

            result = result +
                '<thead><tr>' +
                '<td class="report right">№</td>' +
                '<td class="report left">Название</td>' +
                '<td class="report left">Метка</td>' +
                '<td class="report left">Тип</td>' +
                '<td class="report left">Длина</td>' +
                '<td class="report left">Точность</td>' +
                '<td class="report left">Null</td>' +
                '<td class="report left">Индексы</td>' +
                '<td class="report left">Справочник</td>' +
                '<td class="report left">Группа</td>' +
                '<td class="report left">Параметры</td>' +
                '<td class="report left">Значение</td>' +
                '<td class="report left">Описание</td>' +
                '</tr></thead>';

            // Строки данных
            for (var i = 0; i < data.length; i++) {

                result = result +
                    '<tr>' +
                    '<td class="report right">' + data[i].f_no + '</td>' +
                    '<td class="report left">' + data[i].f_name + '</td>' +
                    '<td class="report left">' + data[i].f_label + '</td>' +
                    '<td class="report left">' + data[i].f_type_name + '</td>' +
                    '<td class="report left">' + data[i].f_length + '</td>' +
                    '<td class="report left">' + data[i].f_prec + '</td>' +
                    '<td class="report left">' + data[i].f_null + '</td>' +
                    '<td class="report left">' + data[i].f_indexes + '</td>' +
                    '<td class="report left">' + data[i].f_spr_name + '</td>' +
                    '<td class="report left">' + data[i].f_group_name + '</td>' +
                    '<td class="report left">' + data[i].f_params + '</td>' +
                    '<td class="report left">' + data[i].f_default + '</td>' +
                    '<td class="report left">' + data[i].f_info + '</td>' +
                    '</tr>';
            }

            result = result +'</table>';

            res.send(result);
        })
        .catch(function (error) {
            res.send("ОШИБКА: "+error);
        });
});



//
// Любая таблица БД, показать
//
router.post('/get_table', function(req, res, next) {
    var t_rf = req.body.t_rf;

    var f_no = [];
    var f_name = [];
    var f_label = [];
    var f_type_rf = [];
    var type_name = [];
    var f_length = [];
    var f_prec = [];
    var f_null = [];
    var f_indexes = [];
    var f_spr_rf = [];
    var f_spr_name = [];
    var f_group_rf = [];
    var f_group_name = [];
    var f_params = [];
    var f_default = [];
    var f_info = [];

    var t_name = 'table_name';

//    f_no.length=0; // Очистка массива

    db.any(
        "SELECT table_rf, tb.item_name AS f_table_name, f_no, f_name, f_label, f_type_rf, t.item_name AS f_type_name, f_length, f_prec, " +
        "       f_null, f_indexes, f_spr_rf, s.item_name AS f_spr_name, f_group_rf, g.item_name AS f_group_name, f_params, f_default, f_info " +
        "  FROM ((((table_f f " +
        "    LEFT JOIN item_list tb ON f.table_rf = tb.item_id)" +
        "    LEFT JOIN item_list t ON f.f_type_rf = t.item_id)" +
        "    LEFT JOIN item_list s ON f.f_spr_rf = s.item_id)" +
        "    LEFT JOIN item_list g ON f.f_group_rf = g.item_id)" +
        "  WHERE table_rf = " + t_rf +
        "  ORDER BY f_no"
    )
        .then (function (data) {

            var sel = get_sel(data);
//            res.send(sel);
//            return;

            db.any(sel)
                .then (function (data2) {

                    var result = '<table class="svod w100">';

                    // Шапка таблицы
                    result = result + '<thead><tr>';
                    for (var j = 0; j < data.f_names.length; j++) {
                            result = result + '<td class="report left">' + data.f_labels[j] + '</td>';
                    }
                    result = result + '</tr></thead>';

                    // Строки данных
                    for (var i = 0; i < data2.length; i++) {

                        result = result + '<tr>';

                        for (var j = 0; j < data.f_names.length; j++) {

                            if (data.f_types[j] == 'INTEGER' || data.f_types[j] == 'NUMERIC') // Выравнивание, числа вправо
                                result = result + '<td class="report right">' + data2[i][data.f_names[j]] + '</td>';
                            else
                                result = result + '<td class="report left">' + data2[i][data.f_names[j]] + '</td>';
                        }

                        result = result + '</tr>';
                    }

                    result = result +'</table>';
                    result = result + '<br>'+ data.f_names;
                    result = result + '<br>'+ data.f_labels;
                    result = result + '<br>'+ global_test;

                    res.send(result);
                })
                .catch(function (error) {
                    res.send("ОШИБКА: "+error);
                });

        })
        .catch(function (error) {
            res.send("ОШИБКА: "+error);
        });
});

//
// Формирование SELECT
// получение параметров полей таблицы
//
function get_sel(data) {

    var ret = 'SELECT ';
    var rf = '';
    var sk = '';
    var lj = '';
    var f_names = [];
    var f_types = [];
    var f_labels = [];

    if (data[0].f_table_name == 'table_s') global_test = 'Присвоено значение!!! '+data[0].f_table_name;

    for (var i = 0; i < data.length; i++) {

        ret = ret + ' t.'+ data[i].f_name;

        f_names.push(data[i].f_name);
        f_types.push(data[i].f_type_name);
        f_labels.push(data[i].f_label);

        rf = data[i].f_name.slice(-3);

        if (rf == '_rf') {
            ret = ret + ', s' + i+ '.item_name AS ' + data[i].f_name.slice(0, -2) + 'name';
            sk = sk + '(';
            lj = lj + ' LEFT JOIN item_list s'+i+' ON t.'+data[i].f_name + ' = s'+i+'.item_id) ';

            f_names.push(data[i].f_name.slice(0, -2) + 'name');
            f_types.push('VARCHAR');
            f_labels.push(data[i].f_label);

        }

        if (i != data.length-1)
          ret = ret + ',';

    }

    data.f_names = f_names;
    data.f_types = f_types;
    data.f_labels = f_labels;

    ret = ret + ' FROM '+ sk +  data[0].f_table_name + ' t ' + lj + ' ORDER BY 1, 2, 3';

//    return 'SELECT';
    return ret;

}














module.exports = router;