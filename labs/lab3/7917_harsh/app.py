import uuid
from datetime import datetime
from pymongo import MongoClient

# MongoDB connection setup
def setup_mongo_connection():
    uri = "mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3"
    client = MongoClient(uri)
    return client

# Generate 1000 objects with required attributes
def generate_objects():
    objects = []
    for i in range(1000):
        object_data = {
            "uuid": str(uuid.uuid4()),  # Unique identifier
            "source_db": "MongoDB",  # Source database identifier
            "created_at": datetime.now(),  # Timestamp for creation
            "updated_at": datetime.now(),  # Timestamp for last update
            "attribute1": f"Attr1_Value_{i}",  # Custom attribute 1
            "attribute2": f"Attr2_Value_{i}",  # Custom attribute 2
            "attribute3": f"Attr3_Value_{i}"   # Custom attribute 3
        }
        objects.append(object_data)
    return objects

# Insert generated objects into MongoDB collection
def insert_objects_to_mongo(client, collection_name, objects):
    db = client['lab3']  # Use 'lab3' database
    collection = db[collection_name]  # Collection name with last 4 digits of your student ID
    result = collection.insert_many(objects)  # Insert all objects
    print(f"Inserted {len(result.inserted_ids)} objects into the collection '{collection_name}'.")

# Main execution function
def main():
    student_id_last4 = "7917"  # Replace this with the last 4 digits of your student ID
    collection_name = f"harsh_{student_id_last4}"

    # Setup MongoDB connection
    client = setup_mongo_connection()

    # Generate 1000 objects
    objects = generate_objects()

    # Insert objects into the MongoDB collection
    insert_objects_to_mongo(client, collection_name, objects)

    # Close the MongoDB connection
    client.close()

# Run the main function
if __name__ == "__main__":
    main()