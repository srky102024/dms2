import uuid
import pymongo
from datetime import datetime
import random

# Connect to MongoDB
uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"
client = pymongo.MongoClient(uri)

# Specify the database and collection
db = client['lab3']  # Use the 'lab3' database
collection_name = "1012_RaniSupriya"
collection = db[collection_name]

# Function to generate a single object with UUID, timestamps, and new attributes
def generate_object():
    return {
        'uuid': str(uuid.uuid4()),
        'source_db': "MongoDB",
        'created_at': datetime.utcnow(),
        'updated_at': datetime.utcnow(),
        'rating': random.randint(1, 5),  # Random rating between 1 and 5
        'review_count': random.randint(0, 1000),  # Random review count between 0 and 1000
        'discount': round(random.uniform(0.0, 50.0), 2)  # Random discount percentage between 0.0 and 50.0
    }

# Generate 1000 objects
objects = [generate_object() for _ in range(1000)]

# Insert objects into MongoDB in batches
batch_size = 100  # Insert 100 objects at a time

try:
    for i in range(0, len(objects), batch_size):
        batch = objects[i:i + batch_size]
        result = collection.insert_many(batch)
        print(f"Inserted {len(result.inserted_ids)} documents into MongoDB.")
except pymongo.errors.BulkWriteError as e:
    print("Error during bulk write:", e.details)

# Print a sample of the data inserted
print("Sample document:", objects[0])
