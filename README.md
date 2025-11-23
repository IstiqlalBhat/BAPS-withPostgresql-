# BBAPS - BIM & AI-Powered Automatic Procurement System

![License](https://img.shields.io/badge/license-ISC-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)

> A production-grade procurement system integrating **Revit BIM data extraction**, **AI-powered pricing suggestions**, and a **modern web dashboard** for General Contractors and Subcontractors.

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

BBAPS (BIM & Blockchain-enabled Automatic Procurement System) is a comprehensive solution that bridges the gap between BIM workflows and procurement processes. It enables:

- **General Contractors** to extract BIM element data directly from Revit and receive AI-powered pricing suggestions
- **Subcontractors** to upload and manage pricing data via a modern web interface
- **Automated workflows** that leverage OpenAI to suggest realistic pricing based on element properties

The system consists of three main components:
1. **PyRevit Extension** - Revit plugin for data extraction and authentication
2. **Backend API** - Node.js/TypeScript REST API with PostgreSQL database
3. **Web Application** - Next.js dashboard for data management and visualization

## 🏗️ Architecture

```
┌─────────────────────┐
│  PyRevit Extension  │  (Python - Revit Plugin)
│  - Authentication   │
│  - BIM Extraction   │
│  - API Integration  │
└──────────┬──────────┘
           │ HTTPS + JWT Auth
           ▼
┌─────────────────────┐
│   Backend API       │  (Node.js + Express + TypeScript)
│  - Authentication   │
│  - Role-Based Auth  │
│  - OpenAI Service   │
│  - Data Management  │
└──────────┬──────────┘
           │ REST API
           ▼
┌─────────────────────┐
│  Web Application    │  (Next.js + React + TypeScript)
│  - User Dashboard   │
│  - Element Mgmt     │
│  - Pricing Portal   │
└─────────────────────┘
```

For detailed architecture documentation, see [ARCHITECTURE.md](ARCHITECTURE.md).

## ✨ Features

### PyRevit Extension
- 🔐 Secure authentication with JWT tokens
- 📊 Extract BIM element data from Revit models
- 🔄 Real-time sync with backend API
- 🎨 Modern UI integrated into Revit interface

### Backend API
- 🔒 JWT-based authentication & authorization
- 👥 Role-based access control (GC Admin, GC User, Subcontractor)
- 🤖 OpenAI integration for intelligent pricing suggestions
- 📝 PostgreSQL database with Sequelize ORM
- 🛡️ Security features: rate limiting, helmet, CORS
- 📚 RESTful API design

### Web Application
- 🎨 Modern Next.js 16 + React 19 interface
- 📱 Responsive design with TailwindCSS
- 🌓 Support for light/dark themes
- 📊 Interactive dashboards and data visualization
- 🔐 Secure authentication flow
- 📤 Role-based data upload (GC via Revit, Subcontractor via web)

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript 5.3
- **Database:** PostgreSQL
- **ORM:** Sequelize
- **Authentication:** JWT, Passport.js
- **AI Integration:** OpenAI GPT-4
- **Security:** Helmet, CORS, bcrypt, rate-limiting

### Frontend
- **Framework:** Next.js 16
- **UI Library:** React 19
- **Styling:** TailwindCSS 4
- **UI Components:** Radix UI, Lucide React
- **Forms:** React Hook Form + Zod validation
- **Language:** TypeScript 5

### PyRevit Extension
- **Language:** Python 2.7/3.x (pyRevit compatible)
- **HTTP Client:** requests library
- **BIM API:** Revit API

## 📦 Prerequisites

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 13.0
- **Python** 2.7 or 3.x (for PyRevit)
- **Revit** 2020+ (for PyRevit extension)
- **OpenAI API Key** (for AI features)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/IstiqlalBhat/BAPS-withPostgresql-.git
cd BBAPS
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Set up environment variables (see Configuration section)
cp .env.example .env

# Edit .env with your actual values
# DATABASE_URL, JWT_SECRET, OPENAI_API_KEY, etc.

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

The backend will start on `http://localhost:5001`

### 3. Frontend Setup

```bash
cd app

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will start on `http://localhost:3000`

### 4. PyRevit Extension Setup

1. Install [pyRevit](https://github.com/eirannejad/pyRevit) if not already installed
2. Copy the `pyrevit-extension` folder to your pyRevit extensions directory:
   - Default location: `%appdata%/pyRevit/Extensions`
3. Reload pyRevit in Revit
4. The BAPS tab should appear in Revit's ribbon

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server
NODE_ENV=development
PORT=5001

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/bbaps_db

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key-here

# OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

> ⚠️ **Security Note:** Never commit your `.env` file to version control. The `.gitignore` file is configured to exclude all `.env*` files except `.env.example`.

### Frontend Configuration

The frontend uses environment variables for API endpoints. Create a `.env.local` file in the `app` directory if needed:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### PyRevit Extension Configuration

Update the API endpoint in `pyrevit-extension/lib/api_client.py`:

```python
BASE_URL = "http://localhost:5001"  # Change to your backend URL
```

## 📖 Usage

### For General Contractors

1. **Login to Revit Extension**
   - Open Revit
   - Click on the BAPS tab → Auth panel → Login button
   - Enter your credentials
   - Authentication token is stored securely

2. **Extract BIM Data**
   - Select elements in your Revit model
   - Click BAPS tab → Pricing panel → Sync button
   - Element data is automatically extracted and sent to the backend
   - View data and pricing suggestions in the web dashboard

### For Subcontractors

1. **Login to Web Application**
   - Navigate to `http://localhost:3000`
   - Click "Register" and select "Subcontractor" role
   - Login with your credentials

2. **Upload Pricing Data**
   - Access the pricing dashboard
   - Upload pricing information for elements
   - View and manage your pricing data

### For Administrators

1. **User Management**
   - Access admin dashboard
   - Manage user roles and permissions
   - Monitor system activity

## 📁 Project Structure

```
BBAPS/
├── app/                          # Next.js frontend application
│   ├── app/                      # Next.js 16 app directory
│   │   ├── api/                  # API routes
│   │   │   └── auth/            # Authentication endpoints
│   │   ├── dashboard/           # Dashboard pages
│   │   └── page.tsx             # Home page
│   ├── components/              # React components
│   ├── lib/                     # Utilities and models
│   ├── types/                   # TypeScript types
│   └── package.json
│
├── backend/                     # Node.js backend API
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/    # Request handlers
│   │   │   ├── middleware/     # Auth, RBAC, error handling
│   │   │   └── routes/         # Route definitions
│   │   ├── config/             # Configuration files
│   │   │   ├── auth.ts         # JWT config
│   │   │   ├── database.ts     # DB connection
│   │   │   └── openai.ts       # OpenAI config
│   │   ├── models/             # Database models (Sequelize)
│   │   │   ├── User.ts
│   │   │   ├── Element.ts
│   │   │   └── Pricing.ts
│   │   ├── services/           # Business logic
│   │   │   ├── auth.service.ts
│   │   │   ├── element.service.ts
│   │   │   ├── openai.service.ts
│   │   │   └── pricing.service.ts
│   │   └── server.ts           # Express app entry point
│   ├── migrations/             # Database migrations
│   ├── dist/                   # Compiled TypeScript output
│   └── package.json
│
├── pyrevit-extension/          # PyRevit extension for Revit
│   ├── BAPS.tab/              # Revit UI tab
│   │   ├── Auth.panel/        # Authentication panel
│   │   │   └── Login.pushbutton/
│   │   └── Pricing.panel/     # Pricing panel
│   │       └── Sync.pushbutton/
│   └── lib/                   # Python libraries
│       ├── api_client.py      # Backend API client
│       └── element_extractor.py # BIM data extraction
│
├── common/                     # Shared TypeScript types
│   └── types/
│       ├── element.types.ts
│       ├── user.types.ts
│       └── api.types.ts
│
├── .gitignore                 # Git ignore rules
├── ARCHITECTURE.md            # Detailed architecture docs
└── README.md                  # This file
```

## 🔌 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with credentials |
| POST | `/api/auth/logout` | Logout user |
| GET | `/api/auth/me` | Get current user |

### Element Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/elements` | List all elements |
| POST | `/api/elements` | Create element (from BIM) |
| GET | `/api/elements/:id` | Get element by ID |
| PUT | `/api/elements/:id` | Update element |
| DELETE | `/api/elements/:id` | Delete element |

### Pricing Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pricing/suggest` | Get AI pricing suggestion |
| PUT | `/api/elements/:id/pricing` | Update element pricing |

All authenticated endpoints require a Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

## 🔧 Development

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd app
npm test
```

### Building for Production

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd app
npm run build
```

### Database Migrations

```bash
cd backend

# Create migration
npx sequelize migration:generate --name migration-name

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

## 🚢 Deployment

### Backend Deployment

The backend can be deployed to:
- **Railway** (recommended for quick setup)
- **Heroku**
- **AWS ECS**
- **DigitalOcean App Platform**

Ensure you set environment variables on your hosting platform.

### Frontend Deployment

The Next.js app can be deployed to:
- **Vercel** (recommended, zero-config)
- **Netlify**
- **AWS Amplify**

### Database

Use managed PostgreSQL services:
- **Supabase**
- **Railway**
- **AWS RDS**
- **DigitalOcean Managed Database**

### PyRevit Extension Distribution

1. Package the extension as a `.zip` file
2. Distribute to users who can extract to their pyRevit extensions folder
3. Or publish to the pyRevit package manager

## 🔒 Security

- ✅ All passwords are hashed using bcrypt
- ✅ JWT tokens with expiration
- ✅ HTTPS required in production
- ✅ CORS configured properly
- ✅ Rate limiting on authentication endpoints
- ✅ SQL injection prevention via Sequelize ORM
- ✅ Input validation with Zod
- ✅ Helmet.js for security headers
- ✅ Environment variables for secrets (never committed)

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- **Istiqlal Bhat** - Initial work

## 🙏 Acknowledgments

- pyRevit community for the excellent Revit extension framework
- OpenAI for GPT-4 API
- The open-source community for all the awesome packages

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check the [ARCHITECTURE.md](ARCHITECTURE.md) for detailed technical information

---

**Built with ❤️ for the construction industry**
