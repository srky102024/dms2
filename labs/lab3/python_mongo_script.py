from pymongo import MongoClient
from bson.binary import Binary, UuidRepresentation
import uuid
from datetime import datetime

# Connect to MongoDB with UUID representation specified
client = MongoClient("mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3", uuidRepresentation="standard")
db = client["lab3"]

collection_name = "8044_PawanKumar"
collection = db[collection_name]

# Generate and insert 1000 objects
for _ in range(1000):
    object_uuid = uuid.uuid4()
    current_time = datetime.utcnow()
    
    object_data = {
        "uuid": object_uuid,  # PyMongo will now handle this correctly
        "source_db": "MongoDB",
        "created_at": current_time,
        "updated_at": current_time,
        "attribute1": "Sample value 1",
        "attribute2": 42,
        "attribute3": ["item1", "item2", "item3"]
    }
    
    collection.insert_one(object_data)

print(f"1000 objects inserted into the {collection_name} collection")

# Retrieve and display a sample object
sample_object = collection.find_one()
print("\nSample object:")
print(sample_object)

# Count the number of documents in the collection
doc_count = collection.count_documents({})
print(f"\nTotal documents in the collection: {doc_count}")

client.close()