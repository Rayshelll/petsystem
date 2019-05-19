
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');
var MongoStore = require("connect-mongo")(express);
var settings = require("./settings");
var flash = require('connect-flash');
var mutipart= require('connect-multiparty');
var mutipartMiddeware = mutipart();
var app = express();

// all environments
app.set('port', process.env.PORT || 8000);
app.set('views', __dirname + '/views');
app.use(mutipart({uploadDir:'./public/images'}));
app.set('view engine', 'ejs');
app.use(flash());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({
  secret: settings.db,
  key: settings.db,
  cookie: {maxAge: 1000*60*60*24*30},//30day
  store: new MongoStore({
    url: 'mongodb://localhost/petsystem'
  })
}));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

routes(app);
