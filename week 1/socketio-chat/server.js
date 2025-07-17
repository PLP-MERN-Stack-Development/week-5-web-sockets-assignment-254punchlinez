const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000', // React client URL
        methods: ['GET', 'POST'],
    },
});

// Track users and rooms
const onlineUsers = {};
const userRooms = {};

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('set_username', (username) => {
        socket.username = username;
        onlineUsers[socket.id] = username;
        console.log(`Username set: ${username}`);
        io.emit('online_users', Object.values(onlineUsers));
    });

    socket.on('join_room', (room) => {
        socket.join(room);
        userRooms[socket.id] = room;
        console.log(`${socket.username} joined room: ${room}`);
    });

    socket.on('send_message', (data) => {
        const timestamp = new Date().toLocaleTimeString();
        const messageData = {
            user: socket.username,
            message: data.message,
            timestamp,
        };

        if (data.to) {
            // Private message
            const recipientSocketId = Object.keys(onlineUsers).find(
                id => onlineUsers[id] === data.to
            );
            if (recipientSocketId) {
                messageData.private = true;
                messageData.to = data.to;
                io.to(recipientSocketId).emit('receive_message', messageData);
                socket.emit('receive_message', messageData);
                console.log(`Private message from ${socket.username} to ${data.to}: ${data.message}`);
            }
        } else if (data.room) {
            // Room message
            messageData.room = data.room;
            io.to(data.room).emit('receive_message', messageData);
            console.log(`Room message in ${data.room} from ${socket.username}: ${data.message}`);
        } else {
            // Public message
            io.emit('receive_message', messageData);
            console.log(`Public message from ${socket.username}: ${data.message}`);
        }
    });

    socket.on('typing', ({ isTyping, to, room }) => {
        if (to) {
            // Notify specific user
            const recipientSocketId = Object.keys(onlineUsers).find(
                id => onlineUsers[id] === to
            );
            if (recipientSocketId) {
                io.to(recipientSocketId).emit('user_typing', {
                    user: socket.username,
                    isTyping,
                });
            }
        } else if (room) {
            // Notify users in the room
            socket.to(room).emit('user_typing', {
                user: socket.username,
                isTyping,
            });
        } else {
            // Notify all users except the sender
            socket.broadcast.emit('user_typing', {
                user: socket.username,
                isTyping,
            });
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.username}`);
        delete onlineUsers[socket.id];
        delete userRooms[socket.id];
        io.emit('online_users', Object.values(onlineUsers));
    });
});

// Basic test endpoint
app.get('/', (req, res) => {
    res.send('Real-time Chat Server is running...');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
