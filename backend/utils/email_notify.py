"""
RAKSHAK Backend — Email Notification via AWS SES (Free Tier)
"""

import os
import logging
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger(__name__)


def send_alert_email(guardian_email, guardian_name, alert_data):
    """
    Send a distress alert email to a guardian via AWS SES.

    Args:
        guardian_email: Recipient email address
        guardian_name: Guardian's display name
        alert_data: Dict with location, timestamp, detectionType

    Returns:
        dict with status and message_id
    """
    ses = boto3.client("ses", region_name=os.environ.get("SES_REGION", "us-east-1"))
    sender = os.environ.get("SES_SENDER_EMAIL", "alerts@rakshak.ai")

    lat = alert_data.get("location", {}).get("lat", "N/A")
    lng = alert_data.get("location", {}).get("lng", "N/A")
    timestamp = alert_data.get("timestamp", "Unknown")
    detection = alert_data.get("detectionType", "unknown").replace("_", " ").title()

    subject = "🚨 RAKSHAK ALERT — Distress Detected"

    body_html = f"""
    <html>
    <body style="font-family: Inter, Arial, sans-serif; background: #0b1120; color: #e2e5ea; padding: 32px;">
        <div style="max-width: 500px; margin: 0 auto; background: #131b2e; border-radius: 12px; padding: 32px; border: 1px solid rgba(255,255,255,0.06);">
            <h1 style="color: #c06070; font-size: 18px; margin-bottom: 4px;">🚨 DISTRESS ALERT</h1>
            <p style="color: #8b92a0; font-size: 14px; margin-bottom: 24px;">RAKSHAK has detected a potential distress event.</p>

            <table style="width: 100%; font-size: 14px;">
                <tr>
                    <td style="color: #8b92a0; padding: 8px 0;">Detection Type</td>
                    <td style="color: #e2e5ea; font-weight: 600; text-align: right;">{detection}</td>
                </tr>
                <tr>
                    <td style="color: #8b92a0; padding: 8px 0;">Location</td>
                    <td style="color: #e2e5ea; font-weight: 600; text-align: right;">{lat}, {lng}</td>
                </tr>
                <tr>
                    <td style="color: #8b92a0; padding: 8px 0;">Time</td>
                    <td style="color: #e2e5ea; font-weight: 600; text-align: right;">{timestamp}</td>
                </tr>
            </table>

            <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.06); margin: 20px 0;" />

            <p style="color: #8b92a0; font-size: 13px;">
                Dear {guardian_name}, you are receiving this because you are listed as an emergency guardian.
                Please check on the individual's safety and contact local authorities if needed.
            </p>

            <p style="color: #5a6070; font-size: 11px; margin-top: 24px;">
                This is an automated alert from RAKSHAK — AI-Powered Silent Guardian System
            </p>
        </div>
    </body>
    </html>
    """

    body_text = (
        f"RAKSHAK DISTRESS ALERT\n\n"
        f"Detection: {detection}\n"
        f"Location: {lat}, {lng}\n"
        f"Time: {timestamp}\n\n"
        f"Dear {guardian_name}, please check on the individual's safety."
    )

    try:
        response = ses.send_email(
            Source=sender,
            Destination={"ToAddresses": [guardian_email]},
            Message={
                "Subject": {"Data": subject, "Charset": "UTF-8"},
                "Body": {
                    "Text": {"Data": body_text, "Charset": "UTF-8"},
                    "Html": {"Data": body_html, "Charset": "UTF-8"},
                },
            },
        )
        message_id = response.get("MessageId", "")
        logger.info(f"SES email sent to {guardian_email}: {message_id}")
        return {"status": "delivered", "messageId": message_id}

    except ClientError as e:
        error_code = e.response["Error"]["Code"]
        logger.error(f"SES error ({error_code}) sending to {guardian_email}: {e}")
        return {"status": "failed", "error": error_code}
