import uuid
import datetime
import random
from pymongo import MongoClient


mongo_uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"

# Set up the MongoDB connection
client = MongoClient(mongo_uri)


student_id_last_four = "1552"  
db = client.lab3  # Database name
collection_name = f"{student_id_last_four}_Vishnu_bhargav"
collection = db[collection_name]

# Generate a single object
def generate_object():
    return {
        "uuid": str(uuid.uuid4()),  # Unique identifier
        "source_database": "MongoDB",  # Source database identifier
        "created_at": datetime.datetime.utcnow(),  # Creation timestamp
        "updated_at": datetime.datetime.utcnow(),  # Update timestamp
        # Additional custom attributes
        "temperature": round(random.uniform(-10, 40), 2),  # Random temperature value
        "humidity": round(random.uniform(10, 90), 2),  # Random humidity percentage
        "location": random.choice(["Field 1", "Field 2", "Field 3", "Greenhouse A"])  # Random location
    }

# Generate 1000 objects
def generate_objects(n=1000):
    return [generate_object() for _ in range(n)]

# Insert generated objects into MongoDB
def insert_into_mongodb(data):
    collection.insert_many(data)
    print(f"Inserted {len(data)} objects into collection: {collection_name}")

# Main execution
if __name__ == "__main__":
    # Generate 1000 objects
    objects = generate_objects(1000)

    # Insert the objects into the MongoDB collection
    insert_into_mongodb(objects)

    # Print a sample of inserted data
    for doc in collection.find().limit(5):
        print(doc)
