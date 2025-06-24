#!/usr/bin/env python3
"""
Database seed script for AgentBooks
Creates sample practices, users, customers, and client companies
"""

import asyncio
import sys
import os
sys.path.append('/app')

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from config.settings import settings
from db.models import Practice, User, Customer, ClientCompany, UserRole
from services.auth_service import get_password_hash

async def create_sample_data():
    """Create sample data for the AgentBooks platform"""
    
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
            print("🌱 Starting database seeding...")
            
            # Create Practices
            practices = []
            for i in range(1, 4):  # Practice1, Practice2, Practice3
                practice = Practice(name=f"Practice{i}")
                db.add(practice)
                practices.append(practice)
            
            await db.flush()  # Get the IDs
            print(f"✅ Created {len(practices)} practices")
            
            # Create Customers for each practice
            customers = []
            for practice in practices:
                for j in range(1, 4):  # Client1, Client2, Client3 per practice
                    practice_index = practices.index(practice) + 1
                    customer = Customer(
                        name=f"Client{j} Practice{practice_index}",
                        first_name=f"Client{j}",
                        last_name=f"Practice{practice_index}",
                        primary_email=f"client{j}.practice{practice_index}@example.com",
                        practice_id=practice.id
                    )
                    db.add(customer)
                    customers.append(customer)
            
            await db.flush()
            print(f"✅ Created {len(customers)} customers")
            
            # Create Client Companies
            client_companies = []
            for customer in customers:
                for k in range(1, 3):  # 2 companies per client
                    company = ClientCompany(
                        business_name=f"{customer.name} Company {k}",
                        customer_id=customer.id,
                        business_type='limited_company'  # Add required field
                    )
                    db.add(company)
                    client_companies.append(company)
            
            await db.flush()
            print(f"✅ Created {len(client_companies)} client companies")
            
            # Create Users
            users_data = [
                # Practice Owners
                {"email": "owner1@practice1.com", "role": UserRole.practice_owner, "practice_idx": 0},
                {"email": "owner2@practice2.com", "role": UserRole.practice_owner, "practice_idx": 1},
                {"email": "owner3@practice3.com", "role": UserRole.practice_owner, "practice_idx": 2},
                
                # Accountants
                {"email": "accountant1@practice1.com", "role": UserRole.accountant, "practice_idx": 0},
                {"email": "accountant2@practice1.com", "role": UserRole.accountant, "practice_idx": 0},
                {"email": "accountant1@practice2.com", "role": UserRole.accountant, "practice_idx": 1},
                
                # Bookkeepers
                {"email": "bookkeeper1@practice1.com", "role": UserRole.bookkeeper, "practice_idx": 0},
                {"email": "bookkeeper2@practice2.com", "role": UserRole.bookkeeper, "practice_idx": 1},
                {"email": "bookkeeper3@practice3.com", "role": UserRole.bookkeeper, "practice_idx": 2},
                
                # Payroll
                {"email": "payroll1@practice1.com", "role": UserRole.payroll, "practice_idx": 0},
                {"email": "payroll2@practice2.com", "role": UserRole.payroll, "practice_idx": 1},
                
                # Clients (no practice affiliation initially)
                {"email": "client1@company.com", "role": UserRole.client, "practice_idx": None},
                {"email": "client2@company.com", "role": UserRole.client, "practice_idx": None},
                {"email": "client3@company.com", "role": UserRole.client, "practice_idx": None},
                {"email": "client4@company.com", "role": UserRole.client, "practice_idx": None},
                {"email": "client5@company.com", "role": UserRole.client, "practice_idx": None},
                
                # Test admin users
                {"email": "admin@agentbooks.com", "role": UserRole.practice_owner, "practice_idx": 0},
                {"email": "test@client.com", "role": UserRole.client, "practice_idx": None},
            ]
            
            created_users = []
            password_hash = get_password_hash("admin")  # All users have password "admin"
            
            for user_data in users_data:
                practice_id = practices[user_data["practice_idx"]].id if user_data["practice_idx"] is not None else None
                
                user = User(
                    email=user_data["email"],
                    password_hash=password_hash,
                    role=user_data["role"],
                    practice_id=practice_id
                )
                db.add(user)
                created_users.append(user)
            
            await db.flush()
            print(f"✅ Created {len(created_users)} users")
            
            # Note: Skipping customer-user assignments for now to avoid relationship loading issues
            # This can be added later through the API or with proper async relationship handling
            print("🔗 Skipping customer-user assignments for now (can be done via API)")
            
            # Commit all changes
            await db.commit()
            print("💾 Database seeding completed successfully!")
            
            # Print summary
            print("\n📊 Summary:")
            print(f"Practices: {len(practices)}")
            print(f"Customers: {len(customers)}")
            print(f"Client Companies: {len(client_companies)}")
            print(f"Users: {len(created_users)}")
            print("\n🔑 Login Credentials (all users have password 'admin'):")
            
            print("\n👥 Practice Staff:")
            for user in created_users:
                if user.role != UserRole.client:
                    practice_name = f"Practice{practices.index(next(p for p in practices if p.id == user.practice_id)) + 1}" if user.practice_id else "No Practice"
                    print(f"  {user.email} - {user.role.value} at {practice_name}")
            
            print("\n🏢 Clients:")
            for user in created_users:
                if user.role == UserRole.client:
                    print(f"  {user.email} - {user.role.value}")
            
            print("\n🎯 Quick Test Accounts:")
            print("  admin@agentbooks.com (Practice Owner) - password: admin")
            print("  test@client.com (Client) - password: admin")
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Error seeding database: {e}")
            raise
        finally:
            await engine.dispose()

if __name__ == "__main__":
    print("🚀 AgentBooks Database Seeder")
    print("=" * 50)
    asyncio.run(create_sample_data())
    print("=" * 50)
    print("✨ Seeding complete! You can now test the application.") 