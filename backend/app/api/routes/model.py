from fastapi import APIRouter, HTTPException
from app.db.model_crud import (
    get_all_active_models,

)

router = APIRouter()


@router.get("/models")
async def list_models():
    """
    Return all active models.
    Used for frontend dropdown selection.
    """
    return get_all_active_models()


# @router.get("/models/{asset_type}")
# async def get_model_for_asset(asset_type: str):
#     """
#     Return the active model for a given asset type.
#     Used internally for prediction.
#     """
#     try:
#         return get_active_model_for_asset(asset_type)
#     except Exception:
#         raise HTTPException(
#             status_code=404,
#             detail=f"No active model found for asset_type={asset_type}",
#         )
