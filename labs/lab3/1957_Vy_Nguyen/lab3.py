# Vy Nguyen
# Python Script to generate 1000 objects to represent a job application system

from pymongo import MongoClient
from uuid import uuid4
from datetime import datetime
import random

client = MongoClient('mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3')
db = client.lab3
collection = db['1957_Vy_Nguyen']

def generate_object():
    return {
        "uuid": str(uuid4()),
        "source_db": "MongoDB",
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "quantity": random.randint(1, 100),
        "status": random.choice(["active", "inactive", "pending"]),
        "type": random.choice(["internship", "full-time", "part-time"])
    }

objects = [generate_object() for _ in range(1000)]
collection.insert_many(objects)
print(f"Just printing out the first 10 objects:")
for i in range(0, 10):
    print(objects[i])
print(f"Inserted 1000 objects into '{collection.name}'")