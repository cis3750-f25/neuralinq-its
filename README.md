# Neuralinq Tutor - Intelligent Tutoring System

## 🎯 What This Project Is

This is a **full-stack intelligent tutoring system** we are building for the CIS\*3750 course. It's designed to teach Grade 2 English skills through adaptive learning - meaning it gets smarter about what questions to ask based on how well students are doing.

The system has two main users:
- **Students** who answer questions and track their progress
- **Admins** who can add new questions to expand the curriculum

## 🔄 **IMPORTANT: Fresh Start Instructions**

**If you just pulled this code and want to start with clean progress:**

1. **Option 1 - Use Settings (Recommended):**
   - Run the app: `npm start` (frontend) and `python app.py` (backend)
   - Login as student: `student/student`
   - Go to Settings → Click "Reset My Progress"

2. **Option 2 - Delete Data File:**
   - Delete `backend/data/student.json`
   - Restart the backend server
   - The system will create a fresh profile automatically

3. **Option 3 - Manual Reset:**
   - Open `backend/data/student.json`
   - Change all mastery values to `0.0`
   - Clear the badges array: `"badges": []`
   - Reset metrics to zero values

## 🏗️ Architecture Overview

We chose a **modern separation of concerns** approach:
- **React Frontend** (SPA - Single Page Application)
- **Python Flask Backend** (RESTful API)
- **JSON File Database** (Simple, but effective for this stage of the project)

This means the frontend and backend are completely separate, which makes the code cleaner and easier to maintain.

## 📁 Project Structure

```
neuralinq-its/
├── backend/                    # Python Flask API Server
│   ├── app.py                 # Main Flask application with all API endpoints
│   ├── data/                  # JSON "database" files
│   │   ├── domain.json        # All questions organized by skills
│   │   └── student.json       # Student profiles and progress data
│   ├── requirements.txt       # Python dependencies
│   └── .env.example          # Environment variables template
├── frontend/                   # React Single Page Application
│   ├── public/                # Static assets
│   │   ├── logo-normal.png.png    # Main logo
│   │   ├── logo-peeking.png.png   # Hover logo (fun easter egg)
│   │   └── index.html         # HTML template
│   ├── src/
│   │   ├── components/        # All React components
│   │   │   ├── Login.js       # Authentication page
│   │   │   ├── Lesson.js      # Main learning interface
│   │   │   ├── Profile.js     # Progress tracking page
│   │   │   ├── Settings.js    # User preferences
│   │   │   └── Admin.js       # Content management
│   │   ├── App.js            # Main app with routing logic
│   │   ├── App.css           # All styles including dark mode
│   │   └── index.js          # React entry point
│   ├── package.json          # Node.js dependencies
│   └── .env.example          # Frontend environment variables
├── docs/                      # Additional documentation
│   ├── API.md                # Complete API documentation
│   └── DEPLOYMENT.md         # Production deployment guide
├── setup.sh                   # Unix/Linux setup script
├── setup.bat                  # Windows setup script
├── package.json              # Root project configuration
├── .gitignore                # Git ignore rules
├── LICENSE                   # MIT License
├── CONTRIBUTING.md           # Contribution guidelines
└── README.md                 # This comprehensive guide
```

## 🧠 How the Intelligence Works

### Adaptive Learning Algorithm
The "intelligent" part happens in the `get-question` API endpoint:

1. **Check Student Mastery**: Look at current skill levels (0.0 to 1.0)
2. **Find Weak Areas**: Identify skills below 1.0 (not mastered)
3. **Prioritize Learning**: Pick a random unmastered skill to focus on
4. **Select Question**: Choose a random question from that skill area
5. **Update Progress**: When answered, adjust mastery (+0.25 correct, -0.1 wrong)

This ensures students spend time on skills they haven't mastered yet, rather than random questions.

### Data Flow Example

Student answers "cold" to "What's opposite of hot?" 
→ Frontend sends: {student_id: "student_alex", skill: "vocab_g2", is_correct: true}
→ Backend updates: vocab_g2 mastery from 0.25 to 0.50
→ Next question prioritizes skills still below 1.0


