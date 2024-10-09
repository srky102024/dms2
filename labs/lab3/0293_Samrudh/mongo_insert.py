from pymongo import MongoClient
import uuid
from datetime import datetime
import random

client = MongoClient("mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3")
db = client.lab3
collection = db["0293"]

def gen_k(task_number):
    return {
        "uuid": str(uuid.uuid4()),
        "source": "MongoDB",
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "task_number": f"task{task_number}",
        "computing_cost": random.randint(1, 100),
        "status": random.choice(["processing", "done"])
    }

try:
    list_objects = [gen_k(i + 1) for i in range(1000)]
    collection.insert_many(list_objects)
    print("Data inserted successfully.")
except Exception as e:
    print(f"An error occurred: {e}")

