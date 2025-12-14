from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio

from app.db.training_job_crud import get_training_job

router = APIRouter()

@router.websocket("/ws/training/{job_id}")
async def training_progress_ws(ws: WebSocket, job_id: str):
    await ws.accept()

    last_status = None

    while True:
        job = get_training_job(job_id)

        if job and job["status"] != last_status:
            await ws.send_json({
                "job_id": job_id,
                "status": job["status"],
                "message": job["progress_message"]
            })
            last_status = job["status"]

        await asyncio.sleep(1)