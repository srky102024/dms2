import uuid
import random
import json
from datetime import datetime

# Example names and genders
names = ["David", "John", "Alice", "Mary", "Chris", "Eve"]
genders = ["Male", "Female"]

# Function to generate a sample object
def generate_object():
    return {
        "uuid": str(uuid.uuid4()),                # Unique identifier
        "source_database": "MongoDB",             # Fixed source database
        "created_at": datetime.now().isoformat(), # Creation timestamp
        "updated_at": datetime.now().isoformat(), # Update timestamp
        "name": random.choice(names),             # Random name from the list
        "age": random.randint(18, 90),            # Random age between 18 and 90
        "gender": random.choice(genders)          # Random gender
    }

# Generate 1000 objects
objects = [generate_object() for _ in range(1000)]

# Save to JSON file
with open('generated_data.json', 'w') as json_file:
    json.dump(objects, json_file, indent=4)

print("Generated 1000 objects and saved to 'generated_data.json'")
