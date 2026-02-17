import os
import sys
import json
import logging
from flask import Flask, request, jsonify, make_response
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from backend/.env file
_env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
load_dotenv(_env_path, override=True)

# Ensure we can import from local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from handler import lambda_handler

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("LocalBackend")

print(f"✅ Loaded AWS Region: {os.getenv('COGNITO_REGION')}")
print(f"✅ Loaded MongoDB URI: {os.getenv('MONGODB_URI', '')[:20]}...")

@app.route('/', defaults={'path': ''}, methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
@app.route('/<path:path>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def catch_all(path):
    # Construct Lambda event object
    # API Gateway proxy integration event structure
    event = {
        'httpMethod': request.method,
        'path': '/' + path,
        'headers': {k: v for k, v in request.headers.items()},
        'body': request.get_data(as_text=True) if request.data else None,
        'queryStringParameters': request.args.to_dict(),
        'pathParameters': {},  # Handler populates this if needed
        'requestContext': {}
    }

    # Mock context object
    class Context:
        def __init__(self):
            self.function_name = "local_rakshak"
            self.memory_limit_in_mb = 128
            self.invoked_function_arn = "arn:aws:lambda:local:123:function:rakshak"
            self.aws_request_id = "local-request-id"

    context = Context()

    logger.info(f"👉 Request: {request.method} /{path}")

    try:
        # Invoke the actual Lambda handler
        response = lambda_handler(event, context)
        
        # Parse response
        status_code = response.get('statusCode', 200)
        body = response.get('body', '')
        
        # Handle body if it's a string (API Gateway expects stringified JSON)
        if isinstance(body, str):
            try:
                # Try to parse it back to JSON for Flask to return proper JSON content-type
                # (Optional, but helps with debugging)
                final_body = json.loads(body)
            except:
                final_body = body
        else:
            final_body = body

        # Build Flask response
        flask_resp = make_response(jsonify(final_body) if isinstance(final_body, dict) else final_body, status_code)
        
        # Add headers from Lambda response
        for k, v in response.get('headers', {}).items():
            if k.lower() not in ['content-length', 'connection', 'content-type']:
                flask_resp.headers[k] = v
                
        return flask_resp

    except Exception as e:
        logger.error(f"❌ Handler failed: {e}", exc_info=True)
        return jsonify({"message": "Internal server error", "error": str(e)}), 500

if __name__ == '__main__':
    print("\n🚀 Starting RAKSHAK Backend locally...")
    print(f"📡 API URL: http://localhost:3001")
    print("Press Ctrl+C to stop\n")
    app.run(port=3001, debug=True)
