const multer = require("multer");
const User = require("../app/models/user");
const path = require("path");
const user = require("../app/models/user");
const pdfs = "pdfs";

var storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, pdfs);
     },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + "-" + Date.now()+".pdf");
    }
});

var upload = multer({ storage: storage,
    fileFilter: function (req, file, cb){ 
        // Set the filetypes, it is optional 
        var filetypes = /pdf/; 
        var mimetype = filetypes.test(file.mimetype); 
  
        var extname = filetypes.test(path.extname( 
                    file.originalname).toLowerCase()); 
        
        if (mimetype && extname) { 
            return cb(null, true); 
        } 
      
        cb("Error: File upload only supports the "
                + "following filetypes - " + filetypes); 
      }  
}).single("expediente");

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

    app.post("/apuestas", function(req, res, next) {
        User.findOne({"local.email": req.user.local.email}, function(err, user2){
            user2.local.credits -= 6;
            user2.save();
            res.redirect("/principal");
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

    app.post("/expediente", function(req, res, next) {
        upload(req,res,function(err2) {
            if(err2) {
                res.send(err2);
                res.redirect("/principal"); 
            } else {
                User.findOne({"local.email": req.user.local.email}, function(err, user2){
                    user2.local.credits = 60;
                    user2.save();
                   })
                res.redirect("/profile");
            }
        })
    })

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

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
}