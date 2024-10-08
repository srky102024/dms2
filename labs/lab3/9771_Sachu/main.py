from pymongo import MongoClient
import uuid
from datetime import datetime, timezone
import certifi

# MongoDB URI with SSL certificate verification disabled
client = MongoClient("mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3", tlsCAFile=certifi.where())
db = client['lab3']
collection = db['9771_Sachu']

# Generate 1000 objects
data = []
for i in range(1000):
    data.append({
        "uuid": str(uuid.uuid4()),
        "source": "MongoDB",
        "created_at": datetime.now(timezone.utc).isoformat(),  # Use timezone-aware datetime
        "updated_at": datetime.now(timezone.utc).isoformat(),  # Use timezone-aware datetime
        "attribute1": f"MongoAttr1_{i}",
        "attribute2": f"MongoAttr2_{i}",
        "attribute3": f"MongoAttr3_{i}"
    })

# Insert 1000 objects into the MongoDB collection
collection.insert_many(data)
print("Inserted 1000 objects into MongoDB.")
