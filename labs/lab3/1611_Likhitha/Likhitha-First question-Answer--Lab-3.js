!pip install pymongo
 !pip install uuid

import pymongo
import uuid
from datetime import datetime

# Connect to MongoDB
client = pymongo.MongoClient("mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3")

# Define database and collection
db = client['lab3']
collection_name = '471611_Likhitha'
collection = db[collection_name]

# Clear the collection to avoid duplicates
result = collection.delete_many({})
print(f"Deleted {result.deleted_count} documents from the collection.")  # Output the number of deleted documents

# Create and insert exactly 1000 objects into the collection
objects = []
for i in range(1000):
    obj = {
        "_id": str(uuid.uuid4()),
        "uuid": str(uuid.uuid4()),
        "source_database": "MongoDB",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "attribute1": f"attribute_value_{i}",
        "attribute2": f"attribute_value_{i+1}",
        "attribute3": f"attribute_value_{i+2}"
    }
    objects.append(obj)

# Insert objects into the collection
insert_result = collection.insert_many(objects)
print(f"Inserted {len(insert_result.inserted_ids)} documents into the collection.")

# Check the count to verify there are exactly 1000 documents
count = collection.count_documents({})
print(f"Total documents in collection: {count}")

# Retrieve and display 5 sample documents from the collection
sample_data = collection.find().limit(5)
for data in sample_data:
    print(data)