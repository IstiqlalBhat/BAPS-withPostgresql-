# BAPS Architecture (BIM + AI Procurement System)

This document defines the architectural standards for the BAPS project - a production-grade procurement system integrating **pyRevit extensions**, **OpenAI LLM**, and a **modern web dashboard** for General Contractors.

---

## 1. System Overview

### 1.1 Core Components

```
┌─────────────────┐
│  pyRevit Ext    │  (Python - Revit Plugin)
│  - Auth Client  │
│  - BIM Extractor│
└────────┬────────┘
         │ HTTPS + Auth Token
         ▼
┌─────────────────┐
│   Backend API   │  (Node.js + Express + TypeScript)
│  - Auth/AuthZ   │
│  - OpenAI LLM   │
│  - Data Store   │
└────────┬────────┘
         │ REST API
         ▼
┌─────────────────┐
│  Web Dashboard  │  (React + TypeScript + Modern UI)
│  - GC Portal    │
│  - Element Mgmt │
│  - Pricing      │
└─────────────────┘
```

### 1.2 Technology Stack

| Layer | Technology |
|-------|-----------|
| **BIM Integration** | pyRevit (Python 2.7/3.x for Revit API) |
| **Backend** | Node.js 18+, Express, TypeScript, PostgreSQL |
| **AI Integration** | OpenAI API (GPT-4) |
| **Frontend** | React 18+, TypeScript, TailwindCSS, shadcn/ui |
| **Authentication** | JWT + OAuth2 (Google/Microsoft) |
| **Deployment** | Docker, CI/CD (GitHub Actions) |

---

## 2. Directory Structure

```
/
├── pyrevit-extension/           # pyRevit Extension (Python)
│   ├── BAPS.extension/
│   │   ├── BAPS.tab/           # Revit UI Tab
│   │   │   ├── Auth.panel/
│   │   │   ├── Extract.panel/
│   │   │   └── Sync.panel/
│   │   ├── lib/                # Shared libraries
│   │   │   ├── auth_client.py
│   │   │   ├── api_client.py
│   │   │   └── bim_extractor.py
│   │   └── icon.png
│   └── README.md
│
├── backend/                     # Backend API (Node.js + TypeScript)
│   ├── src/
│   │   ├── api/
│   │   │   ├── controllers/    # Request handlers
│   │   │   ├── routes/         # Route definitions
│   │   │   └── middleware/     # Auth, validation, error handling
│   │   │       ├── auth.middleware.ts
│   │   │       ├── rbac.middleware.ts
│   │   │       └── error.middleware.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── openai.service.ts
│   │   │   ├── element.service.ts
│   │   │   └── pricing.service.ts
│   │   ├── models/             # PostgreSQL models (Sequelize)
│   │   │   ├── User.ts
│   │   │   ├── Element.ts
│   │   │   ├── Pricing.ts
│   │   │   └── Project.ts
│   │   ├── config/
│   │   │   ├── database.ts
│   │   │   ├── auth.ts
│   │   │   └── openai.ts
│   │   └── server.ts
│   ├── tests/
│   └── package.json
│
├── frontend/                    # Web Dashboard (React + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui components
│   │   │   ├── auth/           # Login, Register, OAuth
│   │   │   ├── dashboard/      # Main dashboard layout
│   │   │   ├── elements/       # Element management
│   │   │   └── pricing/        # Pricing views
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Elements.tsx
│   │   │   └── Pricing.tsx
│   │   ├── services/
│   │   │   └── api.service.ts  # Axios client
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   └── useElements.ts
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   └── App.tsx
│   ├── public/
│   └── package.json
│
├── common/                      # Shared TypeScript types
│   └── types/
│       ├── element.types.ts
│       ├── user.types.ts
│       └── api.types.ts
│
└── scripts/                     # DevOps
    ├── docker-compose.yml
    └── deploy.sh
```

---

## 3. Authentication & Authorization

### 3.1 Authentication Flow

```
pyRevit Extension → POST /auth/login → Backend issues JWT
                                     ↓
                              Store token in extension
                                     ↓
                        All API calls include: Authorization: Bearer <token>
```

