# Import necessary modules
import uuid
from pymongo import MongoClient
from datetime import datetime
import random

# MongoDB connection setup
mongo_uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"
client = MongoClient(mongo_uri)

# Define the database and collection name (use the last 4 digits of student ID for collection name)
db = client['lab3']
collection_name = "8409_objects"
collection = db[collection_name]

# Function to generate random data for additional attributes
def generate_additional_attributes():
    return {
        "attribute1": random.choice(['A', 'B', 'C', 'D']),  # Example attribute
        "attribute2": random.randint(1, 100),               # Example attribute
        "attribute3": random.uniform(10.5, 75.9)            # Example attribute
    }

# Generate 1000 objects with the specified attributes
objects = []
for _ in range(1000):
    obj = {
        "uuid": str(uuid.uuid4()),                           # Generate a unique identifier
        "source_db": "MongoDB",                              # Source database identifier
        "created_at": datetime.now(),                        # Timestamp for creation
        "updated_at": datetime.now(),                        # Timestamp for updates
        **generate_additional_attributes()                   # Additional random attributes
    }
    objects.append(obj)

# Insert the generated objects into the MongoDB collection
collection.insert_many(objects)

# Confirmation
print(f"Successfully inserted {len(objects)} objects into collection '{collection_name}'.")

# To verify, let's fetch and print a sample of the data
sample_data = collection.find_one()
print("Sample Data:", sample_data)
