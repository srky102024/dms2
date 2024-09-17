// Open or create the IndexedDB
let db;
let request = indexedDB.open("AgricultureDB", 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;

    // Create an object store named "FarmData" with an auto-incrementing key
    let objectStore = db.createObjectStore("FarmData", { keyPath: "id", autoIncrement: true });

    // Define the fields we want to store
    objectStore.createIndex("sensorReadings", "sensorReadings", { unique: false });
    objectStore.createIndex("cropPhoto", "cropPhoto", { unique: false });
    objectStore.createIndex("farmerNote", "farmerNote", { unique: false });
    objectStore.createIndex("gpsCoordinates", "gpsCoordinates", { unique: false });
    objectStore.createIndex("timestamp", "timestamp", { unique: false });
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log("IndexedDB is ready.");
    addSampleData();  // Add data once the database is ready
};

request.onerror = function(event) {
    console.log("Error opening IndexedDB: ", event);
};

// Function to add sample data to IndexedDB
function addSampleData() {
    let transaction = db.transaction(["FarmData"], "readwrite");
    let objectStore = transaction.objectStore("FarmData");

    // Sample agricultural data
    let farmData = {
        sensorReadings: [24.5, 65.3],  // Sensor readings: temperature and humidity
        cropPhoto: "data:image/png;base64,iVBORw0KGgoAAA...",  // Base64 encoded image (placeholder)
        farmerNote: "Checked crop health; observed no issues.",  // Farmer notes
        gpsCoordinates: 37.7749,  // GPS coordinates (latitude example)
        timestamp: new Date()  // Current date and time
    };

    let request = objectStore.add(farmData);
    request.onsuccess = function() {
        console.log("Sample data added successfully.");
    };
    request.onerror = function(event) {
        console.log("Error adding sample data: ", event);
    };
}

// Function to retrieve and display data from IndexedDB in the console
function displayData() {
    let transaction = db.transaction(["FarmData"], "readonly");
    let objectStore = transaction.objectStore("FarmData");

    let request = objectStore.getAll();
    request.onsuccess = function(event) {
        let allData = event.target.result;
        console.log("Retrieved Data:", allData);

        allData.forEach(data => {
            console.log(`Entry ID: ${data.id}`);
            console.log(`Sensor Readings: ${data.sensorReadings}`);
            console.log(`Crop Photo (Base64): ${data.cropPhoto}`);
            console.log(`Farmer Note: ${data.farmerNote}`);
            console.log(`GPS Coordinates: ${data.gpsCoordinates}`);
            console.log(`Timestamp: ${data.timestamp}`);
            console.log("-----------------------------------");
        });
    };

    request.onerror = function(event) {
        console.log("Error retrieving data: ", event);
    };
}

// After running this code in the browser console, you can call displayData() to view the data stored in IndexedDB.
displayData();