## 🚀 Getting Started (For New Developers)

### Prerequisites
You need these installed:
- **Python 3.12+** (for backend)
- **Node.js 16+** (for frontend)

### **Quick Setup & Startup (Recommended)**

#### For Windows
```bash
setup.bat
```

#### For Linux/Mac
```bash
./setup.sh
```

### **Manual Setup**
#### 1. Backend setup
```bash
cd backend
pip install -r requirements.txt
python app.py
```

#### 2. Frontend setup (new terminal)
```bash
cd frontend
npm install
npm start
```

**Backend runs on:** http://localhost:5000  
**Frontend runs on:** http://localhost:3000

#### 3. Test the System
1. Open http://localhost:3000
2. Try these login credentials:
   - **Student**: `student/student`
   - **Admin**: `admin/admin`

## 🔐 Authentication System

### How Login Works
We implemented a **simple but effective** authentication system:

```javascript
// In Login.js
if (username === 'admin' && password === 'admin') {
  onLogin('admin');  // Sets userRole to 'admin'
} else if (username === 'student' && password === 'student') {
  onLogin('student'); // Sets userRole to 'student'
}
```

### Role-Based Navigation
The app automatically routes users based on their role:
- **Admin login** → `/admin` (Content Management)
- **Student login** → `/lesson` (Learning Interface)

### Navigation Features I Added
- **Smart History Management**: Logout clears browser history to prevent "stuck" pages
- **Role Indicators**: Admin sees "Admin Mode" badge when viewing student areas
- **Cross-Navigation**: Admin can easily switch between admin and student views
- **Logout Confirmation**: Prevents accidental logouts

## 🎨 Frontend Architecture

### Component Structure
Each page is a **React functional component** with hooks:

```javascript
// Example component structure
const Lesson = ({ onLogout, userRole }) => {
  const [currentQuestion, setCurrentQuestion] = useState({});
  const [userAnswer, setUserAnswer] = useState('');
  
  // API calls with axios
  const getNextQuestion = async () => {
    const response = await axios.post('http://localhost:5000/api/get-question', {
      student_id: 'student_alex'
    });
    setCurrentQuestion(response.data);
  };
  
  return (/* JSX here */);
};
```

### State Management
We use **React hooks** for state management:
- `useState` for component state
- `useEffect` for side effects (API calls, animations)
- Props for passing data between components

### Styling Approach
**Single CSS file** (`App.css`) with:
- **CSS Variables** for dark mode theming
- **Responsive design** with media queries
- **Smooth animations** using CSS transitions
- **Component-specific classes** for organization

## 🔧 Backend Architecture

### API Design Philosophy
We built a **RESTful API** that's completely separate from the frontend:

```python
# Example endpoint structure
@app.route('/api/get-question', methods=['POST'])
def get_question():
    # 1. Get student data
    student_data = read_json_file(STUDENT_FILE)
    
    # 2. Apply learning algorithm
    unmastered_skills = [skill for skill, score in mastery.items() if score < 1.0]
    
    # 3. Return appropriate question
    return jsonify(selected_question)
```

### Data Storage Strategy
We chose **JSON files** over a database because:
- **Simplicity**: Easy to read and modify
- **Portability**: No database setup required
- **Transparency**: You can see exactly what data looks like
- **Perfect for Demo**: Handles multiple users for demonstration

### CORS Configuration
```python
from flask_cors import CORS
app = Flask(__name__)
CORS(app)  # Allows React (localhost:3000) to call API (localhost:5000)
```

## 🎯 Key Features Explained

### 1. Adaptive Learning Engine
**Location**: `backend/app.py` - `get_question()` function

**How it works**:
```python
# Find skills that need work
unmastered_skills = [skill for skill, score in mastery.items() if score < 1.0]

# Pick one to focus on
skill_to_teach = random.choice(unmastered_skills)

# Find questions for that skill
skill_questions = [q for q in all_questions if q['skill'] == skill_to_teach]
```

**Why this matters**: Students don't waste time on skills they've already mastered.

### 2. Real-Time Progress Tracking
**Location**: `frontend/src/components/Profile.js`

