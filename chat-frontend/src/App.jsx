import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

export default function App() {
  const [room, setRoom] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setChat((prev) => [...prev, data]);
    });

    socket.on("message_history", (history) => {
      setChat(history);
    });

    socket.on("user_joined", (message) => {
      setChat((prev) => [...prev, { sender: "System", message }]);
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_history");
      socket.off("user_joined");
    };
  }, []);

  const joinRoom = () => {
    if (room !== "" && username !== "") {
      socket.emit("join_room", { room, username });
      setJoined(true);
    }
  };

  const sendMessage = () => {
    if (message.trim() !== "") {
      socket.emit("send_message", { room, message });
      setMessage("");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-xl font-bold text-center mb-4">Live Chat</h1>

        {!joined ? (
          <div className="space-y-3">
            <input
              className="w-full p-2 border rounded"
              type="text"
              placeholder="Enter your name"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              className="w-full p-2 border rounded"
              type="text"
              placeholder="Enter Room ID"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
            />
            <button
              className="w-full bg-blue-500 text-white py-2 rounded"
              onClick={joinRoom}
            >
              Join Room
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-60 overflow-y-auto border p-3 rounded bg-gray-50">
              {chat.map((msg, index) => (
                <p key={index} className="mb-1">
                  <strong>{msg.sender}:</strong> {msg.message}
                </p>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                className="flex-1 p-2 border rounded"
                type="text"
                placeholder="Type a message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <button
                className="bg-green-500 text-white py-2 px-4 rounded"
                onClick={sendMessage}
              >
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
