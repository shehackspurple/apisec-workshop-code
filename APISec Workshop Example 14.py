# Better Code — Fixes only IDOR (indirect object reference, our security misconfiguration)
# Authorize access to /users/<user_id> based on the authenticated user's identity.
# If the authenticated subject's id != user_id from the path, deny access.

import requests
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user_details(user_id):
    # This is a demo, usually we would validate with session/JWT/OAuth token or something better
    subject_id = verify_and_get_subject(request.headers.get('Authorization'))

    # reject if no valid auth presented 
    if subject_id is None:
        return jsonify({'error': 'Unauthorized access'}), 401

    # --- FIX enforce that caller can only access their own resource
    if subject_id != user_id:
        return jsonify({'error': 'Forbidden'}), 403

    # Authorized: subject_id == user_id → return that user's data
    user_data = fetch_user_info(user_id)
    return jsonify(user_data)

def verify_and_get_subject(authorization_header: str):
    # Minimal auth example for demo purposes only.
    # In prod you would validate and decode a real token (session/JWT/OAuth)
    
    if not authorization_header or not authorization_header.startswith('Bearer '):
        return None
    token = authorization_header.split(' ', 1)[1].strip()

    # Demo-only parsing: accept a numeric user id as the "token".
    return int(token) if token.isdigit() else None

# fetch user information from db, this is only called if we know it's the right user's info 
def fetch_user_info(user_id):
    return {
        'user_id': user_id,
        'username': 'example_user',
        'email': 'example_user@example.com'
    }

if __name__ == '__main__':
    app.run()
