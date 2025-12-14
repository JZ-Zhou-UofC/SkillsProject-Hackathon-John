from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.db.training_job_crud import get_training_job
router = APIRouter()

active_connections: dict[int, WebSocket] = {}


@router.websocket("/ws/training/{job_id}")
async def training_progress_ws(ws: WebSocket, job_id: int):
    await ws.accept()

    # 🔥 SEND CURRENT STATE IMMEDIATELY
    job = get_training_job(job_id)
    if job:
        await ws.send_json({
            "job_id": job_id,
            "status": job["status"],
            "message": job["progress_message"],
        })

    try:
        while True:
            await ws.receive_text()  # keep connection alive
    except WebSocketDisconnect:
        pass