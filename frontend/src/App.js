import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Lesson from './components/Lesson';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Admin from './components/Admin';
import Badges from './components/Badges';
import Metrics from './components/Metrics';
import Results from './components/Results';
import './App.css';

// Main App Component
function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('student');
  const [studentId, setStudentId] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [key, setKey] = useState(0); // Force re-render key

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  const handleLogin = (role, id) => {
    console.log('Login attempt with role:', role, 'id:', id);
    setIsLoggedIn(true);
    setUserRole(role);
    setStudentId(id);
    setKey(prev => prev + 1); // Force fresh routing

    // Clear any existing navigation history
    window.history.replaceState(null, '', '/');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('student');
    setStudentId('');
    setKey(prev => prev + 1); // Force fresh routing

    // Clear browser history and go to root
    window.history.replaceState(null, '', '/');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);

    if (newDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="App" key={key}>
      <Routes>
        <Route
          path="/"
          element={
            userRole === 'admin' ?
              <Navigate to="/admin" replace /> :
              <Navigate to="/lesson" replace />
          }
        />
        <Route
          path="/lesson"
          element={<Lesson onLogout={handleLogout} userRole={userRole} studentId={studentId} />}
        />
        <Route
          path="/profile"
          element={<Profile onLogout={handleLogout} userRole={userRole} studentId={studentId} />}
        />
        <Route
          path="/settings"
          element={
            <Settings
              onLogout={handleLogout}
              darkMode={darkMode}
              toggleDarkMode={toggleDarkMode}
              userRole={userRole}
              studentId={studentId}
            />
          }
        />
        <Route
          path="/admin"
          element={<Admin onLogout={handleLogout} userRole={userRole} />}
        />
        <Route
          path="/badges"
          element={<Badges onLogout={handleLogout} userRole={userRole} studentId={studentId} />}
        />
        <Route
          path="/metrics"
          element={<Metrics onLogout={handleLogout} userRole={userRole} studentId={studentId} />}
        />
        <Route
          path="/results"
          element={<Results onLogout={handleLogout} userRole={userRole} studentId={studentId} />}
        />
        {/* Catch all route - redirect based on role */}
        <Route
          path="*"
          element={
            userRole === 'admin' ?
              <Navigate to="/admin" replace /> :
              <Navigate to="/lesson" replace />
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;