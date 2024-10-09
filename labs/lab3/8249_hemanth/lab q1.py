from pymongo import MongoClient
from uuid import uuid4
from datetime import datetime
import random

# Connect to MongoDB
client = MongoClient("mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3")
db = client.lab3

# Create a collection name using the last 4 digits of your student ID
# Replace '1234' with the last 4 digits of your student ID
collection_name = "8249_hemanth"
collection = db[collection_name]

# Generate and insert 1000 objects
objects = []
for _ in range(1000):
    obj = {
        "uuid": str(uuid4()),
        "source_db": "MongoDB",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "age": random.randint(18, 80),
        "favorite_color": random.choice(["Red", "Blue", "Green", "Yellow", "Purple"]),
        "score": round(random.uniform(0.0, 100.0), 2)
    }
    objects.append(obj)

# Insert the objects into the collection
result = collection.insert_many(objects)

print(f"Inserted {len(result.inserted_ids)} objects into {collection_name}")

# Display a sample of the data
sample = collection.find_one()
print("\nSample object:")
for key, value in sample.items():
    print(f"{key}: {value}")

client.close()
