from flask import Flask, request
from flask_pymongo import PyMongo
from flask_cors import CORS, cross_origin  # Import CORS
from bson import json_util, ObjectId
import json

app = Flask(__name__)
CORS(app, resources={r"/mongodb/*": {"origins": "*", "methods": ["GET", "POST", "OPTIONS"]}})
app.config["MONGO_URI"] = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3?tls=true&tlsAllowInvalidCertificates=true"
mongo = PyMongo(app)

@app.route("/mongodb/post", methods=['OPTIONS', 'POST'])
@cross_origin()
def post_data():
    # Get data from IndexedDB
    indexedDBData = json.loads(request.data)
    # Get data from MongoDB
    mongoDBData = mongo.db['sync_data'].find({})
    
    # Check each row from IndexedDB
    for indexedDBCar in indexedDBData:
        mongoCar = next((mongoCar for mongoCar in mongoDBData if indexedDBCar['uuid'] == mongoCar['uuid']), None)
        # If the data doesn't exist in MongoDB, add it to MongoDB
        if (mongoCar is None):
            indexedDBCar.pop('_id', None)
            print("here")
            mongo.db['sync_data'].insert_one(indexedDBCar)
        # If the data already exists in MongoDB but the updated_at is newly updated, update it in MongoDB
        elif (mongoCar.get('updated_at') < indexedDBCar.get('updated_at')):
            indexedDBCar.pop('_id', None)
            mongo.db['sync_data'].update_one({'uuid': indexedDBCar['uuid']}, {'$set': indexedDBCar}  # Update the document with the new data
        )
    
    return {"message": "Successfully synced indexedDB to MongoDB!"}, 201

# Fetch objects from MongoDB
@app.route("/mongodb", methods=["GET"])
def mongodb():
    data = mongo.db['sync_data'].find({})
    page_sanitized = json.loads(json_util.dumps(data))
    return page_sanitized, 200

if __name__ == '__main__':
    app.run(debug=True)
