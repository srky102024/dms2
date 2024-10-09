import pymongo
import uuid
import datetime

# Connect to MongoDB using the provided connection string
client = pymongo.MongoClient("mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3")
db = client["lab3"]  # Select the database
collection_name = "0147_Bala_collection"  # Collection name starts with the last four digits of student ID
collection = db[collection_name]

# Generate 1000 objects with required attributes
documents = []
for i in range(1000):
    document = {
        "uuid": str(uuid.uuid4()),  # Generate a UUID
        "source": "MongoDB",  # Source database identifier
        "created_at": datetime.datetime.now(),  # Timestamp for creation
        "updated_at": datetime.datetime.now(),  # Timestamp for update
        "attribute1": f"value_{i}_attr1",  # Custom attribute 1
        "attribute2": f"value_{i}_attr2",  # Custom attribute 2
        "attribute3": f"value_{i}_attr3"   # Custom attribute 3
    }
    documents.append(document)

# Insert the documents into the collection
collection.insert_many(documents)

# Print a sample of the data
for doc in collection.find().limit(5):
    print(doc)
