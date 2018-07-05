function show_msg(element_id, message)
{
  document.getElementById(element_id).innerHTML = message;
}

function erro(message)
{
  show_msg("erro", message);
}

//<script> function x() {  x = 1; } </script>

var xhr = new XMLHttpRequest();

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
    onErr();  // обработать ошибку
  }
  else
  {
    onOK();   // вывести результат //(xhr.responseText);
  }
}

function onOKdefault()
{
  erro(xhr.responseText);
}
var onOK = onOKdefault;

function onERRdefault()
{
  erro('Ошибка:'+xhr.status + ': ' + xhr.statusText);
}
var onErr = onERRdefault;

//
// Запуск асинхронного запроса на выполнение
//
function doPostQuery (url, params)
{
  xhr.open("POST", url);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
  xhr.send(params);
}
function doGetQuery (url)
{
  xhr.open("GET", url);
  xhr.send();
}
