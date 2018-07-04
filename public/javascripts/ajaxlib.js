function erro(message)
{
  document.getElementById("erro").innerHTML = ".."+message+"..";
}

//<script> function x() {  x = 1; } </script>

var deftimeout = 3000;
//var xhr = new getXmlHttp();


xhronreadystatechange = function()
{
  if (xhr.readyState != 4) return;

  if (xhr.status != 200)
  {
    onErr();  // обработать ошибку
  }
  else
  {
    onOK();   // вывести результат //(xhr.responseText);
  }
}

//
// Запуск асинхронного запроса на выполнение
//
function doquery (url, params)
{
  erro('doquery'+url);
//  xhr.open("GET", url);
//  xhr.open('GET', '/ajax', true);
//  xmlhttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
//  xhr.send();
  var xhr = new XMLHttpRequest();

//    xhr.open('GET', 'phones.json', true);
//  xhr.open('GET', '/ajax', true);
  xhr.open("GET", url);
//  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
  xhr.send();

  xhr.onreadystatechange = function() {
    if (xhr.readyState != 4) return;

    if (xhr.status != 200) {
      // обработать ошибку
      erro(xhr.status + ': ' + xhr.statusText);
    } else {
      // вывести результат
      erro(xhr.responseText);
      onOK();
    }
  }

}

function onOK()
{
  erro('onOK');
//  alert(xhr.responseText);
}

function onErr()
{
  erro('onErr');
  alert('Ошибка:'+xhr.status + ': ' + xhr.statusText);
}