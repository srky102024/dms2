from pymongo import MongoClient
import uuid
import datetime
import random

uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"
client = MongoClient(uri)

db = client['lab3']
collection_name = "6447_Srikar"
collection = db[collection_name]

crop_types = ['Wheat', 'Rice', 'Corn', 'Soybean', 'Barley']
weather_conditions = ['Sunny', 'Rainy', 'Cloudy', 'Windy', 'Stormy']

objects = []
for _ in range(1000):
    obj = {
        'uuid': str(uuid.uuid4()),
        'source_db': 'MongoDB',
        'created_at': datetime.datetime.now(datetime.timezone.utc),
        'updated_at': datetime.datetime.now(datetime.timezone.utc),
        'crop_type': random.choice(crop_types),
        'weather': random.choice(weather_conditions),
        'pH level': round(random.uniform(10.0, 100.0), 2)
    }
    objects.append(obj)
collection.insert_many(objects)
