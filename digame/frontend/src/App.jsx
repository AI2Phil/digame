import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const handleDemoAccess = () => {
    setIsDemoMode(true);
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsDemoMode(false);
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              <HomePage 
                onDemoAccess={handleDemoAccess}
                onLogin={handleLogin}
              />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              (isAuthenticated || isDemoMode) ? (
                <DashboardPage 
                  isDemoMode={isDemoMode}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate to="/" replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;