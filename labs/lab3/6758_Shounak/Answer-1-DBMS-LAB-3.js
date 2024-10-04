!pip install pymongo
!pip install uuid



import pymongo
import uuid
from datetime import datetime



client = pymongo.MongoClient("mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3")


db = client['lab3']



collection_name = '476758_Shounak'  
collection = db[collection_name]



objects = []
for i in range(1000):
    obj = {
        "_id": str(uuid.uuid4()),  
        "uuid": str(uuid.uuid4()),  
        "source_database": "MongoDB",  
        "created_at": datetime.utcnow().isoformat(),  
        "updated_at": datetime.utcnow().isoformat(),  
        "attribute1": f"attribute_value_{i}",  
        "attribute2": f"attribute_value_{i+1}",  
        "attribute3": f"attribute_value_{i+2}"  
    }
    objects.append(obj)



collection.insert_many(objects)



sample_data = collection.find().limit(5)



for data in sample_data:
    print(data)