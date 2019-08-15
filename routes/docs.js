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
                '</tr></thead>';

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

    var s_sprs = ''; //Справочники для выбора значения полей из списков

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

                    // Таблица
                    result = result + '<table class="grid w100" id="anytable">';

                    for (var j = 0; j < data.f_names.length; j++) {
                        var len = (data.f_length[j] / data.r_length) * 90;
                        len = (data.f_length[j]) * 5;

                        result = result + '<col width="'+len+'">';
//                        result = result + '<col width="'+data.f_length[j]+'%">';
/*
                        if (data.f_types[j] == 'INTEGER')  result = result + '<col width="'+len+'%">';
                        else if (data.f_types[j] == 'NUMERIC')  result = result + '<col width="70">';
                        else if (data.f_types[j] == 'VARCHAR')  result = result + '<col width="200">';
                        else if (data.f_types[j] == 'TEXT')  result = result + '<col width="300">';
                        else  result = result + '<col width="30">';
*/
                    }
                    result = result + '<col width="200">'; // Поле кнопок
                    result = result + '<col width="35">'; // Поля ключей
//                    result = result + '<col width="3%">'; //
//                    result = result + '<col width="2%">'; //
//
                    // Заголовок таблицы
                    result = result + '<caption><h3>'+t_label+'</h3></caption>';

                    // Шапка таблицы
                    result = result + '<thead>';
                    result = result + '<tr>';
                    for (var j = 0; j < data.f_names.length; j++) {
                            result = result + '<td class="report left">' + data.f_labels[j] + '</td>';
                    }
//                    result = result + '<td class="report left"><button type="button" onclick="insert_row(this)" >Вставить новую строку1</button></td>';
                    result = result + '</tr></thead>';

                    // Строки данных таблицы
                    for (var i = 0; i < data2.length; i++) {

                        result = result + '<tr>';

                        // Поля таблицы
                        for (var j = 0; j < data.f_names.length; j++) {

                            if (data.f_types[j] == 'INTEGER' || data.f_types[j] == 'NUMERIC') // Выравнивание, числа вправо
                                var fld_align = 'right';
                            else
                                fld_align = 'left';

                            // Обработчики событий
                            if (data.f_names[j].slice(-5) == '_namexxx') {
                                var onevent = ' onfocus="list_focus(this)" ondblclick="select_val(' + j + ', this)" ';
                            }
                            else {
                                onevent = 'onfocus="num_focus(this)" onclick="cell_edit(this)" ';
//                                onevent = ' ondblclick="cell_edit(this)" ';
                            }


                            // [data.f_names[j]] здесь имя поля data.f_names[j] взято как индекс массива, хотя в явном виде оно (имя поля) пишется через точку
                            result = result + '<td class="report '+ fld_align +'"  '+onevent+' contenteditable>' + data2[i][data.f_names[j]] + '</td>';

                        }

                        //Поле кнопок
                        result = result + '<td>';
                        result = result + '<button type="button" onclick="delete_row(this)" >Удалить строку</button>';
                        result = result + '<button type="button" onclick="save_row(this)" xdisabled >Сохранить строку</button>';
                        result = result + '<button type="button" onclick="insert_row(this)" xdisabled >Вставить строку</button></td>';
                        result = result + '</td>';

                        // Поля для сохранения старых значений ключевых полей
                        for (var ii = 0; ii < data.t_pk_f.length; ii++)
                        {
                            result = result + '<td class="report">' + data2[i][data.f_names[data.t_pk_fn[ii]]] + '</td>';
                        }

                        result = result + '</tr>';
                    }
                    result = result +'</table>';
                    result = result + '<br><button type="button green" onclick="insert_row(this)" >Вставить новую строку2</button><br>';

