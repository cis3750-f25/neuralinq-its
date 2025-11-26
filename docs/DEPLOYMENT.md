# Deployment Guide

## Development vs Production

This project is currently configured for **development**. For production deployment, several changes are recommended.

## Production Checklist

### Backend Changes
- [ ] Replace JSON files with a proper database (PostgreSQL, MongoDB)
- [ ] Add environment variable configuration
- [ ] Implement proper authentication (JWT tokens)
- [ ] Add password hashing (bcrypt)
- [ ] Add input validation and sanitization
- [ ] Add comprehensive error logging
- [ ] Add rate limiting
- [ ] Add HTTPS support
- [ ] Add database migrations

### Frontend Changes
- [ ] Build production bundle (`npm run build`)
- [ ] Configure environment variables for production API URL
- [ ] Add error boundaries for better error handling
- [ ] Optimize images and assets
- [ ] Add service worker for offline support
- [ ] Add analytics tracking (if needed)

### Security Considerations
- [ ] Enable CORS only for specific domains
- [ ] Add authentication middleware
- [ ] Validate all user inputs
- [ ] Add SQL injection protection (when using database)
- [ ] Add XSS protection
- [ ] Use HTTPS everywhere
- [ ] Add security headers

## Deployment Options

### Option 1: Heroku (Recommended for beginners)

#### Backend (Flask API)
```bash
# 1. Create Heroku app
heroku create your-app-name-backend

# 2. Add Python buildpack
heroku buildpacks:set heroku/python

# 3. Add environment variables
heroku config:set FLASK_ENV=production

# 4. Deploy
git push heroku main
```

#### Frontend (React App)
```bash
# 1. Build production bundle
npm run build

# 2. Deploy to Netlify or Vercel
# - Connect GitHub repository
# - Set build command: npm run build
# - Set publish directory: build
```

### Option 2: DigitalOcean/AWS

#### Backend Setup
```bash
# 1. Create Ubuntu server
# 2. Install Python and dependencies
sudo apt update
sudo apt install python3 python3-pip nginx

# 3. Clone repository
git clone your-repo-url
cd neuralinq-its/backend

# 4. Install dependencies
pip3 install -r requirements.txt

# 5. Configure Nginx
sudo nano /etc/nginx/sites-available/neuralinq-backend

# 6. Start with Gunicorn
pip3 install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

#### Frontend Setup
```bash
# 1. Build production bundle
npm run build

# 2. Serve with Nginx
sudo cp -r build/* /var/www/html/

# 3. Configure Nginx for React Router
sudo nano /etc/nginx/sites-available/neuralinq-frontend
```

### Option 3: Docker Deployment

#### Backend Dockerfile
```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5000

CMD ["python", "app.py"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:16-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
  
  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
```

## Environment Variables

### Backend (.env)
```bash
FLASK_ENV=production
DATABASE_URL=postgresql://user:pass@host:port/db
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
CORS_ORIGINS=https://your-frontend-domain.com
```

### Frontend (.env)
```bash
REACT_APP_API_BASE_URL=https://your-backend-domain.com
REACT_APP_ENV=production
```

## Database Migration

### From JSON to PostgreSQL
```python
# migration_script.py
import json
import psycopg2

# Read JSON data
with open('data/student.json') as f:
    students = json.load(f)

with open('data/domain.json') as f:
    domain = json.load(f)

# Connect to PostgreSQL
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

# Create tables
cur.execute("""
    CREATE TABLE students (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE,
        name VARCHAR(100),
        email VARCHAR(100),
        password_hash VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
    )
""")

cur.execute("""
    CREATE TABLE mastery (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES students(id),
        skill VARCHAR(50),
        score DECIMAL(3,2),
        updated_at TIMESTAMP DEFAULT NOW()
    )
""")

# Insert data
# ... migration logic here

conn.commit()
```

## Monitoring and Maintenance

### Logging
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s %(levelname)s %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
```

### Health Checks
```python
@app.route('/health')
def health_check():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    })
```

### Backup Strategy
- Database: Daily automated backups
- Files: Version control with Git
- Monitoring: Use services like Sentry for error tracking

## Performance Optimization

### Backend
- Use database connection pooling
- Add Redis for caching
- Implement pagination for large datasets
- Add database indexing

### Frontend
- Code splitting with React.lazy()
- Image optimization
- Bundle analysis and optimization
- CDN for static assets

## SSL/HTTPS Setup

### Let's Encrypt (Free)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Nginx Configuration
```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```