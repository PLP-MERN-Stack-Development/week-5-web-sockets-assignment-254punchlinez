// Step 3 implementation: Improved UI with components without breaking Step 2 functionality
// Folder structure:
// src/
//   App.js
//   components/ChatWindow.js
//   components/MessageInput.js
//   components/UserList.js
//   components/RoomJoiner.js

// == App.js ==
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import UserList from './components/UserList';
import RoomJoiner from './components/RoomJoiner';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const socket = io('http://localhost:5000');

function App() {
    const [username, setUsername] = useState('');
    const [isUsernameSet, setIsUsernameSet] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [typingUser, setTypingUser] = useState('');
    const [recipient, setRecipient] = useState('');
    const [currentRoom, setCurrentRoom] = useState('global');
    const [newRoom, setNewRoom] = useState('');

    useEffect(() => {
        socket.on('receive_message', (data) => {
            setMessages(prev => [...prev, data]);
        });

        socket.on('online_users', (users) => {
            setOnlineUsers(users);
        });

        socket.on('user_typing', ({ user, isTyping }) => {
            setTypingUser(isTyping ? `${user} is typing...` : '');
        });

        socket.on('user_joined', (user) => {
            toast.info(`${user} joined the chat.`);
        });

        socket.on('user_left', (user) => {
            toast.info(`${user} left the chat.`);
        });

        return () => {
            socket.off('receive_message');
            socket.off('online_users');
            socket.off('user_typing');
            socket.off('user_joined');
            socket.off('user_left');
        };
    }, []);

    const handleUsernameSubmit = (e) => {
        e.preventDefault();
        if (username.trim() !== '') {
            socket.emit('set_username', username);
            setIsUsernameSet(true);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
            <ToastContainer position="top-right" autoClose={3000} />

            {!isUsernameSet ? (
                <form onSubmit={handleUsernameSubmit} className="username-form bg-white p-6 rounded shadow w-full max-w-sm">
                    <h2 className="text-xl font-semibold mb-4">Enter Username</h2>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Your username"
                        className="border p-2 w-full rounded mb-4"
                    />
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">Join Chat</button>
                </form>
            ) : (
                <div className="w-full max-w-2xl space-y-4">
                    <h2 className="text-2xl font-bold text-center">Real-Time Chat</h2>
                    <p className="text-center"><strong>Current Room:</strong> {currentRoom}</p>

                    <RoomJoiner
                        newRoom={newRoom}
                        setNewRoom={setNewRoom}
                        setCurrentRoom={setCurrentRoom}
                        socket={socket}
                    />

                    <UserList
                        onlineUsers={onlineUsers}
                        username={username}
                        recipient={recipient}
                        setRecipient={setRecipient}
                    />

                    <div className="chat-container">
                      <ChatWindow
                          messages={messages}
                          typingUser={typingUser}
                      />

                      <MessageInput
                          message={message}
                          setMessage={setMessage}
                          socket={socket}
                          recipient={recipient}
                          currentRoom={currentRoom}
                      />
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;