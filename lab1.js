// temperature and humidity readings in celsius and % respectively
let sensorReadings = [[23.5, 45.2]]; // example readings temperature 23.5, humidity 45.2

//Crop images: (Base64, encoded image string)
let cropImages = ["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAZABkAAD/..."] //example image

//String: Farmer notes and descriptions
let farmerNote = "Checked the crop health, observed some pest issues.";

//Number: GPS coordinates(latitude, longitude)
let gpsCoordinates = [[40.7128, -74.0060]];

//Date: Timestamp of the data collection
let timeStamp = new Date(); //current date and time

let openRequest = indexedDB.open("AgricultureDB", 2);

openRequest.onupgradeneeded = (event)  => {
  let db = event.target.result;

  let farmStore = db.createObjectStore("FarmData", {keypath: "id", autoIncrement: true});

}

openRequest.onerror = function() {
    console.error("Error", openRequest.error);
  }
  
    openRequest.onsuccess = (event) => {
    let db = event.target.result;
    console.log("Success", db);

    let transaction = db.transaction(["FarmData"], "readwrite");

    let farmStore = transaction.objectStore("FarmData");

    farmStore.add({sensorReadings, cropImages, farmerNote, gpsCoordinates, timeStamp}); //add data to the store

    let getRequest = farmStore.get(1);

     getRequest.onsuccess = (event) => {
        let farmDataRequest = event.target.result;
        console.log('Sensor Readings:- ', farmDataRequest.sensorReadings.map(reading => reading.join('\u2103, ') + '%') + [' type:- '] + typeof farmDataRequest.sensorReadings[0][0]);
        console.log('Crop Image:- ', farmDataRequest.cropImages + [' type:- '] + typeof farmDataRequest.cropImages[0]);
        console.log('Farmer Description:- ', farmDataRequest.farmerNote + [' type:- '] + typeof farmDataRequest.farmerNote);
        console.log('GPS Coordinates:- ', farmDataRequest.gpsCoordinates.map(coord => 'Latitude ' + coord.join(', Longitude ')) + [' type:- '] + typeof farmDataRequest.gpsCoordinates[0][0]);
        console.log('Current Date and Time:- ', farmDataRequest.timeStamp + [' type:- '] + (farmDataRequest.timeStamp instanceof Date == true ? 'Date' : 'Not a Date'));
    }

    transaction.oncomplete = (event) => {
        db.close();
    };
  }

  module.exports = {sensorReadings, cropImages, farmerNote, gpsCoordinates, timeStamp};





