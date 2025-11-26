import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const Lesson = ({ onLogout, userRole, studentId }) => {
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
  const [skillLessons, setSkillLessons] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [skillLoadError, setSkillLoadError] = useState('');
  const [diagnosticQuestions, setDiagnosticQuestions] = useState([]);
  const [diagnosticIndex, setDiagnosticIndex] = useState(0);
  const [diagnosticResponses, setDiagnosticResponses] = useState([]);
  const [diagnosticAnswer, setDiagnosticAnswer] = useState('');
  const [diagnosticComplete, setDiagnosticComplete] = useState(userRole === 'admin');
  const [diagnosticLoading, setDiagnosticLoading] = useState(false);
  const [diagnosticError, setDiagnosticError] = useState('');
  const [recommendedLessons, setRecommendedLessons] = useState([]);

  const activeStudentId = studentId || 'student_alex';

  const formatSkillName = (skillKey) =>
    skillKey
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

  const fetchSkillLessons = async () => {
    setIsLoadingSkills(true);
    setSkillLoadError('');
    try {
      const response = await axios.get(`${API_BASE}/api/skill-lessons`);
      setSkillLessons(response.data);
    } catch (error) {
      console.error('Error loading skills and lessons', error);
      setSkillLoadError('Unable to load skills right now.');
    } finally {
      setIsLoadingSkills(false);
    }
  };

  const startDiagnostic = async () => {
    if (userRole === 'admin') {
      setDiagnosticComplete(true);
      return;
    }

    setDiagnosticLoading(true);
    setDiagnosticError('');
    try {
      const response = await axios.post(`${API_BASE}/api/diagnostic/start`, {
        student_id: activeStudentId
      });
      const questions = response.data.questions || [];
      setDiagnosticQuestions(questions);
      setDiagnosticIndex(0);
      setDiagnosticResponses([]);
      setRecommendedLessons([]);
      if (questions.length === 0) {
        setDiagnosticComplete(true);
      }
    } catch (error) {
      console.error('Error starting diagnostic:', error);
      setDiagnosticError('Could not start diagnostic. You can still pick a skill to begin.');
      setDiagnosticComplete(true);
    } finally {
      setDiagnosticLoading(false);
    }
  };

  const submitDiagnosticResponses = async (responses) => {
    try {
      const response = await axios.post(`${API_BASE}/api/diagnostic/submit`, {
        student_id: activeStudentId,
        responses
      });
      setRecommendedLessons(response.data.recommended_lessons || []);

      // Auto-jump to the first recommended lesson if available
      const firstRecommendation = (response.data.recommended_lessons || [])[0];
      if (firstRecommendation) {
        setSelectedSkill(firstRecommendation.skill);
        setSelectedLesson(firstRecommendation.lesson);
      }
    } catch (error) {
      console.error('Error submitting diagnostic:', error);
    } finally {
      setDiagnosticComplete(true);
    }
  };

  const getNextQuestion = async () => {
    if (!selectedSkill || !selectedLesson) return;

    setIsLoading(true);
    setFeedback('');
    setUserAnswer('');
    setCurrentHint('');
    setHintsUsed(0);
    setWrongAttempts(0);

    try {
      const response = await axios.post(`${API_BASE}/api/get-question`, {
        student_id: activeStudentId,
        skill: selectedSkill,
        lesson: selectedLesson.id
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
        student_id: activeStudentId,
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
          student_id: activeStudentId,
          skill: currentQuestion.skill,
          lesson: currentQuestion.lesson,
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
            student_id: activeStudentId,
            skill: currentQuestion.skill,
            lesson: currentQuestion.lesson,
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

  const handleSkillSelect = (skillKey) => {
    setSelectedSkill(skillKey);
    setSelectedLesson(null);
    setCurrentQuestion({});
  };

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
  };

  const handleDiagnosticSubmit = (e) => {
    e.preventDefault();

    const currentDiagnostic = diagnosticQuestions[diagnosticIndex];
    if (!currentDiagnostic || !diagnosticAnswer.trim()) return;

    const isCorrect =
      diagnosticAnswer.toLowerCase().trim() === currentDiagnostic.answer.toLowerCase();

    const newResponses = [
      ...diagnosticResponses,
      {
        question_id: currentDiagnostic.id,
        skill: currentDiagnostic.skill,
        lesson: currentDiagnostic.lesson,
        is_correct: isCorrect
      }
    ];

    setDiagnosticResponses(newResponses);
    setDiagnosticAnswer('');

    const hasMore = diagnosticIndex + 1 < diagnosticQuestions.length;
    if (hasMore) {
      setDiagnosticIndex((prev) => prev + 1);
    } else {
      submitDiagnosticResponses(newResponses);
    }
  };

  const lessonsForSelectedSkill = skillLessons.find((item) => item.skill === selectedSkill)?.lessons || [];
  const currentDiagnosticQuestion = diagnosticQuestions[diagnosticIndex] || null;

  useEffect(() => {
    fetchSkillLessons();
    startDiagnostic();

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

  useEffect(() => {
    if (selectedLesson) {
      getNextQuestion();
    }
  }, [selectedLesson]);

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
        {!diagnosticComplete && (
          <div className="diagnostic-card">
            <div className="skill-grid__header">
              <h2>Quick skill check</h2>
              <span className="skill-subtext">We’ll tune lessons to your level.</span>
            </div>
            {diagnosticError && <p className="incorrect" role="alert">{diagnosticError}</p>}
            {diagnosticLoading ? (
              <p>Preparing your starter questions...</p>
            ) : currentDiagnosticQuestion ? (
              <>
                <p className="skill-subtext">
                  Skill: {formatSkillName(currentDiagnosticQuestion.skill)}
                </p>
                <p>{currentDiagnosticQuestion.question}</p>
                <form className="answer-box" onSubmit={handleDiagnosticSubmit}>
                  <input
                    type="text"
                    value={diagnosticAnswer}
                    onChange={(e) => setDiagnosticAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    disabled={diagnosticLoading}
                  />
                  <div className="button-group">
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!diagnosticAnswer.trim()}
                    >
                      {diagnosticIndex + 1 === diagnosticQuestions.length ? 'Finish Check' : 'Next Question'}
                    </button>
                  </div>
                </form>
                <p className="skill-subtext">
                  Question {diagnosticIndex + 1} of {diagnosticQuestions.length}
                </p>
              </>
            ) : (
              <p>We could not load a starter question. You can begin by choosing a skill.</p>
            )}
          </div>
        )}

        {diagnosticComplete && (
          <>
            {recommendedLessons.length > 0 && (
              <div className="recommend-banner">
                <div>
                  <h2>Recommended starting points</h2>
                  <p className="skill-subtext">Based on your answers, start here.</p>
                </div>
                <div className="skills-list skills-list--vertical">
                  {recommendedLessons.map(({ skill, lesson }) => (
                    <button
                      key={`${skill}-${lesson.id}`}
                      className="skill-tag skill-tag--card"
                      onClick={() => {
                        setSelectedSkill(skill);
                        setSelectedLesson(lesson);
                      }}
                    >
                      <span className="skill-name">{formatSkillName(skill)}</span>
                      <span className="skill-subtext">{lesson.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!selectedSkill && (
              <div className="skill-grid">
                <h2>Choose a skill to practice</h2>
                {skillLoadError && <p className="incorrect" role="alert">{skillLoadError}</p>}
                {isLoadingSkills ? (
                  <p>Loading skills...</p>
                ) : (
                  <div className="skills-list skills-list--vertical">
                    {skillLessons.map(({ skill, lessons }) => (
                      <button
                        key={skill}
                        className="skill-tag skill-tag--card"
                        onClick={() => handleSkillSelect(skill)}
                      >
                        <span className="skill-name">{formatSkillName(skill)}</span>
                        <span className="skill-subtext">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedSkill && !selectedLesson && (
              <div className="skill-grid">
                <div className="skill-grid__header">
                  <h2>{formatSkillName(selectedSkill)} lessons</h2>
                  <button className="btn btn-secondary" onClick={() => setSelectedSkill('')}>← All skills</button>
                </div>
                {lessonsForSelectedSkill.length === 0 ? (
                  <p>No lessons yet for this skill.</p>
                ) : (
                  <div className="skills-list skills-list--vertical">
                    {lessonsForSelectedSkill.map((lesson) => (
                      <button
                        key={lesson.id}
                        className="skill-tag skill-tag--card"
                        onClick={() => handleLessonSelect(lesson)}
                      >
                        <span className="skill-name">{lesson.title}</span>
                        <span className="skill-subtext">{lesson.description}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedLesson && (
              <>
                <div id="question-card">
                  <div className="breadcrumb">
                    <button className="btn btn-secondary" onClick={() => setSelectedLesson(null)}>← Lessons</button>
                    <span className="skill-subtext">{formatSkillName(selectedSkill)} • {selectedLesson.title}</span>
                  </div>
                  <h2>
                    {currentQuestion.skill
                      ? `Skill: ${formatSkillName(currentQuestion.skill)}`
                      : 'Loading...'}
                  </h2>
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
              </>
            )}
          </>
        )}
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
