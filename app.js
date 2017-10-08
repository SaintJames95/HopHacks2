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
//doThing();

function doThing() {
    var MongoClient = mongodb.MongoClient;
    var url = 'mongodb://localhost:27017/hackumbc';

    MongoClient.connect(url, function (err, db) {
        if (err) {
            err.message = "Failed To Connect to MongoDB";
            next(err);
        }
        else {
            console.log('Connection established to', url);
            //makeChoices(2000, db)
            // DO THING HERE
            //var myDB = db.collection('recipes');
            getMccormickData(db)


        }
    })
}


//Get Mccormick Data
function getMccormickData(database)
{
  var options = {
    host: "gdt-api.mccormick.com",
    port: 443,
    path: '/recipes?page=4&size=3',
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
}

//Put Mccormick Response in Mongo
function jsonToMongo(database, theData) {
    //Get all recipes
    database.collection("recipes").insert(theData, function (err, result) {
        if (err) {
            next(err);
        }
    });

    //database.close();
};

function makeChoices(totalCalories, database) {
    var breakfast = ""
    var lunch = ""
    var dinner = ""
    var breakfastCal = (totalCalories / 4).toString()
    var lunchCal = (totalCalories / 4).toString()
    var dinnerCal = (totalCalories / 2).toString()

    database.collection('recipes').aggregate([{ $match: { tag_names: { $regex: /.*breakfast.*/i }, calories: { $lte: breakfastCal } } }, { $sample: { size: 70 } }]).toArray(function (err, results) {
        if (err)
        { console.log('failed') }
        else
        {
            breakfast = results
            console.log(breakfast);
        }
    });

    database.collection('recipes').aggregate([{ $match: { tag_names: { $regex: /.*lunch.*/i }, calories: { $lte: lunchCal } } }, { $sample: { size: 70 } }]).toArray(function (err, results) {
        if (err)
        { console.log('failed') }
        else
        {
            lunch = results
            console.log(lunch);
        }
    });

    database.collection('recipes').aggregate([{ $match: { tag_names: { $regex: /.*dinner.*/i }, calories: { $lte: dinnerCal } } }, { $sample: { size: 70 } }]).toArray(function (err, results) {
        if (err)
        { console.log('failed') }
        else
        {
            dinner = results
            console.log(dinner);
        }
    });

}

//Iterate through the recipies collection

function recipesIter(database) {

    //database.collection("recipes").find().forEach(function (value) {})
    database.collection("recipes").find({}).toArray(function(err, results) {
       
        //console.log(results);

        var breakfast = ["breakfast", "omelette", "syrup", "early", "morning", "dawn"];
        var lunch = ["lunch", "soup", "sandwich", "slow cook", "grilled", "afternoon", "noon", "mid day", "pic-nic", "snack"];
        var dinner = ["dinner", "soup", "slow cook", "grilled", "evening", "late", "supper", "dusk"];

        for (i = 0; i < results.length; i++){
            // if mydoc does not have a breakfast, lunch or dinner key
            var tagArray = results[i].tag_names.split(",");
            var flag = false;
        
            for (j = 0; j < tagArray.length; j++) {
                currentTag = tagArray[j].toLowerCase();
                if (currentTag == "breakfast" || currentTag == "lunch" || currentTag == "dinner") {
                    flag = true;
                }
            }

            // Look at description if it contains a keyword add breakfast, lunch or dinner accordingly
            if (flag == false) {
                dFlag = false;
                var descriptionArray = results[i].description.split(" ");
                for (j = 0; j < descriptionArray.length; j++) {
                    for (k = 0; k < breakfast.length; k++) {
                        if (breakfast[k].toLowerCase() == descriptionArray[j]) {
                            dFlag = true;
                            // UPDATE OUR DUDE
                            results[i].tag_names = results[i].tag_names + ",Breakfast";
                            break;
                        }
                    }

                    if (dFlag == false) {
                        for (k = 0; k < lunch.length; k++) {
                            if (lunch[k].toLowerCase() == descriptionArray[j]) {
                                dFlag = true;
                                // UPDATE OUR DUDE
                                results[i].tag_names = results[i].tag_names + ",Lunch";
                                break;
                            }
                        }
                    }

                    if (dFlag == false) {
                        for (k = 0; k < dinner.length; k++) {
                            if (dinner[k].toLowerCase() == descriptionArray[j]) {
                                dFlag = true;
                                // UPDATE OUR DUDE
                                results[i].tag_names = results[i].tag_names + ",Dinner";
                                break;
                            }
                        }
                    }
                }

                if (dFlag == false) {
                    // set to lunch
                    results[i].tag_names = results[i].tag_names + ",Lunch";
                }
            

                database.collection("recipes").update( { id: results[i].id }, { $set: { tag_names: results[i].tag_names } }, { multi: true });
                //console.log(database.collection("recipes").find({ _id: results[i]._id }).tag_names)
            }
            console.log(results[i].tag_names)
            
        }
        
        //   console.log("MESSAGE", myDoc.tag_names)
        database.close();
    });
    
    //database.collection("recipes").find().forEach(function (doc) { console.log(doc.tag_names) });
   // 


};

//DON'T MODIFY ANYTHING BELOW

//Setup Handlebars
var handlebars = require('express-handlebars').create(
{
    defaultLayout: 'main',
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
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function (err, req, res, next) {
    if (err.status == 404) {
        res.status(404);
        res.render('404');
    }
    else {
        var errorCode = (err.status || 500);
        res.status(errorCode);
        res.render('error', { errorCode: errorCode, errorMessage: err.message });
    }
});

module.exports = app;
