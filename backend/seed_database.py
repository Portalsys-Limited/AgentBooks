#!/usr/bin/env python3
"""
Database seed script for AgentBooks
Drops and recreates all tables, then seeds with sample data for Twilio testing
"""

import asyncio
import sys
import os
sys.path.append('/app')

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import delete
from config.settings import settings
from db.models.base import Base  # Import Base to access metadata
from db.models import (
    Practice, User, Customer, Client, CustomerClientAssociation, 
    UserRole, BusinessType
)
from db.models.customer_client_association import RelationshipType
from services.auth_service import get_password_hash

async def create_sample_data():
    """Drop all tables, recreate from models, and create sample data"""
    
    # Create async database engine and session
    async_database_url = settings.database_url.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(async_database_url, echo=False)
    AsyncSessionLocal = async_sessionmaker(
        engine,
        class_=AsyncSession,
        expire_on_commit=False
    )
    
    async with AsyncSessionLocal() as db:
        try:
            print("🌱 Starting database recreation and seeding...")
            
            # Drop all tables
            print("🗑️  Dropping all existing tables...")
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.drop_all)
            print("✅ All tables dropped")
            
            # Create all tables from current models
            print("🏗️  Creating all tables from current models...")
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("✅ All tables created from models")
            
            # Create Practice with WhatsApp number
            practice = Practice(
                name="AgentBooks Test Practice",
                whatsapp_number="whatsapp:+14155238886",
                main_phone="+442079460755", 
                main_email="admin@agentbooks.com"
            )
            db.add(practice)
            await db.flush()
            print(f"✅ Created practice: {practice.name}")
            
            # Create Customers
            customers_data = [
                {
                    "name": "Nyal Patel",
                    "first_name": "Nyal",
                    "last_name": "Patel",
                    "email": "nyal@portalsys.co.uk",
                    "phone": "+447494101144"
                },
                {
                    "name": "Ashani Patel",
                    "first_name": "Ashani",
                    "last_name": "Patel",
                    "email": "ashani@portalsys.co.uk",
                    "phone": "+447595205210"
                },
                {
                    "name": "Siyan Patel",
                    "first_name": "Siyan",
                    "last_name": "Patel",
                    "email": "siyan@portalsys.co.uk",
                    "phone": "+447970869912"
                }
            ]
            
            customers = []
            for customer_data in customers_data:
                customer = Customer(
                    name=customer_data["name"],
                    first_name=customer_data["first_name"],
                    last_name=customer_data["last_name"],
                    primary_email=customer_data["email"],
                    primary_phone=customer_data["phone"],
                    practice_id=practice.id
                )
                db.add(customer)
                customers.append(customer)
            
            await db.flush()
            print(f"✅ Created {len(customers)} customers")
            
            # Create Client - Portalsys Ltd
            client = Client(
                client_code="PTS001",
                business_name="Portalsys Ltd",
                business_type=BusinessType.ltd,
                nature_of_business="Technology Services",
                main_phone="+447494101144",
                main_email="info@portalsys.co.uk",
                customer_id=customers[0].id,  # Legacy field - Nyal as primary
                practice_id=practice.id
            )
            db.add(client)
            await db.flush()
            print(f"✅ Created client: {client.business_name}")
            
            # Create Customer-Client Associations
            associations_data = [
                {"customer": customers[0], "relationship": RelationshipType.director},  # Nyal - Director
                {"customer": customers[1], "relationship": RelationshipType.shareholder},  # Ashani - Shareholder
                {"customer": customers[2], "relationship": RelationshipType.son},  # Siyan - Son
            ]
            
            for assoc_data in associations_data:
                association = CustomerClientAssociation(
                    customer_id=assoc_data["customer"].id,
                    client_id=client.id,
                    relationship_type=assoc_data["relationship"],
                    is_active="active"
                )
                db.add(association)
            
            await db.flush()
            print(f"✅ Created {len(associations_data)} customer-client associations")
            
            # Create essential users for testing
            password_hash = get_password_hash("admin")  # Password is "admin"
            
            users_data = [
                {"email": "admin@agentbooks.com", "role": UserRole.practice_owner},
                {"email": "accountant@agentbooks.com", "role": UserRole.accountant},
                {"email": "nyal@portalsys.co.uk", "role": UserRole.client},
                {"email": "ashani@portalsys.co.uk", "role": UserRole.client},
                {"email": "siyan@portalsys.co.uk", "role": UserRole.client},
            ]
            
            created_users = []
            for user_data in users_data:
                user = User(
                    email=user_data["email"],
                    password_hash=password_hash,
                    role=user_data["role"],
                    practice_id=practice.id if user_data["role"] != UserRole.client else None
                )
                db.add(user)
                created_users.append(user)
            
            await db.flush()
            print(f"✅ Created {len(created_users)} users")
            
            # Commit all changes
            await db.commit()
            print("💾 Database recreation and seeding completed successfully!")
            
            # Print summary
            print("\n📊 Summary:")
            print(f"Practice: {practice.name} (WhatsApp: {practice.whatsapp_number})")
            print(f"Client: {client.business_name}")
            print(f"Customers: {len(customers)}")
            print(f"Users: {len(created_users)}")
            print(f"Associations: {len(associations_data)}")
            
            print("\n👥 Customers & Associations:")
            for i, customer in enumerate(customers):
                assoc = associations_data[i]
                print(f"  {customer.name} ({customer.primary_phone}) - {assoc['relationship'].value}")
            
            print("\n🔑 Login Credentials (all users have password 'admin'):")
            for user in created_users:
                print(f"  {user.email} - {user.role.value}")
            
            print("\n📱 Twilio Testing Setup:")
            for customer in customers:
                print(f"  {customer.name}: {customer.primary_phone}")
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Error seeding database: {e}")
            raise
        finally:
            await engine.dispose()

if __name__ == "__main__":
    print("🚀 AgentBooks Database Seeder - Complete Rebuild & Multi-Customer Setup")
    print("=" * 75)
    asyncio.run(create_sample_data())
    print("=" * 75)
    print("✨ Database rebuilt and seeded! Ready for Twilio testing with multiple customers.") 