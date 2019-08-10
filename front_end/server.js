const express = require("express");
const app = express();
//const server = require('http').Server(app); WORKING SERVER
const PORT = process.env.PORT || 3231;
const server = app.listen(PORT, ()=> {console.log("Server connected")});
const io = module.exports.io = require('socket.io')(server);


const path = require('path');
const INDEX = path.join(__dirname, '/build/index.html');

app.use( express.static(__dirname + '/build'))

app.get('/*', (req, res) => {
    res.sendFile(INDEX);
});
//establishing a connection to the client
io.on('connection', (client) => {
    console.log("Client connected")
    //checking if the client's command is pause
    client.on('pause', (command) => {

        //sending to all other users that the command is now pause
        client.broadcast.emit('command', 'pause')
    })
    client.on('play', (command) => {
        client.broadcast.emit('command', 'play');
    })
});
