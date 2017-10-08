var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');

router.get('/database', function(req, res, next) {
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/sampsite';

  // Connect to the server
  MongoClient.connect(url, function (err, db) {
    if (err) {
      err.message = "Failed To Connect to MongoDB";
      return next(err);
    }

    //Get the database collection 
    console.log('Connection established to', url);
    var myDB = db.collection('testdb');

    //Get all recipes
    myDB.find({}).toArray(function (err, result) {
      if (err) {
        next(err);
      } else if (result.length) {
        res.render('database', {myArray: result});
      } else {
        res.render('database', {myArray: false});
      }
      console.log('Closing DB connection...')
      db.close();
      console.log('Connection Closed')
    });
  });
});

module.exports = router;
