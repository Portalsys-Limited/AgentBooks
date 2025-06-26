# Celery Workers for AgentBooks

This directory contains the Celery worker configuration and tasks for background job processing in AgentBooks.

## 📁 Structure

```
workers/
├── celery_app.py           # Main Celery application configuration
├── tasks/
│   ├── __init__.py         # Task imports for auto-discovery
│   └── exampletask.py      # Example tasks (email, file processing, reports)
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites

- Redis (message broker and result backend)
- PostgreSQL (for database tasks)
- Python dependencies (see requirements.txt)

### Running Services

The complete setup includes:

1. **Redis** - Message broker and result backend
2. **Celery Worker** - Processes background tasks
3. **Celery Beat** - Scheduler for periodic tasks
4. **Flower** - Web-based monitoring interface

Start all services with Docker Compose:

```bash
docker-compose up -d redis celery-worker celery-beat flower
```

### Accessing Services

- **Flower Monitoring**: http://localhost:5555
- **Redis**: localhost:6379
- **API Tasks Endpoint**: http://localhost:8000/tasks

## 📋 Available Tasks

### 1. Example Task
Basic task with progress tracking:
```python
# Start via API
POST /tasks/start
{
    "task_name": "example_task",
    "parameters": {
        "name": "test_user",
        "delay": 10
    }
}
```

### 2. Email Task
Send emails asynchronously:
```python
POST /tasks/start
{
    "task_name": "send_email",
    "parameters": {
        "to_email": "user@example.com",
        "subject": "Test Email",
        "message": "Hello from AgentBooks!"
    }
}
```

### 3. File Processing
Process uploaded files:
```python
POST /tasks/start
{
    "task_name": "process_file",
    "parameters": {
        "file_path": "/path/to/file.pdf",
        "file_type": "pdf"
    }
}
```

### 4. Report Generation
Generate reports:
```python
POST /tasks/start
{
    "task_name": "generate_report",
    "parameters": {
        "report_type": "financial",
        "report_params": {
            "start_date": "2024-01-01",
            "end_date": "2024-12-31"
        }
    }
}
```

### 5. Database Cleanup
Periodic maintenance:
```python
POST /tasks/start
{
    "task_name": "database_cleanup",
    "parameters": {
        "days_old": 30
    }
}
```

## 🔧 Configuration

### Environment Variables

```bash
# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=

# Celery Configuration
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
```

### Celery Settings

Key configuration options in `celery_app.py`:

- **Serialization**: JSON (secure and readable)
- **Timezone**: UTC
- **Retry Policy**: 3 retries with exponential backoff
- **Concurrency**: 2 workers by default
- **Result Expiry**: 1 hour

## 🛠️ Development

### Adding New Tasks

1. Create task in `tasks/` directory:

```python
# tasks/my_task.py
from celery import shared_task
from celery.utils.log import get_task_logger

logger = get_task_logger(__name__)

@shared_task(bind=True)
def my_custom_task(self, param1: str, param2: int):
    try:
        logger.info(f"Starting my_custom_task with {param1}")
        
        # Your task logic here
        result = {"status": "completed", "param1": param1}
        
        logger.info("Task completed successfully")
        return result
        
    except Exception as exc:
        logger.error(f"Task failed: {str(exc)}")
        raise self.retry(exc=exc, countdown=60, max_retries=3)
```

2. Import in `tasks/__init__.py`:

```python
from .my_task import my_custom_task
```

3. Add to API router in `api/tasks.py`:

```python
task_map = {
    # ... existing tasks
    "my_custom_task": my_custom_task
}
```

### Running Workers Locally

For development, you can run workers locally:

```bash
# Start worker
celery -A workers.celery_app worker --loglevel=info

# Start beat scheduler
celery -A workers.celery_app beat --loglevel=info

# Start flower monitoring
celery -A workers.celery_app flower --port=5555
```

## 📊 Monitoring

### Flower Dashboard

Access the Flower web interface at http://localhost:5555 to monitor:

- Active tasks
- Worker status
- Task history
- Task details and results
- Worker statistics

### API Endpoints

Monitor tasks through the REST API:

- `GET /tasks/active` - List active tasks
- `GET /tasks/status/{task_id}` - Get task status
- `GET /tasks/stats` - Worker statistics
- `DELETE /tasks/cancel/{task_id}` - Cancel task

### Logs

View worker logs:

```bash
# Docker logs
docker-compose logs celery-worker
docker-compose logs celery-beat

# Follow logs
docker-compose logs -f celery-worker
```

## 🔄 Periodic Tasks

Scheduled tasks are configured in `celery_app.py`:

```python
beat_schedule = {
    "example-periodic-task": {
        "task": "workers.tasks.exampletask.example_periodic_task",
        "schedule": 300.0,  # Every 5 minutes
    },
}
```

Common schedule formats:

```python
# Every 30 seconds
"schedule": 30.0

# Every 5 minutes
"schedule": 300.0

# Every hour
"schedule": crontab(minute=0)

# Daily at 2:30 AM
"schedule": crontab(hour=2, minute=30)

# Weekly on Monday at 7:30 AM
"schedule": crontab(hour=7, minute=30, day_of_week=1)
```

## 🚨 Error Handling

### Retry Policies

Tasks automatically retry on failure:

```python
@shared_task(bind=True)
def my_task(self):
    try:
        # Task logic
        pass
    except Exception as exc:
        # Retry with exponential backoff
        raise self.retry(
            exc=exc,
            countdown=60,  # Wait 1 minute
            max_retries=3
        )
```

### Error Monitoring

- Check Flower dashboard for failed tasks
- Review worker logs for detailed error information
- Use task status API to programmatically check failures

## 🔐 Security

### Best Practices

1. **Message Encryption**: Consider encrypting sensitive task parameters
2. **Access Control**: Secure the Flower dashboard in production
3. **Resource Limits**: Set appropriate memory/CPU limits for workers
4. **Network Security**: Use Redis AUTH in production

### Production Considerations

```bash
# Production Redis with password
REDIS_PASSWORD=your-secure-password

# Secure Flower with basic auth
FLOWER_BASIC_AUTH=admin:secure-password

# Worker resource limits
WORKER_MAX_MEMORY_PER_CHILD=200000  # 200MB
WORKER_MAX_TASKS_PER_CHILD=1000
```

## 🐛 Troubleshooting

### Common Issues

1. **Workers not starting**:
   - Check Redis connection
   - Verify environment variables
   - Check Docker logs

2. **Tasks not executing**:
   - Ensure workers are running
   - Check task routing
   - Verify task imports

3. **High memory usage**:
   - Adjust `max_tasks_per_child`
   - Monitor task memory leaks
   - Use memory profiling tools

### Debug Commands

```bash
# Check Redis connection
redis-cli -h redis ping

# Inspect Celery
celery -A workers.celery_app inspect active
celery -A workers.celery_app inspect registered

# Purge all tasks
celery -A workers.celery_app purge
```

## 📈 Performance Tuning

### Worker Configuration

Adjust based on your needs:

```bash
# More workers for I/O bound tasks
celery -A workers.celery_app worker --concurrency=4

# Use eventlet for high concurrency
celery -A workers.celery_app worker --pool=eventlet --concurrency=1000

# Optimize for CPU bound tasks
celery -A workers.celery_app worker --pool=prefork --concurrency=2
```

### Monitoring Performance

- Track task execution times in Flower
- Monitor Redis memory usage
- Watch worker CPU/memory utilization
- Set up alerts for failed tasks

This setup provides a robust, scalable background task processing system for AgentBooks with comprehensive monitoring and error handling capabilities. 