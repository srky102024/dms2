import uuid
import pymongo
from datetime import datetime

# MongoDB connection details
student_id_last_four = "7093"  # Replace with your last four digits of student ID
mongo_uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"
db_name = "lab3"
collection_name = f"{student_id_last_four}_collection"

# Connect to MongoDB
client = pymongo.MongoClient(mongo_uri)
db = client[db_name]
collection = db[collection_name]

# Generate 1000 objects
for _ in range(1000):
    obj = {
        "uuid": str(uuid.uuid4()),
        "source_database": "MongoDB",
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "attribute1": "value1",  # Customize as needed
        "attribute2": "value2",  # Customize as needed
        "attribute3": "value3"   # Customize as needed
    }
    collection.insert_one(obj)

print(f"Inserted 1000 objects into the collection '{collection_name}'.")
