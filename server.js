var express = require('express')

var app = express()
var server = app.listen(3000)

app.use(express.static('public'))

var socket = require('socket.io');

var io = socket(server)

io.on('connection', function (socket) {
    console.log('made socket connection');
    socket.on('getBikeData', function (data) {
        socket.broadcast.emit('sendBikeData', data)
    });
});
