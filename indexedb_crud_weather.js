const dbName = "WeatherDB";

function openDatabase(callback) {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = function(event) {
        const db = event.target.result;
        db.createObjectStore("WeatherData", { keyPath: "id", autoIncrement: true });
    };

    request.onsuccess = function(event) {
        callback(null, event.target.result); // Pass the database to the callback
    };

    request.onerror = function(event) {
        callback(event.target.error); // Pass the error to the callback
    };
}

function createData(db, data, callback) {
    const transaction = db.transaction(["WeatherData"], "readwrite");
    const store = transaction.objectStore("WeatherData");
    const request = store.add(data);

    request.onsuccess = function(event) {
        callback(null, event.target.result); // Pass the ID of the added record to the callback
    };

    request.onerror = function(event) {
        callback(event.target.error); // Pass the error to the callback
    };
}

openDatabase(function(error, db) {
    if (error) {
        console.error("Error opening database:", error);
        return;
    }

    createData(db, {
        temperature: 22,
        condition: "Sunny",
        isRaining: false,
        windSpeed: 5.0,
        timestamp: new Date().toISOString()
    }, function(error, id) {
        if (error) {
            console.error("Error creating data:", error);
        } else {
            console.log("Data created with ID:", id);
        }
    });
});
