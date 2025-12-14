from fastapi import APIRouter, WebSocket
import asyncio
from app.db.training_job_crud import update_training_job

router = APIRouter()

@router.websocket("/ws/training/{job_id}")

def set_progress(job_id: str, status: str, message: str):
    update_training_job(
        job_id=job_id,
        status=status,
        message=message
    )