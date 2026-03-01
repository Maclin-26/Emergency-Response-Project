import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import './Dashboard.css';

// --- FIX FOR LEAFLET DEFAULT ICONS ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- UPDATED: USE YOUR https://emergency-backend-maclin.onrender.comTUNNEL URL HERE ---
// Open your JS files and change this line:
const API_URL = "https://emergency-backend-maclin.onrender.com";
// ✅ RIGHT: You must define the variable name first
const TUNNEL_URL = "https://emergency-backend-maclin.onrender.com";
function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.setView(center);
    }, [center, map]);
    return null;
}

const DriverDashboard = () => {
    const [position, setPosition] = useState([13.0827, 80.2707]); // Default center
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [requests, setRequests] = useState([]); 
    const [activeRequest, setActiveRequest] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [status, setStatus] = useState("Available");

    // --- PLACEHOLDER FOR REAL DRIVER INFO ---
    // In a real app, you would get this from https://emergency-backend-maclin.onrender.comStorage or your Login state
    const driverInfo = {
        fullName: "Maclin", 
        phone: "+91 98765 43210"
    };

    const darkTiles = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    const lightTiles = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    useEffect(() => {
        socket.on("connect", () => console.log("Driver Connected via https://emergency-backend-maclin.onrender.comtunnel"));

        socket.on("incoming_request", (data) => {
            const newReq = { ...data, id: Date.now() };
            setRequests((prev) => [...prev, newReq]);
            setNotifications((prev) => [`🚨 New ${data.type} request!`, ...prev]);
        });

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition([latitude, longitude]);
                socket.emit("update_driver_location", { lat: latitude, lng: longitude });
            },
            (err) => console.error("GPS Error:", err),
            { enableHighAccuracy: true }
        );

        return () => {
            socket.off("incoming_request");
            navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    const acceptRequest = (req) => {
        setActiveRequest(req);
        setStatus("On Mission");
        setNotifications([`Accepted ${req.type} request`, ...notifications]);
        setRequests(requests.filter(r => r.id !== req.id));
        
        // --- UPDATED: SEND REAL DATA TO SERVER ---
        socket.emit("accept_request", { 
            citizenSocketId: req.citizenSocketId,
            driverName: driverInfo.fullName,
            driverPhone: driverInfo.phone
        });
    };

    const rejectRequest = (id) => {
        setNotifications(["Request Rejected", ...notifications]);
        setRequests(requests.filter(r => r.id !== id));
    };

    const completeMission = () => {
        setNotifications(["Mission Completed ✅", ...notifications]);
        setActiveRequest(null);
        setStatus("Available");
    };

    return (
        <div className={`dashboard-wrapper ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
            <nav className="navbar">
                <div className="logo">SmartResponse AI - Driver</div>
                <div className="nav-controls">
                    <button 
                        className="notification-btn"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        🔔 Notifications {notifications.length > 0 && `(${notifications.length})`}
                    </button>

                    <button className="theme-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
                        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>

                    <button className="logout-btn" onClick={() => window.location.href='/'}>
                        Logout
                    </button>
                </div>
            </nav>

            {showNotifications && (
                <div className="notification-panel">
                    <h3>🔔 Notifications</h3>
                    {notifications.length === 0 ? (
                        <p className="no-notification">No Notifications</p>
                    ) : (
                        notifications.map((note, index) => (
                            <div key={index} className="notification-item">
                                {note}
                            </div>
                        ))
                    )}
                </div>
            )}

            <div className="main-content">
                <header className="hero-section">
                    <h1>Responder Control Panel</h1>
                </header>

                <div className="status-section">
                    <h2>Current Status: <span className="status-text">{status}</span></h2>
                </div>

                {activeRequest && (
                    <div className="active-card">
                        <h3>🚨 Active Emergency</h3>
                        <p><strong>Type:</strong> {activeRequest.type}</p>
                        <p><strong>Location:</strong> {activeRequest.location || "GPS Coordinates"}</p>
                        <button className="complete-btn" onClick={completeMission}>
                            Mark as Completed
                        </button>
                    </div>
                )}

                <div className="requests-section">
                    <h2>🚑 Available Emergency Requests</h2>
                    <div className="request-grid">
                        {requests.length === 0 ? (
                            <p>No pending requests. Waiting for live emergencies...</p>
                        ) : (
                            requests.map(req => (
                                <div key={req.id} className="request-card">
                                    <h3>{req.type}</h3>
                                    <p>{req.location || "Nearby"}</p>
                                    <div className="btn-group">
                                        <button className="accept-btn" onClick={() => acceptRequest(req)}>Accept</button>
                                        <button className="reject-btn" onClick={() => rejectRequest(req.id)}>Reject</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="map-container">
                    <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer url={isDarkMode ? darkTiles : lightTiles} />
                        <ChangeView center={position} />
                        <Marker position={position}>
                            <Popup>Your Location (Ambulance)</Popup>
                        </Marker>

                        {activeRequest && (
                            <Marker position={[activeRequest.lat || position[0], activeRequest.lng || position[1]]}>
                                <Popup>EMERGENCY HERE</Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;