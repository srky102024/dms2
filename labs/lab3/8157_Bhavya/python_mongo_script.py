import uuid
import pymongo
from datetime import datetime

# MongoDB connection details
mongo_uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"
student_id_last4 = "8157"  # Replace with the last 4 digits of your student ID
collection_name = f"{student_id_last4}_Bhavya"  # Collection name starts with '8157_Bhavya'

# Connect to MongoDB
client = pymongo.MongoClient(mongo_uri)
db = client['lab3']
collection = db[collection_name]

# Generate 1000 objects with required attributes
objects_list = []
for i in range(1000):
    obj = {
        "uuid": str(uuid.uuid4()),  # Unique UUID for each object
        "source_db": "MongoDB",  # Source database identifier
        "created_at": datetime.utcnow(),  # Timestamp for object creation
        "updated_at": datetime.utcnow(),  # Timestamp for object update
        "attribute_1": f"Value_{i}_1",  # Custom attribute 1
        "attribute_2": f"Value_{i}_2",  # Custom attribute 2
        "attribute_3": f"Value_{i}_3"   # Custom attribute 3
    }
    objects_list.append(obj)

# Insert objects into MongoDB collection
result = collection.insert_many(objects_list)

# Output the result
print(f"Inserted {len(result.inserted_ids)} objects into collection '{collection_name}'.")

# Close the MongoDB connection
client.close()
