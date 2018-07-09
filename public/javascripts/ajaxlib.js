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
function doQuery (url, onOK, params)
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
    xhr.open("GET", url);
    xhr.send();
  }
  else {
    xhr.open("POST", url);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.send(params);
  }
}


function doGetQuery (url, onOK)
{
  doQuery (url, onOK, '');
}

function doPostQuery (url, onOK, params)
{
  doQuery (url, onOK, params);
}
