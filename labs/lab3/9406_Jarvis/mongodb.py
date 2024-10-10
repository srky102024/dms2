import pymongo
import uuid
import random
import time
from datetime import datetime

# Connect to MongoDB
client = pymongo.MongoClient("mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3")

# Define database and collection
db = client.lab3
collection_name = "9406_Jarvis"
collection = db[collection_name]

# Generate 1000 objects and store them in MongoDB
objects = []
for _ in range(1000):
    obj = {
        "uuid": str(uuid.uuid4()),
        "source_db": "MongoDB",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "attribute_1": random.randint(1, 100),
        "attribute_2": random.choice(['A', 'B', 'C']),
        "attribute_3": random.random()
    }
    objects.append(obj)

# Insert objects into collection
collection.insert_many(objects)

print(f"Successfully inserted {len(objects)} objects into MongoDB collection '{collection_name}'.")