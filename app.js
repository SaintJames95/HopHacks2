var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongo = require('mongodb');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

//Setup Handlebars
var handlebars = require('express-handlebars').create(
  {
    defaultLayout:'main',
    helpers: require('./myHelpers.js')
  });

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  if(err.status == 404)
  {
    res.status(404);
    res.render('404');
  }
  else
  {
    var errorCode = (err.status || 500);
    res.status(errorCode);
    res.render('error', {errorCode: errorCode, errorMessage: err.message});
  }
});

module.exports = app;
