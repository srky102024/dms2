import uuid
from pymongo import MongoClient
from datetime import datetime

# Step 1: Set up MongoDB connection
client = MongoClient("mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3")
db = client.lab3 
collection_name = "4013_Prashant"
collection = db[collection_name]

# Step 2: Generate 1000 objects
data_list = []
for i in range(1000):
    data_object = {
        "uuid": str(uuid.uuid4()),  # Generate a unique UUID
        "source_database": "MongoDB",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "sensor_value": round(100 * (i / 1000), 2),
        "location": f"Farm {i % 10}",
        "status": "active" if i % 2 == 0 else "inactive"  
    }
    data_list.append(data_object)

# Step 3: Insert data into MongoDB
result = collection.insert_many(data_list)

# Output the result
print(f"Inserted {len(result.inserted_ids)} documents into the collection {collection_name}")
