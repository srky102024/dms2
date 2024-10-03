# pip install Flask-PyMongo
# pip install Flask-Cors
from flask import Flask, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from bson import json_util
import json

app = Flask(__name__)

# Enable CORS
CORS(app)

# MongoDB connection string
app.config["MONGO_URI"] = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"
mongo = PyMongo(app)

# Clear existing data and insert 1000 new documents into MongoDB
# mongo.db.test2.delete_many({})
# for i in range(1000):
#     o = {
#         "uuid": i,
#         "source": "mongodb",
#         "creationTimestamp": 12345,
#         "updatedTimestamp": 12345,
#         "A": "A",
#         "B": "B",
#         "C": "C"
#     }
#     mongo.db.test2.insert_one(o)

@app.route("/mongodb", methods=["GET"])
def mongodb():
    # Retrieve all documents from the collection
    data = mongo.db.test2.find()
    
    # Convert MongoDB cursor to JSON
    page_sanitized = json.loads(json_util.dumps(data))
    
    # Return JSON data as a response
    return jsonify(page_sanitized)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
