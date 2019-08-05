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
                        '<button type="button" onclick="get_table('+ data[i].table_rf +',\''+data[i].table_name+'\',\''+data[i].t_label+'\')"> Таблица </button>' +
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
    var t_name = req.body.t_name;
    var t_label = req.body.t_label;

    // Информация о полях таблицы
    var f_no = [];
    var f_name = [];
    var f_label = [];
    var f_type_rf = [];
    var f_type_name = [];
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

//    var t_name = 'table_name';

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

            // Получение дополнительных данных о таблице, формирование SQL-запросов
            var sel = get_sel(data);

            if(sel.substr(0, 6) == 'ОШИБКА') {
                res.send(sel);
                return;
            }

            db.any(sel)
                .then (function (data2) {
                    var result = '';

                    // Название таблицы
                    result = result + '<h2 id="table_label">'+t_label+'</h2>';
                    result = result + '<div id="table_name">'+t_name+'</div>';

                    // Таблица
                    result = result + '<table class="svod w100">';
                    result = result + '<caption><b>'+t_label+'</b><br><br></caption>';

                    // Шапка таблицы
                    result = result + '<thead><tr>';
                    for (var j = 0; j < data.f_names.length; j++) {
                            result = result + '<td class="report left">' + data.f_labels[j] + '</td>';
                    }
                    result = result + '</tr></thead>';

                    // Строки данных таблицы
                    for (var i = 0; i < data2.length; i++) {

                        result = result + '<tr>';

                        for (var j = 0; j < data.f_names.length; j++) {

                            if (data.f_types[j] == 'INTEGER' || data.f_types[j] == 'NUMERIC') // Выравнивание, числа вправо
                                var fld_align = 'right';
                            else
                                fld_align = 'left';

                            // [data.f_names[j]] здесь имя поля data.f_names[j] взято как индекс массива, хотя в явном виде оно (имя поля) пишется через точку
                            result = result + '<td class="report '+ fld_align +'" contenteditable >' + data2[i][data.f_names[j]] + '</td>';


 //                           if (data.f_types[j] == 'INTEGER' || data.f_types[j] == 'NUMERIC') // Выравнивание, числа вправо
  //                              result = result + '<td class="report right" contenteditable >' + data2[i][data.f_names[j]] + '</td>';
  //                          else
  //                              result = result + '<td class="report left">' + data2[i][data.f_names[j]] + '</td>';
                        }

                        result = result + '<td><button type="button" onclick="delete_row(this)" >Удалить строку</button>';
                        result = result + '<button type="button" onclick="save_row(this)" xdisabled >Сохранить строку</button></td>';

                        // Сохранение старых значений ключевых полей
                        for (var ii = 0; ii < data.t_pk_f.length; ii++)
                        {
                            result = result + '<td class="report">' + data2[i][data.f_names[data.t_pk_fn[ii]]] + '</td>';
                        }


                        // Информация для отладки

                        // Первичный ключ, названия полей, номера полей и значение ПК
                        result = result + '<td>';
                        for (var ii = 0; ii < data.t_pk_f.length; ii++)
                        {
//                            result = result + data.t_pk_f.length;
                            result = result  + 'ПК['+ data.t_pk_fn[ii]+ ']: ' + data.t_pk_f[ii] +' = ' + data2[i][data.f_names[data.t_pk_fn[ii]]] + ', ';

                        }
                        result = result + '</td>';

                        result = result + '</tr>';
                    }

                    result = result +'</table>';
                    result = result + '<div id="t_info" style="Xdisplay:none">';
                    result = result + '<br> Имена полей: <span id="f_labels">'+data.f_names+'</span>';
                    result = result + '<br> Метки полей: <span id="f_labels">'+ data.f_labels+'</span>';
                    result = result + '<br> Поля первичного ключа: <span id="t_pk_f">'+ data.t_pk_f+'</span>';
                    result = result + '<br> Номера полей первичного ключа: <span id="t_pk_fn">'+ data.t_pk_fn+'</span>';
                    result = result + '<br> Номер поля кнопок: <span id="t_btn_fn">'+ data.f_names.length+'</span>, за ним идут поля старых значений ПК';
                    result = result + '<br> тест на глобальность переменной: '+ global_test;

                    result = result + '</div>';

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
    var digits10 = ['1','2','3','4','5','6','7','8','9'];

    var t_pk_f = [];    // Поля первичного ключа
    var t_pk_fn = [];   // Номера полей первичного ключа как они показаны в таблице на экране
    var t_u_f = [[]];   // Уникальные индексы
    var t_u_fn = [[]];  // Уникальные индексы
    var t_d_f = [[]];   // Индексы
    var t_d_fn = [[]];  // Индексы


    if (data[0].f_table_name == 'table_s') global_test = 'Присвоено значение!!! '+data[0].f_table_name;

    for (var i = 0; i < data.length; i++) {

        ret = ret + ' t.'+ data[i].f_name;

        // Формирование массивов свойств полей таблицы
        f_names.push(data[i].f_name);
        f_types.push(data[i].f_type_name);
        f_labels.push(data[i].f_label);


        // ВАЖНО!!!
        // Количество полей таблицы на экране больше количества полей таблицы БД,
        // потому что к каждому полю-ссылке (.._rf) добавляется поле-название (.._name)
        // Например:
        // Таблица БД:        table_rf,                          t_label, t_info
        // Таблица на экране: table_rf, item_name AS table_name, t_label, t_info


        // Поле data[i].f_indexes описывает в какие индексы входит данное поле
        // Имеет вид p11,u21,d32
        // первая буква - p - primary key, u - unique, d - индекс с повторяющимися значаниями
        // первая цифра - номер индекса,
        // вторая цифра - номер поля в индексе
        if (data[i].f_indexes != '') {
//            var i_arr = [];
            var i_arr = data[i].f_indexes.split(',');  //  i_arr = ['p11','u21','d32']

            for (var k = 0; k < i_arr.length; k++) {
                var if_arr = i_arr[k].split('');   //  if_arr = ['p', '1', '1']

                if (i_arr[k].length != 3) {
                    ret = 'ОШИБКА: Неверное значение в поле Индексы, неверное описание: "' + data[i].f_indexes +'"';
                    return ret;
                }
                if (digits10.indexOf(if_arr[1]) == -1) {
                    ret = 'ОШИБКА: Неверное значение в поле Индексы, неверный номер индекса: "' + data[i].f_indexes +'"';
                    return ret;
                }
                if (digits10.indexOf(if_arr[2]) == -1) {
                    ret = 'ОШИБКА: Неверное значение в поле Индексы, неверный номер поля индекса: "' + data[i].f_indexes +'"';
                    return ret;
                }

                if (if_arr[0] == 'p') {  // primary key
                    t_pk_f[+if_arr[2]-1] = data[i].f_name;
                    t_pk_fn[+if_arr[2]-1] = f_names.length - 1; // Номер поля первичного ключа. Это не i, потому что к полям .._rf добавляются поля .._name
                }
                else if (if_arr[0] == 'u') {  // unique
                    t_u_f[+if_arr[1]][+if_arr[2]] = data[i].f_name;
                    t_u_fn[+if_arr[1]][+if_arr[2]] = f_names.length - 1;
                }
                else if (if_arr[0] == 'd') {  // unique
                    t_d_f[+if_arr[1]][+if_arr[2]] = data[i].f_name;
                    t_d_fn[+if_arr[1]][+if_arr[2]] = f_names.length - 1;
                }
                else {
                    ret = 'ОШИБКА: Неверное значение в поле Индексы, неверный тип индекса: "' + data[i].f_indexes +'"';
                    return ret;
                }
            }
        } // Закончили формирование индексов

        // Поля-ссылки
        rf = data[i].f_name.slice(-3);
        // Если поле-ссылка, то добавляем поле-название (расшифровку ссылки)
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
    data.t_pk_f = t_pk_f;
    data.t_pk_fn = t_pk_fn;
    data.t_u_f = t_u_f;
    data.t_u_fn = t_u_fn;
    data.t_d_f = t_d_f;
    data.t_d_fn = t_d_fn;

    ret = ret + ' FROM '+ sk +  data[0].f_table_name + ' t ' + lj + ' ORDER BY 1, 2, 3';

//    return 'SELECT';
    return ret;

}














module.exports = router;