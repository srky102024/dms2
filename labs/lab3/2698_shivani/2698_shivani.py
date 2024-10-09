import uuid
import datetime
import random
from pymongo import MongoClient

# MongoDB connection URI
mongo_uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"

# Connect to MongoDB
client = MongoClient(mongo_uri)

# Database and Collection Setup
db = client.lab3  # Access the 'lab3' database
collection_name = "2698_shivani"  # Collection named after the last 4 digits of student ID
collection = db[collection_name]

# Function to generate an object
def create_object():
    return {
        "uuid": str(uuid.uuid4()),  # Generate unique UUID for each object
        "source_db": "MongoDB",  # Identifies the source database
        "created_at": datetime.datetime.utcnow().isoformat(),  # Current timestamp for creation
        "updated_at": datetime.datetime.utcnow().isoformat(),  # Current timestamp for updates
        # Three additional attributes
        "sensor_value": round(random.uniform(20, 100), 2),  # Simulated sensor value
        "status": random.choice(["active", "inactive", "pending"]),  # Random status
        "location": random.choice(["Warehouse A", "Field B", "HQ"])  # Random location
    }

# Generate 1000 objects
def generate_data(count=1000):
    return [create_object() for _ in range(count)]

# Function to insert data into MongoDB
def insert_data(objects):
    result = collection.insert_many(objects)
    print(f"Inserted {len(result.inserted_ids)} documents into {collection_name} collection.")

# Function to show a sample of the inserted data
def show_sample_data(limit=5):
    sample_data = collection.find().limit(limit)
    for obj in sample_data:
        print(obj)

# Main function
if __name__ == "__main__":
    # Generate 1000 objects
    objects_to_insert = generate_data(1000)

    # Insert objects into MongoDB
    insert_data(objects_to_insert)

    # Display a sample of the inserted data
    print("Sample of the data inserted into MongoDB:")
    show_sample_data()
