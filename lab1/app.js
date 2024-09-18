// Open or create IndexedDB database and object store
let request = indexedDB.open('AgricultureDB', 1);

request.onupgradeneeded = function(event) {
    let db = event.target.result;

    // Create object store with auto-incrementing primary key
    let objectStore = db.createObjectStore('FarmData', { autoIncrement: true });

    // Define indexes for object store (optional)
    objectStore.createIndex('sensorReadings', 'sensorReadings', { unique: false });
    objectStore.createIndex('cropPhoto', 'cropPhoto', { unique: false });
    objectStore.createIndex('farmerNote', 'farmerNote', { unique: false });
    objectStore.createIndex('gpsCoordinates', 'gpsCoordinates', { unique: false });
    objectStore.createIndex('timestamp', 'timestamp', { unique: false });

    console.log("Database and object store created.");
};

request.onsuccess = function(event) {
    console.log("Database opened successfully.");
    let db = event.target.result;
    storeData(db); // Pass the db instance to the storeData function
    retrieveData(db); // Retrieve and log the stored data
};

request.onerror = function(event) {
    console.error("Error opening database:", event.target.error);
};

// Function to store data in IndexedDB
function storeData(db) {
    let transaction = db.transaction(['FarmData'], 'readwrite');
    let objectStore = transaction.objectStore('FarmData');
    
    // Sample data to store
    let data = {
        sensorReadings: [25.3, 60.7],
        cropPhoto: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...", // Shortened for brevity
        farmerNote: "Observed good growth, but some areas are dry.",
        gpsCoordinates: 40.7128,
        timestamp: new Date()
    };

    // Add data to object store
    let requestAdd = objectStore.add(data);

    requestAdd.onsuccess = function() {
        console.log("Data stored successfully.");
    };

    requestAdd.onerror = function(event) {
        console.error("Error storing data:", event.target.error);
    };
}

// Function to retrieve and log data from IndexedDB
function retrieveData(db) {
    let transaction = db.transaction(['FarmData'], 'readonly');
    let objectStore = transaction.objectStore('FarmData');

    objectStore.openCursor().onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            console.log("Sensor Readings: ", cursor.value.sensorReadings);
            console.log("Crop Photo: ", cursor.value.cropPhoto);
            console.log("Farmer Note: ", cursor.value.farmerNote);
            console.log("GPS Coordinates: ", cursor.value.gpsCoordinates);
            console.log("Timestamp: ", cursor.value.timestamp);
            cursor.continue();
        } else {
            console.log("No more entries!");
        }
    };

    objectStore.openCursor().onerror = function(event) {
        console.error("Error retrieving data:", event.target.error);
    };
}
