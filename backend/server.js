const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// UPDATED: Set CORS to "*" so your friend can connect from their system
app.use(cors({ origin: "*" })); 
app.use(express.json());

// 1. DATABASE CONNECTION (MongoDB Atlas)
// REPLACE 'YOUR_PASSWORD_HERE' with your actual database user password
const atlasURI = "mongodb+srv://Maclin:Maclinmac1122@cluster0.ilbpnxp.mongodb.net/emergencyDB?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(atlasURI)
    .then(() => console.log("✅ Connected to MongoDB ATLAS (Cloud)"))
    .catch(err => console.error("❌ Atlas Connection Error:", err));

// 2. USER SCHEMA
const User = mongoose.model('User', new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,
    role: String
}));

// 3. SIGNUP ROUTE
app.post('/api/signup', async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: "Success" });
    } catch (err) {
        console.error("Signup Error:", err);
        res.status(400).json({ error: "Email exists or DB error" });
    }
});

// 4. SOCKET SERVER SETUP
const server = http.createServer(app);
const io = new Server(server, {
    cors: { 
        origin: "*", // Allows your friend's React app to connect
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("⚡ New Connection:", socket.id);

    socket.on("update_driver_location", (data) => {
        socket.broadcast.emit("driver_moved", data);
    });

    socket.on("send_request_to_driver", (data) => {
        socket.broadcast.emit("incoming_request", { ...data, citizenSocketId: socket.id });
    });

    socket.on("disconnect", () => console.log("User disconnected"));
});

// 5. START SERVER
server.listen(3001, () => {
    console.log("🚀 Server is live on Port 3001");
    console.log("📡 Friend should connect using your IP or Ngrok URL");
});