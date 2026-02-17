"""
RAKSHAK Backend — JWT Verification for AWS Cognito tokens
"""

import os
import json
import time
import requests
from jose import jwk, jwt
from jose.utils import base64url_decode

_jwks_cache = None
_jwks_fetched_at = 0
JWKS_CACHE_SECONDS = 3600  # Re-fetch JWKS every hour


def _get_jwks():
    """Fetch and cache Cognito JWKS public keys."""
    global _jwks_cache, _jwks_fetched_at
    now = time.time()
    if _jwks_cache and (now - _jwks_fetched_at) < JWKS_CACHE_SECONDS:
        return _jwks_cache

    region = os.environ.get("COGNITO_REGION", "us-east-1")
    pool_id = os.environ.get("COGNITO_USER_POOL_ID", "")
    url = f"https://cognito-idp.{region}.amazonaws.com/{pool_id}/.well-known/jwks.json"
    resp = requests.get(url, timeout=5)
    resp.raise_for_status()
    _jwks_cache = resp.json()
    _jwks_fetched_at = now
    return _jwks_cache


def verify_token(token):
    """
    Verify a Cognito ID token and return the decoded claims.
    Raises Exception on invalid/expired tokens.
    """
    if not token:
        raise ValueError("No token provided")

    # Strip 'Bearer ' prefix if present
    if token.startswith("Bearer "):
        token = token[7:]

    # Decode header to find key ID
    headers = jwt.get_unverified_headers(token)
    kid = headers.get("kid")
    if not kid:
        raise ValueError("Token missing kid header")

    # Find matching key
    jwks = _get_jwks()
    key = None
    for k in jwks.get("keys", []):
        if k["kid"] == kid:
            key = k
            break
    if not key:
        raise ValueError("Token key not found in JWKS")

    # Verify signature + claims
    region = os.environ.get("COGNITO_REGION", "us-east-1")
    pool_id = os.environ.get("COGNITO_USER_POOL_ID", "")
    client_id = os.environ.get("COGNITO_CLIENT_ID", "")
    issuer = f"https://cognito-idp.{region}.amazonaws.com/{pool_id}"

    claims = jwt.decode(
        token,
        key,
        algorithms=["RS256"],
        audience=client_id,
        issuer=issuer,
    )

    # Check expiration
    if time.time() > claims.get("exp", 0):
        raise ValueError("Token has expired")

    return claims
