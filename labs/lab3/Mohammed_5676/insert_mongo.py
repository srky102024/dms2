import uuid
from datetime import datetime
from pymongo import MongoClient

mongo_uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"
client = MongoClient(mongo_uri)
db = client['lab3']

student_id_suffix = "5676"
collection_name = f"{student_id_suffix}_objects"
collection = db[collection_name]

data = []
for i in range(1000):
    obj = {
        "uuid": str(uuid.uuid4()),             
        "created_at": datetime.now(),           
        "updated_at": datetime.now(),           
        "attribute1": f"SensorReading_{i}",      
        "attribute2": f"Location_{i % 10}",    
        "attribute3": f"Status_{i % 5}"          
    }
    data.append(obj)

collection.insert_many(data)
sample_data = collection.find().limit(1000)
print("Sample of the inserted documents:")
for doc in sample_data:
    print(doc)

client.close()