### 3.2 User Roles (RBAC)

| Role | Permissions |
|------|-------------|
| **GC Admin** | Full access, manage users, pricing |
| **GC User** | Submit elements, view pricing |
| **Viewer** | Read-only access |

### 3.3 OAuth2 Providers
- Google Workspace
- Microsoft Azure AD

---

## 4. Data Flow

### 4.1 BIM → Backend Flow

```
1. User extracts elements in Revit (pyRevit extension)
2. Extension authenticates with backend
3. Extension POSTs element data (name, quantity, category, properties)
4. Backend validates + stores in PostgreSQL
5. Backend calls OpenAI API to suggest pricing (optional)
6. Dashboard displays elements in real-time
```

### 4.2 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login with email/password |
| POST | `/auth/oauth/google` | OAuth2 Google login |
| GET | `/elements` | List all elements |
| POST | `/elements` | Create element from BIM |
| PUT | `/elements/:id/pricing` | Update element pricing |
| GET | `/ai/suggest-price` | OpenAI pricing suggestion |

---

## 5. OpenAI Integration

### 5.1 Use Cases
- **Pricing Suggestions**: Given element type, material, quantity → suggest price range
- **Material Classification**: Auto-categorize elements
- **Cost Estimation**: Analyze historical data for predictions

### 5.2 Implementation
```typescript
// backend/src/services/openai.service.ts
export async function suggestPricing(element: Element): Promise<PriceSuggestion> {
  const prompt = `Given: ${element.name}, ${element.quantity} units, ${element.category}
  Suggest a realistic price range for construction procurement.`;
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }]
  });
  
  return parsePricingResponse(response);
}
```

---

## 6. Frontend Design Standards

### 6.1 UI Framework
- **shadcn/ui** for components (modern, accessible)
- **TailwindCSS** for styling
- **Radix UI** primitives

### 6.2 Design System
- **Colors**: Professional palette (blues, grays, accents)
- **Typography**: Inter or Geist font
- **Icons**: Lucide React
- **Dark Mode**: Supported

### 6.3 Key Pages
- **Login/Register**: OAuth + email/password
- **Dashboard**: Overview metrics, recent elements
- **Elements**: Table view with filters, search
- **Pricing**: Editable pricing interface

---

## 7. pyRevit Extension

### 7.1 Features
- **Auth Panel**: Login button → stores token securely
- **Extract Panel**: "Push to BAPS" button → extracts selected/all elements
- **Sync Panel**: View sync status, conflicts

### 7.2 Implementation
```python
# pyrevit-extension/BAPS.extension/lib/api_client.py
import requests

class BAPSClient:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.token = token
    
    def push_elements(self, elements):
        headers = {"Authorization": f"Bearer {self.token}"}
        response = requests.post(
            f"{self.base_url}/elements",
            json=elements,
            headers=headers
        )
        return response.json()
```

---

## 8. Security

### 8.1 Best Practices
- ✅ All passwords hashed with bcrypt
- ✅ JWT tokens expire in 24h
- ✅ HTTPS only in production
- ✅ CORS configured for frontend domain
- ✅ Rate limiting on auth endpoints
- ✅ SQL injection prevention (Sequelize ORM)
- ✅ Input validation (Joi/Zod)

### 8.2 Environment Variables
```env
# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=...
OPENAI_API_KEY=sk-...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# Frontend
VITE_API_URL=https://api.baps.com
```

---

## 9. Deployment

### 9.1 Production Stack
- **Frontend**: Vercel or Netlify
- **Backend**: AWS ECS or Railway
- **Database**: AWS RDS (PostgreSQL)
- **pyRevit**: Distributed as `.zip` or via pyRevit package manager

### 9.2 CI/CD
- GitHub Actions for automated testing
- Docker images for backend
- Automated migrations on deploy

---

## 10. Development Workflow

1. **Planning**: Update this ARCHITECTURE.md before major changes
2. **Implementation**: Follow directory structure strictly
3. **Testing**: Write tests for all services/components
4. **Review**: All PRs require architecture compliance check
5. **Documentation**: Update inline docs + README files
