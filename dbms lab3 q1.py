import uuid
import pymongo
from datetime import datetime
import random
client = pymongo.MongoClient("mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3")
db = client["lab3"] 
collection = db["3569_ChalamalashettyShcharathPavan"]  

product_names = [
    "Laptop", "Smartphone", "Tablet", "Headphones", "Smartwatch",
    "Camera", "Speaker", "Printer", "Monitor", "Keyboard",
    "Mouse", "Charger", "Webcam", "Microphone", "Router"
]

def generate_object():
    return {
        "uuid": str(uuid.uuid4()),  
        "source_database": "MongoDB",
        "created_at": datetime.utcnow(),  
        "updated_at": datetime.utcnow(),  
        "product_name": random.choice(product_names),  
        "count": random.randint(1, 100),  
        "availability_in_stock": random.choice([True, False])  
    }

for _ in range(1000):
    obj = generate_object()
    collection.insert_one(obj)

print("Inserted 1000 objects into MongoDB.")
