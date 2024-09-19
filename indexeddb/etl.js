let patient = {
    "uuid": crypto.randomUUID(),
    "name": "",
    "age": "",
    "gender": "",
    "conditions": {}
};

let requestExtract = indexedDB.open("patientDbExtract", 1);
let requestTransform = indexedDB.open("patientDbTransform", 1);
let requestLoad = indexedDB.open("patientDbLoad", 1);

requestExtract.onupgradeneeded = function (event) {
    let db = event.target.result;
    db.createObjectStore("patient", { keyPath: "uuid" });
};

requestTransform.onupgradeneeded = function (event) {
    let db = event.target.result;
    db.createObjectStore("patient", { keyPath: "uuid" });
};

// Function to load transformed patient data into the Transform database
function loadTransformedPatientData() {
    let transformRequest = indexedDB.open("patientDbTransform", 1);
    
    transformRequest.onsuccess = function (event) {
        let db = event.target.result;
        let transaction = db.transaction(["patient"], "readwrite");
        let os = transaction.objectStore("patient");
        
        patient.name = patient.name.trim() === "" ? "unset" : patient.name.trim();
        os.add(patient);
    };

    transformRequest.onerror = function (event) {
        console.error("Error opening transform database:", event.target.error);
    };
}

// Extract and store patient data
requestExtract.onsuccess = function (event) {
    let db = event.target.result;
    let transaction = db.transaction(["patient"], "readwrite");
    let os = transaction.objectStore("patient");
    
    os.add(patient).onsuccess = function () {
        // After adding to extract, load transformed data
        loadTransformedPatientData();
    };

    transaction.onerror = function (event) {
        console.error("Transaction error:", event.target.error);
    };
};
