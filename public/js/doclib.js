
// Инициализация документа
var set_init_doc = function (reply)
{
    document.getElementById("doc").innerHTML = reply;

//    get_table(1, t_rf, t_name, t_label);
    get_table(1, 1148, 'table_s', 'Таблицы БД');




};
function init_doc(doc_name)
{
    doQuery ("/docs/init_doc", set_init_doc,
        "&doc_name=" + encodeURIComponent(document.getElementById("doc_name").innerHTML)
    );
}


// Инициализация таблицы
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
    var t_no = '1';
    document.getElementById("table"+t_no).innerHTML = reply;  // Сама таблица

return;
    // Списки для выбора
    sprs = document.getElementById("f_spr_names"+t_no).innerHTML.split(',');

    dls.innerHTML = '';
    for (var ii = 0; ii < sprs.length; ii++){

        if (sprs[ii] != '') {
            get_datalist_n(ii, sprs[ii]);
            get_spr_n(ii, sprs[ii]);

        }
    }

//        var el = document.getElementById("tbl");

//        el.style.tableLayout = "fixed";
//        el.style.borderColor = red;
//        alert("sss");
//        var el = document.getElementById("tbl").style.tableLayout = fixed;

//        table-layout: auto | fixed table-layout: auto | fixed

    a_names = document.getElementById("f_names"+t_no).innerHTML.split(',');
    a_types = document.getElementById("f_types"+t_no).innerHTML.split(',');
    a_sprs = document.getElementById("f_sprs"+t_no).innerHTML.split(',');
    a_prec = document.getElementById("f_prec"+t_no).innerHTML.split(',');


    // Определяют тип элемента для редактирования ячейки
//    <input type="button|checkbox|file|hidden|image|password|radio|reset|submit|text">
    //       alert(a_types.length);
    for (var i = 0; i < a_types.length; i++){
//            alert(a_types[i]+a_names[i]+i+a_names[i].slice(-5));
        if (a_types[i] == 'INTEGER')  a_inp_types[i] = ' type="number" ';
        else if (a_types[i] == 'NUMERIC')  a_inp_types[i] = ' type="number" step="0.001" ';
        else if (a_types[i] == 'VARCHAR')  {
            if (a_names[i].slice(-5) == '_name')
                a_inp_types[i] = ' list="lst'+i+'" ';
            else
                a_inp_types[i] = ' type="text" ';
        }
        else if (a_types[i] == 'TEXT')  a_inp_types[i] = ' type="text" ';
        else  a_inp_types[i] = ' ztype="text" ';
    }

    tbl =  document.getElementById("tbl"+t_no);

    //Для отладки
    var s = '';
    for (var i = 0; i < a_types.length; i++){
        s = s + a_inp_types[i] + '<br>';
    }
    //alert(s);


};
function get_table(t_no, t_rf, t_name, t_label)
{
//    document.getElementById("t_name"+t_no).innerHTML = t_name+'xxxxxxxxx';
//    return;
    doQuery ("/docs/get_table", set_table,
        "&t_rf=" + encodeURIComponent(t_rf) +
        "&t_name=" + encodeURIComponent(t_name) +
        "&t_label=" + encodeURIComponent(t_label)
    );
}
