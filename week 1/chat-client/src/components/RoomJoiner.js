// components/RoomJoiner.js
import React from 'react';

function RoomJoiner({ newRoom, setNewRoom, setCurrentRoom, socket }) {
    const handleJoin = (e) => {
        e.preventDefault();
        if (!newRoom.trim()) return;
        socket.emit('join_room', newRoom);
        setCurrentRoom(newRoom);
        setNewRoom('');
    };

    return (
        <form onSubmit={handleJoin} className="room-joiner-form">
            <input
                type="text"
                value={newRoom}
                onChange={e => setNewRoom(e.target.value)}
                placeholder="Enter room name"
                className="room-joiner-input"
            />
            <button className="room-joiner-btn">Join Room</button>
        </form>
    );
}

export default RoomJoiner;