"""
RAKSHAK Backend — Health Check Route
"""

import json
import logging
from db import get_db
from utils.s3_utils import check_s3_ready

logger = logging.getLogger(__name__)


def handle_health(event):
    """Handle GET /health — returns system status."""
    services = {
        "api": "healthy",
        "mongodb": "unknown",
        "s3": "unknown",
    }

    # Check MongoDB
    try:
        db = get_db()
        db.command("ping")
        services["mongodb"] = "connected"
    except Exception as e:
        services["mongodb"] = "disconnected"
        logger.error(f"MongoDB health check failed: {e}")

    # Check S3
    try:
        services["s3"] = "ready" if check_s3_ready() else "not_configured"
    except Exception as e:
        services["s3"] = "not_configured"
        logger.error(f"S3 health check failed: {e}")

    overall = "healthy" if services["mongodb"] == "connected" else "degraded"

    return {
        "statusCode": 200,
        "body": json.dumps({
            "status": overall,
            "services": services,
            "version": "1.0.0",
        }),
    }
