import pymongo
import uuid
from datetime import datetime
import random
import string

# MongoDB connection setup
client = pymongo.MongoClient("mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3")
db = client["lab3"]
collection = db["2223_Hradyesh"]

# Function to generate a random username
def generate_username():
    return ''.join(random.choices(string.ascii_lowercase, k=8))
    
# Function to generate a random email
def generate_email():
    domains = ["example.com", "mail.com", "test.org"]
    return f"{generate_username()}@{random.choice(domains)}"

# Function to generate a single object
def generate_object():
    return {
        "uuid": str(uuid.uuid4()),                # Unique identifier
        "source_database": "MongoDB",             # Database identifier
        "created_at": datetime.utcnow(),          # Timestamp for creation
        "updated_at": datetime.utcnow(),          # Timestamp for update
        "username": generate_username(),          # Randomly generated username
        "email": generate_email(),                # Randomly generated email
        "age": random.randint(18, 65)             # Random age between 18 and 65
    }

# Generate 1000 objects
objects = [generate_object() for _ in range(1000)]

# Insert objects into the MongoDB collection
result = collection.insert_many(objects)

# Confirmation message
print(f"Inserted {len(result.inserted_ids)} documents into the collection.")
