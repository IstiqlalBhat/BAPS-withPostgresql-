# BBAPS v2.0 - Quick Start Guide

Get BBAPS up and running in 10 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 12+ installed and running
- Git (optional)

## Step 1: Setup Backend (5 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Edit `.env` with your PostgreSQL credentials:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bbaps_db
DB_USER=postgres
DB_PASSWORD=your_password
```

**Create database:**
```bash
# In PostgreSQL terminal:
CREATE DATABASE bbaps_db;
```

**Start backend:**
```bash
npm run dev
```

✅ Backend running on http://localhost:5000

## Step 2: Setup Frontend (3 minutes)

**In a new terminal:**

```bash
# Go to project root
cd ..

# Install dependencies
npm install

# Create environment file (if not exists)
cp .env.example .env

# Start frontend
npm start
```

✅ Frontend running on http://localhost:3000

## Step 3: First Login (2 minutes)

### Option A: Create New Account

1. Click "Register" on the login page
2. Choose role: Subcontractor or General Contractor
3. Fill in your details
4. Click "Register"

### Option B: Use Test Accounts

After running `npm run db:seed` in backend:

**General Contractor:**
- Email: gc@example.com
- Password: password123

**Subcontractor:**
- Email: sc@example.com
- Password: password123

## API Documentation

Visit http://localhost:5000/api/docs for interactive API documentation.

## Common Commands

### Backend

```bash
# Development server with auto-reload
npm run dev

# Run migrations (create database tables)
npm run db:migrate

# Seed database with sample data
npm run db:seed

# Reset database (warning: deletes all data)
npm run db:reset
```

### Frontend

```bash
# Development server
npm start

# Production build
npm run build

# Run tests
npm run test
```

## Typical Workflows

### General Contractor: Create Project & Find Matches

1. **Login** as GC (email: gc@example.com)
2. Go to **"Create Project"** (via /project route)
3. Fill in project details:
   - Project Code
   - Location
   - Work Type
   - Schedule
   - Costs
4. Optionally **import BIM data** from CSV
5. Go to **"View Matches"** (via /getSortedMatch route)
6. See list of matching subcontractors ranked by score
7. **Select Winner** to finalize

### Subcontractor: Register & Get Matched

1. **Register** new account as SUBCONTRACTOR
2. Go to **"Register Availability"** (via / route)
3. Fill in:
   - Availability dates
   - Location
   - Work type
   - Costs per sqm
4. System automatically matches you to projects
5. GC will rate your performance (via /trustfactor route)
6. **Track your trust score** via profile

## Troubleshooting

### "Cannot connect to database"
```bash
# Check PostgreSQL is running
# In PostgreSQL: SELECT 1;

# Verify credentials in .env match your setup
```

### "Port 5000 already in use"
```bash
# Change PORT in backend/.env to 5001
# Or kill process using port 5000
```

### "Module not found"
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### "Frontend can't reach API"
```bash
# Check:
# 1. Backend is running (http://localhost:5000)
# 2. Frontend .env has: REACT_APP_API_URL=http://localhost:5000/api
# 3. No CORS errors in browser console
```

## File Structure

```
BBAPS/
├── backend/              # Node.js/Express server
│   ├── models/          # Database models
│   ├── routes/          # API endpoints
│   └── server.js        # Entry point
├── src/                 # React frontend
│   ├── components/      # React components
│   ├── services/        # API client
│   ├── context/         # Auth context
│   └── App.js           # Main app
├── public/              # Static files
├── SETUP.md             # Detailed setup guide
├── IMPLEMENTATION_SUMMARY.md  # Full documentation
└── package.json         # Frontend dependencies
```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bbaps_db
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## API Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"gc@example.com","password":"password123"}'
```

### Get User Profile
```bash
curl http://localhost:5000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### List Projects
```bash
curl http://localhost:5000/api/projects
```

See http://localhost:5000/api/docs for all endpoints.

## Next Steps

1. **Create test data**
   - Register GC and SC accounts
   - Create projects
   - Register SC availability

2. **Test matching**
   - As GC, view matches
   - As SC, see which projects match you

3. **Test winner selection**
   - As GC, select winning SC
   - Check ProjectWinners table

4. **Set trust factors**
   - As GC, rate SC performance
   - Watch trust scores change

## Resources

- **API Docs**: http://localhost:5000/api/docs
- **Full Setup**: See SETUP.md
- **Implementation Details**: See IMPLEMENTATION_SUMMARY.md
- **Code Examples**: Check route files in backend/routes/

## Getting Help

1. Check the troubleshooting section above
2. Review error messages in:
   - Browser console (F12)
   - Backend terminal output
   - logs/error.log file

3. Check API documentation at:
   - http://localhost:5000/api/docs

## What's New in v2.0

✨ **Replaced:**
- Smart contracts → PostgreSQL database
- MetaMask → Email/password authentication
- On-chain storage → Relational database
- Web3.js calls → REST API

✨ **Added:**
- User registration system
- Dashboard with statistics
- Protected routes
- Token-based authentication
- Comprehensive API documentation
- Advanced matching algorithm
- Complete audit trail

## You're Ready!

Your BBAPS v2.0 instance is now running. Start by:

1. Opening http://localhost:3000 in your browser
2. Registering as a General Contractor or Subcontractor
3. Exploring the features
4. Reading SETUP.md for detailed information

Happy building! 🚀
