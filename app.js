var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var hbs = require("hbs");

// var parseurl = require('parseurl')
var session = require('express-session');

var db = require("./db");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var commonRouter = require('./routes/common');
var proRouter = require('./routes/pro');
var planRouter = require('./routes/plan');
var plan2Router = require('./routes/plan2');
var testRouter = require('./routes/test');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// устанавливаем путь к каталогу с частичными представлениями
hbs.registerPartials(__dirname + "/views/partials");

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.disable('x-powered-by');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/common', commonRouter);
app.use('/pro', proRouter);
app.use('/plan', planRouter);
app.use('/plan2', plan2Router);
app.use('/test', testRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
