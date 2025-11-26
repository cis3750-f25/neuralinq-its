# Contributing to Neuralinq ITS

Thank you for your interest in contributing to the Neuralinq Intelligent Tutoring System!

## Getting Started

1. **Fork the repository** and clone it locally
2. **Run the setup script**: `./setup.sh` (Linux/Mac) or `setup.bat` (Windows)
3. **Start development servers**: See README.md for detailed instructions

## Development Workflow

### Backend Changes (Python/Flask)
- All backend code is in `/backend/`
- API endpoints are in `app.py`
- Data files are in `/backend/data/`
- Test your changes by running `python app.py`

### Frontend Changes (React)
- All frontend code is in `/frontend/src/`
- Components are in `/frontend/src/components/`
- Styles are in `/frontend/src/App.css`
- Test your changes with `npm start`

## Code Style Guidelines

### Python (Backend)
- Follow PEP 8 style guidelines
- Use descriptive function and variable names
- Add docstrings to all functions
- Keep functions focused and small

### JavaScript/React (Frontend)
- Use functional components with hooks
- Follow React best practices
- Use descriptive component and prop names
- Keep components focused and reusable

### CSS
- Use CSS variables for theming
- Follow BEM naming convention when possible
- Ensure responsive design (mobile-first)
- Test dark mode compatibility

## Adding New Features

### New Skills/Question Types
1. Add questions to `/backend/data/domain.json`
2. Update student mastery tracking in `/backend/data/student.json`
3. Test with both student and admin workflows

### New API Endpoints
1. Add endpoint to `/backend/app.py`
2. Follow RESTful conventions
3. Add proper error handling
4. Update frontend to use new endpoint

### New React Components
1. Create component in `/frontend/src/components/`
2. Follow existing naming patterns
3. Add proper prop validation
4. Ensure accessibility compliance

## Testing

### Manual Testing
Follow the demo walkthroughs in README.md:
1. Student learning workflow
2. Admin content creation
3. Progress tracking

### Before Submitting
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] All demo walkthroughs work
- [ ] Dark mode functions properly
- [ ] Mobile responsive design works
- [ ] No console errors in browser

## Submitting Changes

1. **Create a feature branch**: `git checkout -b feature/your-feature-name`
2. **Make your changes** following the guidelines above
3. **Test thoroughly** using the manual testing checklist
4. **Commit with clear messages**: `git commit -m "Add: new vocabulary skill type"`
5. **Push to your fork**: `git push origin feature/your-feature-name`
6. **Create a Pull Request** with a clear description of changes

## Project Structure

```
neuralinq-its/
├── backend/              # Python Flask API
├── frontend/             # React application
├── setup.sh/.bat        # Setup scripts
├── package.json         # Root project configuration
└── README.md           # Main documentation
```

## Questions or Issues?

- Check the README.md for comprehensive documentation
- Look at existing code for patterns and examples
- Create an issue for bugs or feature requests
- Follow the demo walkthroughs to understand the system

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Maintain the educational nature of this project

Thank you for contributing to Neuralinq ITS!