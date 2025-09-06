# Bad CODE
import requests
from flask import Flask, jsonify, request

app = Flask(__name__)

@app.route('/users/<int:user_id>', methods=['GET'])
def get_user_details(user_id):
# Insecure direct object reference vulnerability, Any user can access any user's data
    user_data = fetch_user_info(user_id)
    return jsonify(user_data)

# fetch user information from db
def fetch_user_info(user_id):
    return {
        'user_id': user_id,
        'username': 'example_user',
        'email': 'example_user@example.com'  }
if __name__ == '__main__':
    app.run()
