from app.api.routes.websocket import active_connections
from app.db.training_job_crud import update_training_job

async def set_progress(job_id: int, status: str, message: str):
    # 1️⃣ Persist progress (source of truth)
    update_training_job(
        job_id=job_id,
        status=status,
        message=message
    )

    # 2️⃣ Push real-time update if connected
    websocket = active_connections.get(job_id)
    if websocket:
        await websocket.send_json({
            "job_id": job_id,
            "status": status,
            "message": message
        })
