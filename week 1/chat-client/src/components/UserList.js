// components/UserList.js
import React from 'react';

function UserList({ onlineUsers, recipient, setRecipient, username }) {
    return (
        <div className="user-list">
            <h3>Online Users</h3>
            <ul>
                {onlineUsers.map((user) => (
                    <li
                        key={user}
                        className={user === recipient ? "selected" : user === username ? "you" : ""}
                        style={{
                            fontWeight: user === username ? 'bold' : 'normal',
                            cursor: user !== username ? 'pointer' : 'default',
                            color: user === recipient ? 'blue' : 'black'
                        }}
                        onClick={() => user !== username && setRecipient(user)}
                    >
                        {user} {user === username && '(You)'}
                    </li>
                ))}
            </ul>
            <button className="everyone-btn" onClick={() => setRecipient('')}>Send to Everyone</button>
            {recipient && <div className="recipient-label">Sending to: {recipient}</div>}
        </div>
    );
}

export default UserList;
