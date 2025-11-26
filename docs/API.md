# API Documentation

## Base URL
```
http://localhost:5000
```

## Authentication
Currently uses simple username/password authentication. No tokens required for API calls.

## Endpoints

### Student Learning Endpoints

#### GET /api/get-question
Get the next question for a student based on their mastery levels.

**Request Body:**
```json
{
  "student_id": "student_alex"
}
```

**Response:**
```json
{
  "id": 1,
  "skill": "vocab_g2",
  "question": "What is the opposite of 'hot'?",
  "answer": "cold"
}
```

#### POST /api/submit-answer
Submit an answer and update student mastery.

**Request Body:**
```json
{
  "student_id": "student_alex",
  "skill": "vocab_g2",
  "is_correct": true
}
```

**Response:**
```json
{
  "success": true,
  "new_mastery": {
    "vocab_g2": 0.5,
    "grammar_g2": 0.25
  }
}
```

### Student Progress Endpoints

#### POST /api/get-progress
Get student's current mastery levels.

**Request Body:**
```json
{
  "student_id": "student_alex"
}
```

**Response:**
```json
{
  "vocab_g2": 0.75,
  "grammar_g2": 0.25
}
```

#### GET /api/student-data
Get complete student profile data.

**Response:**
```json
{
  "name": "Alex Smith",
  "email": "student@test.com",
  "language_prefs": {
    "learn": "english",
    "ui": "english"
  },
  "mastery": {
    "vocab_g2": 0.75,
    "grammar_g2": 0.25
  }
}
```

### Settings Endpoints

#### POST /api/update-profile
Update student profile information.

**Request Body:**
```json
{
  "student_id": "student_alex",
  "name": "New Name",
  "email": "new@email.com"
}
```

#### POST /api/update-password
Update student password (simulation).

**Request Body:**
```json
{
  "student_id": "student_alex",
  "password": "newpassword123"
}
```

#### POST /api/update-language
Update language preferences.

**Request Body:**
```json
{
  "student_id": "student_alex",
  "learn_lang": "english",
  "ui_lang": "spanish"
}
```

### Admin Endpoints

#### POST /api/add-question
Add a new question to the system (Admin only).

**Request Body:**
```json
{
  "skill": "vocab_g2",
  "question": "What is the opposite of 'fast'?",
  "answer": "slow"
}
```

**Response:**
```json
{
  "success": true,
  "new_question": {
    "id": 17,
    "skill": "vocab_g2",
    "question": "What is the opposite of 'fast'?",
    "answer": "slow"
  }
}
```

## Error Responses

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (missing/invalid data)
- `404` - Not Found (student not found)
- `500` - Internal Server Error

Error response format:
```json
{
  "error": "Error message description"
}
```

## Skills Reference

Current skill categories:
- `vocab_g2` - Grade 2 Vocabulary
- `grammar_g2` - Grade 2 Grammar
- `reading_g2` - Grade 2 Reading
- `math_g2` - Grade 2 Math

## Mastery Scoring

- Range: 0.0 to 1.0
- Correct answer: +0.25
- Incorrect answer: -0.1
- Mastered: >= 1.0
- Unmastered: < 1.0