from fastapi import APIRouter

from app.api.routes import admin, auth, leaderboard, predictions, tournament

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(admin.router)
api_router.include_router(predictions.router)
api_router.include_router(tournament.router)
api_router.include_router(leaderboard.router)
