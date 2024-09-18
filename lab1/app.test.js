// app.test.js

// Sample data for testing
let testData = {
    sensorReadings: [24.5, 65.3],  // Array
    cropPhoto: "data:image/png;base64,iVBORw0KGgoAAA...",  // Base64 image string
    farmerNote: "Checked crop health; observed no issues.",  // String
    gpsCoordinates: 37.7749,  // Number
    timestamp: new Date()  // Date
};

// Test function to check if sensorReadings is an array
test('Sensor readings are an array', () => {
    expect(Array.isArray(testData.sensorReadings)).toBe(true);
});

// Test function to check if cropPhoto is a Base64 string
test('Crop photo is a valid Base64 string', () => {
    const base64Pattern = /^data:image\/[a-zA-Z]+;base64,/;
    expect(typeof testData.cropPhoto).toBe("string");
    expect(base64Pattern.test(testData.cropPhoto)).toBe(true);
});

// Test function to check if farmerNote is a string
test('Farmer note is a string', () => {
    expect(typeof testData.farmerNote).toBe("string");
});

// Test function to check if gpsCoordinates is a number
test('GPS coordinates are a number', () => {
    expect(typeof testData.gpsCoordinates).toBe("number");
});

// Test function to check if timestamp is a valid Date object
test('Timestamp is a valid Date object', () => {
    expect(testData.timestamp instanceof Date).toBe(true);
});
