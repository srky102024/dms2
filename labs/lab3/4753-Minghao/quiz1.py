import pymongo
import uuid
from datetime import datetime

MONGO_URI = 'mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3?tlsAllowInvalidCertificates=true'
STUDENT_ID = "4753_Minghao"

client = pymongo.MongoClient(MONGO_URI)
db = client['lab3']
collection = db[STUDENT_ID]

def generate_objects(num_objects):
    objects = []
    for _ in range(num_objects):
        obj = {
            "uuid": str(uuid.uuid4()),
            "source_database": "MongoDB",
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "temperature": "24",
            "humidity": 85,
            "weather": "rain"
        }
        objects.append(obj)
    return objects

data_to_insert = generate_objects(1000)

result = collection.insert_many(data_to_insert)

print(f"inserted {len(result.inserted_ids)} objects into {db.name},{STUDENT_ID}")