let request = indexedDB.open("WeatherDB", 1);

request.onupgradeneeded = function(event) {
    let db = event.target.result;
    db.createObjectStore("WeatherData", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = function(event) {
    let db = event.target.result;

    function createData(data) {
        let transaction = db.transaction(["WeatherData"], "readwrite");
        let store = transaction.objectStore("WeatherData");
        store.add(data);
    }

    function readData(id, callback) {
        let transaction = db.transaction(["WeatherData"], "readonly");
        let store = transaction.objectStore("WeatherData");
        let request = store.get(id);
        request.onsuccess = function() {
            callback(request.result);
        };
    }

    function updateData(id, updatedData) {
        let transaction = db.transaction(["WeatherData"], "readwrite");
        let store = transaction.objectStore("WeatherData");
        let request = store.get(id);
        request.onsuccess = function() {
            let data = request.result;
            if (data) {
                for (let key in updatedData) {
                    data[key] = updatedData[key];
                }
                store.put(data);
            } else {
                console.error('Record not found.');
            }
        };
    }

    function deleteData(id) {
        let transaction = db.transaction(["WeatherData"], "readwrite");
        let store = transaction.objectStore("WeatherData");
        store.delete(id);
    }

    createData({
        temperature: [25, 30, 28], // Array
        condition: "Sunny", // String
        isRaining: false, // Boolean
        image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA...", // Image in Base64 format
        windSpeed: 10.5, // Number
        timestamp: new Date(), // Date
        location: { lat: 37.7749, lon: -122.4194 } // Object
    });

    readData(1, function(data) { console.log(data); });
    updateData(1, { isRaining: true }); // Ensure this runs after the record is created
    deleteData(1);
};
