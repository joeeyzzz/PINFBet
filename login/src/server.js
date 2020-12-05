const express = require("express");
const app = express();
const path = require("path");
const fetch = require('node-fetch');
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const session = require("express-session");
const { stringify } = require('querystring');
const {url} = require("./config/database");


mongoose.connect(url);

require("./config/passport")(passport);

//settings
app.set("port", process.env.PORT || 3000);
app.set("views",path.join(__dirname, "views"));
app.set("view engine", "ejs");

//middleware
app.use(morgan("dev"));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({
    secret: "admin",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//routes
require("./app/routes") (app, passport);

//static files
app.use(express.static(path.join(__dirname, "public")));

app.listen(app.get("port"), () => {
    console.log("server on port", app.get("port"));
});
app.get('/', (_, res) => res.sendFile(__dirname + '/index.html'));

app.post('/subscribe', async (req, res) => {
  if (!req.body.captcha)
    return res.json({ success: false, msg: 'Please select captcha' });

  // Secret key
  const secretKey = '6LdpvDEUAAAAAHszsgB_nnal29BIKDsxwAqEbZzU';

  // Verify URL
  const query = stringify({
    secret: secretKey,
    response: req.body.captcha,
    remoteip: req.connection.remoteAddress
  });
  const verifyURL = `https://google.com/recaptcha/api/siteverify?${query}`;

  // Make a request to verifyURL
  const body = await fetch(verifyURL).then(res => res.json());

  // If not successful
  if (body.success !== undefined && !body.success)
    return res.json({ success: false, msg: 'Failed captcha verification' });

  // If successful
  return res.json({ success: true, msg: 'Captcha passed' });
});

