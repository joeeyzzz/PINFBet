const LocalStrategy = require("passport-local").Strategy;
const PDFParser = require("pdf2json");
const multer = require("multer");


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
                newUser.local.name = req.body.name;
                newUser.local.nickname = req.body.nickname;
                newUser.local.nacimento = req.body.date;
                newUser.credits = 0;
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


function parseCredits(file) {
    let pdfParser = new PDFParser(this, 1);
    pdfParser.loadPDF(file);

        // On data ready
        pdfParser.on("pdfParser_dataReady", () => {

            // The raw PDF data in text form
            const raw = pdfParser.getRawTextContent().replace(/\r\n/g, " ");
            let data = raw.match(/\d,\d /g);
            let nums = [];
            for(let i = 0; i < data.length; i++) {
                let step1 = data[i].replace(/\s+/g, '');
                let step2 = step1.replace(/,/,'.');
                nums.push(parseFloat(step2));
            }
            let creditos = 0;
            for(let i = 0; i < nums.length; i++) {
                if(nums[i] >= 9) {
                    creditos += 10;
                }
                else if (nums[i] >= 7) {
                    creditos += 8;
                }
                else if (nums[i] >= 5) {
                    creditos += 6;
                }
            }
        });
        return(creditos);
}