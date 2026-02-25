import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';

// Point these to the components folder
import Login from './components/Login'; 
import CitizenDashboard from './components/CitizenDashboard';
import DriverDashboard from './components/DriverDashboard';
import BookingPage from './components/BookingPage'; // Added import for the booking/tracking page

const CLIENT_ID = "268754477257-fi0uevasi9r6d1ria4siojolnp0pg13u.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/citizen-dashboard" element={<CitizenDashboard />} />
          <Route path="/driver-dashboard" element={<DriverDashboard />} />
          {/* New route for tracking the ambulance booking */}
          <Route path="/track-ambulance" element={<BookingPage />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;