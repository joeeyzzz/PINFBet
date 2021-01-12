const passport = require("passport");
const express = require("express");
const multer = require("multer");
const User = require("../app/models/user");
const app2 = express();

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, '../login/src/public/pdfs/');
     },
    filename: function (req, file, cb) {
        cb(null , file.originalname);
    }
});

var upload = multer({ storage: storage })

module.exports = (app, passport) => {
    app.get("/", (req, res) => {
        res.render("index");
    });

    app.get("/login", (req, res) => {
        res.render("login", {
            message: req.flash("loginMessage")
        }); 
    });

    app.post("/login", passport.authenticate("local-login", {
        successRedirect: "/principal",
        failureRedirect: "/login",
        failureFlash: true
    }));

    app.get("/signup", (req,res) => {
        res.render("signup", {
            message: req.flash("signupMessage")
        })
    })

    app.post("/signup", passport.authenticate("local-signup", {
        successRedirect: "/principal",
        failureRedirect: "/signup",
        failureFlash: true
    }));

    app.get("/apuestas", (req,res) => {
        res.render("apuestas", {
            message: req.flash("signupMessage")
        })
    })

    app.get("/chat", (req,res) => {
        res.render("chat", {
            message: req.flash("signupMessage")
        })
    })

    app.get("/acercade", (req,res) => {
        res.render("acercade", {
            message: req.flash("signupMessage")
        })
    })

    app.get("/expediente", (req,res) => {
        res.render("expediente", {
            message: req.flash("signupMessage")
        })
    })

    app.post("/expediente", passport.authenticate("local-login", {
        successRedirect: "/principal",
        failureRedirect: "/login",
        failureFlash: true
    }));

    app.get("/profile", isLoggedIn, (req, res) => {
        res.render("profile", {
            user: req.user
        });
    });

    app.get("/logout", (req, res) => {
        req.logout();
        res.redirect("/");
    });

    app.get("/principal", isLoggedIn, (req, res) => {
        res.render("principal");
    });
};

app2.post("/expediente", upload.single("expediente"), (req, res, next) => {
    const file = req.file
    if (!file) {
        const error = new Error('Please upload a file')
        error.httpStatusCode = 400
        return next(error)
    }
    res.send(file)
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
}