/*
                    // Справочники
                    for (var j = 0; j < data.f_names.length; j++) {
                        if (data.f_spr_names[j] != '') {
                            result = result + // 'si'+ j+ ' '+ data.f_spr_names[j] + '<br>';
                                   '<select class="xy td" size="1" name="si'+j+'" title="" id="si'+j+'" ondblclick="setval(this)" ><option value="x">xx</option></select><br>';
                        }
                    }
*/



                    result = result + '<div id="t_info" style="Xdisplay:none">';
                    result = result + '<br> Имена таблицы: <span id="t_name" class="darkcyan"> '+t_name+'</span>';
                    result = result + '<br> Имена полей: <span id="f_names" class="darkcyan"> '+data.f_names+'</span>';
                    result = result + '<br> Метки полей: <span id="f_labels" class="darkcyan">'+ data.f_labels+'</span>';
                    result = result + '<br> Типы полей: <span id="f_types" class="indigo">'+ data.f_types+'</span><br>';

                    result = result + '<br> Коды справочников: <span id="f_sprs" class="indigo">'+ data.f_sprs+'</span>';
                    result = result + '<br> Cправочники: <span id="f_spr_names" class="indigo">'+ data.f_spr_names+'</span>';
                    result = result + '<br> Группы: <span id="f_groups" class="indigo">'+ data.f_groups+'</span><br>';

                    result = result + '<br> Размер поля: <span id="f_length" class="indigo">'+ data.f_length+'</span>>';
                    result = result + '<br> Точность: <span id="f_prec" class="indigo">'+ data.f_prec+'</span><br>';


                    result = result + '<br> Поля первичного ключа: <span id="t_pk_f" class="darkcyan">'+ data.t_pk_f+'</span>';
                    result = result + '<br> Номера полей первичного ключа: <span id="t_pk_fn" class="darkcyan">'+ data.t_pk_fn+'</span>';
                    result = result + '<br> Номер поля кнопок: <span id="t_btn_fn" class="darkcyan">'+ data.f_names.length+'</span>, за ним идут поля старых значений ПК';
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
    var f_sprs = [];
    var f_spr_names = [];
    var f_groups = [];
    var f_length = [];
    var r_length = 0;
    var f_prec = [];

    var t_pk_f = [];    // Поля первичного ключа
    var t_pk_fn = [];   // Номера полей первичного ключа как они показаны в таблице на экране
    var t_u_f = [[]];   // Уникальные индексы
    var t_u_fn = [[]];  // Уникальные индексы
    var t_d_f = [[]];   // Индексы
    var t_d_fn = [[]];  // Индексы


    if (data[0].f_table_name == 'table_s') global_test = 'Присвоено значение!!! '+data[0].f_table_name;

    // Цикл по полям таблицы
    for (var i = 0; i < data.length; i++) {

        ret = ret + ' t.'+ data[i].f_name;

        data[i].f_length = (data[i].f_length == 0)?80:data[i].f_length;
        data[i].f_length = (data[i].f_length < 20)?20:data[i].f_length;

        // Формирование массивов свойств полей таблицы
        f_names.push(data[i].f_name);
        f_types.push(data[i].f_type_name);
        f_labels.push(data[i].f_label);
        f_sprs.push(data[i].f_spr_rf);
        f_spr_names.push('');
        f_groups.push(data[i].f_group_rf);
        f_length.push(data[i].f_length);
        f_prec.push(data[i].f_prec);

        r_length += data[i].f_length;


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

            f_sprs.push(data[i].f_spr_rf);
            f_spr_names.push(data[i].f_spr_name);
            f_groups.push(data[i].f_group_rf);

            f_length.push(data[i].f_length);
            f_prec.push(data[i].f_prec);

            // Ширина для кода из справочника, вообще-то код это предыдущее поле, но тут находим сумму и порядок суммирования может быть любым
            r_length += 20;

        }

        if (i != data.length-1)
          ret = ret + ',';

    }

    data.t_name = data[0].f_table_name;
    data.f_names = f_names;
    data.f_types = f_types;
    data.f_labels = f_labels;
    data.f_sprs = f_sprs;
    data.f_spr_names = f_spr_names;
    data.f_groups = f_groups;
    data.t_pk_f = t_pk_f;
    data.t_pk_fn = t_pk_fn;
    data.t_u_f = t_u_f;
    data.t_u_fn = t_u_fn;
    data.t_d_f = t_d_f;
    data.t_d_fn = t_d_fn;
    data.r_length = r_length;
    data.f_length = f_length;
    data.f_prec = f_prec;

    ret = ret + ' FROM '+ sk +  data[0].f_table_name + ' t ' + lj + ' ORDER BY 1, 2, 3';

