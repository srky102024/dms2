from pymongo import MongoClient
import uuid
import datetime

uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"
client = MongoClient(uri)

db = client['lab3']
collection_name = '7376_Sai_Sravan'
collection = db[collection_name]


def generate_object():
    return {
        "UUID": str(uuid.uuid4()),
        "source_db": "MongoDB",
        "created_at": datetime.datetime.now(datetime.timezone.utc),
        "updated_at": datetime.datetime.now(datetime.timezone.utc),
        "crop_type": "Carrot",
        "weather": "Sunny",
        "soil_moisture_level": 6.5
    }

objects = [generate_object() for _ in range(1000)]

result = collection.insert_many(objects)

print(f'Inserted {len(result.inserted_ids)} documents into the collection "{collection_name}"')

