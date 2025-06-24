from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.auth import router as auth_router
from api.users import router as users_router
from api.customers import router as customers_router
from config.database import engine
from db.models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AgentBooks API",
    description="Accounting SaaS MVP API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(customers_router, prefix="/customers", tags=["Customers"])

@app.get("/")
async def root():
    return {"message": "Welcome to AgentBooks API", "version": "1.0.0", "dev_mode": "active"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "live-reload-working"} 