'use strict';


// document.getElementById('eee').innerHTML = '<br>ddddddddddd';
// alert(document.getElementById("eee").innerHTML);
// alert(document.getElementById("eee").innerHTML);

function echo2 (message) {
  document.getElementById('eee').innerHTML += '<br>' + message;
}

let op1 = +prompt('op1 =', 0);
let op2 = +prompt('op2 =', 0);

alert(+op1 + +op2);


/*
let ladder = {
    step: 0,
    up() {
        this.step++;
        return this;
    },
    down() {
        this.step--;
        return this;
    },
    showStep: function() { // показывает текущую ступеньку
        alert( this.step );
        return this;
    }
};

//ladder.up().up().up().down().showStep();
*/

/*
function Calc() {
    this.op1 = 1;
    this.op2 = 1;

    this.read =  function() {
        this.op1 = prompt('op1 =', this.op1);
        this.op2 = prompt('op2 =', this.op2);
    };

    this.sum = function() {return (+this.op1 + +this.op2)};
    this.mul = function() {return (+this.op1 * +this.op2)};

}

let clc = new Calc();

clc.read();
echo2(clc.sum());
echo2(clc.mul());
*/

/*
function Accumulator(start_value) {
    this.value = +start_value;

    this.read = function() {
        this.value += +prompt('Добавить ', 1);
    }
}


let accumulator = new Accumulator(1); // начальное значение 1

accumulator.read(); // прибавит ввод prompt к текущему значению
accumulator.read(); // прибавит ввод prompt к текущему значению

alert(accumulator.value); // выведет сумму этих значений
*/

/*
let calc = {
    op1: 1,
    op2: 1,

    read: function() {
        this.op1 = prompt('op1 =', this.op1);
        this.op2 = prompt('op2 =', this.op2);
        },

    sum: function() {return (+this.op1 + +this.op2)},
    mul: function() {return (+this.op1 * +this.op2)}

};

//prompt('op1 =', calc.op1);
//prompt('op2 =', calc.op2);
alert(33);
calc.read();
alert(55);
alert(calc.sum());
alert(calc.mul());
*/

/*
Создайте пустой объект user.
    Добавьте свойство name со значением John.
    Добавьте свойство surname со значением Smith.
    Измените значение свойства name на Pete.
    Удалите свойство name из объекта.


let user = {};
user.name = 'John';
user.surname = 'Smith';
user.name = 'Pete';
delete user.namel
*/
/*
Напишите функцию isEmpty(obj), которая возвращает true, если у объекта нет свойств, иначе false.

    Должно работать так:


function isEmptyMy(obj) {
    let c = +0;
    for (let prop in obj) c++;

    return c == +0;
}
function isEmpty(obj) {
    for (let prop in obj)
        return false;

    return true;
}

let schedule = {};
// alert( isEmpty(schedule) ); // true
schedule["8:30"] = "get up";
// alert( isEmpty(schedule) ); // false


let salaries = {
    John: 100,
    Ann: 160,
    Pete: 130
};

function ssum(sal) {
    let sum = +0;
    for (let key in sal) sum += +sal[key];
    return +sum;
}
// alert(ssum(salaries));

let menu = {
    width: 200,
    height: 300,
    title: "My menu"
};
for (let key in menu) {
    if (typeof (menu[key]) == "number")
        menu[key] *= 2;
}

alert (menu['width']);
*/


//let id = Symbol("id");
//alert(id.toString());



/*
function ask (question, yes, no) {
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
*/

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



