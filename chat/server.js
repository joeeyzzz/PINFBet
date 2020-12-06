const http = require('http');
const express = require('express'); //Empleo el modulo express. Explicar para que sirve?
const socketio = require('socket.io');//Empleo le modul socket.io. Conexiones en tiempo real q funciona sobre un servidor


const app = express();
const server = http.createServer(app);    //Trabajo con este servidor y le paso lo configurado en la variable app
const io = socketio.listen(server);

io.on('connection', socket => {
    console.log('new user connected');  //Cuando se conecte un nuevo usuario, se nos notificará por terminal.
});

//Static files
app.use(express.static('public'));

//Empiezo el servidor
server.listen(3000, () => {
    console.log('server on port 3000');
});