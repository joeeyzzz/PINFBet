const express = require("express");
const app = express();
const app2 = express();
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
let randomColor = require('randomcolor');
const uuid = require('uuid');

const pdfreader = require("pdfreader");

const {url} = require("./config/database");

mongoose.connect(url);

require("./config/passport")(passport);

//settings
app.set("port", process.env.PORT || 3000);
app.set("views",path.join(__dirname, "views"));
app.set("view engine", "ejs");

//middleware
app.use(morgan("dev"));
// Add headers
/*app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  next();
});*/
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

//Disable x-powered-by header
app2.disable('x-powered-by')

//middlewares
app2.use(express.static('public'));

// Add headers
/*app2.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Pass to next layer of middleware
  next();
});*/

//routes
app2.get('/chat', (req,res)=>{
    res.sendFile(__dirname + '/views/chat.ejs');
});

//Listen on port 5000
server = app2.listen( process.env.PORT || 5000, () => {
  console.log("server on port", 5000);
});

//socket.io instantiation
const io = require("socket.io")(server,{
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});
let users = [];
let connnections = [];

//listen on every connection
io.on('connection', (socket) => {
  console.log('New user connected');
  connnections.push(socket)
  //initialize a random color for the socket
  let color = randomColor();

  socket.username = 'Anonymous';
  socket.color = color;

  //listen on change_username
  socket.on('change_username', data => {
      let id = uuid.v4(); // create a random id for the user
      socket.id = id;
      socket.username = data.nickName;
      users.push({id, username: socket.username, color: socket.color});
      updateUsernames();
  })

  //update Usernames in the client
  const updateUsernames = () => {
      io.sockets.emit('get users',users)
  }

  //listen on new_message
  socket.on('new_message', (data) => {
      //broadcast the new message
      io.sockets.emit('new_message', {message : data.message, username : socket.username,color: socket.color});
  })

  //listen on typing
  socket.on('typing', data => {
      socket.broadcast.emit('typing',{username: socket.username})
  })

  //Disconnect
  socket.on('disconnect', data => {

      if(!socket.username)
          return;
      //find the user and delete from the users list
      let user = undefined;
      for(let i= 0;i<users.length;i++){
          if(users[i].id === socket.id){
              user = users[i];
              break;
          }
      }
      users = users.filter( x => x !== user);
      //Update the users list
      updateUsernames();
      connnections.splice(connnections.indexOf(socket),1);
  })
})