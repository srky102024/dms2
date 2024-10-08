import pymongo
import uuid
from datetime import datetime
from pymongo import MongoClient

# MongoDB connection URI (replace with your own URI)
mongo_uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"

# Connect to MongoDB
client = MongoClient(mongo_uri)
db = client['lab3']

# Collection name: use the last 4 digits of your student ID (e.g., 1234)
collection_name = 'divya_5134'
collection = db[collection_name]

# Function to generate 1000 objects
def generate_objects():
    objects = []
    for i in range(1000):
        obj = {
            "_id": str(uuid.uuid4()),  # Generate a unique UUID for each object
            "source": "MongoDB",
            "created_at": datetime.utcnow(),  # Timestamp for object creation
            "updated_at": datetime.utcnow(),  # Timestamp for last update
            "name": f"User_{i}",  # Example additional attribute: name
            "age": i % 100,  # Example additional attribute: age (0-99)
            "status": "active" if i % 2 == 0 else "inactive"  # Example additional attribute: status
        }
        objects.append(obj)
    return objects

# Insert the generated objects into the MongoDB collection
def insert_objects():
    objects = generate_objects()
    collection.insert_many(objects)
    print(f"Successfully inserted {len(objects)} objects into MongoDB.")

# Print a sample of the data inserted into MongoDB
def print_sample():
    sample = collection.find().limit(5)  # Fetch the first 5 documents as a sample
    for doc in sample:
        print(doc)

if __name__ == "__main__":
    insert_objects()
    print("Sample data:")
    print_sample()
