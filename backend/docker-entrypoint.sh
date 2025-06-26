#!/bin/bash

set -e

# Function to wait for services
wait_for_service() {
    local host=$1
    local port=$2
    local service_name=$3
    
    echo "Waiting for $service_name to be ready..."
    while ! nc -z $host $port; do
        sleep 1
    done
    echo "$service_name is ready!"
}

# Wait for required services
if [ "$WAIT_FOR_DB" = "true" ]; then
    wait_for_service postgres-backend 5432 "PostgreSQL"
fi

if [ "$WAIT_FOR_REDIS" = "true" ]; then
    wait_for_service redis 6379 "Redis"
fi

# Execute the command based on service type
case "$SERVICE_TYPE" in
    "web")
        echo "Starting FastAPI web server..."
        alembic upgrade head
        exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
        ;;
    "worker")
        echo "Starting Celery worker..."
        exec celery -A workers.celery_app worker --loglevel=info --concurrency=2
        ;;
    "beat")
        echo "Starting Celery beat scheduler..."
        exec celery -A workers.celery_app beat --loglevel=info
        ;;
    "flower")
        echo "Starting Flower monitoring..."
        exec celery -A workers.celery_app flower --port=5555
        ;;
    "seeder")
        echo "Running database seeder..."
        sleep 10  # Wait for database to be ready
        exec python seed_database.py
        ;;
    *)
        echo "Unknown service type: $SERVICE_TYPE"
        echo "Available types: web, worker, beat, flower, seeder"
        exit 1
        ;;
esac 