**Visual feedback**:
- Animated progress bars that fill based on mastery level
- Color-coded stats (Total Skills, Mastered, Average Progress)
- Smooth animations when progress updates

### 3. Dark Mode Implementation
**Location**: `frontend/src/App.css` + `Settings.js`

**How it works**:
```css
/* CSS Variables for theming */
body.dark-mode {
  --bg-color: #121212;
  --text-color: #e0e0e0;
  /* ... more variables */
}

/* Components use variables */
.app-container {
  background-color: var(--bg-color, #ffffff);
  color: var(--text-color, #333);
}
```

**Persistence**: Saves preference to `localStorage` so it remembers your choice.

### 4. Interactive Logo Easter Egg
**Location**: `frontend/src/components/Login.js`

**Features**:
- **Hover Effect**: Logo changes from normal to "peeking" version
- **Smooth Animations**: CSS transitions for professional feel

### 5. Admin Content Management
**Location**: `frontend/src/components/Admin.js` + backend API

**Workflow**:
1. Admin adds question through form
2. Frontend sends to `/api/add-question`
3. Backend validates and adds to `domain.json`
4. New question immediately available for students

## 🛠️ How to Modify and Extend

### Adding New Skills
1. **Add questions to backend**:
```python
# In backend/data/domain.json
{
  "id": 17,
  "skill": "math_g3",  # New skill category
  "question": "What is 12 + 8?",
  "answer": "20"
}
```

2. **Update student mastery tracking**:
```python
# In backend/data/student.json
"mastery": {
  "vocab_g2": 0.25,
  "grammar_g2": 0.1,
  "math_g3": 0.0  # Add new skill
}
```

### Adding New API Endpoints
```python
# In backend/app.py
@app.route('/api/your-new-endpoint', methods=['POST'])
def your_new_function():
    # Your logic here
    return jsonify({"success": True, "data": result})
```

### Adding New React Components
```javascript
// Create new file: frontend/src/components/YourComponent.js
import React, { useState } from 'react';

const YourComponent = ({ props }) => {
  const [state, setState] = useState('');
  
  return (
    <div className="your-component">
      {/* Your JSX */}
    </div>
  );
};

export default YourComponent;
```

### Modifying Styles
All styles are in `frontend/src/App.css`:
- **Dark mode**: Modify CSS variables in `body.dark-mode`
- **Responsive**: Update media queries at bottom
- **Animations**: Add new `@keyframes` rules
- **Components**: Add new classes following existing naming pattern

## 🐛 Common Issues and Solutions

### Backend Won't Start
```bash
# Check Python version
python --version  # Should be 3.12+

# Install dependencies
pip install flask flask-cors

# Check if port 5000 is free
# On Windows: netstat -an | findstr :5000
```

### Frontend Won't Start
```bash
# Check Node version
node --version  # Should be 16+

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### CORS Errors
Make sure:
1. Backend has `CORS(app)` enabled
2. Frontend API calls use correct URL: `http://localhost:5000`
3. Both servers are running simultaneously

### Navigation Issues
The app uses React Router. If you get stuck:
1. Check browser console for errors
2. Logout and login again (clears history)
3. Manually navigate to `http://localhost:3000`

## 📊 Data Structure Reference

### Student Data Format
```json
{
  "student_alex": {
    "name": "Alex Smith",
    "email": "student@test.com",
    "language_prefs": {
      "learn": "english",
      "ui": "english"
    },
    "mastery": {
      "vocab_g2": 0.75,    # 75% mastered
      "grammar_g2": 0.25   # 25% mastered
    }
  }
}
```

### Question Data Format
```json
{
  "questions": [
    {
      "id": 1,
      "skill": "vocab_g2",
      "question": "What is the opposite of 'hot'?",
      "answer": "cold"
    }
  ]
}
```

## 🚀 Deployment Considerations

### For Production Use
1. **Database**: Replace JSON files with PostgreSQL or MongoDB
2. **Authentication**: Implement JWT tokens and password hashing
3. **Environment Variables**: Use `.env` files for configuration
4. **Error Handling**: Add comprehensive error logging
5. **Testing**: Add unit tests for components and API endpoints

