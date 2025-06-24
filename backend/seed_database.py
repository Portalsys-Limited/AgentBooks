#!/usr/bin/env python3
"""
Database seed script for AgentBooks
Creates sample practices, users, customers, and client companies
"""

import asyncio
import sys
import os
sys.path.append('/app')

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from config.settings import settings
from db.models import Practice, User, Customer, ClientCompany, UserRole
from services.auth_service import get_password_hash

def create_sample_data():
    """Create sample data for the AgentBooks platform"""
    
    # Create database engine and session
    engine = create_engine(settings.database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        print("🌱 Starting database seeding...")
        
        # Create Practices
        practices = []
        for i in range(1, 4):  # Practice1, Practice2, Practice3
            practice = Practice(name=f"Practice{i}")
            db.add(practice)
            practices.append(practice)
        
        db.flush()  # Get the IDs
        print(f"✅ Created {len(practices)} practices")
        
        # Create Customers for each practice
        customers = []
        for practice in practices:
            for j in range(1, 4):  # Client1, Client2, Client3 per practice
                customer = Customer(
                    name=f"Client{j}",
                    practice_id=practice.id
                )
                db.add(customer)
                customers.append(customer)
        
        db.flush()
        print(f"✅ Created {len(customers)} customers")
        
        # Create Client Companies
        client_companies = []
        for customer in customers:
            for k in range(1, 3):  # 2 companies per client
                company = ClientCompany(
                    name=f"{customer.name} Company {k}",
                    customer_id=customer.id
                )
                db.add(company)
                client_companies.append(company)
        
        db.flush()
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
        
        db.flush()
        print(f"✅ Created {len(created_users)} users")
        
        # Assign customers to users (many-to-many relationship)
        print("🔗 Assigning customers to users...")
        
        for practice_idx, practice in enumerate(practices):
            practice_customers = [c for c in customers if c.practice_id == practice.id]
            practice_users = [u for u in created_users if u.practice_id == practice.id and u.role != UserRole.practice_owner]
            
            # Assign customers to non-owner practice users
            for i, user in enumerate(practice_users):
                # Each user gets assigned to some customers (round robin)
                assigned_customers = practice_customers[i::len(practice_users)] if practice_users else []
                user.assigned_clients.extend(assigned_customers)
        
        # Commit all changes
        db.commit()
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
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 AgentBooks Database Seeder")
    print("=" * 50)
    create_sample_data()
    print("=" * 50)
    print("✨ Seeding complete! You can now test the application.") 