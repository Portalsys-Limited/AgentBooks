# AgentBooks API Postman Collection

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
