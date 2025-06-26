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
            
            # Create Customers with varied contact details
            customers_data = [
                # Original customers
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
                },
                # Additional customers for other companies
                {
                    "name": "Alice Johnson",
                    "first_name": "Alice",
                    "last_name": "Johnson",
                    "email": "alice.johnson@abcdltd.com",
                    "phone": "+447123456789"
                },
                {
                    "name": "Robert Smith",
                    "first_name": "Robert",
                    "last_name": "Smith",
                    "email": "robert.smith@abcdltd.com",
                    "phone": "+447234567890"
                },
                {
                    "name": "Harrison Bernstein",
                    "first_name": "Harrison",
                    "last_name": "Bernstein",
                    "email": "harrison@harrisonbernstein.co.uk",
                    "phone": "+447345678901"
                },
                {
                    "name": "Sarah Bernstein",
                    "first_name": "Sarah",
                    "last_name": "Bernstein",
                    "email": "sarah@harrisonbernstein.co.uk",
                    "phone": "+447456789012"
                },
                {
                    "name": "David Beckfield",
                    "first_name": "David",
                    "last_name": "Beckfield",
                    "email": "david@beckfieldsstore.com",
                    "phone": "+447567890123"
                },
                {
                    "name": "Emma Beckfield",
                    "first_name": "Emma",
                    "last_name": "Beckfield",
                    "email": "emma@beckfieldsstore.com",
                    "phone": "+447678901234"
                },
                {
                    "name": "Michael Wilson",
                    "first_name": "Michael",
                    "last_name": "Wilson",
                    "email": "michael.wilson@consultant.com",
                    "phone": "+447789012345"
                },
                {
                    "name": "Jennifer Davis",
                    "first_name": "Jennifer",
                    "last_name": "Davis",
                    "email": "jennifer.davis@lawfirm.co.uk",
                    "phone": "+447890123456"
                },
                {
                    "name": "Thomas Brown",
                    "first_name": "Thomas",
                    "last_name": "Brown",
                    "email": "thomas.brown@investor.com",
                    "phone": "+447901234567"
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
            
            # Create Multiple Clients
            clients_data = [
                {
                    "code": "PTS001",
                    "name": "Portalsys Ltd",
                    "type": BusinessType.ltd,
                    "nature": "Technology Services",
                    "phone": "+447494101144",
                    "email": "info@portalsys.co.uk"
                },
                {
                    "code": "ABCD001",
                    "name": "ABCD Ltd",
                    "type": BusinessType.ltd,
                    "nature": "Manufacturing",
                    "phone": "+447123456789",
                    "email": "info@abcdltd.com"
                },
                {
                    "code": "HB001",
                    "name": "Harrison Bernstein Ltd",
                    "type": BusinessType.ltd,
                    "nature": "Professional Services",
                    "phone": "+447345678901",
                    "email": "contact@harrisonbernstein.co.uk"
                },
                {
                    "code": "BF001",
                    "name": "Beckfields Store Ltd",
                    "type": BusinessType.ltd,
                    "nature": "Retail",
                    "phone": "+447567890123",
                    "email": "info@beckfieldsstore.com"
                }
            ]
            
            clients = []
            for client_data in clients_data:
                client = Client(
                    client_code=client_data["code"],
                    business_name=client_data["name"],
                    business_type=client_data["type"],
                    nature_of_business=client_data["nature"],
                    main_phone=client_data["phone"],
                    main_email=client_data["email"],
                    customer_id=customers[0].id,  # Legacy field
                    practice_id=practice.id
                )
                db.add(client)
                clients.append(client)
            
            await db.flush()
            print(f"✅ Created {len(clients)} clients")
            
            # Create Complex Customer-Client Associations
            associations_data = [
                # Portalsys Ltd associations
                {"customer_idx": 0, "client_idx": 0, "relationship": RelationshipType.director, "is_primary": True, "percentage": "40%"},  # Nyal - Director (PRIMARY)
                {"customer_idx": 1, "client_idx": 0, "relationship": RelationshipType.shareholder, "is_primary": False, "percentage": "35%"},  # Ashani - Shareholder
                {"customer_idx": 2, "client_idx": 0, "relationship": RelationshipType.son, "is_primary": False, "percentage": "25%"},  # Siyan - Son
                
                # ABCD Ltd associations
                {"customer_idx": 3, "client_idx": 1, "relationship": RelationshipType.director, "is_primary": True, "percentage": "60%"},  # Alice - Director (PRIMARY)
                {"customer_idx": 4, "client_idx": 1, "relationship": RelationshipType.shareholder, "is_primary": False, "percentage": "40%"},  # Robert - Shareholder
                {"customer_idx": 9, "client_idx": 1, "relationship": RelationshipType.consultant, "is_primary": False, "percentage": None},  # Michael - Consultant
                {"customer_idx": 10, "client_idx": 1, "relationship": RelationshipType.solicitor, "is_primary": False, "percentage": None},  # Jennifer - Solicitor
                
                # Harrison Bernstein Ltd associations
                {"customer_idx": 5, "client_idx": 2, "relationship": RelationshipType.director, "is_primary": True, "percentage": "70%"},  # Harrison - Director (PRIMARY)
                {"customer_idx": 6, "client_idx": 2, "relationship": RelationshipType.spouse, "is_primary": False, "percentage": "30%"},  # Sarah - Spouse & Shareholder
                {"customer_idx": 11, "client_idx": 2, "relationship": RelationshipType.investor, "is_primary": False, "percentage": None},  # Thomas - Investor
                
                # Beckfields Store Ltd associations
                {"customer_idx": 7, "client_idx": 3, "relationship": RelationshipType.director, "is_primary": True, "percentage": "55%"},  # David - Director (PRIMARY)
                {"customer_idx": 8, "client_idx": 3, "relationship": RelationshipType.partner, "is_primary": False, "percentage": "45%"},  # Emma - Partner
                {"customer_idx": 9, "client_idx": 3, "relationship": RelationshipType.accountant, "is_primary": False, "percentage": None},  # Michael - Accountant (serves multiple companies)
                
                # Cross-company relationships
                {"customer_idx": 0, "client_idx": 1, "relationship": RelationshipType.consultant, "is_primary": False, "percentage": None},  # Nyal consults for ABCD Ltd
                {"customer_idx": 5, "client_idx": 3, "relationship": RelationshipType.solicitor, "is_primary": False, "percentage": None},  # Harrison provides legal services to Beckfields
            ]
            
            created_associations = []
            for assoc_data in associations_data:
                association = CustomerClientAssociation(
                    customer_id=customers[assoc_data["customer_idx"]].id,
                    client_id=clients[assoc_data["client_idx"]].id,
                    relationship_type=assoc_data["relationship"],
                    is_active="active",
                    is_primary_contact=assoc_data["is_primary"],
                    percentage_ownership=assoc_data["percentage"]
                )
                db.add(association)
                created_associations.append(association)
            
            await db.flush()
            print(f"✅ Created {len(created_associations)} customer-client associations")
            
            # Create essential users for testing
            password_hash = get_password_hash("admin")  # Password is "admin"
            
            users_data = [
                {"email": "admin@agentbooks.com", "role": UserRole.practice_owner},
                {"email": "accountant@agentbooks.com", "role": UserRole.accountant},
                {"email": "nyal@portalsys.co.uk", "role": UserRole.client},
                {"email": "ashani@portalsys.co.uk", "role": UserRole.client},
                {"email": "siyan@portalsys.co.uk", "role": UserRole.client},
                {"email": "alice.johnson@abcdltd.com", "role": UserRole.client},
                {"email": "harrison@harrisonbernstein.co.uk", "role": UserRole.client},
                {"email": "david@beckfieldsstore.com", "role": UserRole.client},
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
            
            # Print comprehensive summary
            print("\n📊 Summary:")
            print(f"Practice: {practice.name} (WhatsApp: {practice.whatsapp_number})")
            print(f"Clients: {len(clients)}")
            print(f"Customers: {len(customers)}")
            print(f"Users: {len(created_users)}")
            print(f"Associations: {len(created_associations)}")
            
            print("\n🏢 Clients & Primary Contacts:")
            for i, client in enumerate(clients):
                # Find primary contact for this client
                primary_assoc_data = next((ad for ad in associations_data if ad["client_idx"] == i and ad["is_primary"]), None)
                if primary_assoc_data:
                    primary_customer = customers[primary_assoc_data["customer_idx"]]
                    print(f"  {client.business_name} - Primary: {primary_customer.name} ({primary_customer.primary_phone})")
                else:
                    print(f"  {client.business_name} - No primary contact found")
            
            print("\n👥 All Customer Details:")
            for customer in customers:
                print(f"  {customer.name} ({customer.primary_phone}) - {customer.primary_email}")
            
            print("\n🔗 Complex Associations:")
            client_names = [c.business_name for c in clients]
            for assoc_data in associations_data:
                customer = customers[assoc_data["customer_idx"]]
                client = clients[assoc_data["client_idx"]]
                primary_flag = "🟢 PRIMARY" if assoc_data["is_primary"] else ""
                percentage = f" ({assoc_data['percentage']})" if assoc_data["percentage"] else ""
                print(f"  {customer.name} → {client.business_name}: {assoc_data['relationship'].value}{percentage} {primary_flag}")
            
            print("\n🔑 Login Credentials (all users have password 'admin'):")
            for user in created_users:
                print(f"  {user.email} - {user.role.value}")
            
            print("\n📱 Twilio Testing Numbers:")
            for customer in customers:
                print(f"  {customer.name}: {customer.primary_phone}")
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Error seeding database: {e}")
            raise
        finally:
            await engine.dispose()

if __name__ == "__main__":
    print("🚀 AgentBooks Database Seeder - Complete Rebuild & Multi-Company Setup")
    print("=" * 85)
    asyncio.run(create_sample_data())
    print("=" * 85)
    print("✨ Database rebuilt and seeded! Ready for testing with multiple companies and complex associations.") 