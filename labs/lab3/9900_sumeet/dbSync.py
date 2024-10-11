from pymongo import MongoClient
from pymongo.server_api import ServerApi
from datetime import datetime
import uuid
from random import random
from random import uniform
from random import seed
from random import randint
from random import sample

uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"
client = MongoClient(uri, 
                     server_api= ServerApi(version="1", strict=True, deprecation_errors=True),
                     tls=True)

try:
    client.admin.command({'ping': 1})
    print("Pinged your deployment. You successfully connected to mongoDB!")
    database = client["lab3"]
    collection_list = database.list_collections()
    checkIfExists = [True for c in collection_list if c['name'] == '9900']
    print(checkIfExists)
    if not checkIfExists:
        database.create_collection("9900")
    else:
        print("Collection exists")
    collection = database["9900"]
    collection_count = collection.count_documents({})
    
    # collection.delete_many({})
    if collection_count == 0:
        seed(1)
        gender = ['M', 'F']
        # generate 1000 objects with attributes like uuid, source identifier, timestamp for creation and last update and three random attributes
        for i in range(1000):
            obj = {
                "uuid": str(uuid.uuid4()),
                "source": "MongoDB",
                "timestamp_creation": datetime.now().isoformat(),
                "timestamp_update": 0,
                "age": randint(18, 60),
                "height": randint(150, 200),
                "weight": round(uniform(50, 100),1),
                "bmi": round(uniform(18, 30),1),
                "gender" : sample(gender, 1)
            }
            collection.insert_one(obj)
        print("Inserted 1000 documents")
    else:
        for doc in collection.find():
            print(doc)
        print("Collection already has documents")
    print(collection_count)
finally:
    client.close()
    print("Database closed")

