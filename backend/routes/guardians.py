"""
RAKSHAK Backend — Guardian Management Routes
"""

import json
import logging
from bson import ObjectId
from db import get_collection

logger = logging.getLogger(__name__)
MAX_GUARDIANS = 3


def _serialize_guardian(g):
    """Convert MongoDB document to JSON-safe dict."""
    g["id"] = str(g.pop("_id"))
    return g


def handle_guardians(event, user_sub):
    """Handle CRUD operations on /user/guardians"""
    method = event.get("httpMethod", "GET")
    guardians = get_collection("guardians")
    path = event.get("pathParameters") or {}
    guardian_id = path.get("id")

    # GET — list all guardians for user
    if method == "GET":
        docs = list(guardians.find({"userId": user_sub}))
        return {
            "statusCode": 200,
            "body": json.dumps({"guardians": [_serialize_guardian(d) for d in docs]}),
        }

    # POST — add a new guardian
    if method == "POST":
        existing_count = guardians.count_documents({"userId": user_sub})
        if existing_count >= MAX_GUARDIANS:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": f"Maximum {MAX_GUARDIANS} guardians allowed"}),
            }

        body = json.loads(event.get("body", "{}"))
        name = body.get("name", "").strip()
        email = body.get("email", "").strip()
        phone = body.get("phone", "").strip()
        relationship = body.get("relationship", "").strip()

        if not name or not email:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "Name and email are required"}),
            }

        doc = {
            "userId": user_sub,
            "name": name,
            "email": email,
            "phone": phone,
            "relationship": relationship,
        }
        result = guardians.insert_one(doc)
        doc["id"] = str(result.inserted_id)
        doc.pop("_id", None)

        logger.info(f"Guardian added for user {user_sub}: {name}")
        return {
            "statusCode": 201,
            "body": json.dumps({"message": "Guardian added", "guardian": doc}),
        }

    # PUT — update guardian by ID
    if method == "PUT" and guardian_id:
        body = json.loads(event.get("body", "{}"))
        allowed = ["name", "email", "phone", "relationship"]
        update = {k: v.strip() for k, v in body.items() if k in allowed and isinstance(v, str)}

        if not update:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "No valid fields to update"}),
            }

        result = guardians.update_one(
            {"_id": ObjectId(guardian_id), "userId": user_sub},
            {"$set": update},
        )
        if result.matched_count == 0:
            return {
                "statusCode": 404,
                "body": json.dumps({"message": "Guardian not found"}),
            }

        logger.info(f"Guardian {guardian_id} updated for user {user_sub}")
        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Guardian updated"}),
        }

    # DELETE — remove guardian by ID
    if method == "DELETE" and guardian_id:
        result = guardians.delete_one(
            {"_id": ObjectId(guardian_id), "userId": user_sub}
        )
        if result.deleted_count == 0:
            return {
                "statusCode": 404,
                "body": json.dumps({"message": "Guardian not found"}),
            }

        logger.info(f"Guardian {guardian_id} deleted for user {user_sub}")
        return {
            "statusCode": 200,
            "body": json.dumps({"message": "Guardian deleted"}),
        }

    return {"statusCode": 405, "body": json.dumps({"message": "Method not allowed"})}
