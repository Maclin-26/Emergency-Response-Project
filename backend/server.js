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
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    console.log("⚡ New Connection:", socket.id);

    socket.on("update_driver_location", (data) => {
        socket.broadcast.emit("driver_moved", data);
    });

    socket.on("send_request_to_driver", (data) => {
        // We attach the citizen's socket ID so the driver knows who to reply to
        socket.broadcast.emit("incoming_request", { ...data, citizenSocketId: socket.id });
    });

    // --- NEW LOGIC: PASS REAL DRIVER INFO TO CITIZEN ---
    socket.on("accept_request", (data) => {
        console.log("🚑 Driver accepted request. Sending info to citizen:", data.citizenSocketId);
        
        // This sends the driver's real name and phone only to the citizen who requested it
        io.to(data.citizenSocketId).emit("driver_assigned", {
            driverName: data.driverName,
            driverPhone: data.driverPhone
        });
    });

    socket.on("disconnect", () => console.log("User disconnected"));
});

// 5. START SERVER
server.listen(3001, () => {
    console.log("🚀 Server is live on Port 3001");
    console.log("📡 Friend should connect using your IP or Ngrok URL");
});