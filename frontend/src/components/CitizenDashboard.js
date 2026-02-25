import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom'; // Import navigate hook
import L from 'leaflet';
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

// Helper to handle map centering
function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
}

const CitizenDashboard = () => {
    const navigate = useNavigate(); // Initialize navigate
    const [position, setPosition] = useState([40.7128, -74.0060]);
    const [isDarkMode, setIsDarkMode] = useState(true); // Default to Dark

    // TILE URLS
    const darkTiles = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    const lightTiles = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
            (err) => console.error(err),
            { enableHighAccuracy: true }
        );
    }, []);

    return (
        <div className={`dashboard-wrapper ${isDarkMode ? 'dark-theme' : 'light-theme'}`}>
            <nav className="navbar">
                <div className="logo">SmartResponse AI</div>
                <div className="nav-controls">
                    {/* THEME TOGGLE BUTTON */}
                    <button className="theme-btn" onClick={() => setIsDarkMode(!isDarkMode)}>
                        {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                    </button>
                    <button className="logout-btn" onClick={() => window.location.href='/'}>Logout</button>
                </div>
            </nav>

            <div className="main-content">
                <header className="hero-section">
                    <h1>Emergency Command</h1>
                </header>

                <div className="action-grid">
                    <div className="action-card ambulance">
                        <div className="icon">🚨</div>
                        {/* Added onClick to navigate to tracking page */}
                        <button 
                            className="neon-button medical-btn"
                            onClick={() => navigate('/track-ambulance')}
                        >
                            Request Ambulance
                        </button>
                    </div>
                    <div className="action-card fire">
                        <div className="icon">🔥</div>
                        <button className="neon-button fire-btn">Request Firetruck</button>
                    </div>
                    <div className="action-card police">
                        <div className="icon">🚔</div>
                        <button className="neon-button police-btn">Request Police</button>
                    </div>
                </div>
                
                <div className="map-container">
                    <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
                        {/* URL SWAPS BASED ON STATE */}
                        <TileLayer url={isDarkMode ? darkTiles : lightTiles} />
                        <ChangeView center={position} />
                        <Marker position={position}>
                            <Popup>You are here</Popup>
                        </Marker>
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default CitizenDashboard;