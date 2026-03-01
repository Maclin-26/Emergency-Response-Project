import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { io } from 'socket.io-client';
import 'leaflet/dist/leaflet.css';
import './Dashboard.css';

// --- LEAFLET ICON FIX ---
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- TUNNEL URL ---
// Open your JS files and change this line:
const TUNNEL_URL = "https://bumpy-emus-throw.loca.lt";
const socket = io(TUNNEL_URL);

function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => { if (center) map.setView(center); }, [center]);
    return null;
}

const CitizenDashboard = () => {
    const [position, setPosition] = useState([13.0827, 80.2707]);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [activeRequestType, setActiveRequestType] = useState(null); // Tracks if we sent a request
    const [assignedDriver, setAssignedDriver] = useState(null); // Stores Real Driver Info

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
            (err) => console.error(err),
            { enableHighAccuracy: true }
        );

        // LISTEN FOR DRIVER ACCEPTANCE
        socket.on("driver_assigned", (data) => {
            console.log("Driver details received:", data);
            setAssignedDriver(data); 
            setActiveRequestType(null); // Stop showing the "Searching" loader
        });

        return () => { socket.off("driver_assigned"); };
    }, []);

    const handleRequest = (type) => {
        socket.emit("send_request_to_driver", {
            type: type,
            lat: position[0],
            lng: position[1],
            location: "Live Location"
        });
        setActiveRequestType(type); // Set which type we are currently searching for
    };

    return (
        <div className={`dashboard-wrapper ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
            <nav className="navbar">
                <div className="logo">SmartResponse AI</div>
                <button className="logout-btn" onClick={() => window.location.href='/'}>Logout</button>
            </nav>

            <div className="main-content">
                <header className="hero-section">
                    <h1>Emergency Command Center</h1>
                </header>

                {/* --- 1. ACTIVE BOOKING SECTION (Shows when Driver accepts) --- */}
                {assignedDriver && (
                    <div className="driver-contact-banner">
                        <div className="banner-content">
                            <div className="status-indicator">✅ BOOKED</div>
                            <div className="driver-details">
                                <h3>{assignedDriver.driverName} is responding!</h3>
                                <p className="phone-display">📞 {assignedDriver.driverPhone}</p>
                            </div>
                            <div className="banner-actions">
                                <button className="call-now-btn" onClick={() => window.open(`tel:${assignedDriver.driverPhone}`)}>
                                    Call Driver
                                </button>
                                <button className="dismiss-btn" onClick={() => setAssignedDriver(null)}>Done</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- 2. SEARCHING SECTION (Shows while waiting) --- */}
                {activeRequestType && !assignedDriver && (
                    <div className="searching-banner">
                        <div className="loader-small"></div>
                        <p>Searching for nearest <strong>{activeRequestType}</strong>...</p>
                        <button className="cancel-small" onClick={() => setActiveRequestType(null)}>Cancel</button>
                    </div>
                )}

                {/* --- 3. THE ACTION GRID (Always visible now) --- */}
                <div className="action-grid">
                    <div className="action-card ambulance" onClick={() => handleRequest("Ambulance")}>
                        <div className="icon">🚨</div>
                        <h3>Request Ambulance</h3>
                    </div>
                    <div className="action-card fire" onClick={() => handleRequest("Firetruck")}>
                        <div className="icon">🔥</div>
                        <h3>Request Firetruck</h3>
                    </div>
                    <div className="action-card police" onClick={() => handleRequest("Police")}>
                        <div className="icon">🚔</div>
                        <h3>Request Police</h3>
                    </div>
                </div>

                <div className="map-container">
                    <MapContainer center={position} zoom={15} style={{ height: '400px', width: '100%' }}>
                        <TileLayer url={isDarkMode ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"} />
                        <ChangeView center={position} />
                        <Marker position={position}><Popup>You are here</Popup></Marker>
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default CitizenDashboard;