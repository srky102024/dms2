import uuid
import pymongo
from datetime import datetime

# MongoDB connection URI
mongo_uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"

# Connect to MongoDB
client = pymongo.MongoClient(mongo_uri)

# Select the database and collection (starting with the last 4 digits of your student ID)
db = client["lab3"]
collection_name = "3114_Mythry"
collection = db[collection_name]

# Generate 1000 objects
objects = []
for i in range(1000):
    obj = {
        "uuid": str(uuid.uuid4()),
        "source_database": "MongoDB",
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "item_name": f"Item_{i}",
        "category": "Category_" + str(i % 10),  # Example of 10 different categories
        "price": round(10 + i * 0.5, 2)  # Prices starting at $10, increasing by $0.5
    }
    objects.append(obj)

# Insert the objects into the MongoDB collection
collection.insert_many(objects)

print(f"Successfully inserted 1000 objects into the collection: {collection_name}")
