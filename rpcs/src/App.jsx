// App.jsx
import React from 'react';
import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NextClassProvider } from "./context/NextClassContext"; // Import the NextClassProvider
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Schedule from './pages/Schedule'; // Corrected path
import './styles/common.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NextClassProvider> {/* Wrap NextClassProvider inside Router */}
          <CssBaseline />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/schedule" element={<Schedule />} /> {/* Corrected path */}
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </NextClassProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
