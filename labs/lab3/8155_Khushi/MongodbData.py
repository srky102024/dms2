import uuid
import random
import pymongo
from datetime import datetime

mongo_uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"
client = pymongo.MongoClient(mongo_uri)

db = client['lab3']
collection_name = "8155_Khushi"
collection = db[collection_name]


brands = [
    "CeraVe", "Neutrogena", "La Roche-Posay", "The Ordinary", "Olay", 
    "L'Oréal", "Clinique", "Kiehl's", "Paula's Choice", "Aveeno"
]


products = [
    "Toner", "Face Mask", "Sunscreen", "Moisturizer", "Cleanser", 
    "Serum", "Eye Cream", "Exfoliator", "Face Oil", "Lip Balm"
]


ratings = [1, 2, 3, 4, 5]

def generate_object():
    obj = {
        "UUID": str(uuid.uuid4()),
        "source_db": "MongoDB",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "brand": random.choice(brands),
        "product": random.choice(products),
        "rating": random.choice(ratings)
    }
    return obj

objects = [generate_object() for _ in range(1000)]

collection.insert_many(objects)

print(f"Successfully inserted objects into the collection '{collection_name}'.")

client.close()