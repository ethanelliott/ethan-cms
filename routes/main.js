var express = require('express');
var crypto = require('crypto');
var mongo = require('mongodb');
var session = require('client-sessions');
var numeral = require('numeral');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Ethan Designs' });
});

router.get('/login', function(req, res, next) {
  res.redirect("/admin/login");
});

router.get('/logvisit', function(req, res, next) {
	var log = req.dbStats;
	var collection = log.get('stats');
	var a = {

	};
	log.insert(a, function(err, d){
		console.log(err);
	});
});


module.exports = router;
