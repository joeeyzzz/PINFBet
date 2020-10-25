//BACKEND
//Listener, aquí descargaremos todas las rutas que tiene nuestra página web y atenderemos las solicitudes del cliente.

const http = require('http');

const server = http.createServer((req,res) => {
   
    if (req.url === '/'){
        res.write('Bienvenido a PINFBET');
        res.end();
    }
});

server.listen(3000);

console.log('Escuchando en el puerto 3000...');
