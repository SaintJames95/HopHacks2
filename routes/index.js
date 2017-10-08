var express = require('express');
var router = express.Router();
var mongodb = require('mongodb');

router.get('/', function(req, res, next) {
  res.render('home');
});

router.get('/sam', function(req, res, next) {
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/hackumbc';

  MongoClient.connect(url, function (err, db) {
    if (err) {
      err.message = "Failed To Connect to MongoDB";
    }
    else
    {
      console.log('Connection established to', url);
      
      var queryResults = db.collection('recipes').find({}).limit(3).toArray(function (err, results){
        if(err)
        {
          console.log('failed')
        }
        else
        {

          var groccery_list = []
          var ingredients_list = []

          var j = 0
          results.forEach(function (doc) {
            var ingredients = doc.ingredients
            ingredients_list[j] = new Array()

            ingredients.forEach(function (ingredient)
            {
              var qty = 0;
              var qty_unchanged = ingredient.primQty.split(' ')

              for(i = 0; i < qty_unchanged.length; i++)
              {
                var add = eval(qty_unchanged[i])
                if (isNaN(parseFloat(add)))
                {
                  add = 0
                }
                qty += add
              }

              var qty_name = ingredient.primUom.name
              var name = ingredient.ingredientName

              var obj = {

                name: name,
                qty_name: qty_name,
                qty: qty

              }

              ingredients_list[j].push(obj)
              groccery_list.push(obj)
            })
            j++
          })

          var obj = {
            monday: {
              breakfast: {
                title: results[0].title,
                mobile_image: results[0].mobile_image,
                ingredients: ingredients_list[0],
                description: results[0].description, 
                instructions: results[0].recipe_instructions,
                time: results[0].prep_time + results[0].time, 
                calories: results[0].calories,
                protein: results[0].protein,
                carbs: results[0].sodium,
                sodium: results[0].carbohydrates
              },
              lunch: {
                title: results[1].title,
                mobile_image: results[1].mobile_image,
                ingredients: ingredients_list[1],
                time: results[1].prep_time + results[1].time, 
                calories: results[1].calories,
                protein: results[1].protein,
                carbs: results[1].sodium,
                sodium: results[1].carbohydrates
              },
              dinner: {
                title: results[2].title,
                mobile_image: results[2].mobile_image,
                ingredients: ingredients_list[2],
                time: results[2].prep_time + results[2].time, 
                calories: results[2].calories,
                protein: results[2].protein,
                carbs: results[2].sodium,
                sodium: results[2].carbohydrates
              }
            }, 
            groccery_list: groccery_list
          }
          res.json(obj)
        }
        db.close()
      });
    }
  })
});

/*
router.get('/database', function(req, res, next) {
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/hackumbc';

  // Connect to the server
  MongoClient.connect(url, function (err, db) {
    if (err) {
      err.message = "Failed To Connect to MongoDB";
      return next(err);
    }

    //Get the database collection 
    console.log('Connection established to', url);
    var myDB = db.collection('recipes');

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
});*/

module.exports = router;
