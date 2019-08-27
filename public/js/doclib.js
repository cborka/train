var tbl = [];
var pk_length = [""];
var r_length = [0];
var a_names = [[]];
var a_types = [[]];
var a_sprs = [[]];
var a_inp_types = [[]];
var a_prec = [[]];


// Инициализация документа
var set_init_doc = function (reply)
{
    document.getElementById("doc").innerHTML = reply;

//    get_table(1, t_rf, t_name, t_label);
    get_table(1, 1148, 'table_s', 'Таблицы БД');
    get_table(2, 1150, 'table_f', 'Поля таблиц БД');


};
function init_doc(doc_name)
{
    doQuery ("/docs/init_doc", set_init_doc,
        "&doc_name=" + encodeURIComponent(document.getElementById("doc_name").innerHTML)
    );
}


// Инициализация таблицы (нет такой процедуры)
var set_init_table = function (reply)
{
    document.getElementById("doc").innerHTML = reply;
};
function init_table(table_id, table_name)
{
    doQuery ("/docs/init_table", set_init_table,
        "&table_id=" + encodeURIComponent(table_id) +
        "&table_name=" + encodeURIComponent(table_name)
    );
}


// Показать таблицу
var set_table = function (reply)
{
//    var t_no = '1'; // Здесь нужно получить реальный номер таблицы в документе
    var t_no = reply.slice(4, 8).trim();

//    alert('['+ss+']');


    document.getElementById("table"+t_no).innerHTML = reply;  // Сама таблица

//return;
    // Списки для выбора
    sprs = document.getElementById("f_spr_names"+t_no).innerHTML.split(',');

//    alert(sprs+sprs.length);

//    var dls = document.getElementById('dls'+t_no+'x'+ii);
//    dls.innerHTML = '';
    for (var ii = 0; ii < sprs.length; ii++){

        if (sprs[ii] != '') {
//            alert(sprs[ii]);
            get_datalist_n(t_no+'x'+ii, sprs[ii]);
            get_spr_n(t_no+'x'+ii, sprs[ii]);

        }
    }
//    alert('x');
//        var el = document.getElementById("tbl");

//        el.style.tableLayout = "fixed";
//        el.style.borderColor = red;
//        alert("sss");
//        var el = document.getElementById("tbl").style.tableLayout = fixed;

//        table-layout: auto | fixed table-layout: auto | fixed

    a_names[t_no] = document.getElementById("f_names"+t_no).innerHTML.split(',');
    a_types[t_no] = document.getElementById("f_types"+t_no).innerHTML.split(',');
    a_sprs[t_no] = document.getElementById("f_sprs"+t_no).innerHTML.split(',');
    a_prec[t_no] = document.getElementById("f_prec"+t_no).innerHTML.split(',');

    // Здесь просто заполняем массив чем-нибудь, чтобы не был пустым
    a_inp_types[t_no] = document.getElementById("f_types"+t_no).innerHTML.split(',');

//    alert('x');
//    alert(a_types[t_no]);

    // Определяют тип элемента для редактирования ячейки
//    <input type="button|checkbox|file|hidden|image|password|radio|reset|submit|text">
    //       alert(a_types.length);
    for (var i = 0; i < a_types[t_no].length; i++){
//            alert(a_types[i]+a_names[i]+i+a_names[i].slice(-5));
//        alert(a_types[t_no][i]+a_names[t_no][i]+i+a_names[t_no][i].slice(-5));
        if (a_types[t_no][i] == 'INTEGER')  a_inp_types[t_no][i] = ' type="number" ';
        else if (a_types[t_no][i] == 'NUMERIC')  a_inp_types[t_no][i] = ' type="number" step="0.001" ';
        else if (a_types[t_no][i] == 'VARCHAR')  {
            if (a_names[t_no][i].slice(-5) == '_name')
                a_inp_types[t_no][i] = ' list="lst'+t_no+'x'+i+'" ';
            else
                a_inp_types[t_no][i] = ' type="text" ';
        }
        else if (a_types[t_no][i] == 'TEXT')  a_inp_types[t_no][i] = ' type="text" ';
        else  a_inp_types[t_no][i] = ' ztype="text" ';
    }
//    alert('xxx');
    tbl =  document.getElementById("tbl"+t_no);

    //Для отладки
    var s = '';
    for (var i = 0; i < a_types[t_no].length; i++){
        s = s + a_inp_types[t_no][i] + '<br>';
    }
//    alert(s);


};
function get_table(t_no, t_rf, t_name, t_label)
{
//    document.getElementById("t_name"+t_no).innerHTML = t_name+'xxxxxxxxx';
//    return;
    doQuery ("/docs/get_table", set_table,
        "&t_no=" + encodeURIComponent(t_no) +
        "&t_rf=" + encodeURIComponent(t_rf) +
        "&t_name=" + encodeURIComponent(t_name) +
        "&t_label=" + encodeURIComponent(t_label)
    );
}


function get_datalist_n(n, spr_name) {
//        doQuery ("/common/get_spr_names/"+spr_name, set_spr);

    doQuery ("/docs/get_datalist_n", set_datalist_n,
        "&n=" + encodeURIComponent(n) +
        "&spr_name=" + encodeURIComponent(spr_name)
    );

//        document.getElementById("si"+n).innerHTML = ' <option value="'+n+'">'+spr_name+'</option>';
}

var set_datalist_n = function (reply)
{
    var n = reply.slice(4, 10).trim();
    var dls = document.getElementById('dls'+n);
    dls.innerHTML += reply;
    //       alert(dls.innerHTML);
};



function get_spr_n(n, spr_name) {
//        doQuery ("/common/get_spr_names/"+spr_name, set_spr);

    doQuery ("/docs/get_spr_n", set_spr_n,
        "&n=" + encodeURIComponent(n) +
        "&spr_name=" + encodeURIComponent(spr_name)
    );

//        document.getElementById("si"+n).innerHTML = ' <option value="'+n+'">'+spr_name+'</option>';
}

var set_spr_n = function (reply)
{
    var n = reply.slice(0,3).trim();
    var n = reply.slice(4, 10).trim();
//alert(n);
    sprs[n] = document.getElementById("si"+n);
    sprs[n].innerHTML = reply.slice(3);
//        sprs[n].style.visibility = 'hidden';
    // Скрыть список выбора при отмене и потере фокуса
    sprs[n].onabort = function () { this.style.visibility = 'hidden'; };
    sprs[n].onblur = function () { this.style.visibility = 'hidden'; };
    //       alert(sprs[n]);
//        document.getElementById("si"+n).value = 'x';
};