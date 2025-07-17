// components/ChatWindow.js
import React from 'react';

function ChatWindow({ messages, typingUser, username }) {
    return (
        <div className="chat-window">
            {messages.map(msg => (
                <div
                    className={`msg${msg.private ? " private" : msg.room ? " room" : ""}`}
                    key={msg.timestamp} // Assuming timestamp is unique for each message
                >
                    <strong>
                        {msg.private
                            ? `${msg.user} ➔ ${msg.to} (private)`
                            : msg.room
                            ? `[${msg.room}] ${msg.user}`
                            : msg.user}
                        :
                    </strong> {msg.message}
                    <span className="timestamp">({msg.timestamp})</span>
                </div>
            ))}
            {typingUser && <div className="typing">{typingUser}</div>}
        </div>
    );
}

export default ChatWindow;