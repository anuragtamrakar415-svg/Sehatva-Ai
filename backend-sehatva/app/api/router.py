from fastapi import APIRouter

from app.api import (
    activity,
    analytics,
    appointments,
    auth,
    caregiver,
    chat,
    dashboard,
    insurance,
    medicines,
    notifications,
    profile,
    recovery,
    reports,
    settings_routes,
    sos,
)

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(profile.router)
api_router.include_router(dashboard.router)
api_router.include_router(medicines.router)
api_router.include_router(reports.router)
api_router.include_router(recovery.router)
api_router.include_router(insurance.router)
api_router.include_router(chat.router)
api_router.include_router(caregiver.router)
api_router.include_router(sos.router)
api_router.include_router(appointments.router)
api_router.include_router(analytics.router)
api_router.include_router(notifications.router)
api_router.include_router(settings_routes.router)
api_router.include_router(activity.router)
