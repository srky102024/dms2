import uuid
import datetime
import random
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
import json

# Initialize Flask application
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# MongoDB connection configuration
app.config["MONGO_URI"] = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"
mongo = PyMongo(app)

# Sample data for generating randomized name and gender
names = ["Alice", "Bob", "Charlie", "David", "Eva", "Fay", "George", "Hannah", "Ivan", "Julia"]
genders = ["Male", "Female", "Other"]

# Function to create a new object with attributes
def create_object():
    return {
        "uuid": str(uuid.uuid4()),
        "source_database": "MongoDB",
        "created_at": datetime.datetime.now().isoformat(),
        "updated_at": datetime.datetime.now().isoformat(),
        "name": random.choice(names),
        "age": random.randint(18, 65),
        "gender": random.choice(genders)
    }

# Root route to handle base URL access
@app.route("/", methods=["GET"])
# Root route to handle base URL access with a beautiful landing page
@app.route("/", methods=["GET"])
def home():
    return '''
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to MongoDB API</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f9;
                color: #333;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                text-align: center;
            }
            h1 {
                color: #4CAF50;
                font-size: 3em;
                margin-bottom: 0.2em;
            }
            p {
                font-size: 1.2em;
                margin: 10px 0;
                max-width: 600px;
            }
            .button-container {
                margin: 20px 0;
            }
            .fetch-button {
                background-color: #4CAF50;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                margin: 5px;
                font-size: 16px;
                border: none;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }
            .fetch-button:hover {
                background-color: #45a049;
            }
            a {
                color: #4CAF50;
                text-decoration: none;
                font-weight: bold;
                transition: color 0.3s ease;
            }
            a:hover {
                color: #45a049;
                text-decoration: underline;
            }
            footer {
                margin-top: 30px;
                font-size: 0.9em;
                color: #666;
            }
        </style>
    </head>
    <body>
        <h1>Welcome to the MongoDB API</h1>
        <div class="button-container">
            <button class="fetch-button" onclick="window.location.href='/api/mongodb'">Fetch Data from MongoDB</button>
        </div>
        <p>This API only allows you to fetch data. For posting data, please visit the <strong><a href="file:///Users/pavannaik/Downloads/index.html" target="_blank" rel="noopener noreferrer">MongoDB Object Manager</a></strong> interface.</p>
        <footer>
            &copy; 2024 MongoDB API | Powered by Flask & PyMongo
        </footer>
    </body>
    </html>
    '''


# Endpoint to post 1000 objects to MongoDB
@app.route("/api/mongodb/post", methods=["POST"])
def post_objects():
    objects = [create_object() for _ in range(1000)]
    mongo.db['8154_Pavan_Naik'].insert_many(objects)
    return jsonify({"message": "Successfully inserted 1000 objects!"}), 201

# Endpoint to fetch objects from MongoDB
@app.route("/api/mongodb", methods=["GET"])
def get_objects():
    data = mongo.db['8154_Pavan_Naik'].find()
    objects = json.loads(json.dumps(list(data), default=str))
    return jsonify(objects), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
