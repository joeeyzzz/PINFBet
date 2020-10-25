const express = require("express")
const app = express()
const path=require('path')


app.use(express.static(path.join(__dirname, "public")))

app.listen(3000, () => {
    console.log("Servidor en puerto 3000")
})

/*
function Function(){
    location.href="Apuestas.html";
}



app.get('/', function(req, res) {
    res.redirect(307,'/apuestas');
});

app.post('/apuestas', function(req, res) {
    res.send('/apuestas page');
});
*/