// 🚀 Real-Time Chat App with Socket.io and React
// Fully structured starter you can paste and build progressively
// This will help you complete your Socket.io real-time chat project cleanly.

// ========================== //
// 1️⃣ SERVER SIDE (server/index.js)
// ========================== //

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // React dev server
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.get('/', (req, res) => {
  res.send('Server is running 🚀');
});

const users = {}; // track online users

io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('join', (username) => {
    users[socket.id] = username;
    io.emit('onlineUsers', Object.values(users));
    io.emit('notification', `${username} joined the chat.`);
  });

  socket.on('sendMessage', (data) => {
    io.emit('receiveMessage', {
      user: users[socket.id],
      message: data.message,
      timestamp: new Date()
    });
  });

  socket.on('typing', (isTyping) => {
    socket.broadcast.emit('typing', { user: users[socket.id], isTyping });
  });

  socket.on('disconnect', () => {
    io.emit('notification', `${users[socket.id]} left the chat.`);
    delete users[socket.id];
    io.emit('onlineUsers', Object.values(users));
    console.log('❌ User disconnected:', socket.id);
  });
});

server.listen(5000, () => console.log('🚀 Server running on http://localhost:5000'));

// ========================== //
// 2️⃣ CLIENT SIDE (React) 
// Create a new React app using Vite or CRA:
// npm create vite@latest client --template react
// cd client
// npm install socket.io-client
// ========================== //

// src/App.jsx
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);

  const handleJoin = () => {
    if (username.trim() !== '') {
      socket.emit('join', username);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() !== '') {
      socket.emit('sendMessage', { message });
      setMessage('');
    }
  };

  useEffect(() => {
    socket.on('receiveMessage', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    socket.on('notification', (note) => {
      setMessages((prev) => [...prev, { user: 'System', message: note, timestamp: new Date() }]);
    });

    socket.on('typing', ({ user, isTyping }) => {
      setTypingStatus(isTyping ? `${user} is typing...` : '');
    });

    socket.on('onlineUsers', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('notification');
      socket.off('typing');
      socket.off('onlineUsers');
    };
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h2>🚀 Real-Time Chat App</h2>

      {!username ? (
        <div>
          <input
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button onClick={handleJoin}>Join Chat</button>
        </div>
      ) : (
        <div>
          <h4>Online: {onlineUsers.join(', ')}</h4>
          <div style={{ border: '1px solid #ddd', padding: 10, height: 300, overflowY: 'scroll' }}>
            {messages.map((msg, index) => (
              <div key={index}>
                <strong>{msg.user}:</strong> {msg.message}{' '}
                <small>{new Date(msg.timestamp).toLocaleTimeString()}</small>
              </div>
            ))}
          </div>
          <p>{typingStatus}</p>
          <input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              socket.emit('typing', e.target.value.length > 0);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      )}
    </div>
  );
}

export default App;

// ========================== //
// 3️⃣ Package.json Scripts
// ========================== //
// In server/package.json add:
// "scripts": {
//   "dev": "nodemon index.js"
// }
//
// In client/package.json add:
// "scripts": {
//   "dev": "vite"
// }
//
// ========================== //
// 4️⃣ Running the App
// ========================== //
// In one terminal:
// cd server
// npm install
// npm run dev
//
// In another terminal:
// cd client
// npm install
// npm run dev
//
// Open http://localhost:5173 in your browser.

// You now have a **real-time chat application using Socket.io** with:
// ✅ Live messaging
// ✅ Online user tracking
// ✅ Notifications on join/leave
// ✅ Typing indicators
// ✅ Responsive React front end

// You can progressively add advanced features like private messaging, read receipts, reactions, and file sharing on top of this clean structured base for your assignment.
