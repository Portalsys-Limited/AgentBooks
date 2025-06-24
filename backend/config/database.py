from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from config.settings import settings

# Convert database URL to async format
async_database_url = settings.database_url.replace("postgresql://", "postgresql+asyncpg://")

# Async database engine
engine = create_async_engine(
    async_database_url,
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for models
Base = declarative_base()

# Dependency to get async database session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close() 