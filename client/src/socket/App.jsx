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
