var LocalStrategy = require("passport-local").Strategy;

var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);


module.exports = function(passport) {

  main();

  async function main() {
  var um = await funcaoUm();
  var dois = await funcaoDois();
  return um, dois;
  }
  async function funcaoUm() {
  connection.connect(function(err) {
    if(err){
      console.log('\x1b[31m%s\x1b[0m',"######  -->> Edit database on config folder <<-- #####");	
      }else{
        connection.query("CREATE DATABASE IF NOT EXISTS xrpay", function (err, result) {
          if (err) throw err;
          connection.query('USE xrpay', function(err){
                if(err) throw err;
                console.log('\x1b[32m%s\x1b[0m',"The xrpay data base was created and the connection done")

                var sql = "CREATE TABLE IF NOT EXISTS `users` (";
                sql +="`id` int(11) NOT NULL AUTO_INCREMENT,";
                sql +=" `username` varchar(100) COLLATE utf8_unicode_ci NOT NULL,";
                sql +=" `password` varchar(255) COLLATE utf8_unicode_ci NOT NULL,";
                sql +=" `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,";
                sql +=" `modified` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,";
                sql +=" PRIMARY KEY (`id`)";
                sql +=")";

                connection.query(sql, function (err, result){
                  if(err) throw err;
                  console.log('\x1b[32m%s\x1b[0m',"Table users to login is created")
                })
          })
        })
      }
  })
}
async function funcaoDois() {
  await sleep(500);
connection.query('USE xrpay');

 passport.serializeUser(function(user, done){
  done(null, user.id);
 });

 passport.deserializeUser(function(id, done){
  connection.query("SELECT * FROM users WHERE id = ? ", [id],
   function(err, rows){
    done(err, rows[0]);
   });
 });

 passport.use(
  'local-signup',
  new LocalStrategy({
   usernameField : 'username',
   passwordField: 'password',
   passReqToCallback: true
  },
  function(req, username, password, done){
   connection.query("SELECT * FROM users WHERE username = ? ", 
   [username], function(err, rows){
    if(err)
     return done(err);
    if(rows.length){
     return done(null, false, req.flash('signupMessage', 'That is already taken'));
    }else{
     var newUserMysql = {
      username: username,
      password: bcrypt.hashSync(password, null, null)
     };


     var sql = "INSERT INTO users (username, password) VALUES ('"+newUserMysql.username+"', '"+newUserMysql.password+"')";
     connection.query(sql, function (err, result) {
      if (err) throw err;

      newUserMysql.id = result.insertId;
      console.log('\x1b[32m%s\x1b[0m',result.insertId);
      return done(null, newUserMysql);
      });
    }
   });
  })
 );

 passport.use(
  'local-login',
  new LocalStrategy({
   usernameField : 'username',
   passwordField: 'password',
   passReqToCallback: true
  },
  function(req, username, password, done){
   connection.query("SELECT * FROM users WHERE username = ? ", [username],
   function(err, rows){
    if(err)
     return done(err);
    if(!rows.length){
     return done(null, false, req.flash('loginMessage', 'No User Found'));
    }
    if(!bcrypt.compareSync(password, rows[0].password))
     return done(null, false, req.flash('loginMessage', 'Wrong Password'));

    return done(null, rows[0]);
   });
  })
 );
 }
 function sleep(ms = 0) {
  return new Promise(r => setTimeout(r, ms));
}
};