### Hosting Options
- **Frontend**: Netlify, Vercel, or GitHub Pages
- **Backend**: Heroku, Railway, or DigitalOcean
- **Database**: PostgreSQL on Heroku or MongoDB Atlas

## 🚀 Key Demo Walkthroughs

This project is designed to be demonstrated by showing 3 key user stories that cover all core functionality and address the project's primary goals.

### Walkthrough 1: The "Intelligent" Student Lesson (Adaptive Logic)

This walkthrough demonstrates the "intelligent" part of the ITS in action.

1. **Log In:** Log in as a student (e.g., `student/student`).
2. **Receive Question:** The `Lesson.js` component loads and calls the `/api/get-question` endpoint.
3. **Backend Logic:** The Flask backend checks the `student.json` file, identifies an unmastered skill (e.g., `vocab_g2`), and sends a question for that skill.
4. **Answer Incorrectly:** Answer the question *incorrectly*.
5. **See Feedback:** The frontend shows an "Incorrect" message. The backend updates the student's mastery score (e.g., `0.25` -> `0.15`).
6. **Receive New Question:** The frontend automatically requests a new question. The backend *again* sees that `vocab_g2` is unmastered and **prioritizes it**, sending a *different* question from that same skill.
7. **Answer Correctly:** Answer the new question *correctly*.
8. **See Feedback:** The frontend shows a "Correct!" message. The backend updates the mastery score (e.g., `0.15` -> `0.40`)

**What this proves:** The system is "intelligent" and meets the core requirement of prioritizing problems from concepts the student has not yet mastered.

### Walkthrough 2: The "Admin" Content Creation (System Growth)

This walkthrough demonstrates the solution to the "content creation" gap identified in the project feedback.

1. **Log In:** Log in as an admin (e.g., `admin/admin`).
2. **Navigate:** You are automatically taken to the `/admin` page.
3. **Create Question:** Fill out the "Content Management" form:
   - **Skill:** `vocab_g2` (Grade 2 Vocabulary)
   - **Question:** `What is the opposite of 'fast'?`
   - **Answer:** `slow`
4. **Save:** Click "Add Question".
5. **Backend Logic:** The `Admin.js` frontend sends the data to the `/api/add-question` endpoint. The Flask backend validates it and adds this new question object to the `domain.json` file.

**What this proves:** The system is not a static shell. It is a dynamic tool that an admin or instructor can actively grow and add new content to, which is essential for a real ITS.

### Walkthrough 3: The "Student" Progress Review (Visual Feedback)

This walkthrough demonstrates the "Student Model" and provides clear visual feedback to the user.

1. **Log In:** Log in as the *same student* from Walkthrough 1.
2. **Navigate:** Click on the "My Progress" link in the header.
3. **View Profile:** The `Profile.js` component loads and calls the `/api/get-progress` endpoint.
4. **See Mastery:** The page displays the student's "Skill Mastery," showing visual progress bars. The `vocab_g2` bar will show **40%** (or `0.40`), reflecting the progress made in the first walkthrough.

**What this proves:** The system correctly models, saves, and displays student progress over time. The "Student Model" (`student.json`) is persistent and directly connects the lesson experience to the progress review.

## 🎓 Learning Outcomes

This project demonstrates:
- **Full-Stack Development**: Separate frontend and backend
- **Modern React Patterns**: Hooks, routing, state management
- **RESTful API Design**: Clean, predictable endpoints
- **User Experience**: Responsive design, animations, accessibility
- **Software Architecture**: Component-based, maintainable code

## 📞 Support and Contact

If you're working with this code and need help: 

1. **Check the console**: Browser dev tools often show the issue
2. **Read error messages**: They usually tell you exactly what's wrong
3. **Test API endpoints**: Use Postman or browser to test backend directly
4. **Check network tab**: See if API calls are reaching the backend

If you need further help, create an issue on the GitHub repo and provide as much information as possible.

---

**Built with ❤️ for CIS\*3750 - KINGS CODE**
