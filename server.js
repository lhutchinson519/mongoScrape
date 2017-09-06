// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var mongojs = require("mongojs");
var logger = require("morgan");
var articleinput = require("models/articles.js")
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");
var mongoose = require("mongoose");
var path = require("path");
mongoose.Promise = Promise;

// Initialize Express
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: "application/vnd.api+json" }));
app.use(express.static(path.join(__dirname, 'public')));

// Database configuration
var databaseUrl = "articles";
var collections = ["scrapedData"];

// var  articles= require("./models/articles.js");

app.use(logger("dev"));
app.use(bodyParser.urlencoded({
    extended: false
}));


// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
    console.log("Database Error:", error);
});


// Main route
app.get("/", function(req, res) {
    res.send("index");
});

// Retrieve data from the db
app.get("/all", function(req, res) {
    // Find all results from the scrapedData collection in the db
    db.articles.find({}, function(error, found) {
        // Throw any errors to the console
        if (error) {
            console.log(error);
        }
        // If there are no errors, send the data to the browser as json
        else {
            res.json(found);
        }
    });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
    // Make a request for the news section of ycombinator
    request("https://www.nytimes.com/", function(error, response, html) {
        // Load the html body from request into cheerio
        var $ = cheerio.load(html);
        // console.log(html);

        var articleobjects = [];
        $("article").each(function(i, element) {

            var headline = $(element).children("h2").text().trim();
            var subheaders = $(element).find("p.summary").text().trim();

            // console.log("headline: " + headline);
            // console.log("Subheader: " + subheaders);

            if (headline && subheaders) {
                // Insert the data in the articles db
                db.articles.insert({
                    headline: headline,
                    subheaders: subheaders
                }, function(err, inserted) {
                    if (err) {
                        // Log the error if one is encountered during the query
                        console.log(err);
                    } else {
                        // Otherwise, log the inserted data
                        console.log(inserted);
                    }
                });
            }
            // console.log("Array: " + articleobjects)
            // articleobjects = articleobjects.slice(0, 20);
        });
    })
};

// Send a "Scrape Complete" message to the browser
res.send("Scrape Complete");
});


// Handle form submission, save submission to mongo
app.post("/submit", function(req, res) {
    console.log(req.body);
    // Insert the note into the notes collection
    db.notes.insert(req.body, function(error, saved) {
        // Log any errors
        if (error) {
            console.log(error);
        }
        // Otherwise, send the note back to the browser
        // This will fire off the success function of the ajax request
        else {
            res.send(saved);
        }
    });
});


// Listen on port 3000
app.listen(3000, function() {
    console.log("App running on port 3000!");
});