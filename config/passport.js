// config/passport.js
// load all the things we need
var
    mongoose = require('mongoose')
    ,passport = require('passport')
    ,LocalStrategy   = require('passport-local').Strategy

// load up the user model
 var Company = require('../app/models/company');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {

        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        Company.findById(id, function(err, user) {
            done(err, user);
        });
    });


    // by default, if there was no name, it would just be called 'local'
    passport.use('local', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {
            console.log(email);
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            Company.findOne({ 'email' :  email },function (err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }
                if (!user.validPassword(password)) {
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
                }
                return done(null, user);
            });

        }));

    passport.use('local-signup', new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, email, password, done) {
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            Company.findOne({ 'email' :  email }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);
                // check to see if theres already a user with that email
                if (user) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } else {
                    // if there is no user with that email
                    // create the user
                    var newUser            = new Company();

                    // set the user's local credentials
                    newUser.email    = email;
                    newUser.password = newUser.generateHash(password);
                           

                    // save the user
                    newUser.save(function(err) {
                        if (err)
                            console.log(err) ;
                        return done(null, newUser);                        
                    });
                }
            });

        }));

};
