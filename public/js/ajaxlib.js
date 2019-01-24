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



// Дальше просто библиотека, не аякс, чтобы не плодить файлы


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