import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ComponentDemoPage from './pages/ComponentDemoPage';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(true); // Default to demo mode for testing

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
              <DashboardPage
                isDemoMode={isDemoMode}
                onLogout={handleLogout}
              />
            }
          />
          <Route
            path="/components"
            element={<ComponentDemoPage />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;