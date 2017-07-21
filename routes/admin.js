var express = require('express');
var crypto = require('crypto');
var mongo = require('mongodb');
var session = require('client-sessions');
var numeral = require('numeral');
var router = express.Router();

var AdminMenu = [
	{
		"name":"Dashboard",
		"icon":"tachometer",
		"url":"/admin",
	},
	{
		"name":"Pages",
		"icon":"file",
		"url":"/admin/pages",
	},
	{
		"name":"Posts",
		"icon":"comment",
		"url":"/admin/posts",
	},
	{
		"name":"Media",
		"icon":"photo",
		"url":"/admin/media",
	},
	{
		"name":"Users",
		"icon":"users",
		"url":"/admin/users",
	},
	{
		"name":"Settings",
		"icon":"cog",
		"url":"/admin/settings",
	}
];

router.get('/login', function(req, res, next) {
  	res.render('login', { title: 'Sign-in'});
});
router.get('/login/:error', function(req, res, next) {
	var er = req.params.error;
	var out = "";
	if (er === "e1") {
		out = "Invalid Username / Password";
	} else if (er === "e2") {
		out = "Username / Password combination does not exist";
	}
  	res.render('login', { title: 'Sign-in', e: out});
});

router.get('/register', function(req, res, next) {
	validateUser(req, res, function() {
		res.render('register', { title: 'Register'});
	}, function() {
		res.redirect("/login");
	});
});

router.post('/adduser', function(req, res, next) {
	validateUser(req, res, function() {
		registerNewUser(req, res);
	}, function() {
		res.redirect("/login");
	});
});

router.post('/validateuser', function(req, res, next) {
  	loginUser(req, res);
});

router.get('/logout', function (req, res, next)
{
  req.session.reset();
  res.redirect("/admin");
});

//Admin Content Pages

router.get('/', function(req, res, next) {
	var s = [
		['Day', 'Views'],
		['Monday', 500],
		['Tuesday', 420],
		['Wednesday', 660],
		['Thursday', 1030],
		['Friday', 684],
		['Saturday', 1120],
		['Sunday', 937]
	];


	var db = req.dbStats;
	var collection = db.get('stats');
	collection.find({}).then(function (stats) {
		console.log(stats);
		validateUser(req, res, function() {
			res.render('admin_home', {title: 'Dashboard', user:req.session.user, menu:AdminMenu, stats:JSON.stringify(s)});
		});
	});
});

router.get('/pages', function(req, res, next) {
	validateUser(req, res, function() {
		res.render('admin_pages', {title: 'Pages', user:req.session.user, menu:AdminMenu});
	});
});

router.get('/posts', function(req, res, next) {
	validateUser(req, res, function() {
		res.render('admin_posts', {title: 'Posts', user:req.session.user, menu:AdminMenu});
	});
});

router.get('/media', function(req, res, next) {
	validateUser(req, res, function() {
		res.render('admin_media', {title: 'Media', user:req.session.user, menu:AdminMenu});
	});
});

router.get('/users', function(req, res, next) {
	validateUser(req, res, function() {
		res.render('admin_users', {title: 'Users', user:req.session.user, menu:AdminMenu});
	});
});

router.get('/settings', function(req, res, next) {
	validateUser(req, res, function() {
		res.render('admin_settings', {title: 'Settings', user:req.session.user, menu:AdminMenu});
	});
});

var validateUser = function (req, res, callback_success)
{
	var db = req.dbUser;
	var collection = db.get('user');
	if (req.session && req.session.user) {
		var query = collection.find({'username': req.session.user.username}).then(function (value) {
			if (value) {
				callback_success();
			} else {
				res.redirect("/login");
			}
		});
	} else {
		res.redirect("/login");
	}
};

var loginUser = function (req, res)
{
	var db = req.dbUser;
	var collection = db.get('user');
	var uName = req.body.username;
	var uPass = req.body.password;
	var query = collection.find({'username': uName}).then(function (value) {
		if (value[0])
		{
			if (validatePassword(uPass, value[0].password))
			{
				req.session.user = value[0];
				req.session.user.password = "";
				res.redirect("/admin");
			} else {
				res.redirect("/admin/login/e1");
			}
		}
		else
		{
			res.redirect("/admin/login/e2");
		}
	});
};

var registerNewUser = function(req, res) {
	var db = req.dbUser;
	var collection = db.get('user');
	var uName = req.body.username;
	var uPass = req.body.password;
	var uFirstName = req.body.firstname;
	var uLastName = req.body.lastname;
	collection.find({'username': uName}).then(function (value) {
		if (value[0]) {
			res.redirect("/register");
		} else {
			if (uName.length > 0 && uPass.length > 0) {
				var userData = {
					'firstname': uFirstName,
					'lastname': uLastName,
					'username': uName,
					'password': saltAndHash(uPass)
				};
				console.log(userData);
				collection.insert(userData, function(){
					res.redirect("/login");
				});
			} else {
				res.redirect("/register");
			}
		}
	});
};

var saltLength = 20;
var generateSalt = function ()
{
  var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
  var salt = '';
  for (var i = 0; i < saltLength; i++)
  {
    var p = Math.floor(Math.random() * set.length);
    salt += set[p];
  }
  return salt;
};
var hash = function (str){return crypto.createHash('sha256').update(str).digest('HEX');};
var saltAndHash = function (pass)
{
  var salt = generateSalt();
  return salt + hash(pass + salt) + hash(salt);
};
var validatePassword = function (plainPass, hashedPass)
{
  var salt = hashedPass.substr(0, saltLength);
  var validHash = salt + hash(plainPass + salt) + hash(salt);
  if (hashedPass === validHash) {return true;}
  else {return false;}
};

module.exports = router;
