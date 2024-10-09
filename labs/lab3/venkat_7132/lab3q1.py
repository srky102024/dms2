from pymongo import MongoClient
from uuid import uuid4
from datetime import datetime
import random

# Connect to MongoDB
client = MongoClient("mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3")
db = client.lab3

# Replace '1234' with the last 4 digits of your student ID
student_id_suffix = '7132'  # Change this to your actual student ID suffix
collection_name = f"venkat_{student_id_suffix}"
collection = db[collection_name]

# Generate and insert 1000 objects
objects = []
for _ in range(1000):
    obj = {
        "uuid": str(uuid4()),            # Generating a unique UUID
        "source_db": "MongoDB",          # Source database identifier
        "created_at": datetime.utcnow(), # Timestamp for creation
        "updated_at": datetime.utcnow(), # Timestamp for updates
        "attribute1": random.randint(1, 100),               # Random integer attribute
        "attribute2": random.choice(["A", "B", "C", "D", "E"]),  # Random categorical attribute
        "attribute3": random.uniform(0.0, 1.0)              # Random float attribute
    }
    objects.append(obj)

# Insert the objects into the MongoDB collection
result = collection.insert_many(objects)

print(f"Inserted {len(result.inserted_ids)} objects into {collection_name}")

# Display a sample of the data
sample = collection.find_one()
print("\nSample object:")
print(sample)

# Close the connection
client.close()
