// Sample data for testing
let testData = {
    sensorReadings: [24.5, 65.3],  // Array
    cropPhoto: "data:image/png;base64,iVBORw0KGgoAAA...",  // Base64 image string
    farmerNote: "Checked crop health; observed no issues.",  // String
    gpsCoordinates: 37.7749,  // Number
    timestamp: new Date()  // Date
};

// Utility function to log passed tests in green with a checkmark
function logPass(message) {
    console.log(`%c✔️ Test Passed: ${message}`, "color: green; font-weight: bold; font-size: 14px;");
}

// Utility function to log failed tests in red with a cross mark
function logFail(message) {
    console.log(`%c❌ Test Failed: ${message}`, "color: red; font-weight: bold; font-size: 14px;");
}

// Test function to check if sensorReadings is an array
function testSensorReadingsIsArray() {
    if (Array.isArray(testData.sensorReadings)) {
        logPass("Sensor readings are an array.");
    } else {
        logFail("Sensor readings are not an array.");
    }
}

// Test function to check if cropPhoto is a Base64 string
function testCropPhotoIsBase64() {
    const base64Pattern = /^data:image\/[a-zA-Z]+;base64,/;
    if (typeof testData.cropPhoto === "string" && base64Pattern.test(testData.cropPhoto)) {
        logPass("Crop photo is a valid Base64 string.");
    } else {
        logFail("Crop photo is not a valid Base64 string.");
    }
}

// Test function to check if farmerNote is a string
function testFarmerNoteIsString() {
    if (typeof testData.farmerNote === "string") {
        logPass("Farmer note is a string.");
    } else {
        logFail("Farmer note is not a string.");
    }
}

// Test function to check if gpsCoordinates is a number
function testGpsCoordinatesIsNumber() {
    if (typeof testData.gpsCoordinates === "number") {
        logPass("GPS coordinates are a number.");
    } else {
        logFail("GPS coordinates are not a number.");
    }
}

// Test function to check if timestamp is a valid Date object
function testTimestampIsDate() {
    if (testData.timestamp instanceof Date) {
        logPass("Timestamp is a valid Date object.");
    } else {
        logFail("Timestamp is not a valid Date object.");
    }
}

// Function to run all tests with visual separation
function runTests() {
    console.log("%cRunning Unit Tests...", "color: blue; font-weight: bold; font-size: 16px;");
    console.log("%c===========================", "color: blue; font-weight: bold;");
    testSensorReadingsIsArray();
    testCropPhotoIsBase64();
    testFarmerNoteIsString();
    testGpsCoordinatesIsNumber();
    testTimestampIsDate();
    console.log("%c===========================", "color: blue; font-weight: bold;");
    console.log("%cAll tests completed.", "color: blue; font-weight: bold; font-size: 16px;");
}

// Call runTests to execute all tests
runTests();
