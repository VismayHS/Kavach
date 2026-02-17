"""
RAKSHAK Backend — Alert Simulation & History Routes
"""

import json
import logging
from datetime import datetime, timezone
from db import get_collection
from utils.email_notify import send_alert_email

logger = logging.getLogger(__name__)


def _serialize_alert(a):
    """Convert MongoDB doc to JSON-safe dict."""
    a["alertId"] = str(a.pop("_id"))
    return a


def handle_simulate(event, user_sub):
    """Handle POST /alert/simulate — creates alert record and notifies guardians via email."""
    body = json.loads(event.get("body", "{}"))
    location = body.get("location", {"lat": 0, "lng": 0})
    detection_type = body.get("detectionType", "voice_distress")
    confidence = body.get("confidence", 0.0)
    timestamp = datetime.now(timezone.utc).isoformat()

    alerts = get_collection("alerts")
    guardians_col = get_collection("guardians")

    # Create alert record
    alert_doc = {
        "userId": user_sub,
        "location": location,
        "detectionType": detection_type,
        "confidence": confidence,
        "timestamp": timestamp,
        "deliveryMethod": "email",
        "status": "processing",
        "guardiansNotified": 0,
    }
    result = alerts.insert_one(alert_doc)
    alert_id = str(result.inserted_id)

    logger.info(f"Alert {alert_id} created for user {user_sub}")

    # Fetch user's guardians and send notifications
    user_guardians = list(guardians_col.find({"userId": user_sub}))
    notified = 0
    delivery_status = "delivered"

    for g in user_guardians:
        email_result = send_alert_email(
            guardian_email=g.get("email", ""),
            guardian_name=g.get("name", "Guardian"),
            alert_data={
                "location": location,
                "timestamp": timestamp,
                "detectionType": detection_type,
            },
        )
        if email_result.get("status") == "delivered":
            notified += 1
        else:
            delivery_status = "partial"

    if notified == 0 and len(user_guardians) > 0:
        delivery_status = "failed"
    elif len(user_guardians) == 0:
        delivery_status = "no_guardians"

    # Update alert record with final status
    alerts.update_one(
        {"_id": result.inserted_id},
        {"$set": {
            "status": delivery_status,
            "guardiansNotified": notified,
        }},
    )

    logger.info(f"Alert {alert_id}: {notified}/{len(user_guardians)} guardians notified")

    return {
        "statusCode": 200,
        "body": json.dumps({
            "alertId": alert_id,
            "timestamp": timestamp,
            "deliveryMethod": "email",
            "status": delivery_status,
            "guardiansNotified": notified,
            "message": "Silent alert triggered successfully",
        }),
    }


def handle_history(event, user_sub):
    """Handle GET /alert/history — returns all alerts for the user."""
    alerts = get_collection("alerts")
    docs = list(alerts.find({"userId": user_sub}).sort("timestamp", -1).limit(50))
    return {
        "statusCode": 200,
        "body": json.dumps({"alerts": [_serialize_alert(d) for d in docs]}),
    }
