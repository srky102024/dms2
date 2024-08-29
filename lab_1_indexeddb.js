// Open a database connection named "LibraryDB" with version 1
let request = indexedDB.open("LibraryDB", 1);

request.onupgradeneeded = function(event) {
    let db = event.target.result;
    
    // Create an object store named "Books" within the database
    let booksStore = db.createObjectStore("Books", { keyPath: "id", autoIncrement: true });
    
    // Create another object store named "Novels" within the database
    let novelsStore = db.createObjectStore("Novels", { keyPath: "id", autoIncrement: true });
};

request.onsuccess = function(event) {
    let db = event.target.result;
    
    // Start a transaction for reading and writing data to the "Books" store
    let transaction = db.transaction(["Books"], "readwrite");
    
    // Access the "Books" object store within the transaction
    let booksStore = transaction.objectStore("Books");
    
    // Add a new book with the title "Learn JavaScript" and author "Jane Smith"
    booksStore.add({ title: "Learn JavaScript", author: "Jane Smith" });
    
    // Retrieve a book with a specific ID from the "Books" store
    let getRequest = booksStore.get(1);
    
    getRequest.onsuccess = function(event) {
        // Log the retrieved book's author to the console
        let book = event.target.result;
        console.log("Author:", book.author);
        
        // Update the book's title in the "Books" store
        book.title = "Mastering JavaScript";
        booksStore.put(book);
    };
    
    // Delete a book with ID 2 from the "Books" store
    booksStore.delete(2);
    
    // Clear all data in the "Books" store
    booksStore.clear();
    
    // Close the database connection after all operations are done
    transaction.oncomplete = function() {
        db.close();
    };

    // Handle operations in the "Novels" store
    let novelsTransaction = db.transaction(["Novels"], "readwrite");
    let novelsStore = novelsTransaction.objectStore("Novels");
    
    // Add a new book with the title "Web Development" and author "Alice Brown"
    novelsStore.add({ title: "Web Development", author: "Alice Brown" });
    
    // Retrieve a book by its ID from the "Novels" store
    let novelGetRequest = novelsStore.get(1);
    
    novelGetRequest.onsuccess = function(event) {
        // Log the retrieved book's title and author to the console
        let novel = event.target.result;
        console.log("Title:", novel.title, "Author:", novel.author);
    };
    
    // Delete a book with a specific ID from the "Novels" store
    novelsStore.delete(1);
    
    novelsTransaction.oncomplete = function() {
        db.close();
    };
};

// Handle errors that might occur during any of the database operations
request.onerror = function(event) {
    console.error("Database error:", event.target.errorCode);
};

// Delete the entire "LibraryDB" database (this would usually be done in a separate context)
let deleteRequest = indexedDB.deleteDatabase("LibraryDB");

deleteRequest.onsuccess = function(event) {
    console.log("LibraryDB deleted successfully");
};
