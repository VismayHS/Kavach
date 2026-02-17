"""
RAKSHAK Backend — Health Check Route
"""

import json
import os
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
        from pymongo import MongoClient
        uri = os.environ.get("MONGODB_URI")
        if uri:
            client = MongoClient(uri, serverSelectionTimeoutMS=5000)
            client.admin.command("ping")
            client.close()
            services["mongodb"] = "connected"
        else:
            services["mongodb"] = "not_configured"
    except Exception as e:
        services["mongodb"] = "disconnected"
        services["mongodb_error"] = str(e)
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
