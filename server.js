const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Import models
const authRoutes = require('./routes/auth');
const GroupMessage = require('./models/GroupMessage'); // Import GroupMessage model

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use(express.static('public'));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const rooms = ["devops", "cloud computing", "covid19", "sports", "nodeJS"];

// Object to track users typing in rooms
const usersTyping = {};

io.on('connection', (socket) => {
    console.log('New user connected');

    // User joins a room
    socket.on('joinRoom', ({ username, room }) => {
        if (!rooms.includes(room)) return;

        socket.join(room);
        socket.room = room;
        socket.username = username;

        console.log(`${username} joined ${room}`);
        io.to(room).emit('message', { user: username, text: `${username} joined the chat`, type: "join" });
    });

    // User leaves a room
    socket.on('leaveRoom', () => {
        if (socket.room) {
            io.to(socket.room).emit('message', { user: socket.username, text: `${socket.username} left the chat`, type: "leave" });

            socket.leave(socket.room);
            console.log(`${socket.username} left ${socket.room}`);

            socket.room = null;
        }
    });

    // User sends a message
    socket.on('chatMessage', ({ username, room, message }) => {
        if (!socket.room || socket.room !== room) return;

        // Store the message in MongoDB (GroupMessage model)
        const newMessage = new GroupMessage({
            from_user: username,
            room: room,
            message: message
        });

        newMessage.save()
            .then(() => {
                io.to(room).emit('message', { user: username, text: message, type: "message" });
                stopTyping(username, room);
            })
            .catch(err => console.error('Error saving message:', err));
    });

    // User starts typing
    socket.on('typing', ({ username, room }) => {
        if (!socket.room) return;
    
        if (!usersTyping[room]) {
            usersTyping[room] = new Set();
        }
        usersTyping[room].add(username);
        
        io.to(room).emit('typing', { users: Array.from(usersTyping[room]) });
    });
    

    // User stops typing
    socket.on('stopTyping', ({ username, room }) => {
        stopTyping(username, room);
    });

    function stopTyping(username, room) {
        if (!usersTyping[room]) return;

        usersTyping[room].delete(username);
        if (usersTyping[room].size === 0) {
            io.to(room).emit('stopTyping');
        } else {
            io.to(room).emit('typing', { users: Array.from(usersTyping[room]) });
        }
    }

    // User disconnects
    socket.on('disconnect', () => {
        if (socket.room) {
            io.to(socket.room).emit('message', { user: socket.username, text: `${socket.username} disconnected`, type: "leave" });
            stopTyping(socket.username, socket.room);
        }
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
