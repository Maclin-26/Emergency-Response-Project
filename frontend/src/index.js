import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Polyfill to prevent 'process is not defined' error
window.process = { env: { NODE_ENV: 'development' } };

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <App />
);