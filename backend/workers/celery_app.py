from celery import Celery
from config.settings import settings
import os

# Create Celery app
celery_app = Celery(
    "agentbooks_worker",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["workers.tasks"]
)

# Celery configuration
celery_app.conf.update(
    # Task serialization
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    
    # Task routing and execution
    task_always_eager=False,
    worker_prefetch_multiplier=1,
    task_acks_late=True,
    worker_max_tasks_per_child=1000,
    
    # Result backend settings
    result_expires=3600,  # 1 hour
    result_backend_max_retries=10,
    result_backend_retry_delay=1,
    
    # Task retry settings
    task_default_retry_delay=60,  # 1 minute
    task_max_retries=3,
    
    # Beat schedule (for periodic tasks)
    beat_schedule={
        "example-periodic-task": {
            "task": "workers.tasks.exampletask.example_periodic_task",
            "schedule": 300.0,  # Every 5 minutes
        },
    },
)

# Auto-discover tasks
celery_app.autodiscover_tasks(["workers.tasks"])

if __name__ == "__main__":
    celery_app.start() 