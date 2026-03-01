import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { io } from 'socket.io-client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Dashboard.css';

const socket = io("https://emergency-backend-maclin.onrender.com");

// --- CUSTOM ICONS ---
const ambulanceIcon = L.divIcon({
    html: `<div class="ambulance-marker">🚑</div>`,
    className: 'custom-marker',
    iconSize: [40, 40]
});

function ChangeView({ center }) {
    const map = useMap();
    useEffect(() => { if (center) map.setView(center); }, [center, map]);
    return null;
}

const BookingPage = () => {
    const [userLoc, setUserLoc] = useState([13.0827, 80.2707]);
    const [driverLoc, setDriverLoc] = useState(null);
    const [bookingStatus, setBookingStatus] = useState('searching'); // 'searching', 'confirmed', 'cancelled'
    
    useEffect(() => {
        // 1. Get User Location
        navigator.geolocation.getCurrentPosition((pos) => {
            setUserLoc([pos.coords.latitude, pos.coords.longitude]);
        });

        // 2. Listen for Driver (Your Friend)
        socket.on("driver_moved", (data) => {
            setDriverLoc([data.lat, data.lng]);
            if (bookingStatus === 'searching') {
                // Auto-confirm if a driver is found during search
                setBookingStatus('confirmed');
            }
        });

        return () => socket.off("driver_moved");
    }, [bookingStatus]);

    const handleCancel = () => {
        if (window.confirm("Are you sure you want to cancel the emergency request?")) {
            setBookingStatus('cancelled');
            window.location.href = '/citizen-dashboard';
        }
    };

    return (
        <div className="dashboard-wrapper dark-theme">
            <div className="booking-container">
                
                {/* 1. TOP STATUS BAR */}
                <div className="booking-card header-card">
                    <button className="back-btn" onClick={() => window.history.back()}>←</button>
                    <div className="status-info">
                        <h2>{bookingStatus === 'confirmed' ? "Ambulance En Route" : "Finding Best Route..."}</h2>
                        <p className="pulse-text">{bookingStatus === 'confirmed' ? "ETA: 4 Mins" : "Locating nearby responders..."}</p>
                    </div>
                </div>

                {/* 2. THE TRACKING MAP */}
                <div className="map-section">
                    <MapContainer center={userLoc} zoom={15} style={{ height: '400px', width: '100%' }}>
                        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                        <ChangeView center={userLoc} />
                        
                        <Marker position={userLoc}><Popup>Emergency Location</Popup></Marker>

                        {driverLoc && (
                            <>
                                <Marker position={driverLoc} icon={ambulanceIcon}>
                                    <Popup>Responder SR-102</Popup>
                                </Marker>
                                <Polyline positions={[userLoc, driverLoc]} color="#00f2fe" weight={3} dashArray="10, 10" />
                            </>
                        )}
                    </MapContainer>
                </div>

                {/* 3. BOOKING OPTIONS PANEL */}
                <div className="booking-card controls-panel">
                    <div className="driver-profile">
                        <div className="driver-avatar">👨‍⚕️</div>
                        <div className="details">
                            <h3>Paramedic Unit #SR-102</h3>
                            <p>Verify Code: <span className="highlight">4492</span></p>
                        </div>
                    </div>

                    <div className="button-group">
                        <button className="call-driver-btn" onClick={() => window.open('tel:911')}>
                            📞 Call Driver
                        </button>
                        <button className="cancel-request-btn" onClick={handleCancel}>
                            Cancel Request
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;