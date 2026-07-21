import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import settings
from app.middleware.error_handler import register_error_handlers

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title=settings.APP_NAME,
    description="AI-Powered Post-Discharge Recovery & Care Platform — backend API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_error_handlers(app)

app.include_router(api_router)


@app.get("/")
def root():
    return {"success": True, "message": f"{settings.APP_NAME} backend is running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
