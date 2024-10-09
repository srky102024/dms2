import pymongo
import uuid
import random
import datetime
from pymongo import MongoClient

# Connect to MongoDB using the URI
client = MongoClient("mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3")

# Define the database and collection
db = client['lab3']

# Replace '1234' with the last four digits of your student ID to create the collection name
student_id_suffix = '6864_svinesh'
collection_name = f'{student_id_suffix}'
collection = db[collection_name]

# List to hold the generated objects
objects = []

# List of sample names
names_list = ['John', 'Alice', 'Ron', 'Daisy', 'Mike', 'Sophia', 'Tom', 'Emma', 'Robert', 'Olivia']

# Function to generate a random name, age, and gender
def generate_name():
    return random.choice(names_list)

def generate_age():
    return random.randint(18, 60)  # Random age between 18 and 60

def generate_gender():
    return random.choice(['Male', 'Female'])  # Random gender

# Generate 1000 objects
for _ in range(1000):
    obj = {
        "uuid": str(uuid.uuid4()),  # Generate a unique identifier
        "source_database": "MongoDB",  # Source database identifier
        "created_at": datetime.datetime.utcnow(),  # Timestamp for creation
        "updated_at": datetime.datetime.utcnow(),  # Timestamp for last update
        # Three additional attributes: name, age, and gender
        "name": generate_name(),
        "age": generate_age(),
        "gender": generate_gender()
    }
    objects.append(obj)

# Insert objects into the MongoDB collection
result = collection.insert_many(objects)

# Print a sample of the inserted data
print(f"Inserted {len(result.inserted_ids)} objects into collection '{collection_name}'")
print("Sample of inserted objects:")
for obj in objects[:5]:  # Display first 5 objects
    print(obj)

# Close the connection
client.close()
