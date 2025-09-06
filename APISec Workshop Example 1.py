# Example in Python Flask
from flask import request, jsonify

@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user_data(user_id):
    if user_id == current_user.id:
        # Only fetch data if user is requesting their own info
        user_data = User.query.get(user_id)
        return jsonify({'user_id': user_data.id, 'username': user_data.username, 'email': user_data.email})
    else:
 # Return an error message if trying to access someone else's data
        return jsonify({'error': 'Unauthorized access!'})
