var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var helmet = require('helmet');
var session = require('client-sessions');
var mongo = require('mongodb');
var monk = require('monk');

//database
var dbUser = monk('localhost:27017/user');
var dbStats = monk('localhost:27017/stats');

var index = require('./routes/main');
var admin = require('./routes/admin');

var app = express();

//app.use(favicon(path.join(__dirname, 'public', 'favicon.png')));
app.set('views', [path.join(__dirname, 'views'), path.join(__dirname, 'views/admin')]);
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json(
{
  limit: '512mb'
}));
app.use(bodyParser.urlencoded(
{
  limit: '512mb',
  extended: true
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session(
{
  cookieName: 'session',
  secret: '20F99CD92BF5812C37588975E695C244523H3FAA210D82188276BE1464812223EF80D63A7E1C9F69A3C7FD7F782566C',
  duration: 60 * 60 * 1000,
  activeDuration: 30 * 60 * 1000
}));

app.use(function (req, res, next)
{
  req.dbUser = dbUser;
  req.dbStats = dbStats;
  next();
});

app.use('/', index);
app.use('/admin', admin);
app.use(helmet());

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
