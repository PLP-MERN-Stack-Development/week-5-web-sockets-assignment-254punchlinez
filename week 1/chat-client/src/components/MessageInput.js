// components/MessageInput.js
import React from 'react';

function MessageInput({ message, setMessage, socket, recipient, currentRoom }) {
    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        // Send private, room, or public message
        if (recipient) {
            socket.emit('send_message', { message, to: recipient });
        } else if (currentRoom && currentRoom !== 'global') {
            socket.emit('send_message', { message, room: currentRoom });
        } else {
            socket.emit('send_message', { message });
        }
        setMessage('');
        socket.emit('typing', { isTyping: false, to: recipient, room: currentRoom });
    };

    const handleTyping = (e) => {
        setMessage(e.target.value);
        socket.emit('typing', { isTyping: true, to: recipient, room: currentRoom });
    };

    return (
        <form onSubmit={handleSend} className="message-input-form">
            <input
                type="text"
                value={message}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="message-input-box"
            />
            <button type="submit" className="message-send-btn">Send</button>
        </form>
    );
}

export default MessageInput;
