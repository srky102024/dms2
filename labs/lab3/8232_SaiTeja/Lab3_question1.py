# Import necessary libraries
import pymongo
import uuid
from datetime import datetime
import random

# MongoDB connection
uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"
client = pymongo.MongoClient(uri)
db = client['lab3']  # Replace 'lab3' with your database name if different\
collection = db['8232_Sai_Teja']  # Replace 'objects' with your collection name

# Function to generate random attributes
def generate_randomly_attr():
    attribute1 = random.randint(1, 100)  # Random integer
    attribute2 = random.choice(["Tiger","Lion","Bull","Leopard"])  # Random color
    attribute3 = random.uniform(1.0, 10.0)  # Random float
    return attribute1, attribute2, attribute3

# List to store 1000 objects
list_of_object = []

for _ in range(1000):
    attribute1, attribute2, attribute3 = generate_randomly_attr()

    # Create object with required attributes
    object = {
        "UUID": str(uuid.uuid4()),  # Unique identifier
        "source_db": "MongoDB",  # Source database identifier
        "created_at": datetime.now(),  # Creation timestamp
        "updated_at": datetime.now(),  # Update timestamp
        "attribute_1": attribute1,  # Random attribute 1
        "attribute_2": attribute2,  # Random attribute 2
        "attribute_3": attribute3  # Random attribute 3
    }
    list_of_object.append(object)

# Insert generated objects into MongoDB
result = collection.insert_many(list_of_object)
print(f"Inserted the {len(result.inserted_ids)} documents into the MongoDB.")
