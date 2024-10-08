# main.py: Python script for MongoDB interaction (if required)

from pymongo import MongoClient

# MongoDB connection
client = MongoClient("mongodb+srv://i40:dbms2@cluster0.lixbqmp.mongodb.net/lab3")
db = client["lab3"]
collection = db["test2"]

# Insert a sample document
data = {"uuid": "1234", "attribute": "Sample Data"}
collection.insert_one(data)

# Fetch and print all documents in the collection
documents = collection.find()
for document in documents:
    print(document)

# Close connection
client.close()
