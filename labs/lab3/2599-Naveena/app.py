from flask import Flask, request
from flask_pymongo import PyMongo
from flask_cors import CORS  # Import CORS
from bson import json_util, ObjectId
import json

app = Flask(__name__)
# Enable CORS and allow requests from http://localhost:8080
CORS(app, resources={r"/*": {"origins": "http://localhost:8080"}})

app.config["MONGO_URI"] = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"
mongo = PyMongo(app)

# Route to post 1000 objects
@app.route("/mongodb/post", methods=["POST"])
def post_data():
    data = json.loads(request.data)
    if isinstance(data, list) and len(data) == 1000:
        mongo.db.test2.insert_many(data)
        return {"message": "Successfully posted 1000 objects!"}, 201
    return {"error": "Invalid data or not 1000 objects"}, 400

# Fetch objects from MongoDB
@app.route("/mongodb", methods=["GET"])
def mongodb():
    data = mongo.db.test2.find({})
    page_sanitized = json.loads(json_util.dumps(data))
    return page_sanitized, 200

if __name__ == '__main__':
    app.run(debug=True)