from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import os

app = Flask(__name__)

# UPDATED CORS: Explicitly allow the React origin to prevent blockages
CORS(app, resources={r"/*": {"origins": "http://https://emergency-backend-maclin.onrender.comhost:3000"}})

# MongoDB Connection
try:
    # Use https://emergency-backend-maclin.onrender.comhost instead of 127.0.0.1 for better compatibility on some Windows setups
    client = MongoClient("mongodb://https://emergency-backend-maclin.onrender.comhost:27017/", serverSelectionTimeoutMS=5000)
    db = client['emergency_system']
    users_collection = db['users']
    # Trigger a call to check if connection is truly alive
    client.admin.command('ping')
    print("✅ DATABASE CONNECTED SUCCESSFULLY")
except Exception as e:
    print(f"❌ DATABASE ERROR: {e}")

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.json
        if not data or not data.get('username'):
            return jsonify({"error": "Missing data"}), 400
            
        if users_collection.find_one({"username": data.get('username')}):
            return jsonify({"error": "Username taken"}), 400
            
        users_collection.insert_one(data)
        return jsonify({"message": "User created"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        user = users_collection.find_one({
            "username": data.get('username'), 
            "password": data.get('password')
        })
        
        if user:
            # IMPORTANT: We only return the role, avoiding the ObjectId serialization error
            return jsonify({"role": user.get('role', 'citizen')}), 200
        return jsonify({"error": "Invalid credentials"}), 401
    except Exception as e:
        return jsonify({"error": "Internal Server Error"}), 500

@app.route('/google-login', methods=['POST'])
def google_login():
    try:
        data = request.json
        email = data.get('email')
        
        if not email:
            return jsonify({"error": "Email is required"}), 400

        user = users_collection.find_one({"email": email})
        
        if not user:
            new_user = {
                "username": data.get('name'),
                "email": email,
                "role": "citizen",
                "google_id": data.get('googleId')
            }
            users_collection.insert_one(new_user)
            return jsonify({"role": "citizen"}), 201
        
        return jsonify({"role": user.get('role', 'citizen')}), 200
    except Exception as e:
        print(f"Google Login Error: {e}")
        return jsonify({"error": "Failed to process Google Login"}), 500

if __name__ == '__main__':
    # Use threaded=True to handle multiple requests from the frontend smoothly
    app.run(debug=True, port=5000, threaded=True)