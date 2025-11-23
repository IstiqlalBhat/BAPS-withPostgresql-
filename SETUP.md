# BBAPS v2.0 - Setup Guide

This guide provides complete setup instructions for the BBAPS (BIM- and Blockchain-enabled Automatic Procurement System) v2.0 platform.

## Project Overview

BBAPS v2.0 is a full-stack application for automated procurement matching between General Contractors and Subcontractors. Unlike the MVP which used smart contracts, this version uses a traditional PostgreSQL database backend with a Node.js/Express API and React frontend.

### Tech Stack

**Backend:**
- Node.js 18+
- Express.js
- PostgreSQL 12+
- Sequelize ORM
- JWT Authentication

**Frontend:**
- React 18
- React Router v6
- Tailwind CSS
- Fetch API

## Prerequisites

Before you begin, ensure you have installed:

1. **Node.js** (v18 or higher)
   - Download from https://nodejs.org/

2. **PostgreSQL** (v12 or higher)
   - Download from https://www.postgresql.org/download/

3. **Git** (optional, for version control)
   - Download from https://git-scm.com/

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit the `.env` file and update the following values:

```env
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bbaps_db
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_REFRESH_EXPIRE=30d

# Optional: Email Configuration for notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# Logging
LOG_LEVEL=info
```

### Step 4: Create PostgreSQL Database

Open PostgreSQL command line (psql) and run:

```sql
CREATE DATABASE bbaps_db;
```

### Step 5: Run Database Migrations

```bash
npm run db:migrate
```

This will create all necessary tables in your database.

### Step 6: (Optional) Seed Database

If you want to populate with sample data:

```bash
npm run db:seed
```

### Step 7: Start the Backend Server

```bash
npm run dev
```

The server should start on `http://localhost:5000`

You should see:
```
Server running on port 5000
API Documentation: http://localhost:5000/api/docs
```

Visit http://localhost:5000/api/docs to view the interactive API documentation (Swagger UI).

## Frontend Setup

### Step 1: Navigate to Frontend Directory

```bash
cd ..
```

(Return to the root BBAPS directory)

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

The default configuration should work:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

If your backend is on a different server, update accordingly.

### Step 4: Start the Frontend Development Server

```bash
npm start
```

The application will open automatically at `http://localhost:3000`

## Database Schema

The PostgreSQL database includes the following tables:

### Users
- Stores all user accounts with encrypted passwords
- Roles: ADMIN, GENERAL_CONTRACTOR, SUBCONTRACTOR

### GeneralContractors
- Company information for General Contractors

### Subcontractors
- Company information for Subcontractors

### Projects
- Procurement projects created by GCs
- Includes project details, schedule, and costs

### SubcontractorData
- Availability and cost information provided by SCs

### TrustFactors
- Performance ratings given by GCs to SCs
- Scoring system: cost, time, and quality conformity (1-10 each, max 30 total)

### ProjectMatches
- Automatically generated matches between projects and SCs
- Includes match scoring algorithm results

### ProjectWinners
- Final selected subcontractor for each project

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - List all users (admin only)
- `GET /api/users/{id}` - Get user by ID (admin only)

### General Contractors
- `POST /api/gc` - Create GC
- `GET /api/gc` - List GCs
- `GET /api/gc/{id}` - Get GC details
- `PUT /api/gc/{id}` - Update GC

### Subcontractors
- `POST /api/sc` - Create SC
- `GET /api/sc` - List SCs
- `GET /api/sc/{id}` - Get SC details
- `POST /api/sc/{id}/availability` - Add availability data
- `GET /api/sc/{id}/trust-score` - Get SC trust score
- `PUT /api/sc/{id}` - Update SC

### Projects
- `POST /api/projects` - Create project
- `GET /api/projects` - List projects
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `POST /api/projects/{id}/import-bim` - Import BIM data from CSV

### Trust Factors
- `POST /api/trust-factors` - Set trust factor
- `GET /api/trust-factors/{id}` - Get trust factor
- `GET /api/trust-factors/subcontractor/{scId}` - Get SC trust factors
- `PUT /api/trust-factors/{id}` - Update trust factor

