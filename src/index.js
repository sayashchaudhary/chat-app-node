require('dotenv').config();
const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const path = require('path');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('../src/utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server)

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New websocket connection');

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });

        if (error) {
            return callback(error)
        }

        socket.join(user.room);

        socket.emit('message', generateMessage('Welcome'));

        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`));

        callback()
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed')
        }
        io.to('abcd').emit('message', generateMessage(message));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left`))
        }
    });

    socket.on('sendLocation', (coords, callback) => {
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    });
});

server.listen(port, () => {
    console.log(`Server is running on ${port}`)
})
