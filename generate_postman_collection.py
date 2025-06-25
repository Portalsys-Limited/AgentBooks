#!/usr/bin/env python3
"""
AgentBooks Postman Collection Generator

This script generates a comprehensive Postman collection for the AgentBooks API
using fastapi2postman, with additional authentication setup and environment variables.

Usage:
    python generate_postman_collection.py

Requirements:
    pip install fastapi2postman requests
"""

import os
import sys
import json
import subprocess
from pathlib import Path
import requests
from datetime import datetime

# Add the backend directory to Python path for imports
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

def install_requirements():
    """Install required packages if not already installed."""
    try:
        import fastapi2postman
        print("✓ fastapi2postman is already installed")
    except ImportError:
        print("Installing fastapi2postman...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "fastapi2postman"])
        print("✓ fastapi2postman installed successfully")

def generate_base_collection():
    """Generate the base Postman collection using fastapi2postman."""
    print("Generating base Postman collection...")
    
    # Run fastapi2postman command from backend directory
    cmd = [
        "fastapi2postman",
        "--app", "main",
        "--output", "../agentbooks_collection.json"
    ]
    
    try:
        # Run from backend directory where main.py is located
        result = subprocess.run(cmd, capture_output=True, text=True, cwd="backend")
        if result.returncode != 0:
            print(f"Error running fastapi2postman: {result.stderr}")
            return False
        print("✓ Base collection generated successfully")
        return True
    except FileNotFoundError:
        print("Error: fastapi2postman command not found. Make sure it's installed and in PATH.")
        return False
    except Exception as e:
        print(f"Error generating collection: {e}")
        return False

def enhance_collection():
    """Enhance the generated collection with authentication and environment setup."""
    print("Enhancing collection with authentication and environment variables...")
    
    try:
        # Load the generated collection
        with open("agentbooks_collection.json", "r") as f:
            collection = json.load(f)
        
        # Update collection info
        collection["info"]["name"] = "AgentBooks API Collection"
        collection["info"]["description"] = "Comprehensive API collection for AgentBooks practice management system"
        collection["info"]["schema"] = "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        
        # Add authentication configuration
        collection["auth"] = {
            "type": "bearer",
            "bearer": [
                {
                    "key": "token",
                    "value": "{{auth_token}}",
                    "type": "string"
                }
            ]
        }
        
        # Add environment variables
        collection["variable"] = [
            {
                "key": "base_url",
                "value": "http://localhost:8000",
                "type": "string"
            },
            {
                "key": "auth_token",
                "value": "",
                "type": "string"
            },
            {
                "key": "user_id",
                "value": "",
                "type": "string"
            },
            {
                "key": "practice_id",
                "value": "",
                "type": "string"
            },
            {
                "key": "client_id",
                "value": "",
                "type": "string"
            }
        ]
        
        # Add pre-request scripts and tests to auth endpoints
        enhance_auth_endpoints(collection)
        
        # Add authentication to protected endpoints
        add_auth_to_protected_endpoints(collection)
        
        # Add test scripts
        add_test_scripts(collection)
        
        # Save enhanced collection
        with open("agentbooks_collection_enhanced.json", "w") as f:
            json.dump(collection, f, indent=2)
        
        print("✓ Collection enhanced successfully")
        return True
        
    except Exception as e:
        print(f"Error enhancing collection: {e}")
        return False

def enhance_auth_endpoints(collection):
    """Add special handling for authentication endpoints."""
    for item in collection.get("item", []):
        if item.get("name") == "Authentication":
            for auth_item in item.get("item", []):
                if "login" in auth_item.get("name", "").lower():
                    # Add test script to extract token
                    auth_item["event"] = [
                        {
                            "listen": "test",
                            "script": {
                                "exec": [
                                    "if (pm.response.code === 200) {",
                                    "    const responseJson = pm.response.json();",
                                    "    if (responseJson.access_token) {",
                                    "        pm.environment.set('auth_token', responseJson.access_token);",
                                    "        pm.environment.set('user_id', responseJson.user.id);",
                                    "        pm.environment.set('practice_id', responseJson.user.practice_id);",
                                    "        console.log('Auth token saved to environment');",
                                    "    }",
                                    "}",
                                    "",
                                    "pm.test('Login successful', function () {",
                                    "    pm.response.to.have.status(200);",
                                    "    pm.expect(pm.response.json()).to.have.property('access_token');",
                                    "});"
                                ],
                                "type": "text/javascript"
                            }
                        }
                    ]

def add_auth_to_protected_endpoints(collection):
    """Add bearer token authentication to protected endpoints."""
    def add_auth_recursive(items):
        for item in items:
            if "item" in item:  # This is a folder
                add_auth_recursive(item["item"])
            else:  # This is a request
                # Skip auth endpoints
                if item.get("name", "").lower() in ["login", "register"]:
                    continue
                
                # Add authorization header
                if "request" in item:
                    if "header" not in item["request"]:
                        item["request"]["header"] = []
                    
                    # Check if Authorization header already exists
                    auth_exists = any(h.get("key") == "Authorization" for h in item["request"]["header"])
                    
                    if not auth_exists:
                        item["request"]["header"].append({
                            "key": "Authorization",
                            "value": "Bearer {{auth_token}}",
                            "type": "text"
                        })
    
    add_auth_recursive(collection.get("item", []))

def add_test_scripts(collection):
    """Add test scripts to various endpoints."""
    def add_tests_recursive(items):
        for item in items:
            if "item" in item:  # This is a folder
                add_tests_recursive(item["item"])
            else:  # This is a request
                request_name = item.get("name", "").lower()
                
                # Add common tests
                common_tests = [
                    "pm.test('Response time is reasonable', function () {",
                    "    pm.expect(pm.response.responseTime).to.be.below(5000);",
                    "});",
                    "",
                    "pm.test('Response has correct content type', function () {",
                    "    pm.expect(pm.response.headers.get('Content-Type')).to.include('application/json');",
                    "});"
                ]
                
                # Add specific tests based on endpoint
                specific_tests = []
                
                if "create" in request_name or "post" in request_name:
                    specific_tests.extend([
                        "",
                        "pm.test('Resource created successfully', function () {",
                        "    pm.response.to.have.status(201);",
                        "});"
                    ])
                elif "get" in request_name or "read" in request_name:
                    specific_tests.extend([
                        "",
                        "pm.test('Resource retrieved successfully', function () {",
                        "    pm.response.to.have.status(200);",
                        "});"
                    ])
                elif "update" in request_name or "put" in request_name:
                    specific_tests.extend([
                        "",
                        "pm.test('Resource updated successfully', function () {",
                        "    pm.response.to.have.status(200);",
                        "});"
                    ])
                elif "delete" in request_name:
                    specific_tests.extend([
                        "",
                        "pm.test('Resource deleted successfully', function () {",
                        "    pm.response.to.have.status(204);",
                        "});"
                    ])
                
                # Companies House specific tests
                if "companies" in request_name:
                    specific_tests.extend([
                        "",
                        "if (pm.response.code === 200) {",
                        "    pm.test('Companies House data structure', function () {",
                        "        const jsonData = pm.response.json();",
                        "        pm.expect(jsonData).to.have.property('success');",
                        "        pm.expect(jsonData.success).to.be.true;",
                        "    });",
                        "}"
                    ])
                
                all_tests = common_tests + specific_tests
                
                if "event" not in item:
                    item["event"] = []
                
                # Check if test event already exists
                test_exists = any(event.get("listen") == "test" for event in item["event"])
                
                if not test_exists:
                    item["event"].append({
                        "listen": "test",
                        "script": {
                            "exec": all_tests,
                            "type": "text/javascript"
                        }
                    })
    
    add_tests_recursive(collection.get("item", []))

def create_environment_file():
    """Create a Postman environment file."""
    print("Creating Postman environment file...")
    
    environment = {
        "id": f"agentbooks-env-{datetime.now().strftime('%Y%m%d')}",
        "name": "AgentBooks Local Environment",
        "values": [
            {
                "key": "base_url",
                "value": "http://localhost:8000",
                "type": "default",
                "enabled": True
            },
            {
                "key": "auth_token",
                "value": "",
                "type": "secret",
                "enabled": True
            },
            {
                "key": "admin_email",
                "value": "admin@example.com",
                "type": "default",
                "enabled": True
            },
            {
                "key": "admin_password",
                "value": "admin123",
                "type": "secret",
                "enabled": True
            },
            {
                "key": "user_id",
                "value": "",
                "type": "default",
                "enabled": True
            },
            {
                "key": "practice_id",
                "value": "",
                "type": "default",
                "enabled": True
            },
            {
                "key": "client_id",
                "value": "",
                "type": "default",
                "enabled": True
            },
            {
                "key": "company_number",
                "value": "00000006",
                "type": "default",
                "enabled": True
            }
        ],
        "_postman_variable_scope": "environment"
    }
    
    with open("agentbooks_environment.json", "w") as f:
        json.dump(environment, f, indent=2)
    
    print("✓ Environment file created successfully")

def create_readme():
    """Create a README file with instructions."""
    readme_content = """# AgentBooks API Postman Collection

This directory contains the generated Postman collection and environment for the AgentBooks API.

## Files

- `agentbooks_collection_enhanced.json` - Enhanced Postman collection with auth and tests
- `agentbooks_environment.json` - Environment variables for local development
- `agentbooks_collection.json` - Original generated collection (backup)

## Setup Instructions

### 1. Import Collection and Environment

1. Open Postman
2. Click "Import" button
3. Import both files:
   - `agentbooks_collection_enhanced.json`
   - `agentbooks_environment.json`

### 2. Select Environment

1. In Postman, select "AgentBooks Local Environment" from the environment dropdown
2. Make sure your AgentBooks Docker containers are running (`docker compose up`)

### 3. Authentication Flow

1. **First, run the Login request:**
   - Go to `Authentication > Login for access token`
   - The request body should already have admin credentials
   - Run the request - the auth token will be automatically saved to environment

2. **All other requests will now use the auth token automatically**

## Testing Different Endpoints

### Companies House API
- `GET /companies-house/company/{company_number}` - Get company profile
- `GET /companies-house/search` - Search companies
- `POST /companies-house/clients/{client_id}/update-from-companies-house` - Update client data

### Client Management
- `GET /clients/` - List clients
- `POST /clients/` - Create new client
- `GET /clients/{client_id}` - Get client details
- `PUT /clients/{client_id}` - Update client

### User Management
- `GET /users/me` - Get current user profile
- `GET /users/practice/{practice_id}` - Get practice users

## Environment Variables

The environment includes these variables:
- `base_url` - API base URL (http://localhost:8000)
- `auth_token` - Automatically set after login
- `admin_email` - Default admin email
- `admin_password` - Default admin password
- `user_id` - Set after login
- `practice_id` - Set after login
- `client_id` - Use for client-specific requests
- `company_number` - Example company number for testing

## Notes

- Make sure Docker containers are running before testing
- The auth token expires after 30 minutes by default
- All requests include automatic tests for response validation
- Protected endpoints automatically include Bearer token authentication

## Regenerating Collection

To regenerate this collection, run:
```bash
python generate_postman_collection.py
```
"""

    with open("POSTMAN_README.md", "w") as f:
        f.write(readme_content)
    
    print("✓ README file created successfully")

def main():
    """Main function to generate the complete Postman collection."""
    print("🚀 Starting AgentBooks Postman Collection Generation")
    print("=" * 60)
    
    # Install requirements
    install_requirements()
    
    # Generate base collection
    if not generate_base_collection():
        print("❌ Failed to generate base collection")
        return False
    
    # Enhance collection
    if not enhance_collection():
        print("❌ Failed to enhance collection")
        return False
    
    # Create environment file
    create_environment_file()
    
    # Create README
    create_readme()
    
    print("\n" + "=" * 60)
    print("✅ Postman collection generation completed successfully!")
    print("\nFiles created:")
    print("- agentbooks_collection_enhanced.json (Main collection)")
    print("- agentbooks_environment.json (Environment variables)")
    print("- agentbooks_collection.json (Original backup)")
    print("- POSTMAN_README.md (Setup instructions)")
    print("\nNext steps:")
    print("1. Import both JSON files into Postman")
    print("2. Select 'AgentBooks Local Environment'")
    print("3. Run the Login request to authenticate")
    print("4. Test other endpoints!")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 