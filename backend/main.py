import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.auth import router as auth_router
from api.users import router as users_router
from api.customers import router as customers_router
from api.clients import router as clients_router
from api.search import router as search_router
from config.database import engine
from db.models import Base

# Create tables
async def create_tables():
    async with engine.begin() as conn:
        # In production, you'd want to use Alembic for migrations
        await conn.run_sync(Base.metadata.create_all)

app = FastAPI(
    title="AgentBooks API",
    description="Practice management system for accounting practices",
    version="1.0.0"
)

# Configure CORS
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
app.include_router(clients_router, prefix="/clients", tags=["Clients"])
app.include_router(search_router, prefix="/search", tags=["Search"])

@app.get("/")
async def root():
    return {"message": "AgentBooks API is running"}

@app.on_event("startup")
async def startup_event():
    await create_tables()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 