//    return 'SELECT';
    return ret;

}



//
// Вставить строку в таблицу БД
//
router.post('/insert_row', function(req, res, next) {
    var t_name = req.body.t_name;
    var s_record = req.body.s_record;
    var f_names = req.body.f_names;
    var f_sprs = req.body.f_sprs;
    var f_groups = req.body.f_groups;
    var f_types = req.body.f_types;
    var f_pkey = req.body.f_pkey;

    var a_values = s_record.split('|');
    var a_sprs = f_sprs.split(',');
    var a_groups = f_groups.split(',');
    var a_names = f_names.split(',');
    var a_types = f_types.split(',');
    var a_pkey = f_pkey.split(',');

    var s_fields = '';
    var s_values = '';

    var comma = ', ';

    // Сформировать INSERT
    for (var i = 0; i < a_names.length; i++) {

        if (i == a_names.length-1) comma = '';

        s_fields = s_fields + a_names[i] + comma;

        // Поля-ссылки
        rf = a_names[i].slice(-3);
        // Если поле-ссылка, то следующее - поле-название по которому нужно найти значение текущего поля
        if (rf == '_rf') {

            if (a_values[i+1].trim() == '') {
                s_values = s_values + '1' + comma;
            }
            else {
                s_values =
                    s_values +
                    '(SELECT item_id FROM item_list WHERE spr_rf = ' + a_sprs[i] + " AND item_name = '" + a_values[i+1].replace(/'/g, "''") +"')"
                    + comma;
            }

            i = i + 1; // Пропускаю поле-название, т.к. уже использовал
        }
        else {
            var kav =  (a_types[i] == 'VARCHAR' || a_types[i] == 'TEXT')?"'":"";

            s_values = s_values + kav+ a_values[i].replace(/'/g, "''") + kav + comma;
        }
    }
    var sql = 'INSERT INTO ' + t_name + '( '+  s_fields + ') VALUES ( ' + s_values + ')';

    res.send('INSERT='+sql);


//    res.send("Запись: "+s_record+ '<br> Имена полей: ' + f_names+ '<br> Типы полей: ' + f_types+ '<br> Ключевых полей: ' + s_pkey_num);
});



//
// Сохранить строку таблицы БД
//
router.post('/update_row', function(req, res, next) {
    var t_name = req.body.t_name;
    var s_record = req.body.s_record;
    var f_names = req.body.f_names;
    var f_sprs = req.body.f_sprs;
    var f_groups = req.body.f_groups;
    var f_types = req.body.f_types;
    var f_pkey = req.body.f_pkey;         // Номера полей первичного ключа

    var a_values = s_record.split('|');
    var a_sprs = f_sprs.split(',');
    var a_groups = f_groups.split(',');
    var a_names = f_names.split(',');
    var a_types = f_types.split(',');
    var a_pkey = f_pkey.split(',');

    var s_set = '';
    var s_where = '';

    var comma = ', ';


    // Сформировать UPDATE

    // Сформировать SET
    for (var i = 0; i < a_names.length; i++) {

        if (i == a_names.length-1) comma = '';

        // Поля-ссылки
        rf = a_names[i].slice(-3);
        // Если поле-ссылка, то следующее - поле-название по которому нужно найти значение текущего поля
        if (rf == '_rf') {

            if (a_values[i+1].trim() == '') {
                s_set = s_set + a_names[i] + ' = 1' + comma;
            }
            else {
                s_set = s_set + a_names[i] + ' = ' +
                    '(SELECT item_id FROM item_list WHERE spr_rf = ' + a_sprs[i] + " AND item_name = '" + a_values[i+1] +"')"
                    + comma;
            }

            i = i + 1; // Пропускаю поле-название, т.к. уже использовал
        }
        else {
            var kav =  (a_types[i] == 'VARCHAR' || a_types[i] == 'TEXT')?"'":"";

            s_set = s_set + a_names[i] + ' = ' + kav + a_values[i].replace(/'/g, "''") +kav + comma;
        }
    }

    // Сформировать WHERE
    comma = ' AND ';
    var fn = a_names.length; // Кол-во полей таблицы, дальше начинаются старые ключевые поля
    for (var i = 0; i < a_pkey.length; i++) {

        var ii = a_pkey[i]; // Номер поля

        if (i == a_pkey.length-1) comma = '';

            var kav =  (a_types[i] == 'VARCHAR' || a_types[i] == 'TEXT')?"'":"";

        s_where = s_where + a_names[ii] + ' = ' + kav + a_values[i+fn].replace(/'/g, "''") + kav + comma;
    }

    var sql = 'UPDATE ' + t_name + ' SET ' + s_set + ' WHERE ' + s_where;


    res.send('UPDATE='+sql);


//    res.send("Запись: "+s_record+ '<br> Имена полей: ' + f_names+ '<br> Типы полей: ' + f_types+ '<br> Ключевых полей: ' + s_pkey_num);
});

//
// Удалить строку из таблицы БД
//
router.post('/delete_row', function(req, res, next) {
    var t_name = req.body.t_name;
    var s_record = req.body.s_record;
    var f_names = req.body.f_names;
    var f_sprs = req.body.f_sprs;
    var f_groups = req.body.f_groups;
    var f_types = req.body.f_types;
    var f_pkey = req.body.f_pkey;         // Номера полей первичного ключа

    var a_values = s_record.split('|');
    var a_names = f_names.split(',');
    var a_types = f_types.split(',');
    var a_pkey = f_pkey.split(',');

    var s_where = '';

    var comma = ' AND ';

    // Сформировать DELETE

    // Сформировать WHERE
    var fn = a_names.length; // Кол-во полей таблицы, дальше начинаются старые ключевые поля
    for (var i = 0; i < a_pkey.length; i++) {

        var ii = a_pkey[i]; // Номер поля

        if (i == a_pkey.length-1) comma = '';

        var kav =  (a_types[i] == 'VARCHAR' || a_types[i] == 'TEXT')?"'":"";

        s_where = s_where + a_names[ii] + ' = ' + kav + a_values[i+fn].replace(/'/g, "''") + kav + comma;
    }

    var sql = 'DELETE FROM ' + t_name + ' WHERE ' + s_where;

    res.send('DELETE='+sql);


//    res.send("Запись: "+s_record+ '<br> Имена полей: ' + f_names+ '<br> Типы полей: ' + f_types+ '<br> Ключевых полей: ' + s_pkey_num);
});



// Сформировать и возвратить список для выбора из справочника :spr
//
router.post('/get_spr_n', function(req, res, next) {
    var n = req.body.n;
    var spr = req.body.spr_name;

    db.any(
        "SELECT item_name " +
        "  FROM item_list " +
        "  WHERE spr_rf = " +
        "    (SELECT item_id FROM item_list WHERE spr_rf = 3 AND item_name = $1)" +
        "    AND item_flag = 1 " +
        "  ORDER BY 1 ", [spr])
        .then (function (data) {
            var result = n + '    <option value=""></option>';
            for (var i = 0; i < data.length; i++) {
                result = result + ' <option value="'+data[i].item_name+'">'+data[i].item_name+'</option>';
            }
            res.send(result);
        })
        .catch(function (error) {
            res.send('get_spr_names: ОШИБКА: ' +error);
        });
});

router.post('/get_datalist_n', function(req, res, next) {
    var n = req.body.n;
    var spr = req.body.spr_name;

    db.any(
        "SELECT item_name " +
        "  FROM item_list " +
        "  WHERE spr_rf = " +
        "    (SELECT item_id FROM item_list WHERE spr_rf = 3 AND item_name = $1)" +
        "    AND item_flag = 1 " +
        "  ORDER BY 1 ", [spr])
        .then (function (data) {
            var result = '<datalist id="lst'+n+'"> <option value=" ">';
            for (var i = 0; i < data.length; i++) {
                result = result + ' <option value="'+data[i].item_name+'">';
            }
            result = result +'</datalist>';
            res.send(result);
        })
        .catch(function (error) {
            res.send('get_datalist_n: ОШИБКА: ' +error);
        });
});
/*
<datalist id="<идентификатор>">
    <option value="Текст1">
    <option value="Текст2">
</datalist>
*/

module.exports = router;