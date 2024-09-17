// Array: Sensor readings (e.g., temperature, humidity)
let sensorReadings = [23.5, 45.2]; // Temperature: 23.5°C, Humidity: 45.2%

// Image: Crop photos (Base64 encoded image string)
let cropPhoto = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...";

// String: Farmer notes and descriptions
let farmerNote = "Checked the crop health, observed some pest issues.";

// Number: GPS coordinates (Latitude example)
let gpsCoordinates = 37.7749;

// Date: Timestamp of data collection
let timestamp = new Date(); // Current date and time

let db;
let openOrCreateDB = window.indexedDB.open('AgricultureDB', 1);

openOrCreateDB.addEventListener('error', () => 
console.error("Error in opening DB"));

openOrCreateDB.onsuccess = (event) => {
    db = openOrCreateDB.result;
    console.log("Successfully opened DB");
    let transaction = db.transaction(['farmData'], 'readwrite');
    let objectStore = transaction.objectStore('farmData');

    let query = objectStore.add({sensorReadings, cropPhoto, farmerNote, gpsCoordinates, timestamp});
    query.onsuccess = (event) => {
        console.log("Value added successfully");
    };

    let getRequest = objectStore.get(1);
    getRequest.onsuccess = (event) => {
        let farmDataReq = event.target.result;
        console.log("Sensor Reading: ", farmDataReq.sensorReadings);
        console.log("Crop Photo ", farmDataReq.cropPhoto);
        console.log("Farmer Notes: ", farmDataReq.farmerNote);
        console.log("GPS Coordinates: ", farmDataReq.gpsCoordinates);
        console.log("TimeStamp: ", farmDataReq.timestamp);
    };


};

openOrCreateDB.addEventListener('upgradeneeded', () => {
    db = openOrCreateDB.result;
    db.onerror = () => {
        console.log("Error loading database")
    };

    let table = db.createObjectStore('farmData', {keyPath: 'id', autoIncrement: true});

})

