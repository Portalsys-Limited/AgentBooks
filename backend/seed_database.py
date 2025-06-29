#!/usr/bin/env python3
"""
Database seed script for AgentBooks
Drops and recreates all tables, then seeds with sample data for Twilio testing
"""

import asyncio
import sys
import os
from datetime import date, datetime
from decimal import Decimal
sys.path.append('/app')

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import delete, text
from config.settings import settings
from db.models.base import Base  # Import Base to access metadata
from db.models import (
    Practice, User, Individual, Customer, Client, CustomerClientAssociation, 
    Service, ClientService, Income, Property, PropertyIndividualRelationship,
    UserRole, BusinessType, IndividualRelationship, ChartOfAccount, AccountType, AccountSource, SyncStatus
)
from db.models.individuals import Gender, MaritalStatus
from db.models.customer import MLRStatus, CustomerStatus
from db.models.income import IncomeType
from db.models.property import PropertyType, PropertyStatus
from db.models.customer_client_association import RelationshipType
from db.models.individual_relationship import IndividualRelationType
from db.models.property_individual_relationship import OwnershipType
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
            
            # Drop all tables with CASCADE to handle foreign key dependencies
            print("🗑️  Dropping all existing tables...")
            async with engine.begin() as conn:
                # Get all table names and drop them with CASCADE
                await conn.execute(text("DROP SCHEMA public CASCADE;"))
                await conn.execute(text("CREATE SCHEMA public;"))
            print("✅ All tables dropped")
            
            # Create all tables from current models
            print("🏗️  Creating all tables from current models...")
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            print("✅ All tables created from models")
            
            # Create Practice with WhatsApp number
            practice = Practice(
                name="AgentBooks Test Practice",
                whatsapp_number="+14155238886",
                main_phone="+442079460755", 
                main_email="admin@agentbooks.com"
            )
            db.add(practice)
            await db.flush()
            print(f"✅ Created practice: {practice.name}")
            
            # Create Individuals with detailed personal information
            individuals_data = [
                {
                    "first_name": "Nyal",
                    "last_name": "Patel",
                    "title": "Mr",
                    "email": "nyal@portalsys.co.uk",
                    "primary_mobile": "+447494101144",
                    "date_of_birth": date(1985, 3, 15),
                    "gender": Gender.male,
                    "marital_status": MaritalStatus.married,
                    "nationality": "British",
                    "address_line_1": "123 Tech Street",
                    "town": "London",
                    "post_code": "SW1A 1AA",
                    "country": "United Kingdom"
                },
                {
                    "first_name": "Ashani",
                    "last_name": "Patel",
                    "title": "Mrs",
                    "email": "ashani@portalsys.co.uk",
                    "primary_mobile": "+447595205210",
                    "date_of_birth": date(1987, 7, 22),
                    "gender": Gender.female,
                    "marital_status": MaritalStatus.married,
                    "nationality": "British",
                    "address_line_1": "123 Tech Street",
                    "town": "London",
                    "post_code": "SW1A 1AA",
                    "country": "United Kingdom"
                },
                {
                    "first_name": "Siyan",
                    "last_name": "Patel",
                    "title": "Mr",
                    "email": "siyan@portalsys.co.uk",
                    "primary_mobile": "+447970869912",
                    "date_of_birth": date(2010, 11, 8),
                    "gender": Gender.male,
                    "marital_status": MaritalStatus.single,
                    "nationality": "British",
                    "address_line_1": "123 Tech Street",
                    "town": "London",
                    "post_code": "SW1A 1AA",
                    "country": "United Kingdom"
                },
                {
                    "first_name": "Alice",
                    "last_name": "Johnson",
                    "title": "Ms",
                    "email": "alice.johnson@abcdltd.com",
                    "primary_mobile": "+447123456789",
                    "date_of_birth": date(1982, 1, 12),
                    "gender": Gender.female,
                    "marital_status": MaritalStatus.divorced,
                    "nationality": "British",
                    "address_line_1": "456 Business Ave",
                    "town": "Manchester",
                    "post_code": "M1 2AB",
                    "country": "United Kingdom"
                },
                {
                    "first_name": "Robert",
                    "last_name": "Smith",
                    "title": "Mr",
                    "email": "robert.smith@abcdltd.com",
                    "primary_mobile": "+447234567890",
                    "date_of_birth": date(1978, 9, 5),
                    "gender": Gender.male,
                    "marital_status": MaritalStatus.married,
                    "nationality": "British",
                    "address_line_1": "789 Industrial Road",
                    "town": "Manchester",
                    "post_code": "M2 3CD",
                    "country": "United Kingdom"
                },
                {
                    "first_name": "Harrison",
                    "last_name": "Bernstein",
                    "title": "Mr",
                    "email": "harrison@harrisonbernstein.co.uk",
                    "primary_mobile": "+447345678901",
                    "date_of_birth": date(1975, 12, 18),
                    "gender": Gender.male,
                    "marital_status": MaritalStatus.married,
                    "nationality": "British",
                    "address_line_1": "321 Legal Square",
                    "town": "Birmingham",
                    "post_code": "B1 4EF",
                    "country": "United Kingdom"
                },
                {
                    "first_name": "Sarah",
                    "last_name": "Bernstein",
                    "title": "Mrs",
                    "email": "sarah@harrisonbernstein.co.uk",
                    "primary_mobile": "+447456789012",
                    "date_of_birth": date(1977, 4, 25),
                    "gender": Gender.female,
                    "marital_status": MaritalStatus.married,
                    "nationality": "British",
                    "address_line_1": "321 Legal Square",
                    "town": "Birmingham",
                    "post_code": "B1 4EF",
                    "country": "United Kingdom"
                },
                {
                    "first_name": "David",
                    "last_name": "Beckfield",
                    "title": "Mr",
                    "email": "david@beckfieldsstore.com",
                    "primary_mobile": "+447567890123",
                    "date_of_birth": date(1980, 6, 10),
                    "gender": Gender.male,
                    "marital_status": MaritalStatus.civil_partnership,
                    "nationality": "British",
                    "address_line_1": "654 Retail Street",
                    "town": "Leeds",
                    "post_code": "LS1 5GH",
                    "country": "United Kingdom"
                },
                {
                    "first_name": "Emma",
                    "last_name": "Beckfield",
                    "title": "Ms",
                    "email": "emma@beckfieldsstore.com",
                    "primary_mobile": "+447678901234",
                    "date_of_birth": date(1983, 8, 14),
                    "gender": Gender.female,
                    "marital_status": MaritalStatus.civil_partnership,
                    "nationality": "British",
                    "address_line_1": "654 Retail Street",
                    "town": "Leeds",
                    "post_code": "LS1 5GH",
                    "country": "United Kingdom"
                }
            ]
            
            individuals = []
            for individual_data in individuals_data:
                individual = Individual(
                    practice_id=practice.id,
                    **individual_data
                )
                db.add(individual)
                individuals.append(individual)
            
            await db.flush()
            print(f"✅ Created {len(individuals)} individuals")
            
            # Create Individual Relationships
            individual_relationships_data = [
                # Family relationships for Nyal, Ashani, and Siyan
                {
                    "from_idx": 0,  # Nyal
                    "to_idx": 1,    # Ashani
                    "type": IndividualRelationType.spouse,
                    "description": "Married since 2010"
                },
                {
                    "from_idx": 0,  # Nyal
                    "to_idx": 2,    # Siyan
                    "type": IndividualRelationType.parent,
                    "description": "Father"
                },
                {
                    "from_idx": 1,  # Ashani
                    "to_idx": 2,    # Siyan
                    "type": IndividualRelationType.parent,
                    "description": "Mother"
                },
                
                # Harrison and Sarah Bernstein
                {
                    "from_idx": 5,  # Harrison
                    "to_idx": 6,    # Sarah
                    "type": IndividualRelationType.spouse,
                    "description": "Married since 2005"
                },
                
                # David and Emma Beckfield
                {
                    "from_idx": 7,  # David
                    "to_idx": 8,    # Emma
                    "type": IndividualRelationType.partner,
                    "description": "Civil Partnership since 2015"
                },
                
                # Business relationships
                {
                    "from_idx": 3,  # Alice
                    "to_idx": 4,    # Robert
                    "type": IndividualRelationType.friend,
                    "description": "Business partners and friends"
                },
                
                # Extended family relationships
                {
                    "from_idx": 5,  # Harrison
                    "to_idx": 0,    # Nyal
                    "type": IndividualRelationType.cousin,
                    "description": "Second cousins, tech advisor"
                }
            ]
            
            individual_relationships = []
            for rel_data in individual_relationships_data:
                relationship = IndividualRelationship(
                    from_individual_id=individuals[rel_data["from_idx"]].id,
                    to_individual_id=individuals[rel_data["to_idx"]].id,
                    relationship_type=rel_data["type"],
                    description=rel_data["description"],
                    practice_id=practice.id
                )
                db.add(relationship)
                individual_relationships.append(relationship)
            
            await db.flush()
            print(f"✅ Created {len(individual_relationships)} individual relationships")
            
            # Create Customers linked to individuals
            customers_data = [
                {
                    "individual_idx": 0,  # Nyal
                    "ni_number": "AB123456C",
                    "personal_utr_number": "1234567890",
                    "status": CustomerStatus.active,
                    "do_they_own_sa": True,
                    "mlr_status": MLRStatus.complete,
                    "mlr_date_complete": date(2023, 1, 15),
                    "passport_number": "123456789",
                    "uk_home_telephone": "+442079460755"
                },
                {
                    "individual_idx": 1,  # Ashani
                    "ni_number": "CD789012D",
                    "personal_utr_number": "2345678901",
                    "status": CustomerStatus.active,
                    "do_they_own_sa": False,
                    "mlr_status": MLRStatus.complete,
                    "mlr_date_complete": date(2023, 2, 10),
                    "driving_license": "PATEL850322AS9IJ"
                },
                {
                    "individual_idx": 2,  # Siyan
                    "ni_number": "EF345678E",
                    "status": CustomerStatus.active,
                    "do_they_own_sa": False,
                    "mlr_status": MLRStatus.pending
                },
                {
                    "individual_idx": 3,  # Alice
                    "ni_number": "GH901234F",
                    "personal_utr_number": "3456789012",
                    "status": CustomerStatus.active,
                    "do_they_own_sa": True,
                    "mlr_status": MLRStatus.complete,
                    "mlr_date_complete": date(2023, 3, 5)
                },
                {
                    "individual_idx": 4,  # Robert
                    "ni_number": "IJ567890G",
                    "status": CustomerStatus.active,
                    "do_they_own_sa": False,
                    "mlr_status": MLRStatus.in_progress
                },
                {
                    "individual_idx": 5,  # Harrison
                    "ni_number": "KL123456H",
                    "personal_utr_number": "4567890123",
                    "status": CustomerStatus.active,
                    "do_they_own_sa": True,
                    "mlr_status": MLRStatus.complete,
                    "mlr_date_complete": date(2023, 1, 20)
                },
                {
                    "individual_idx": 6,  # Sarah
                    "ni_number": "MN789012I",
                    "status": CustomerStatus.active,
                    "do_they_own_sa": False,
                    "mlr_status": MLRStatus.complete,
                    "mlr_date_complete": date(2023, 1, 25)
                },
                {
                    "individual_idx": 7,  # David
                    "ni_number": "OP345678J",
                    "personal_utr_number": "5678901234",
                    "status": CustomerStatus.active,
                    "do_they_own_sa": True,
                    "mlr_status": MLRStatus.complete,
                    "mlr_date_complete": date(2023, 4, 1)
                },
                {
                    "individual_idx": 8,  # Emma
                    "ni_number": "QR901234K",
                    "status": CustomerStatus.active,
                    "do_they_own_sa": False,
                    "mlr_status": MLRStatus.complete,
                    "mlr_date_complete": date(2023, 4, 5)
                }
            ]
            
            customers = []
            for customer_data in customers_data:
                individual_idx = customer_data.pop("individual_idx")
                customer = Customer(
                    individual_id=individuals[individual_idx].id,
                    practice_id=practice.id,
                    **customer_data
                )
                db.add(customer)
                customers.append(customer)
            
            await db.flush()
            print(f"✅ Created {len(customers)} customers")
            
            # Create Incomes for individuals (not customers)
            incomes_data = [
                # Nyal's incomes
                {"individual_idx": 0, "income_type": IncomeType.self_employment, "income_amount": Decimal("85000"), "description": "Technology Consulting Services"},
                {"individual_idx": 0, "income_type": IncomeType.dividend, "income_amount": Decimal("15000"), "description": "Portalsys Ltd Dividends"},
                {"individual_idx": 0, "income_type": IncomeType.rental, "income_amount": Decimal("18000"), "description": "Buy-to-let Property Rental"},
                
                # Ashani's incomes
                {"individual_idx": 1, "income_type": IncomeType.employment, "income_amount": Decimal("45000"), "description": "Marketing Manager Salary"},
                {"individual_idx": 1, "income_type": IncomeType.dividend, "income_amount": Decimal("8000"), "description": "Portalsys Ltd Dividends"},
                
                # Siyan's incomes (student/part-time)
                {"individual_idx": 2, "income_type": IncomeType.employment, "income_amount": Decimal("6000"), "description": "Part-time Tech Support"},
                
                # Alice's incomes
                {"individual_idx": 3, "income_type": IncomeType.self_employment, "income_amount": Decimal("65000"), "description": "Manufacturing Consultancy"},
                {"individual_idx": 3, "income_type": IncomeType.dividend, "income_amount": Decimal("25000"), "description": "ABCD Ltd Dividends"},
                
                # Robert's incomes
                {"individual_idx": 4, "income_type": IncomeType.employment, "income_amount": Decimal("55000"), "description": "Operations Manager"},
                {"individual_idx": 4, "income_type": IncomeType.dividend, "income_amount": Decimal("12000"), "description": "ABCD Ltd Dividends"},
                
                # Harrison's incomes
                {"individual_idx": 5, "income_type": IncomeType.self_employment, "income_amount": Decimal("120000"), "description": "Legal Services Partnership"},
                {"individual_idx": 5, "income_type": IncomeType.dividend, "income_amount": Decimal("35000"), "description": "Harrison Bernstein Ltd Dividends"},
                {"individual_idx": 5, "income_type": IncomeType.interest, "income_amount": Decimal("8000"), "description": "Stock Market Investments"},
                
                # Sarah's incomes
                {"individual_idx": 6, "income_type": IncomeType.employment, "income_amount": Decimal("40000"), "description": "Practice Administration"},
                {"individual_idx": 6, "income_type": IncomeType.dividend, "income_amount": Decimal("15000"), "description": "Harrison Bernstein Ltd Dividends"},
                
                # David's incomes
                {"individual_idx": 7, "income_type": IncomeType.self_employment, "income_amount": Decimal("75000"), "description": "Retail Business Operations"},
                {"individual_idx": 7, "income_type": IncomeType.dividend, "income_amount": Decimal("20000"), "description": "Beckfields Store Ltd Dividends"},
                
                # Emma's incomes
                {"individual_idx": 8, "income_type": IncomeType.employment, "income_amount": Decimal("38000"), "description": "Store Manager Salary"},
                {"individual_idx": 8, "income_type": IncomeType.dividend, "income_amount": Decimal("18000"), "description": "Beckfields Store Ltd Dividends"}
            ]
            
            incomes = []
            for income_data in incomes_data:
                individual_idx = income_data.pop("individual_idx")
                income = Income(
                    individual_id=individuals[individual_idx].id,
                    **income_data
                )
                db.add(income)
                incomes.append(income)
            
            await db.flush()
            print(f"✅ Created {len(incomes)} income records")
            
            # Create Properties (without individual_id)
            properties_data = [
                # Main Residence
                {
                    "property_name": "Main Residence",
                    "property_type": PropertyType.residential,
                    "property_status": PropertyStatus.owned,
                    "address_line_1": "123 Tech Street",
                    "town": "London",
                    "post_code": "SW1A 1AA",
                    "country": "United Kingdom",
                    "purchase_price": Decimal("450000"),
                    "current_value": Decimal("520000"),
                    "bedrooms": "4",
                    "bathrooms": "2",
                    "is_rental_property": False
                },
                # Buy-to-Let Property
                {
                    "property_name": "Buy-to-Let Property",
                    "property_type": PropertyType.residential,
                    "property_status": PropertyStatus.owned,
                    "address_line_1": "789 Investment Road",
                    "town": "Manchester",
                    "post_code": "M3 4EF",
                    "country": "United Kingdom",
                    "purchase_price": Decimal("180000"),
                    "current_value": Decimal("220000"),
                    "monthly_rental_income": Decimal("1500"),
                    "annual_rental_income": Decimal("18000"),
                    "bedrooms": "2",
                    "bathrooms": "1",
                    "is_rental_property": True,
                    "tenant_name": "John & Jane Tenant",
                    "lease_start_date": datetime(2023, 1, 1),
                    "lease_end_date": datetime(2024, 12, 31)
                },
                # Family Home
                {
                    "property_name": "Family Home",
                    "property_type": PropertyType.residential,
                    "property_status": PropertyStatus.owned,
                    "address_line_1": "456 Business Ave",
                    "town": "Manchester",
                    "post_code": "M1 2AB",
                    "country": "United Kingdom",
                    "purchase_price": Decimal("280000"),
                    "current_value": Decimal("320000"),
                    "bedrooms": "3",
                    "bathrooms": "2",
                    "is_rental_property": False
                },
                # Law Practice Offices
                {
                    "property_name": "Law Practice Offices",
                    "property_type": PropertyType.commercial,
                    "property_status": PropertyStatus.owned,
                    "address_line_1": "321 Legal Square",
                    "town": "Birmingham",
                    "post_code": "B1 4EF",
                    "country": "United Kingdom",
                    "purchase_price": Decimal("650000"),
                    "current_value": Decimal("750000"),
                    "property_size": "2500 sq ft",
                    "is_rental_property": False,
                    "description": "Ground floor offices with meeting rooms"
                },
                # Holiday Home
                {
                    "property_name": "Holiday Home",
                    "property_type": PropertyType.residential,
                    "property_status": PropertyStatus.owned,
                    "address_line_1": "567 Coastal View",
                    "town": "Brighton",
                    "post_code": "BN1 3GH",
                    "country": "United Kingdom",
                    "purchase_price": Decimal("380000"),
                    "current_value": Decimal("420000"),
                    "bedrooms": "3",
                    "bathrooms": "2",
                    "is_rental_property": False,
                    "description": "Seaside holiday home"
                },
                # Beckfields Store
                {
                    "property_name": "Beckfields Store",
                    "property_type": PropertyType.commercial,
                    "property_status": PropertyStatus.leased,
                    "address_line_1": "654 Retail Street",
                    "town": "Leeds",
                    "post_code": "LS1 5GH",
                    "country": "United Kingdom",
                    "property_size": "1800 sq ft",
                    "is_rental_property": False,
                    "description": "Ground floor retail unit with storage"
                },
                # Shared Residence
                {
                    "property_name": "Shared Residence",
                    "property_type": PropertyType.residential,
                    "property_status": PropertyStatus.owned,
                    "address_line_1": "101 Shared Gardens",
                    "town": "Leeds",
                    "post_code": "LS2 6IJ",
                    "country": "United Kingdom",
                    "purchase_price": Decimal("195000"),
                    "current_value": Decimal("225000"),
                    "bedrooms": "2",
                    "bathrooms": "1",
                    "is_rental_property": False
                }
            ]
            
            properties = []
            for property_data in properties_data:
                property_obj = Property(**property_data)
                db.add(property_obj)
                properties.append(property_obj)
            
            await db.flush()
            print(f"✅ Created {len(properties)} property records")

            # Create Property-Individual Relationships
            property_relationships_data = [
                # Main Residence - Nyal & Ashani joint owners
                {
                    "property_idx": 0,
                    "individual_idx": 0,  # Nyal
                    "ownership_type": OwnershipType.joint_owner,
                    "ownership_percentage": Decimal("50.00"),
                    "is_primary_owner": True,
                    "start_date": datetime(2015, 6, 1),
                    "description": "Joint owner with spouse"
                },
                {
                    "property_idx": 0,
                    "individual_idx": 1,  # Ashani
                    "ownership_type": OwnershipType.joint_owner,
                    "ownership_percentage": Decimal("50.00"),
                    "start_date": datetime(2015, 6, 1),
                    "description": "Joint owner with spouse"
                },
                
                # Buy-to-Let Property - Nyal sole owner
                {
                    "property_idx": 1,
                    "individual_idx": 0,  # Nyal
                    "ownership_type": OwnershipType.sole_owner,
                    "ownership_percentage": Decimal("100.00"),
                    "is_primary_owner": True,
                    "start_date": datetime(2018, 3, 15),
                    "description": "Investment property"
                },
                
                # Family Home - Alice sole owner
                {
                    "property_idx": 2,
                    "individual_idx": 3,  # Alice
                    "ownership_type": OwnershipType.sole_owner,
                    "ownership_percentage": Decimal("100.00"),
                    "is_primary_owner": True,
                    "start_date": datetime(2016, 8, 1),
                    "description": "Primary residence"
                },
                
                # Law Practice Offices - Harrison & Sarah joint owners
                {
                    "property_idx": 3,
                    "individual_idx": 5,  # Harrison
                    "ownership_type": OwnershipType.joint_owner,
                    "ownership_percentage": Decimal("70.00"),
                    "is_primary_owner": True,
                    "start_date": datetime(2012, 4, 1),
                    "description": "Business premises - majority owner"
                },
                {
                    "property_idx": 3,
                    "individual_idx": 6,  # Sarah
                    "ownership_type": OwnershipType.joint_owner,
                    "ownership_percentage": Decimal("30.00"),
                    "start_date": datetime(2012, 4, 1),
                    "description": "Business premises - minority owner"
                },
                
                # Holiday Home - Harrison sole owner
                {
                    "property_idx": 4,
                    "individual_idx": 5,  # Harrison
                    "ownership_type": OwnershipType.sole_owner,
                    "ownership_percentage": Decimal("100.00"),
                    "is_primary_owner": True,
                    "start_date": datetime(2019, 7, 1),
                    "description": "Holiday property"
                },
                
                # Beckfields Store - David & Emma joint tenants
                {
                    "property_idx": 5,
                    "individual_idx": 7,  # David
                    "ownership_type": OwnershipType.tenant,
                    "ownership_percentage": Decimal("50.00"),
                    "is_primary_owner": True,
                    "start_date": datetime(2020, 1, 1),
                    "end_date": datetime(2025, 12, 31),
                    "description": "Commercial lease - primary tenant"
                },
                {
                    "property_idx": 5,
                    "individual_idx": 8,  # Emma
                    "ownership_type": OwnershipType.tenant,
                    "ownership_percentage": Decimal("50.00"),
                    "start_date": datetime(2020, 1, 1),
                    "end_date": datetime(2025, 12, 31),
                    "description": "Commercial lease - joint tenant"
                },
                
                # Shared Residence - David & Emma beneficial owners
                {
                    "property_idx": 6,
                    "individual_idx": 7,  # David
                    "ownership_type": OwnershipType.beneficial_owner,
                    "ownership_percentage": Decimal("50.00"),
                    "is_primary_owner": True,
                    "start_date": datetime(2020, 6, 1),
                    "description": "Shared ownership property"
                },
                {
                    "property_idx": 6,
                    "individual_idx": 8,  # Emma
                    "ownership_type": OwnershipType.beneficial_owner,
                    "ownership_percentage": Decimal("50.00"),
                    "start_date": datetime(2020, 6, 1),
                    "description": "Shared ownership property"
                }
            ]
            
            property_relationships = []
            for rel_data in property_relationships_data:
                property_idx = rel_data.pop("property_idx")
                individual_idx = rel_data.pop("individual_idx")
                relationship = PropertyIndividualRelationship(
                    property_id=properties[property_idx].id,
                    individual_id=individuals[individual_idx].id,
                    **rel_data
                )
                db.add(relationship)
                property_relationships.append(relationship)
            
            await db.flush()
            print(f"✅ Created {len(property_relationships)} property-individual relationships")
            
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
                
                # ABCD Ltd associations - Adding Nyal as investor
                {"customer_idx": 0, "client_idx": 1, "relationship": RelationshipType.investor, "is_primary": False, "percentage": "15%"},  # Nyal - Investor
                {"customer_idx": 3, "client_idx": 1, "relationship": RelationshipType.director, "is_primary": True, "percentage": "45%"},  # Alice - Director (PRIMARY)
                {"customer_idx": 4, "client_idx": 1, "relationship": RelationshipType.shareholder, "is_primary": False, "percentage": "40%"},  # Robert - Shareholder
                
                # Harrison Bernstein Ltd associations - Adding Nyal as consultant
                {"customer_idx": 0, "client_idx": 2, "relationship": RelationshipType.consultant, "is_primary": False, "percentage": "0%"},  # Nyal - Technology Consultant
                {"customer_idx": 5, "client_idx": 2, "relationship": RelationshipType.director, "is_primary": True, "percentage": "70%"},  # Harrison - Director (PRIMARY)
                {"customer_idx": 6, "client_idx": 2, "relationship": RelationshipType.spouse, "is_primary": False, "percentage": "30%"},  # Sarah - Spouse & Shareholder
                
                # Beckfields Store Ltd associations - Adding Nyal as technology advisor
                {"customer_idx": 0, "client_idx": 3, "relationship": RelationshipType.consultant, "is_primary": False, "percentage": "0%"},  # Nyal - Technology Advisor
                {"customer_idx": 7, "client_idx": 3, "relationship": RelationshipType.director, "is_primary": True, "percentage": "55%"},  # David - Director (PRIMARY)
                {"customer_idx": 8, "client_idx": 3, "relationship": RelationshipType.partner, "is_primary": False, "percentage": "45%"},  # Emma - Partner
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
            
            # Create Services for the practice
            services_data = [
                {
                    "service_code": "BOOK",
                    "name": "Bookkeeping Services",
                    "description": "Monthly bookkeeping including bank reconciliation, expense categorization, and financial reporting"
                },
                {
                    "service_code": "PAYROLL",
                    "name": "Payroll Services", 
                    "description": "Full payroll processing including RTI submissions, pension contributions, and payslips"
                },
                {
                    "service_code": "VAT",
                    "name": "VAT Returns",
                    "description": "Quarterly VAT return preparation and submission to HMRC"
                },
                {
                    "service_code": "CT",
                    "name": "Corporation Tax",
                    "description": "Annual corporation tax return preparation and filing"
                },
                {
                    "service_code": "ACCOUNTS",
                    "name": "Annual Accounts",
                    "description": "Preparation of statutory annual accounts for Companies House filing"
                }
            ]
            
            services = []
            for service_data in services_data:
                service = Service(
                    practice_id=practice.id,
                    service_code=service_data["service_code"],
                    name=service_data["name"],
                    description=service_data["description"]
                )
                db.add(service)
                services.append(service)
            
            await db.flush()
            print(f"✅ Created {len(services)} services")
            
            # Create Client-Service assignments
            client_service_assignments = [
                # Portalsys Ltd
                {"client_idx": 0, "service_code": "BOOK", "enabled": True, "price": 850.00},
                {"client_idx": 0, "service_code": "PAYROLL", "enabled": True, "price": 125.00},
                {"client_idx": 0, "service_code": "VAT", "enabled": True, "price": 195.00},
                {"client_idx": 0, "service_code": "CT", "enabled": True, "price": 750.00},
                {"client_idx": 0, "service_code": "ACCOUNTS", "enabled": True, "price": 1200.00},
                
                # ABCD Ltd
                {"client_idx": 1, "service_code": "BOOK", "enabled": True, "price": 650.00},
                {"client_idx": 1, "service_code": "VAT", "enabled": True, "price": 150.00},
                {"client_idx": 1, "service_code": "CT", "enabled": True, "price": 650.00},
                {"client_idx": 1, "service_code": "ACCOUNTS", "enabled": True, "price": 950.00},
                
                # Harrison Bernstein Ltd
                {"client_idx": 2, "service_code": "PAYROLL", "enabled": True, "price": 110.00},
                {"client_idx": 2, "service_code": "VAT", "enabled": True, "price": 175.00},
                {"client_idx": 2, "service_code": "CT", "enabled": True, "price": 700.00},
                {"client_idx": 2, "service_code": "ACCOUNTS", "enabled": True, "price": 1100.00},
                
                # Beckfields Store Ltd
                {"client_idx": 3, "service_code": "BOOK", "enabled": True, "price": 550.00},
                {"client_idx": 3, "service_code": "PAYROLL", "enabled": True, "price": 85.00},
                {"client_idx": 3, "service_code": "VAT", "enabled": True, "price": 135.00},
                {"client_idx": 3, "service_code": "CT", "enabled": True, "price": 600.00},
                {"client_idx": 3, "service_code": "ACCOUNTS", "enabled": True, "price": 850.00},
            ]
            
            created_client_services = []
            for assignment in client_service_assignments:
                service = next(s for s in services if s.service_code == assignment["service_code"])
                client_service = ClientService(
                    client_id=clients[assignment["client_idx"]].id,
                    service_id=service.id,
                    is_enabled=assignment["enabled"],
                    price=assignment["price"]
                )
                db.add(client_service)
                created_client_services.append(client_service)
            
            await db.flush()
            print(f"✅ Created {len(created_client_services)} client-service assignments")
            
            # Create Chart of Accounts for each client
            print("Creating chart of accounts...")
            source_mapping = {
                'xero': AccountSource.XERO,
                'quickbooks': AccountSource.QUICKBOOKS,
                'odoo': AccountSource.ODOO
            }
            
            for client in clients:
                # Get source based on client's accounting software, default to MANUAL if None
                source = AccountSource.MANUAL
                if client.accounting_software:
                    source = source_mapping.get(client.accounting_software.value.lower(), AccountSource.MANUAL)
                
                # Standard accounts structure
                accounts_data = [
                    # Asset accounts (1000-1999)
                    {'code': '1000', 'name': 'Cash', 'type': AccountType.ASSET},
                    {'code': '1100', 'name': 'Accounts Receivable', 'type': AccountType.ASSET},
                    {'code': '1200', 'name': 'Inventory', 'type': AccountType.ASSET},
                    {'code': '1300', 'name': 'Prepaid Expenses', 'type': AccountType.ASSET},
                    {'code': '1400', 'name': 'Fixed Assets', 'type': AccountType.ASSET},
                    {'code': '1500', 'name': 'Accumulated Depreciation', 'type': AccountType.ASSET},
                    
                    # Liability accounts (2000-2999)
                    {'code': '2000', 'name': 'Accounts Payable', 'type': AccountType.LIABILITY},
                    {'code': '2100', 'name': 'Accrued Expenses', 'type': AccountType.LIABILITY},
                    {'code': '2200', 'name': 'Income Tax Payable', 'type': AccountType.LIABILITY},
                    {'code': '2300', 'name': 'VAT Payable', 'type': AccountType.LIABILITY},
                    {'code': '2400', 'name': 'Payroll Liabilities', 'type': AccountType.LIABILITY},
                    {'code': '2500', 'name': 'Long-term Debt', 'type': AccountType.LIABILITY},
                    
                    # Equity accounts (3000-3999)
                    {'code': '3000', 'name': 'Owner\'s Equity', 'type': AccountType.EQUITY},
                    {'code': '3100', 'name': 'Retained Earnings', 'type': AccountType.EQUITY},
                    {'code': '3200', 'name': 'Common Stock', 'type': AccountType.EQUITY},
                    
                    # Revenue accounts (4000-4999)
                    {'code': '4000', 'name': 'Sales Revenue', 'type': AccountType.REVENUE},
                    {'code': '4100', 'name': 'Service Revenue', 'type': AccountType.REVENUE},
                    {'code': '4200', 'name': 'Interest Income', 'type': AccountType.REVENUE},
                    {'code': '4300', 'name': 'Other Revenue', 'type': AccountType.REVENUE},
                    
                    # Expense accounts (5000-5999)
                    {'code': '5000', 'name': 'Cost of Goods Sold', 'type': AccountType.EXPENSE},
                    {'code': '5100', 'name': 'Salaries Expense', 'type': AccountType.EXPENSE},
                    {'code': '5200', 'name': 'Rent Expense', 'type': AccountType.EXPENSE},
                    {'code': '5300', 'name': 'Utilities Expense', 'type': AccountType.EXPENSE},
                    {'code': '5400', 'name': 'Office Supplies', 'type': AccountType.EXPENSE},
                    {'code': '5500', 'name': 'Marketing Expense', 'type': AccountType.EXPENSE},
                    {'code': '5600', 'name': 'Insurance Expense', 'type': AccountType.EXPENSE},
                    {'code': '5700', 'name': 'Depreciation Expense', 'type': AccountType.EXPENSE},
                    {'code': '5800', 'name': 'Bank Fees', 'type': AccountType.EXPENSE},
                    {'code': '5900', 'name': 'Miscellaneous Expense', 'type': AccountType.EXPENSE}
                ]
                
                for account_data in accounts_data:
                    account = ChartOfAccount(
                        client_id=client.id,
                        code=account_data['code'],
                        name=account_data['name'],
                        account_type=account_data['type'],
                        source=source,
                        is_active=True,
                        sync_status=SyncStatus.SYNCED if source != AccountSource.MANUAL else None
                    )
                    db.add(account)
            
            await db.flush()
            print(f"✅ Created {len(clients) * len(accounts_data)} chart of accounts entries ({len(accounts_data)} accounts for each of {len(clients)} clients)")
            
            # Create essential users for testing
            password_hash = get_password_hash("admin")  # Password is "admin"
            
            users_data = [
                {
                    "email": "admin@agentbooks.com", 
                    "role": UserRole.practice_owner,
                    "first_name": "Admin",
                    "last_name": "User"
                },
                {
                    "email": "accountant@agentbooks.com", 
                    "role": UserRole.accountant,
                    "first_name": "John",
                    "last_name": "Smith"
                },
                {
                    "email": "nyal@portalsys.co.uk", 
                    "role": UserRole.client,
                    "first_name": "Nyal",
                    "last_name": "Patel"
                },
                {
                    "email": "ashani@portalsys.co.uk", 
                    "role": UserRole.client,
                    "first_name": "Ashani",
                    "last_name": "Patel"
                },
                {
                    "email": "alice.johnson@abcdltd.com", 
                    "role": UserRole.client,
                    "first_name": "Alice",
                    "last_name": "Johnson"
                },
                {
                    "email": "harrison@harrisonbernstein.co.uk", 
                    "role": UserRole.client,
                    "first_name": "Harrison",
                    "last_name": "Bernstein"
                },
                {
                    "email": "david@beckfieldsstore.com", 
                    "role": UserRole.client,
                    "first_name": "David",
                    "last_name": "Beckfield"
                },
            ]
            
            created_users = []
            for user_data in users_data:
                user = User(
                    email=user_data["email"],
                    password_hash=password_hash,
                    role=user_data["role"],
                    first_name=user_data["first_name"],
                    last_name=user_data["last_name"],
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
            print(f"Individuals: {len(individuals)}")
            print(f"Customers: {len(customers)}")
            print(f"Incomes: {len(incomes)}")
            print(f"Properties: {len(properties)}")
            print(f"Clients: {len(clients)}")
            print(f"Users: {len(created_users)}")
            print(f"Associations: {len(created_associations)}")
            print(f"Services: {len(services)}")
            print(f"Client-Service Assignments: {len(created_client_services)}")
            print(f"Chart of Accounts: {len(clients) * len(accounts_data)} total ({len(accounts_data)} per client)")
            
            print("\n👥 Individual → Customer → Relations:")
            for i, individual in enumerate(individuals):
                customer = customers[i] if i < len(customers) else None
                if customer:
                    individual_incomes = [inc for inc in incomes if inc.individual_id == individual.id]
                    individual_properties = [
                        rel.property for rel in property_relationships 
                        if rel.individual_id == individual.id
                    ]
                    print(f"  {individual.full_name} ({individual.primary_mobile})")
                    print(f"    └─ Customer: NI {customer.ni_number}, MLR: {customer.mlr_status.value}")
                    print(f"    └─ Incomes: {len(individual_incomes)} records")
                    print(f"    └─ Properties: {len(individual_properties)} records")
            
            print("\n💰 Income Summary:")
            for i, individual in enumerate(individuals):
                individual_incomes = [inc for inc in incomes if inc.individual_id == individual.id]
                total_income = sum(inc.income_amount for inc in individual_incomes)
                print(f"  {individual.full_name}: £{total_income:,} total")
                for inc in individual_incomes:
                    print(f"    └─ {inc.income_type.value}: £{inc.income_amount:,} ({inc.description})")
            
            print("\n🏠 Property Summary:")
            for i, individual in enumerate(individuals):
                individual_properties = [
                    rel.property for rel in property_relationships 
                    if rel.individual_id == individual.id
                ]
                if individual_properties:
                    print(f"  {individual.full_name}:")
                    for prop in individual_properties:
                        rel = next(r for r in property_relationships 
                                 if r.individual_id == individual.id and r.property_id == prop.id)
                        ownership_info = f"{rel.ownership_type.value} ({rel.ownership_percentage}%)"
                        rental_info = f" (Rental: £{prop.monthly_rental_income}/month)" if prop.is_rental_property else ""
                        value_info = f"£{prop.current_value:,}" if prop.current_value else "No value recorded"
                        print(f"    └─ {prop.property_name}: {prop.property_type.value} - {ownership_info} - {value_info}{rental_info}")
            
            print("\n🔑 Login Credentials (all users have password 'admin'):")
            for user in created_users:
                print(f"  {user.email} - {user.role.value}")
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Error seeding database: {e}")
            raise
        finally:
            await engine.dispose()

if __name__ == "__main__":
    print("🚀 AgentBooks Database Seeder - Complete Rebuild with Individuals, Customers, Incomes & Properties")
    print("=" * 100)
    asyncio.run(create_sample_data())
    print("=" * 100)
    print("✨ Database rebuilt and seeded! Ready for testing with complete relational data structure.") 