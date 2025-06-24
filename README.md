# AgentBooks - Accounting SaaS MVP

A full-stack monorepo for an accounting SaaS platform with role-based access and multi-portal architecture.

## 🏗️ Architecture

- **Backend**: FastAPI + PostgreSQL + Alembic
- **Frontend**: 3 Next.js portals with NextAuth.js
- **Integration**: Dockerized Odoo 16 Community
- **Authentication**: JWT with role-based routing

## 📁 Structure

```
AgentBooks/
├── backend/                 # FastAPI backend
│   ├── api/                # API endpoints
│   ├── config/             # Configuration
│   ├── db/                 # Database models & schemas
│   ├── services/           # Business logic
│   └── alembic/            # Database migrations
├── frontends/
│   ├── auth-portal/        # Shared login/signup (Port 3000)
│   ├── client-portal/      # Client dashboard (Port 3001)
│   └── practice-portal/    # Practice staff dashboard (Port 3002)
├── odoo/                   # Odoo 16 setup (Port 8069)
└── docker-compose.yml      # Orchestration
```

## 🚀 Quick Start

1. **Clone and Navigate**
   ```bash
   git clone <your-repo-url>
   cd AgentBooks
   ```

2. **Start Everything**
   ```bash
   docker-compose up --build
   ```

3. **Access Applications**
   - Auth Portal: http://localhost:3000
   - Client Portal: http://localhost:3001  
   - Practice Portal: http://localhost:3002
   - Backend API: http://localhost:8000
   - Odoo: http://localhost:8069

## 🔐 User Roles & Flow

### Authentication Flow
1. Users login at `http://localhost:3000`
2. After authentication, users are redirected based on role:
   - **practice_owner, accountant, bookkeeper, payroll** → Practice Portal (3002)
   - **client** → Client Portal (3001)

### Role-Based Dashboards

**Practice Owner**: See all clients, staff, revenue, and tasks
**Accountant**: View assigned clients, reports due, pending reviews  
**Bookkeeper**: Manage ledger tasks, reconciliations, invoices
**Payroll**: Handle payroll runs, employee data, tax filings
**Client**: View invoices, account balance, notifications

## 🔧 Development

### Backend Development
```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

### Frontend Development
```bash
cd frontends/auth-portal
npm install
npm run dev
```

### Database Migrations
```bash
cd backend
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

## 🐳 Docker Services

- **postgres-backend**: PostgreSQL for FastAPI (Port 5432)
- **postgres-odoo**: PostgreSQL for Odoo (Port 5433)
- **backend**: FastAPI application (Port 8000)
- **auth-portal**: Authentication interface (Port 3000)
- **client-portal**: Client dashboard (Port 3001)
- **practice-portal**: Practice dashboard (Port 3002)
- **odoo**: Odoo 16 Community (Port 8069)

## 📝 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/signup` - User registration
- `POST /auth/token` - OAuth2 token endpoint

### User Management
- `GET /users/me` - Get current user
- `GET /users/me/token-data` - Get token details

## 🔑 Environment Variables

Set these in your environment or `.env` files:

```env
# Backend
DATABASE_URL=postgresql://postgres:postgres@postgres-backend:5432/agentbooks
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Frontend
NEXTAUTH_SECRET=your-nextauth-secret-change-in-production
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🗄️ Database Schema

### Core Models
- **Practice**: Accounting practice/firm
- **User**: System users with roles
- **Customer**: Clients of the practice
- **ClientCompany**: Companies under customers

### Relationships
- Users belong to practices
- Customers belong to practices  
- Users can be assigned to multiple customers
- Client companies belong to customers

## 🛠️ Tech Stack

**Backend**:
- FastAPI (Python web framework)
- SQLAlchemy (ORM)
- Alembic (migrations)
- PostgreSQL (database)
- JWT + bcrypt (authentication)

**Frontend**:
- Next.js 14 (React framework)
- NextAuth.js (authentication)
- Tailwind CSS (styling)
- TypeScript (type safety)

**Infrastructure**:
- Docker & Docker Compose
- Odoo 16 Community
- PostgreSQL (2 instances)

## 📚 Getting Started

1. **Create a test account**:
   - Visit http://localhost:3000
   - Click "Sign up"
   - Choose your role (client, accountant, etc.)

2. **Explore role-based features**:
   - Each role sees different dashboard content
   - Practice staff can manage clients
   - Clients can view their data

3. **API Documentation**:
   - Visit http://localhost:8000/docs for Swagger UI
   - Interactive API testing available

## 🔒 Security Features

- JWT token authentication
- Role-based access control
- Password hashing with bcrypt
- CORS configuration
- Environment-based secrets

## 📈 Next Steps

- Add more detailed client/practice data models
- Implement real financial data integration
- Add file upload capabilities
- Integrate with Odoo for full ERP features
- Add email notifications
- Implement real-time updates

---

Built with ❤️ for modern accounting practices 