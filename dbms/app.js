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

// Output sensor readings
console.log("Temperature: " + sensorReadings[0] + "°C");
console.log("Humidity: " + sensorReadings[1] + "%");

// Output the crop photo
let imageElement = document.createElement('img');
imageElement.src = cropPhoto;
document.body.appendChild(imageElement); // This will add the image to the webpage

// Output farmer's notes
console.log("Farmer's Note: " + farmerNote);

// Output GPS coordinates
console.log("GPS Coordinates: Latitude " + gpsCoordinates);

// Output timestamp
console.log("Data Collection Timestamp: " + timestamp.toLocaleString());

let db;
const request = indexedDB.open('MyDatabase', 1);

request.onerror = function(event) {
  console.log('Error: ', event.target.errorCode);
};

request.onsuccess = function(event) {
  db = event.target.result;
  console.log('Database opened successfully');
};

request.onupgradeneeded = function(event) {
  db = event.target.result;
  const objectStore = db.createObjectStore('MyObjectStore', { keyPath: 'key' });
  objectStore.transaction.oncomplete = function() {
    console.log('Object Store created');
  };
};

// Add initial sensor data to IndexedDB
function addData() {
  // Prepare data to be added
  const data = {
    key: 'sensorData',
    value: {
      temperature: sensorReadings[0],
      humidity: sensorReadings[1],
      cropPhoto: cropPhoto,
      farmerNote: farmerNote,
      gpsCoordinates: gpsCoordinates,
      timestamp: timestamp.toLocaleString()
    }
  };

  const transaction = db.transaction(['MyObjectStore'], 'readwrite');
  const objectStore = transaction.objectStore('MyObjectStore');

  const request = objectStore.add(data);

  request.onsuccess = function() {
    console.log('Data added successfully');
  };

  request.onerror = function(event) {
    console.log('Error adding data:', event.target.errorCode);
  };
}

// Get the stored data from IndexedDB
function getData() {
  const key = 'sensorData'; // Use the same key for retrieval

  const transaction = db.transaction(['MyObjectStore']);
  const objectStore = transaction.objectStore('MyObjectStore');

  const request = objectStore.get(key);

  request.onsuccess = function(event) {
    const result = event.target.result;
    if (result) {
      document.getElementById('output').textContent = `Key: ${result.key}, Value: ${JSON.stringify(result.value)}`;
    } else {
      document.getElementById('output').textContent = 'No data found';
    }
  };

  request.onerror = function(event) {
    console.log('Error retrieving data: ', event.target.errorCode);
  };
}
