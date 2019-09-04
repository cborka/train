var tbls = [];
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

/*
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
*/

// Показать таблицу
var set_table = function (reply)
{
    var t_no = reply.slice(4, 8).trim(); // Номер таблицы в документе

    // Здесь сама таблица и параметры в невидимых тэгах f_spr_names, f_names и т.д.
    document.getElementById("table"+t_no).innerHTML = reply;

    // Списки для выбора значения поля
    sprs = document.getElementById("f_spr_names"+t_no).innerHTML.split(',');

    for (var ii = 0; ii < sprs.length; ii++){

        if (sprs[ii] != '') {
//            Здесь пока не решил что использовать из этих двух
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

    // Здесь просто заполняем массив чем-нибудь, чтобы не был пустым, иначе значение не присваивается в нужное место массива
    a_inp_types[t_no] = document.getElementById("f_types"+t_no).innerHTML.split(',');

    // Определяют тип элемента для редактирования ячейки в зависимости от типа данный поля
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


    tbl =  document.getElementById("tbl"+t_no); // а это зачем?

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

// Получение списка datalist
function get_datalist_n(n, spr_name) {

    doQuery ("/docs/get_datalist_n", set_datalist_n,
        "&n=" + encodeURIComponent(n) +   // В n уже есть номер таблицы и номер поля в таблице n = t_no+'x'+i
        "&spr_name=" + encodeURIComponent(spr_name)
    );

//        document.getElementById("si"+n).innerHTML = ' <option value="'+n+'">'+spr_name+'</option>';
}
var set_datalist_n = function (reply)
{
    var n = reply.slice(4, 10).trim(); // '<!-- '+n+'      -->'
    var dls = document.getElementById('dls'+n);
    dls.innerHTML += reply;
//           alert('dls'+n+'='+dls.innerHTML);
};


// Получение списка <option value=""></option>
function get_spr_n(n, spr_name) {

    doQuery ("/docs/get_spr_n", set_spr_n,
        "&n=" + encodeURIComponent(n) +
        "&spr_name=" + encodeURIComponent(spr_name)
    );
//        document.getElementById("si"+n).innerHTML = ' <option value="'+n+'">'+spr_name+'</option>';
}
var set_spr_n = function (reply)
{
//    var n = reply.slice(0,3).trim();
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




// ========================================================================
function row_focus(t) {
    //       erro(t.rowIndex+' row_focus');
    alert('asdf222');
}
function xcell_edit(f)
{
    alert('asdf111');
    var gcell = f;                          // Запоминаем изменяемую текущую ячейку
}



// При получении фокуса на ячейку которую редактируем вручную
function xnum_focus(t)
{
//    alert('asdf');
    var col_no = t.cellIndex;
    var v = t.innerHTML;
    var t_no = t.parentNode.parentNode.parentElement.id.slice(3); // Номер таблицы в документе, tbl1.slice(3) = 1

    var tbl =  document.getElementById("tbl"+t_no);  // Редактируемая таблица

    // Координаты ячейки в таблице
    var y = +t.parentNode.rowIndex;
    var x = +t.cellIndex;

    var rows = tbl.rows.length;    // Кол-во строк
    var row = tbl.rows[y];         // Текущая строка
    var cells = row.cells.length;  // Кол-во колонок

//    hint(t_no+','+v);

//    return;


//    tbl.rows[y].onfocus = function() { erro('ffffffffffffffffffff'); };
//    tbl.rows[y].focus();
//    tbl.rows[y].on = function() { erro('xxxxxxxxxxxxxxxxxxxxxxx'); };
//        alert( gcell.cellIndex + ' : ' + gcell.parentNode.rowIndex );
//    alert('cells='+cells);

    erro('x-');
        erro('x-'+tbl.rows[y].cells[cells-1].innerHTML);

 //        tbl.rows[0].cells.length;
 //        erro(math.min(3,cells.length-1));
 //        t.contentEditable = true;
//    alert('3');

     gcell = t;
//    alert('4');

 //        select_tc_text(t);             // Выделяем текст в ячейке
 //        save_row_btn.disabled = false; // Активируем кнопку сохранения строки
//    alert('5');
     // При потере фокуса снимаем выделение
     t.onblur = function () { window.getSelection().removeAllRanges(); };
//    erro('onblur-');
//    alert(a_types[t_no][col_no]);
     if (a_types[t_no][col_no] == 'TEXT') {
         //t.style.position = "relative";
         t.innerHTML = '<textarea wrap="soft" class="grid" id="edit2">'+v+'</textarea>';
//         t.innerHTML = 'textarea';
     }
     else if (a_names[t_no][col_no].slice(-5) == '_name') {
         // показать список для выбора
         t.innerHTML = '<input '+a_inp_types[t_no][col_no]+' class="cell2" id="edit2"  value="'+v+'" />';
     }
     else {
         t.innerHTML = '<input '+a_inp_types[t_no][col_no]+' class="cell2" id="edit2"  value="'+v+'" />';
     }
//return;
     var ed = document.getElementById("edit2");
     ed.focus();
     ed.select();
     ed.onblur = function() {
          t.innerHTML = ed.value.trim();

         if (a_names[t_no][col_no].slice(-5) == '_name') {

//            alert("lst"+t_no+'x'+x);

             var dl = document.getElementById("lst"+t_no+'x'+x);
//             alert(dl);

             function dlmap(dl) {
                 var res = [];

                 for (var i=0; i<dl.options.length; i++){
                     res[i] =  dl.options[i].value;
                 }

                 return res;
             }
             var idx = dlmap(dl).indexOf(ed.value);

             if (+idx == -1)
             {
                 hint('Названия "'+ed.value+'" нет в списке. Попробуйте ещё раз.');
                 t.focus();
         //        return false;
             }
             else hint('');
//             else  hint('Это справочник ' +a_sprs[t_no][x] +' значение '+ ed.value+' dlen='+dl.options[1].value+';;'+idx);
         }



     };
//  return;

     ed.onkeyup = onk;
     function onk(f) {
         switch(f.keyCode) {
             case 13:
                 erro('Enter');
                 break;
             case 16:
                 erro('Shift');
                 break;
             case 38:  // Стрелка вверх
                 if (y > 1)  tbl.rows[y-1].cells[x].focus();
                 else        erro('Это первая строка');
                 break;
             case 40:  // Стрелка вниз
                 if (y < rows-1)  tbl.rows[y+1].cells[x].focus();
                 else           erro(y + '- это последняя строка');
                 break;
             case 39:  // Стрелка вправо не обрабатывается и правильно
                 if (x < cells-1)  tbl.rows[y-1].cells[x].focus();
                 else        erro(x + '- это последняя ячейка в строке');
                 break;
/*
             case 45:  // Insert
                 erro('Ins');
                 // Создаем строку таблицы и вставляем ее перед текущей
                 ed.blur();
                 var row = tbl.insertRow(y);
                 erro('Inse');
                 row.innerHTML = tbl.rows[y+1].innerHTML;
                 erro('Inser');
                 row.cells[1].innerHTML = y;

                 tbl.rows[y].cells[x].focus();
 //                    var row = document.createElement("TR");
 //                    tbl.appendChild(row);
 //                    row.innerHTML = tbl.rows[rows-1].innerHTML;
 //                    alert(tbl.rows[rows-1].innerHTML);

 //                    row = tbl.rows[rows].cloneNode('yes');

 //                    var tr = document.createElement("TR");
 //                    row.appendChild(tr);
 //                    tr.innerHTML = 'новая строка';

                 //         tbl.rows.push(tbl.rows[rows].cloneNode('yes'));
                 erro('Insert');
                 break;
*/
             case 27: // Escape
                 ed.value = v;
                 erro('Escape');
                 break;

             default:
                 erro('Кнопка '+f.keyCode);
         }
     }

}
