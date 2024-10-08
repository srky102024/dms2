import uuid
import pymongo
from datetime import datetime, timezone
import random

# Connect to MongoDB
def connect_to_mongodb(uri):
    try:
        client = pymongo.MongoClient(uri)
        db = client.get_database()
        return db
    except pymongo.errors.ConnectionError as e:
        print(f"Connection error: {e}")
        return None

# Generate objects
def generate_objects(n):
    data = []
    for _ in range(n):
        obj = {
            'uuid': str(uuid.uuid4()),
            'source_db': 'MongoDB',
            'created_at': datetime.now(timezone.utc),
            'updated_at': datetime.now(timezone.utc),
            'temperature': round(random.uniform(-10, 35), 2),  # Random temperature between -10°C and 35°C
            'humidity': round(random.uniform(10, 90), 2),  # Random humidity between 10% and 90%
            'status': random.choice(['active', 'inactive', 'pending'])  # Random status
        }
        data.append(obj)
    return data

# Main function
def main():
    db = connect_to_mongodb("mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3")
    if db is not None:
        collection = db['3600_Konika_lab3mongo']  
        data = generate_objects(1000)
        try:
            collection.insert_many(data)
            print(f"Inserted {len(data)} documents into the collection {collection.name}")
        except pymongo.errors.BulkWriteError as e:
            print(f"Error during insertion: {e.details}")
        
        for d in data:
            print(d)

if __name__ == "__main__":
    main()
