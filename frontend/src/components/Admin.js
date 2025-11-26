import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const Admin = ({ onLogout, userRole }) => {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    skill: 'vocabulary'
  });
  const [feedback, setFeedback] = useState('');
  const [allQuestions, setAllQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('add');
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [users, setUsers] = useState([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);

  useEffect(() => {
    fetchSkills();
  }, []);

  useEffect(() => {
    if (activeTab === 'manage') {
      fetchAllQuestions();
    }

    if (activeTab === 'users') {
      fetchAllUsers();
    }

    if (activeTab === 'skills') {
      fetchSkills();
    }
  }, [activeTab]);

  const showFeedback = (message, isError = false) => {
    setFeedback({ message, isError });
    setTimeout(() => setFeedback(''), 3000);
  };

  const fetchSkills = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/skills`);
      setSkills(response.data);
      setFormData(prev => ({
        ...prev,
        skill: prev.skill || response.data[0] || 'vocabulary'
      }));
    } catch (error) {
      showFeedback('Error loading skills', true);
    }
  };

  const fetchAllQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/get-all-questions`);
      setAllQuestions(response.data);
    } catch (error) {
      showFeedback('Error loading questions', true);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    setIsUsersLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/api/admin/users`);
      setUsers(response.data);
    } catch (error) {
      showFeedback('Error loading users', true);
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.question.trim() || !formData.answer.trim()) {
      showFeedback('Please fill in all fields', true);
      return;
    }
    
    try {
      const response = await axios.post(`${API_BASE}/api/add-question`, formData);

      showFeedback('Question added successfully!');
      setFormData({ question: '', answer: '', skill: skills[0] || 'vocabulary' });
      if (activeTab === 'manage') {
        fetchAllQuestions(); // Refresh the list
      }
    } catch (error) {
      showFeedback(error.response?.data?.error || 'Error adding question', true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();

    if (!newSkill.trim()) {
      showFeedback('Please enter a skill name', true);
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/admin/add-skill`, { skill: newSkill });
      showFeedback('Skill added successfully!');
      setNewSkill('');
      fetchSkills();
    } catch (error) {
      showFeedback(error.response?.data?.error || 'Error adding skill', true);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/delete-question`, {
        question_id: questionId
      });
      showFeedback('Question deleted successfully!');
      fetchAllQuestions(); // Refresh the list
    } catch (error) {
      showFeedback(error.response?.data?.error || 'Error deleting question', true);
    }
  };

  const handleDeleteUser = async (username) => {
    if (!window.confirm(`Delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/admin/delete-user`, {
        username
      });
      showFeedback('User deleted successfully');
      fetchAllUsers();
    } catch (error) {
      showFeedback(error.response?.data?.error || 'Error deleting user', true);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <Link to="/admin" className="logo-link">
          <h1>Admin Panel</h1>
        </Link>
        <div>
          <Link to="/lesson" className="header-link">👀 View Student Area</Link>
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
      
      <div className="admin-content">
        <div className="admin-status">
          <p>✅ <strong>Admin Access Granted</strong> - Intelligent Tutoring System Management</p>
        </div>
        
        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            Add Questions
          </button>
          <button
            className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            Manage Questions
          </button>
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Manage Users
          </button>
          <button
            className={`tab-button ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            Skills
          </button>
        </div>

        {activeTab === 'add' && (
          <div className="tab-content">
            <h2>📝 Add New Question</h2>
            <p>Create new English learning content for the tutoring system.</p>
            
            <div className="admin-form">
              <form onSubmit={handleSubmit}>
                <div className="input-group">
                  <label htmlFor="skill">English Skill Category</label>
                  <select
                    id="skill"
                    name="skill"
                    value={formData.skill}
                    onChange={handleInputChange}
                  >
                    {(skills.length ? skills : ['vocabulary', 'grammar', 'reading_comprehension', 'spelling', 'writing']).map(
                      (skillKey) => (
                        <option key={skillKey} value={skillKey}>
                          {skillKey.replace(/_/g, ' ')}
                        </option>
                      )
                    )}
                  </select>
                </div>
                
                <div className="input-group">
                  <label htmlFor="question">Question</label>
                  <textarea
                    id="question"
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    placeholder="Enter a clear, educational question..."
                    rows="3"
                  />
                </div>
                
                <div className="input-group">
                  <label htmlFor="answer">Correct Answer</label>
                  <input
                    type="text"
                    id="answer"
                    name="answer"
                    value={formData.answer}
                    onChange={handleInputChange}
                    placeholder="Enter the correct answer..."
                  />
                </div>
                
                <button type="submit" className="btn btn-primary">
                  Add Question to System
                </button>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'manage' && (
          <div className="tab-content">
            <h2>🗂️ Question Management</h2>
            <p>Review and manage existing questions in the system.</p>
            
            {isLoading ? (
              <div className="loading">Loading questions...</div>
            ) : (
              <div className="questions-list">
                {allQuestions.length === 0 ? (
                  <p>No questions found in the system.</p>
                ) : (
                  allQuestions.map((question) => (
                    <div key={question.id} className="question-item">
                      <div className="question-header">
                        <span className="question-id">ID: {question.id}</span>
                        <span className="question-skill">{question.skill}</span>
                      </div>
                      <div className="question-content">
                        <p><strong>Q:</strong> {question.question}</p>
                        <p><strong>A:</strong> {question.answer}</p>
                      </div>
                      <div className="question-actions">
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          Delete Question
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="tab-content">
            <h2>👥 User Accounts</h2>
            <p>View and manage all registered accounts.</p>

            {isUsersLoading ? (
              <div className="loading">Loading users...</div>
            ) : (
              <div className="questions-list">
                {users.length === 0 ? (
                  <p>No users registered yet.</p>
                ) : (
                  users.map((user) => (
                    <div key={user.username} className="question-item">
                      <div className="question-header">
                        <span className="question-id">{user.username}</span>
                        <span className="question-skill">{user.role}</span>
                      </div>
                      <div className="question-content">
                        <p><strong>Name:</strong> {user.name || 'N/A'}</p>
                        <p><strong>Email:</strong> {user.email || 'N/A'}</p>
                        <p><strong>Level:</strong> {user.level}</p>
                      </div>
                      <div className="question-actions">
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteUser(user.username)}
                        >
                          Delete User
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="tab-content">
            <h2>🧠 Skills</h2>
            <p>Add new learning skills that questions can be mapped to.</p>

            <form className="admin-form" onSubmit={handleAddSkill}>
              <div className="input-group">
                <label htmlFor="newSkill">Skill Name</label>
                <input
                  id="newSkill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g. listening comprehension"
                />
              </div>
              <button type="submit" className="btn btn-primary">Add Skill</button>
            </form>

            <div className="skills-list" style={{ marginTop: '20px' }}>
              <h3>Available Skills</h3>
              {skills.length === 0 ? (
                <p>No skills found.</p>
              ) : (
                <div className="skill-tags">
                  {skills.map((skill) => (
                    <span key={skill} className="skill-tag">{skill.replace(/_/g, ' ')}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {feedback && (
          <div className="admin-feedback">
            <div className={`feedback-box ${feedback.isError ? 'incorrect' : 'correct'}`}>
              {feedback.message}
            </div>
          </div>
        )}
        
        <div className="admin-info">
          <h3>📊 System Status</h3>
          <p>✅ Backend API: Connected</p>
          <p>✅ Question Database: {allQuestions.length} questions loaded</p>
          <p>✅ Student Analytics: Active</p>
        </div>
      </div>
    </div>
  );
};

export default Admin;