const passport = require("passport");

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

    app.get("/apuestas", passport.authenticate("local-signup", {
        successRedirect: "/apuestas",
        failureRedirect: "/signup",
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

    app.get("/chat", isLoggedIn, (req, res) => {
        res.render("chat");
    });

    app.get("/chat", isLoggedIn, (req, res)=>{
        res.render("chat");

    });

}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
}