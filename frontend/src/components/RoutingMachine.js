// 1. Imports at the very top
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import RoutingMachine from './RoutingMachine';

const DriverDashboard = () => {
    // 2. State is defined INSIDE the component
    const [position, setPosition] = useState([13.0827, 80.2707]);
    const [activeRequest, setActiveRequest] = useState(null);

    // ... useEffects and functions ...

    return (
        <div className="dashboard">
            {/* ... other UI ... */}
            <MapContainer center={position} zoom={13}>
                <TileLayer url="..." />
                
                {/* 3. RoutingMachine MUST be here, inside the MapContainer */}
                {activeRequest && (
                    <RoutingMachine 
                        start={position} 
                        end={[activeRequest.lat, activeRequest.lng]} 
                    />
                )}
                
                <Marker position={position} />
            </MapContainer>
        </div>
    );
};

export default DriverDashboard;