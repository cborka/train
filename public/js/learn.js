'use strict';


//document.getElementById('eee').innerHTML = '<br>ddddddddddd';
//alert(document.getElementById("eee").innerHTML);
//alert(document.getElementById("eee").innerHTML);

function echo2(message) {
    document.getElementById('eee').innerHTML += '<br>' + message;
}


function ask(question, yes, no) {
    if (confirm(question)) yes()
    else no();
}

ask(
    "Вы согласны?",
    function () {
        alert("Вы согласились.");
    },
    function () {
        alert("Вы отменили выполнение.");
    }
);

ask(
    "Вы согласны?",
    () => alert("Вы согласились."),
    () => alert("Вы отменили выполнение.")
);


/*
function min(a, b) {
    return (a > b) ? b : a;
}
function pow(x, n) {
    let po = 1;
    for (let i = 1; i <= n; i++) po = po * x;
    return po;
}
echo2(pow(2, 5));
echo2(pow);
*/


/*
// Переписать функцию в одну строку
function checkAge(age) {
    if (age > 18) {
        return true;
    } else {
        return confirm('Родители разрешили?');
    }
}
function checkAge(age) {
     return (age > 18) ? true : confirm('Родители разрешили?');
}
function checkAge(age) {
    return (age > 18) || confirm('Родители разрешили?');
}
*/


/*
switch (browser) {
    case 'Edge':
        alert( "You've got the Edge!" );
        break;

    case 'Chrome':
    case 'Firefox':
    case 'Safari':
    case 'Opera':
        alert( 'Okay we support these browsers too' );
        break;

    default:
        alert( 'We hope that this page looks ok!' );
}

if (browser == 'Edge') {
    alert("You've got the Edge!");
}
else if (browser == 'Chrome' ||
         browser == 'Firefox' ||
         browser == 'Safari' ||
         browser == 'Opera' ) {
    alert('Okay we support these browsers too')
}
else {
    alert( 'We hope that this page looks ok!' );
}


const number = +prompt('Введите число между 0 и 3', '');

if (number === 0) {
    alert('Вы ввели число 0');
}

if (number === 1) {
    alert('Вы ввели число 1');
}

if (number === 2 || number === 3) {
    alert('Вы ввели число 2, а может и 3');
}

switch (number) {
    case 0:
        alert('Вы ввели число 0');
        break;
    case 1:
        alert('Вы ввели число 1');
        break;
    case 2:
    case 3:
        alert('Вы ввели число 2, а может и 3');
        break;
}
*/


/*
// Найти простые числа (которые делятся только на 1 и на себя)
function simpleNumbers(maxNumber) {
    echo2(maxNumber);
    outer:
    for (let i = 1; i <= +maxNumber; i++) {
        for (let j = 2; j < i; j++) {
           if (i % j == 0) continue outer;
       }
       echo2(i);
   }
}
simpleNumbers(27);
echo2(7);
*/


/*
*/
/*
let login = prompt('Введите логин', '');

if (login == '' || login == null) {
    alert('Отменено');
}
else if (login == 'Админ') {
    let pass = prompt('Введите пароль');

    if (pass == '' || pass == null) {
        alert('Отменено');
    }
    else {
        if (pass == 'Я главный') {
            alert('Здравствуйте!')
        }
        else {
            alert ('Неверный пароль');
        }
    }
}
else {
alert('Я вас не знаю!');
}
*/
/*
let oodDigits = '0';
for (let i = 1; i <= 20; i++ ) {
    if (i % 2 == 0) oodDigits += ','+i
}
echo2(oodDigits);

for (let i = 0; i < 3; i++) {
    echo2( `number ${i}!` );
}

let i = 0;
while (i < 3) {
    echo2( `number ${i}!` );
    i++;
}

let answer = 0;
while(+answer <= 100) {
   answer = prompt('Введите число больше 100', '');

   if (+answer > 100) {
       echo2(`Отлично, число ${answer} больше 100`);
   }
   else
       continue;
}
*/



