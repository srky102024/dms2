require('fake-indexeddb/auto');
let {sensorReadings, cropImages, farmerNote, gpsCoordinates, timeStamp} = require('./lab1.js');

jest.mock('./lab1.js', () => {
    return {
        sensorReadings: [[23.5, 45.2]],
        cropImages: ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAZABkAAD/..."],
        farmerNote: "Checked the crop health, observed some pest issues.",
        gpsCoordinates: [[40.7128, -74.0060]],
        timeStamp: new Date()
    };
});

describe('Test the data types', () => {
    test('Check the type of sensor readings', () => {
        console.log(sensorReadings);
        
        expect(sensorReadings[0][0]).toBe(23.5);
        expect(sensorReadings[0][1]).toBe(45.2);
        expect(typeof sensorReadings[0][0]).toBe('number');
        expect(typeof sensorReadings[0][1]).toBe('number');
    });
    
    test('Check the type of crop images', () => {
        console.log(cropImages);
        
        expect(cropImages[0]).toBe("data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAZABkAAD/...");
        expect(typeof cropImages[0]).toBe('string');
    });
    
    test('Check the type of farmer note', () => {
        console.log(farmerNote);
        
        expect(farmerNote).toBe("Checked the crop health, observed some pest issues.");
        expect(typeof farmerNote).toBe('string');
    });
    
    test('Check the type of GPS coordinates', () => {
        console.log(gpsCoordinates);
        
        expect(gpsCoordinates[0][0]).toBe(40.7128);
        expect(gpsCoordinates[0][1]).toBe(-74.006);
        expect(typeof gpsCoordinates[0][0]).toBe('number');
        expect(typeof gpsCoordinates[0][1]).toBe('number');
    });
    
    test('Check the type of timestamp', () => {
        console.log(timeStamp);
        
        expect(timeStamp instanceof Date).toBe(true); 
    });
});

