var pgp = require("pg-promise")(/*options*/);

console.log("Режим запуска: "+process.env);
console.log("Режим запуска: "+process.env.PG_CONNECT);
var db = pgp(process.env.PG_CONNECT);

console.log("Подключена база данных: "+db);
//console.log("Режим запуска: "+process.env.NODE_ENV);
//console.log("Режим запуска: "+process.env.PG_CONNECT);

module.exports = db;