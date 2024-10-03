import uuid
from pymongo import MongoClient
from datetime import datetime
import random

# MongoDB connection URI
uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"

# Connect to MongoDB with TLS certificate verification disabled
client = MongoClient(uri, tlsAllowInvalidCertificates=True)

# Access the database (you can change 'lab3' to your target database name)
db = client['lab3']

# Name the collection using the last four digits of your student ID
collection_name = "2109_MayureshMore"
collection = db[collection_name]

# Function to generate a random object
def generate_object():
    return {
        "uuid": str(uuid.uuid4()),
        "source_database": "MongoDB",
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "attribute1": random.choice(["value1", "value2", "value3"]),
        "attribute2": random.randint(1, 100),
        "attribute3": round(random.uniform(1.0, 100.0), 2)
    }

# Generate 1000 objects
objects = [generate_object() for _ in range(1000)]

# Insert the objects into the collection
collection.insert_many(objects)

print(f"Inserted {len(objects)} objects into the collection '{collection_name}'.")
