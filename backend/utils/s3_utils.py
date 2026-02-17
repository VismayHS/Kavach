"""
RAKSHAK Backend — S3 Evidence Storage Utilities
"""

import os
import boto3
from botocore.exceptions import ClientError


def get_s3_client():
    """Get S3 client."""
    return boto3.client("s3", region_name=os.environ.get("S3_REGION", "us-east-1"))


def generate_presigned_upload_url(user_id, alert_id, file_extension="bin", expires_in=300):
    """
    Generate a pre-signed S3 URL for direct upload.

    Args:
        user_id: The Cognito user sub
        alert_id: The alert document ID
        file_extension: File extension (e.g. 'wav', 'jpg')
        expires_in: URL expiry in seconds (default 5 min)

    Returns:
        dict with upload_url and object_key
    """
    bucket = os.environ.get("S3_EVIDENCE_BUCKET", "rakshak-evidence")
    object_key = f"evidence/{user_id}/{alert_id}.{file_extension}"

    s3 = get_s3_client()
    try:
        url = s3.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": bucket,
                "Key": object_key,
                "ServerSideEncryption": "AES256",
                "ContentType": f"application/octet-stream",
            },
            ExpiresIn=expires_in,
        )
        return {"upload_url": url, "object_key": object_key}
    except ClientError as e:
        raise RuntimeError(f"Failed to generate presigned URL: {e}")


def check_s3_ready():
    """Check if the S3 evidence bucket exists and is accessible."""
    bucket = os.environ.get("S3_EVIDENCE_BUCKET", "rakshak-evidence")
    s3 = get_s3_client()
    try:
        s3.head_bucket(Bucket=bucket)
        return True
    except ClientError:
        return False
