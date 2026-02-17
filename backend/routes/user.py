"""
RAKSHAK Backend — User Profile Routes
"""

import json
import logging
from db import get_collection

logger = logging.getLogger(__name__)


def handle_profile(event, user_sub):
    """Handle GET/PUT /user/profile"""
    method = event.get("httpMethod", "GET")
    users = get_collection("users")

    if method == "GET":
        profile = users.find_one({"userId": user_sub}, {"_id": 0})
        return {
            "statusCode": 200,
            "body": json.dumps({"profile": profile or {"userId": user_sub}}),
        }

    elif method == "PUT":
        body = json.loads(event.get("body", "{}"))
        allowed_fields = ["name", "phone", "homeLocation"]
        update_data = {k: v for k, v in body.items() if k in allowed_fields and v}

        if not update_data:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "No valid fields to update"}),
            }

        update_data["userId"] = user_sub
        users.update_one(
            {"userId": user_sub},
            {"$set": update_data},
            upsert=True,
        )
        logger.info(f"Profile updated for user {user_sub}")
        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Profile updated", "profile": update_data}),
        }

    return {"statusCode": 405, "body": json.dumps({"message": "Method not allowed"})}
