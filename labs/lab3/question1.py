# Install required packages (if not already installed)
# pip install pymongo
# pip install uuid

import uuid
import pymongo
import datetime

# MongoDB connection URI
mongo_uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"
client = pymongo.MongoClient(mongo_uri)

# Define database and collection
db = client['lab3']
# Replace '1234' with the last four digits of your student ID
collection_name = "9404_jace"
collection = db[collection_name]

# Function to generate an object
def generate_object():
    return {
        "uuid": str(uuid.uuid4()),
        "source_db": "MongoDB",
        "created_at": datetime.datetime.utcnow(),
        "updated_at": datetime.datetime.utcnow(),
        # Additional attributes
        "attribute1": "Sample data 1",
        "attribute2": "Sample data 2",
        "attribute3": "Sample data 3"
    }

# Generate and insert 1000 objects into the collection
objects = [generate_object() for _ in range(1000)]
collection.insert_many(objects)

# Print sample object to verify
sample_object = collection.find_one()
print(f"Sample object from the collection:\n{sample_object}")
