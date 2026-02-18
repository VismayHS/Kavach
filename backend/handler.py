"""
RAKSHAK Backend — Main Lambda Handler
Routes API Gateway requests to the correct handler.
"""

import json
import logging
import time

from utils.jwt_verify import verify_token
from routes.user import handle_profile
from routes.guardians import handle_guardians
from routes.alerts import handle_simulate, handle_history
from routes.health import handle_health

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Simple in-memory rate limiter for alert simulation
_rate_limit = {}  # user_sub -> last_alert_timestamp
RATE_LIMIT_SECONDS = 10


def _cors_headers():
    """Return CORS headers for all responses."""
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Content-Type": "application/json",
    }


def _response(status_code, body):
    """Build a properly formatted API Gateway response."""
    return {
        "statusCode": status_code,
        "headers": _cors_headers(),
        "body": json.dumps(body) if isinstance(body, dict) else body,
    }


def _get_user_sub(event):
    """Extract and verify user identity from Authorization header."""
    auth_header = (event.get("headers") or {}).get("Authorization", "")
    if not auth_header:
        auth_header = (event.get("headers") or {}).get("authorization", "")
    claims = verify_token(auth_header)
    return claims.get("sub")


def lambda_handler(event, context):
    """Main Lambda entry point — dispatches to route handlers."""
    method = event.get("httpMethod", "")
    path = event.get("path", "")

    logger.info(f"Request: {method} {path}")

    # Handle CORS preflight
    if method == "OPTIONS":
        return _response(200, {"message": "OK"})

    try:
        # ── Health (public) ──
        if path == "/health" and method == "GET":
            result = handle_health(event)
            result["headers"] = _cors_headers()
            return result

        # ── Protected routes — require JWT ──
        try:
            user_sub = _get_user_sub(event)
        except Exception as auth_err:
            logger.warning(f"Auth failed: {auth_err}")
            return _response(401, {"message": "Unauthorized. Please log in."})

        if not user_sub:
            return _response(401, {"message": "Invalid token."})


        # ── User Profile ──
        if path == "/user/profile":
            result = handle_profile(event, user_sub)
            result["headers"] = _cors_headers()
            return result

        # ── Guardians ──
        if path.startswith("/user/guardians"):
            # Extract guardian ID from path if present
            parts = path.split("/")
            if len(parts) >= 4 and parts[3]:
                event["pathParameters"] = {"id": parts[3]}
            result = handle_guardians(event, user_sub)
            result["headers"] = _cors_headers()
            return result

        # ── Alert Simulation ──
        if path == "/alert/simulate" and method == "POST":
            # Rate limiting
            now = time.time()
            last = _rate_limit.get(user_sub, 0)
            if now - last < RATE_LIMIT_SECONDS:
                return _response(429, {
                    "message": f"Please wait {RATE_LIMIT_SECONDS} seconds between alerts."
                })
            _rate_limit[user_sub] = now

            result = handle_simulate(event, user_sub)
            result["headers"] = _cors_headers()
            return result

        # ── Alert History ──
        if path == "/alert/history" and method == "GET":
            result = handle_history(event, user_sub)
            result["headers"] = _cors_headers()
            return result

        # ── 404 ──
        return _response(404, {"message": f"Route not found: {method} {path}"})

    except Exception as e:
        logger.error(f"Unhandled error: {e}", exc_info=True)
        return _response(500, {"message": "Internal server error"})
