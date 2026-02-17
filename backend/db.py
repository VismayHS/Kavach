"""
RAKSHAK Backend — MongoDB Atlas Connection
"""

import os
from pymongo import MongoClient

_client = None
_db = None


def get_db():
    """Get MongoDB database instance (lazy singleton)."""
    global _client, _db
    if _db is None:
        uri = os.environ.get("MONGODB_URI")
        db_name = os.environ.get("MONGODB_DB", "rakshak")
        if not uri:
            raise RuntimeError("MONGODB_URI environment variable is not set")
        _client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        _db = _client[db_name]
    return _db


def get_collection(name):
    """Get a MongoDB collection by name."""
    return get_db()[name]
