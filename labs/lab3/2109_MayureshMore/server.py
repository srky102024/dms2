from flask import Flask, request, send_from_directory
from flask_pymongo import PyMongo
from flask_cors import CORS  # Import CORS
from bson import json_util
import os
import json

app = Flask(__name__)

# Enable CORS and allow requests from the browser
CORS(app, resources={r"/*": {"origins": "*"}})

# Configure MongoDB
app.config["MONGO_URI"] = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"
mongo = PyMongo(app)

# Route to post 1000 objects to MongoDB
@app.route("/mongodb/post", methods=["POST"])
def post_data():
    data = json.loads(request.data)
    if isinstance(data, list) and len(data) == 1000:
        mongo.db.test2.insert_many(data)
        return {"message": "Successfully posted 1000 objects!"}, 201
    return {"error": "Invalid data or not 1000 objects"}, 400

# Route to fetch 1000 objects from MongoDB
@app.route("/mongodb", methods=["GET"])
def mongodb():
    data = mongo.db.test2.find({})
    page_sanitized = json.loads(json_util.dumps(data))
    return page_sanitized, 200

# Serve the HTML file from the static directory
@app.route('/')
def serve_html():
    return send_from_directory('static', 'app.html')

# Serve the JavaScript file from the static directory
@app.route('/app.js')
def serve_js():
    return send_from_directory('static', 'app.js')

if __name__ == '__main__':
    # Create a directory for static files if it doesn't exist
    if not os.path.exists('static'):
        os.makedirs('static')

    app.run(debug=True)
