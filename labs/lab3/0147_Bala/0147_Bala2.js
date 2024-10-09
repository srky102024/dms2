// Open or create the IndexedDB database
let db
const request = indexedDB.open("ObjectDatabase", 1)

request.onupgradeneeded = function (event) {
  db = event.target.result
  let objectStore = db.createObjectStore("objects", { keyPath: "uuid" })
  objectStore.createIndex("source", "source", { unique: false })
  objectStore.createIndex("created_at", "created_at", { unique: false })
  objectStore.createIndex("updated_at", "updated_at", { unique: false })
  objectStore.createIndex("attribute1", "attribute1", { unique: false })
  objectStore.createIndex("attribute2", "attribute2", { unique: false })
  objectStore.createIndex("attribute3", "attribute3", { unique: false })
}

request.onsuccess = function (event) {
  db = event.target.result
  document
    .getElementById("generateObjects")
    .addEventListener("click", generateAndStoreObjects)
}

request.onerror = function (event) {
  console.error("Database error: " + event.target.errorCode)
}

// Generate 1000 objects and store them in IndexedDB
function generateAndStoreObjects() {
  const transaction = db.transaction(["objects"], "readwrite")
  const objectStore = transaction.objectStore("objects")

  for (let i = 0; i < 1000; i++) {
    let uuid = crypto.randomUUID() // Generate UUID
    let currentDate = new Date()

    let object = {
      uuid: uuid,
      source: "IndexedDB",
      created_at: currentDate,
      updated_at: currentDate,
      attribute1: `attribute1_value_${i}`,
      attribute2: `attribute2_value_${i}`,
      attribute3: `attribute3_value_${i}`,
    }

    objectStore.add(object)
  }

  transaction.oncomplete = function () {
    document.getElementById("status").innerText =
      "1000 objects successfully generated and stored in IndexedDB!"
  }

  transaction.onerror = function (event) {
    console.error("Transaction error: " + event.target.errorCode)
  }
}
