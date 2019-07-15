module.exports = function(app, passport) {
    var mysql = require('mysql');
    var dbconfig = require('./../config/database');
    var connection = mysql.createConnection(dbconfig.connection);
    connection.query('USE xrpay')

 app.get('/', function(req, res){
  res.render('index.ejs');
 });

 app.get('/login', function(req, res){
  res.render('login.ejs', {message:req.flash('loginMessage')});
 });

 app.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
 }),
  function(req, res){
   if(req.body.remember){
    req.session.cookie.maxAge = 1000 * 60 * 3;
   }else{
    req.session.cookie.expires = false;
   }
   res.redirect('/');
  });

 app.get('/signup', function(req, res){
  res.render('signup.ejs', {message: req.flash('signupMessage')});
 });

 app.post('/signup', passport.authenticate('local-signup', {
  successRedirect: '/new',
  failureRedirect: '/signup',
  failureFlash: true
 }));

 app.get('/new', function(req, res){
    res.render('new.ejs');
   });

 app.get('/profile', isLoggedIn, function(req, res){
  res.render('profile.ejs', {
   user:req.user
  });
 });

 app.get('/checkAccount', function(req, res){
     var uid = req.query.id;
     console.log(uid)


     var sql = "UPDATE users SET check_acc = '1' WHERE id = '" +uid+ "'";
        connection.query(sql, function (err, result) {
            if (err) throw err;
            console.log(result.affectedRows + " record(s) updated");
            res.redirect('/login');
        });    
     });

 

 app.get('/logout', function(req,res){
  req.logout();
  res.redirect('/');
 })
};

function isLoggedIn(req, res, next){
 if(req.isAuthenticated())
  return next();

 res.redirect('/');
}
