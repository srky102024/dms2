# pip install Flask-PyMongo Flask-CORS
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from bson import json_util
import json
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS
CORS(app)

# MongoDB connection URI
app.config["MONGO_URI"] = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"
mongo = PyMongo(app)

# Route to fetch MongoDB data (already exists)
@app.route("/mongodb", methods=["GET"])
def mongodb():
    data = mongo.db.test2.find()
    page_sanitized = json.loads(json_util.dumps(data))
    return jsonify(page_sanitized)

# Route to post 1000 objects into MongoDB
@app.route("/mongodb/post", methods=["POST"])
def post_data():
    try:
        # Get data from the request body
        data = request.json

        # Validate the incoming data
        if not isinstance(data, list) or len(data) != 1000:
            return jsonify({"error": "Invalid data. Expected a list of 1000 objects."}), 400

        # Insert all 1000 objects into MongoDB
        result = mongo.db.test2.insert_many(data)

        # Return a success message with the number of inserted objects
        return jsonify({"message": f"Successfully inserted {len(result.inserted_ids)} objects."}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':  
   app.run()
