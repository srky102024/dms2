import pymongo
import uuid
import datetime
from pymongo import MongoClient
# MongoDB connection URI
uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"
# Connect to MongoDB
client = MongoClient(uri)
# Access the database
db = client['lab3']
student_id_last4 = '9907_Punam'

# Collection name starts with the last four digits of the student ID
collection_name = f'{student_id_last4}_objects'
collection = db[collection_name]
# Function to generate a single object
def generate_object():
    return {
        "uuid": str(uuid.uuid4()),  # Unique identifier
        "source_db": "MongoDB",  # Source database
        "created_at": datetime.datetime.utcnow(),  # Creation timestamp
        "updated_at": datetime.datetime.utcnow(),  # Update timestamp
        # Additional attributes
        "attribute1": "Sample Value 1", 
        "attribute2": 12345,  # Numeric value
        "attribute3": True  # Boolean value
    }
# Generate and insert 1000 objects
objects = [generate_object() for _ in range(1000)]
collection.insert_many(objects)
# Verification: Retrieve and print the first 5 inserted objects
for obj in collection.find().limit(5):
    print(obj)

# Close the connection
client.close()
