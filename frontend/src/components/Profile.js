import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const Profile = ({ onLogout, userRole }) => {
  const [masteryData, setMasteryData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProgress = async () => {
    try {
      const response = await axios.post(`${API_BASE}/api/get-progress`, {
        student_id: 'student_alex'
      });
      setMasteryData(response.data);
    } catch (error) {
      console.error('Error loading progress:', error);
      setError('Error loading progress data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="lesson-content">
          <p>Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container">
        <div className="lesson-content">
          <p className="incorrect">{error}</p>
        </div>
      </div>
    );
  }

  const skills = Object.keys(masteryData);
  const totalSkills = skills.length;
  const masteredSkills = skills.filter(skill => masteryData[skill] >= 1.0).length;
  const averageProgress = totalSkills > 0 ? 
    Math.round((Object.values(masteryData).reduce((a, b) => a + b, 0) / totalSkills) * 100) : 0;



  return (
    <div className="app-container">
      <header className="app-header">
        <Link to="/lesson" className="logo-link">
          <h1>My Progress</h1>
        </Link>
        <div>
          <Link to="/lesson" className="header-link">📚 Lessons</Link>
          <Link to="/results" className="header-link">📋 Results</Link>
          <Link to="/badges" className="header-link">🏆 Badges</Link>
          <Link to="/metrics" className="header-link">📈 Metrics</Link>
          <Link to="/settings" className="header-link settings-icon">⚙️</Link>
          {userRole === 'admin' && (
            <Link to="/admin" className="header-link admin-link">🔧 Admin Panel</Link>
          )}
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to log out?')) {
                onLogout();
              }
            }} 
            className="header-link logout-btn"
          >
            🚪 Logout
          </button>
        </div>
      </header>
      
      <div className="profile-content">
        <h2>🌟 Your Learning Journey</h2>
        <p>Track your progress across different skills. Each bar shows how close you are to mastering that skill!</p>
        
        <div className="skill-stats">
          <div className="stat-card">
            <div className="stat-number">{totalSkills}</div>
            <div className="stat-label">Total Skills</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{masteredSkills}</div>
            <div className="stat-label">Mastered</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{averageProgress}%</div>
            <div className="stat-label">Average Progress</div>
          </div>
        </div>
        
        <div className="progress-bars-container">
          {Object.entries(masteryData).map(([skill, masteryScore]) => {
            const percentage = Math.round(masteryScore * 100);
            const skillName = skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            
            return (
              <div key={skill} className="progress-bar-group">
                <div className="progress-label">
                  <span>{skillName}</span>
                  <span className="progress-percentage">{percentage}%</span>
                </div>
                <div className="progress-bar-background">
                  <div 
                    className="progress-bar-foreground" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Profile;