### Matching
- `GET /api/matches/projects/{projectId}/find` - Find matching SCs for project
- `POST /api/matches/projects/{projectId}/select-winner` - Select winning SC
- `GET /api/matches/projects/{projectId}/winner` - Get project winner
- `GET /api/matches/gc/{gcId}/summary` - Get GC matching summary

Full API documentation available at `http://localhost:5000/api/docs`

## User Roles and Permissions

### Admin
- Manage all users
- Create GCs and SCs
- View all projects and matches
- Generate reports

### General Contractor (GC)
- Create and manage projects
- View matching subcontractors
- Set trust factors for SCs
- Select winning SC

### Subcontractor (SC)
- Register availability and costs
- View matching projects
- Track performance ratings
- Participate in procurement process

## Matching Algorithm

The matching algorithm in BBAPS scores potential matches based on:

1. **Location Match**: Exact location match between project and SC availability
2. **Schedule Overlap**: SC availability covers full project duration
3. **Trust Score**: Historical performance ratings from previous GC engagements
4. **Cost Competitiveness**: How close SC cost is to estimated project cost

**Match Score = (Trust Component × 70%) + (Cost Component × 30%)**

Results are ranked by match score, with highest scores appearing first.

## Testing the Application

### Test User Accounts

After running seed data, you can use these accounts:

**General Contractor:**
- Email: gc@example.com
- Password: password123

**Subcontractor:**
- Email: sc@example.com
- Password: password123

### Manual Testing Workflow

1. Login as GC
2. Create a new project
3. (Optional) Import BIM data from CSV
4. View matches for the project
5. Login as SC (in different browser/incognito)
6. Register availability for matching work type/location
7. Switch back to GC and view updated matches
8. Select winning SC
9. As GC, set trust factors for the SC

## Troubleshooting

### Database Connection Error

**Problem:** `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution:**
- Ensure PostgreSQL is running
- Check DB_HOST, DB_PORT in .env
- Verify database name exists: `CREATE DATABASE bbaps_db;`

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
- Change PORT in .env to an available port (e.g., 5001)
- Or kill the process using port 5000

### CORS Error

**Problem:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:**
- Ensure backend is running on http://localhost:5000
- Check REACT_APP_API_URL in frontend .env
- Backend has CORS enabled for development

### JWT Token Expired

**Problem:** `Invalid or expired token`

**Solution:**
- The frontend will automatically refresh the token
- Clear browser localStorage if issues persist
- Re-login to get new tokens

## Production Deployment

### Backend Deployment (Heroku Example)

```bash
# Create Heroku app
heroku create bbaps-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DB_NAME=your_production_db
heroku config:set JWT_SECRET=your_production_secret

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel Example)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod --build-env REACT_APP_API_URL=https://your-backend-api.com
```

## Performance Optimization

1. **Database Indexing**: Indexes on frequently queried columns
2. **API Pagination**: All list endpoints support limit/offset
3. **Caching**: Consider implementing Redis for token caching
4. **CDN**: Deploy frontend to CDN for faster delivery

## Security Recommendations

1. **Change Default Secrets**: Update JWT_SECRET and JWT_REFRESH_SECRET
2. **HTTPS**: Use HTTPS in production
3. **Password Policy**: Enforce strong password requirements
4. **Rate Limiting**: Implement API rate limiting
5. **Validation**: Validate all inputs on backend
6. **SQL Injection**: Sequelize ORM prevents SQL injection

## Support and Documentation

- **API Documentation**: http://localhost:5000/api/docs
- **Backend Issues**: Check `logs/error.log`
- **Frontend Console**: Open browser DevTools for errors

## License

BBAPS is based on the research paper:
"BIM- and blockchain-enabled Automatic Procurement System (BBAPS) removing relationship bias"
Yoon, J. H., Aurangzeb, I., & McNamara, S. (2024)

## Contributing

For issues, feature requests, or contributions, please follow the contribution guidelines in the project repository.
