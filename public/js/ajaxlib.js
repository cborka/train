function show_msg(element_id, message)
{
  document.getElementById(element_id).innerHTML = message;
}

function erro(message)
{
  show_msg("erro", message);
}

function onERRdefault(msg)
{
  erro(msg);
}

//
// Запуск асинхронного запроса на выполнение
//
function doQuery (url, onOK, params, async = true)
{
  let xhr = new XMLHttpRequest();

  xhr.timeout = 30000; // 30 секунд (в миллисекундах)

  xhr.ontimeout = function() {
    alert( 'Извините, запрос превысил максимальное время '+xhr.timeout/1000+" секунд." );
  }

  xhr.onreadystatechange = function()
  {
    if (xhr.readyState != 4)
      return;

    if (xhr.status != 200)
    {
      onERRdefault('Ошибка:'+xhr.status + ': ' + xhr.statusText);  // обработать ошибку
    }
    else
    {
      onOK(xhr.responseText);   // вывести результат //(xhr.responseText);
    }
  }

  if (params == '' || params == undefined) {
    xhr.open("GET", url, async);
    xhr.send();
  }
  else {
    xhr.open("POST", url, async);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);
  }
}



// ================== Дальше просто библиотека, не аякс, чтобы не плодить файлы ===========================


// Получение координат элемента
function getCoords(elem) // кроме IE8-
{
  var box = elem.getBoundingClientRect();

  return {
    top: box.top + pageYOffset,
    left: box.left + pageXOffset
  };
}


// Перезагрузить страницу
function reload_page()
{
  location.reload(true);
}

// Выделяем текст в ячейке таблиццы
function select_tc_text(table_cell)
{
  var target = table_cell.firstChild;
  var rng, sel;
  if (document.createRange) {
    rng = document.createRange();
    rng.selectNode(target)
    sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(rng);
  } else {
    rng = document.body.createTextRange();
    rng.moveToElementText(target);
    rng.select();
  }
}

// Возвращает дату-время в виде ГГГГ-ММ-ДД ЧЧ:ММ:СС.МС
function toYYYYMMDDHHMMSS(s)
{
  return s.getFullYear() + '-'+ ("0"+(1+s.getMonth())).slice(-2) + '-' + ("0"+s.getDate()).slice(-2)+" "+
    ("0"+s.getHours()).slice(-2)+":"+("0"+s.getMinutes()).slice(-2)+":"+("0"+s.getSeconds()).slice(-2); //+"."+s.getMilliseconds();
}

// Возвращает дату в виде ГГГГ-ММ-ДД
function toYYYYMMDD(s)
{
  return s.getFullYear() + '-'+ ("0"+(1+s.getMonth())).slice(-2) + '-' + ("0"+s.getDate()).slice(-2);
}

// Возвращает год и месяц в виде ГГГГ-ММ
function toYYYYMM(s)
{
  return s.getFullYear() + '-'+ ("0"+(1+s.getMonth())).slice(-2);
}


//CurrentPlanName

// Возвращает ЧИСЛО последнего дня План-месяца, где План-месяц начинается с ГГГГ-ММ, например 2019-02
function PlanLastDay(plan_name)
{
  return 32 - new Date(plan_name.substr(0, 4),  plan_name.substr(5, 2)-1, 32).getDate();
}

// Возвращает ДАТУ ПЕРВОГО дня План-месяца, где План-месяц начинается с ГГГГ-ММ, например 2019-02
function PlanFirstDate(plan_name)
{
  return new Date(plan_name.substr(0, 4),  plan_name.substr(5, 2)-1, 1);
}
// Возвращает ДАТУ ПОСЛЕДНЕГО дня План-месяца, где План-месяц начинается с ГГГГ-ММ, например 2019-02
function PlanLastDate(plan_name)
{
  return new Date(plan_name.substr(0, 4),  plan_name.substr(5, 2), 0);
}

// Возвращает ДАТУ ПОСЛЕДНЕГО дня План-месяца, где План-месяц начинается с ГГГГ-ММ, например 2019-02
function PlanFirstDateAsSting(plan_name)
{
  return plan_name.substr(0, 7) + '-01';
}
function PlanLastDateAsSting(plan_name)
{
  return plan_name + '-' + PlanLastDay(plan_name);
}















// Сформировать список чисел месяца от даты до даты
function month_days(dtb, dte)
{
  result = '';
  day_ms = 1000*3600*24;

  for (var dt=dtb; dt <=dte; dt+=days_ms)
  {

    result = result + ("0"+dt.getDate()).slice(-2) + ',';
  }
  return result;
}


























