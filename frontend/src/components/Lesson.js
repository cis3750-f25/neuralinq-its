import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const Lesson = ({ onLogout, userRole }) => {
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentHint, setCurrentHint] = useState('');
  const [hintsUsed, setHintsUsed] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [newBadges, setNewBadges] = useState([]);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const getNextQuestion = async () => {
    setIsLoading(true);
    setFeedback('');
    setUserAnswer('');
    setCurrentHint('');
    setHintsUsed(0);
    setWrongAttempts(0);
    
    try {
      const response = await axios.post(`${API_BASE}/api/get-question`, {
        student_id: 'student_alex'
      });
      setCurrentQuestion(response.data);
    } catch (error) {
      console.error('Error fetching question:', error);
      setFeedback('Error loading question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getHint = async () => {
    if (!currentQuestion.id) return;
    
    try {
      const response = await axios.post(`${API_BASE}/api/get-hint`, {
        student_id: 'student_alex',
        question_id: currentQuestion.id
      });
      
      setCurrentHint(response.data.hint);
      setHintsUsed(response.data.hints_used);
      
      if (response.data.is_answer) {
        // Auto-move to next question after showing answer
        setTimeout(() => {
          getNextQuestion();
        }, 3000);
      }
    } catch (error) {
      console.error('Error getting hint:', error);
      setCurrentHint('No more hints available.');
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!currentQuestion.id || !userAnswer.trim()) return;
    
    setIsSubmitting(true);
    
    const isCorrect = userAnswer.toLowerCase().trim() === currentQuestion.answer.toLowerCase();
    
    if (isCorrect) {
      setFeedback('🎉 Excellent! You got it right!');
      createConfetti();
      
      try {
        // Send result to backend
        const response = await axios.post(`${API_BASE}/api/submit-answer`, {
          student_id: 'student_alex',
          skill: currentQuestion.skill,
          question_id: currentQuestion.id,
          is_correct: true
        });
        
        // Check for new badges
        if (response.data.new_badges && response.data.new_badges.length > 0) {
          setNewBadges(response.data.new_badges);
          setShowBadgeModal(true);
        }
      } catch (error) {
        console.error('Error submitting answer:', error);
      }
      
      // Get next question after delay
      setTimeout(() => {
        setIsSubmitting(false);
        getNextQuestion();
      }, 3000);
    } else {
      const newWrongAttempts = wrongAttempts + 1;
      setWrongAttempts(newWrongAttempts);
      
      if (newWrongAttempts >= 3) {
        // After 3 wrong attempts, submit as incorrect and move on
        setFeedback(`🤔 The correct answer was: ${currentQuestion.answer}`);
        
        try {
          await axios.post(`${API_BASE}/api/submit-answer`, {
            student_id: 'student_alex',
            skill: currentQuestion.skill,
            question_id: currentQuestion.id,
            is_correct: false
          });
        } catch (error) {
          console.error('Error submitting answer:', error);
        }
        
        setTimeout(() => {
          setIsSubmitting(false);
          getNextQuestion();
        }, 3000);
      } else {
        setFeedback(`🤔 Not quite right. Try again! (${newWrongAttempts}/3 attempts)`);
        setUserAnswer('');
        setIsSubmitting(false);
      }
    }
  };

  const createConfetti = () => {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c'];
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'fixed';
      confetti.style.left = Math.random() * 100 + 'vw';
      confetti.style.top = '-10px';
      confetti.style.width = '10px';
      confetti.style.height = '10px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.borderRadius = '50%';
      confetti.style.pointerEvents = 'none';
      confetti.style.zIndex = '1000';
      confetti.style.animation = `fall ${Math.random() * 2 + 1}s linear forwards`;
      document.body.appendChild(confetti);

      setTimeout(() => confetti.remove(), 3000);
    }
  };

  useEffect(() => {
    getNextQuestion();
    
    // Add CSS for confetti animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fall {
        to {
          transform: translateY(100vh) rotate(360deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => style.remove();
  }, []);

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <Link to="/lesson" className="logo-link">
            <h1>Grade 2 Lessons</h1>
          </Link>
          {userRole === 'admin' && <span className="role-badge">Admin Mode</span>}
        </div>
        <div>
          <Link to="/profile" className="header-link">My Progress</Link>
          <Link to="/results" className="header-link">📋 Results</Link>
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
      
      <div className="lesson-content">
        <div id="question-card">
          <h2>{currentQuestion.skill ? `Skill: ${currentQuestion.skill.replace('_', ' ').toUpperCase()}` : 'Loading...'}</h2>
          <p>
            {isLoading ? 'Loading your next question...' : currentQuestion.question}
          </p>
          
          {currentHint && (
            <div className="hint-box">
              <p><strong>💡 Hint:</strong> {currentHint}</p>
            </div>
          )}
        </div>
        
        <form className="answer-box" onSubmit={handleSubmitAnswer}>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here..."
            disabled={isSubmitting || isLoading}
          />
          <div className="button-group">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting || isLoading || !userAnswer.trim()}
            >
              {isSubmitting ? 'Checking...' : 'Submit'}
            </button>
            
            {wrongAttempts > 0 && hintsUsed < 3 && !isSubmitting && (
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={getHint}
                disabled={isLoading}
              >
                Get Hint ({hintsUsed}/3)
              </button>
            )}
          </div>
        </form>
        
        <div id="feedback-box">
          {feedback && (
            <p className={feedback.includes('🎉') ? 'correct' : 'incorrect'}>
              {feedback}
            </p>
          )}
        </div>
      </div>

      {/* Badge Modal */}
      {showBadgeModal && (
        <div className="modal-overlay" onClick={() => setShowBadgeModal(false)}>
          <div className="badge-modal" onClick={(e) => e.stopPropagation()}>
            <h2>🎉 New Badge Earned!</h2>
            {newBadges.map((badge, index) => (
              <div key={index} className="new-badge">
                <div className="badge-icon">{badge.icon}</div>
                <div className="badge-info">
                  <h3>{badge.name}</h3>
                  <p>{badge.description}</p>
                </div>
              </div>
            ))}
            <button 
              className="btn btn-primary"
              onClick={() => setShowBadgeModal(false)}
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lesson;