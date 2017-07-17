var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');

const port = 3000;

var app = express();

/*
var logger = function(req, res, next){
	console.log('Logging...');
	next();
}

app.use(logger);
*/

//BODY PARSER MIDDLEWARE
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

//SET STATIC PATH
app.use(express.static(path.join(__dirname, 'productviewer')));

app.get('/', function(req, res){
	res.send('Hello World');
});


app.listen(port, function(){
	console.log('Server started on port ' + port);
});

