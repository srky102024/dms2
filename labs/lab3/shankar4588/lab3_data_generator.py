import pymongo
import uuid
import random
from datetime import datetime

# MongoDB connection string
mongo_uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"
client = pymongo.MongoClient(mongo_uri)

# Database and collection setup
db = client["lab3"]
collection_name = "shankar_data"  # Replace "0040" with the last 4 digits of your student ID
collection = db[collection_name]

# Generate and insert 1000 objects
objects = []
for _ in range(1000):
    obj = {
        "uuid": str(uuid.uuid4()),                     # Generate UUID
        "source_db": "MongoDB",                        # Source database identifier
        "created_at": datetime.now(),                  # Timestamp for creation
        "updated_at": datetime.now(),                  # Timestamp for last update
        "temperature": round(random.uniform(15, 35), 2),  # Random temperature between 15 and 35
        "humidity": round(random.uniform(30, 90), 2),  # Random humidity between 30 and 90
        "status": random.choice(["OK", "WARN", "ALERT"])  # Random status
    }
    objects.append(obj)

# Insert the generated objects into MongoDB
collection.insert_many(objects)

print("Data generation and insertion completed.")
