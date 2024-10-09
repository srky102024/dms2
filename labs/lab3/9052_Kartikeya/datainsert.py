import uuid
import random
import pymongo
from datetime import datetime

mongo_uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"
client = pymongo.MongoClient(mongo_uri)

db = client['lab3']
collection_name = "9052_Kartikeya"
collection = db[collection_name]

names = [
    "Jake", "Emma", "Liam", "Olivia", "Noah", "Ava", "Sophia", "Mason", "Isabella", 
    "James", "Mia", "Ethan", "Amelia", "Michael", "Charlotte", "Benjamin", "Harper", 
    "Jacob", "Evelyn", "Alexander", "Abigail"
]
def generate_object():
    platforms = ["PC", "console", "Mobile"]
    play_styles = ["competitive", "casual"]

    obj = {
        "UUID": str(uuid.uuid4()),
        "source_db": "MongoDB",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "name": random.choice(names),
        "platform": random.choice(platforms),
        "styleOfPlay": random.choice(play_styles)
    }
    return obj

objects = [generate_object() for _ in range(1000)]

collection.insert_many(objects)

print(f"Successfully inserted 1000 objects into the collection '{collection_name}'.")

client.close()