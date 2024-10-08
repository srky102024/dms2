from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
import json

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

# MongoDB connection setup
username = 'i40'  # Your MongoDB username
password = 'dbms2'  # Your MongoDB password
host = 'cluster0.lixbqmp.mongodb.net'  # Your MongoDB host
database = 'lab3'  # Your database name

# Creating MongoDB client
client = MongoClient(f'mongodb+srv://{username}:{password}@{host}/{database}?tls=true&tlsInsecure=true')
db = client[database]
collection = db['9771_Sachu']  # Your collection name

@app.route('/sync/to/mongodb', methods=['POST'])
def sync_to_mongodb():
    data = request.get_json()

    if not data or 'documents' not in data or not isinstance(data['documents'], list) or len(data['documents']) == 0:
        return jsonify({"error": "Documents must be a non-empty list."}), 400

    try:
        collection.insert_many(data['documents'])
        return jsonify({"message": "Data synced to MongoDB successfully!"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
