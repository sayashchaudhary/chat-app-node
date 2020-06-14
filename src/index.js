require('dotenv').config();
const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketio(server)

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New websocket connection');

    socket.emit('message', 'Welcome');

    socket.broadcast.emit('message', 'A new user has joined');

    socket.on('sendMessage', (message) => {
        io.emit('message', message)
    });

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left')
    });

    socket.on('sendLocation', (coords) => {
        io.emit('message', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
    });
});

server.listen(port, () => {
    console.log(`Server is running on ${port}`)
})
