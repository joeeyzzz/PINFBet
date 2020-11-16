const LocalStrategy = require("passport-local").Strategy;

const User = require("../app/models/user");

module.exports = function (passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use("local-signup", new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
    },
    function(req, email, password, done) {
        User.findOne({"local.email": email}, function(err, user) {
            if (err) {return done(err);}
            if (user) {
                return done(null, false, req.flash("signupMessage", "Ese correo ya ha sido registrado"));
            } else {
                var newUser = new User();
                newUser.local.email = email;
                newUser.local.password = newUser.generateHash(password);
                newUser.save(function (error) {
                    if (error) {throw error;}
                    return done(null, newUser);
                });
            }
        })
    }));

    passport.use("local-login", new LocalStrategy({
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true
    },
    function(req, email, password, done) {
        User.findOne({"local.email": email}, function(err, user) {
            if (err) {return done(err);}
            if (!user) {
                return done(null, false, req.flash("loginMessage", "Este usuario no existe"));
            } 
            if (!user.validatePass(password)) {
                return done(null, false, req.flash("loginMessage", "Contraseña incorrecta"));
            }
            return done(null, user);
        })
    }));


}