import pymongo
import uuid
from datetime import datetime


uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"

client = pymongo.MongoClient(uri)
db = client['lab3']  
collection = db['5584_Manishbr']  

data = []
for _ in range(1000):
    obj = {
        "uuid": str(uuid.uuid4()),
        "source_database": "MongoDB",
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "device_type": "sensor",        
        "status": "active",             
        "temperature_reading": 22.5 
    }
    data.append(obj)

# Insert data into MongoDB
collection.insert_many(data)

print("Data inserted successfully into MongoDB")
