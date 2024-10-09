from pymongo import MongoClient
import uuid
from datetime import datetime
import random

# Connect to MongoDB
client = MongoClient("mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3")
db = client["lab3"]

# Specify your student ID collection name
student_id_suffix = "8044_PawanKumar"  # New collection name
collection_name = student_id_suffix
collection = db[collection_name]

# List of random names to choose from
names = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Hannah", "Ivy", "Jack"]

# Generate and insert 1000 objects
for _ in range(1000):
    object_uuid = str(uuid.uuid4())  # Generate a UUID
    current_time = datetime.utcnow()  # Timestamps for creation and updates

    # Randomly select a name from the names list
    random_name = random.choice(names)

    # Object structure
    object_data = {
        "uuid": object_uuid,
        "source_db": "MongoDB",
        "created_at": current_time,
        "updated_at": current_time,
        "attribute1": random_name,  # Random name
        "attribute2": random.randint(1, 100),  # Custom attribute 2 with a random integer
        "attribute3": ["item1", "item2", "item3"]  # Custom attribute 3
    }

    # Insert the object into the MongoDB collection
    collection.insert_one(object_data)

print(f"1000 objects inserted into the {collection_name} collection.")

# Retrieve and display a sample object
sample_object = collection.find_one()
print("\nSample object:")
print(sample_object)

# Count the number of documents in the collection
doc_count = collection.count_documents({})
print(f"\nTotal documents in the collection: {doc_count}")

# Close the connection
client.close()
