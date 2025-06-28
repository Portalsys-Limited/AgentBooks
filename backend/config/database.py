from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
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

# Sync database engine for Celery tasks
sync_engine = create_engine(
    settings.database_url.replace("postgresql://", "postgresql+psycopg2://"),
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False
)

# Sync session factory for Celery tasks
SyncSessionLocal = sessionmaker(bind=sync_engine)

# Base class for models
Base = declarative_base()

# Dependency to get async database session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Function to get sync session for Celery tasks
def get_sync_session():
    """
    Get a sync session for use in Celery tasks.
    Returns the session directly (not a generator).
    """
    return SyncSessionLocal() 