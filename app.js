var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var https = require('https');

//Do the things
doThing();

function doThing() {
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/hackumbc';

  MongoClient.connect(url, function (err, db) {
    if (err) {
      err.message = "Failed To Connect to MongoDB";
    }
    else
    {
      console.log('Connection established to', url);
      
      // DO THING HERE
      var myDB = db.collection('recipes');
      getMccormickData(myDB)
    }
  })
}

//Get Mccormick Data
function getMccormickData(database)
{
  var options = {
    host: "gdt-api.mccormick.com",
    port: 443,
    path: '/recipes?page=0&size=300',
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      'x-api-key': '0CjwofWEIr38gpQIaspYiaKSfE72c3N5P5NzEjtc'
    }
  };

  var data = ""
  https.request(options, function(res) {
    console.log('STATUS: ' + res.statusCode);
    console.log('HEADERS: ' + JSON.stringify(res.headers));
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
      data += chunk;
    });

    res.on('end',function(){
      console.log(data);
      data = JSON.parse(data);

      // DO SOMETHING WITH DATA HERE
      jsonToMongo(database, data.content)
    })
  }).end();
}

//Put Mccormick Response in Mongo
function jsonToMongo(database, theData) {
  //Get all recipes
  database.insert(theData, function (err, result) {
    if (err) {
      next(err);
    } 
  });
  database.close();
};

//DON'T MODIFY ANYTHING BELOW

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
