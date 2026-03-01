const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express(); // 1. Moved this UP so 'app' exists before we use it

// 2. Optimized CORS (One single definition for everything)
app.use(cors({ 
    origin: "*", 
    credentials: true 
})); 
app.use(express.json());

// 3. DATABASE CONNECTION
const atlasURI = "mongodb+srv://Maclin:Maclinmac1122@cluster0.ilbpnxp.mongodb.net/emergencyDB?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(atlasURI)
    .then(() => console.log("✅ Connected to MongoDB ATLAS (Cloud)"))
    .catch(err => console.error("❌ Atlas Connection Error:", err));

// 4. USER SCHEMA
const User = mongoose.model('User', new mongoose.Schema({
    fullName: String,
    email: { type: String, unique: true },
    phone: String,
    password: String,
    role: String
}));

// 5. HOME ROUTE (Fixes the "Cannot GET /" message)
app.get('/', (req, res) => {
    res.send("🚀 Emergency Backend is Live and Running!");
});

// 6. SIGNUP ROUTE
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

// 7. LOGIN ROUTE (Added this so your Login.js actually works!)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });
        if (user) {
            res.json({ message: "Login Successful", user });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

// 8. SOCKET SERVER SETUP
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
        socket.broadcast.emit("incoming_request", { ...data, citizenSocketId: socket.id });
    });

    socket.on("accept_request", (data) => {
        console.log("🚑 Driver accepted request. Sending info to citizen:", data.citizenSocketId);
        io.to(data.citizenSocketId).emit("driver_assigned", {
            driverName: data.driverName,
            driverPhone: data.driverPhone
        });
    });

    socket.on("disconnect", () => console.log("User disconnected"));
});

// 9. START SERVER
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server is running on port ${PORT}`);
});