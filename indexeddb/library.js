// Open or create the 'library' database and 'books' object store
let db;
let request = indexedDB.open('library', 1);

request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains('books')) {
        db.createObjectStore('books', { keyPath: 'id', autoIncrement: true });
    }
};

request.onsuccess = function(event) {
    db = event.target.result;
    console.log('Database opened successfully');
    
    // Now you can safely add or retrieve books after the database is successfully opened
    // Example usage:
    addBook('The Great Gatsby', 'F. Scott Fitzgerald');
    getBooks();
};

request.onerror = function(event) {
    console.error('Database error:', event.target.errorCode);
};

// Function to add a new book to the database
function addBook(title, author) {
    if (!db) {
        console.error('Database is not initialized yet');
        return;
    }
    
    let transaction = db.transaction(['books'], 'readwrite');
    let objectStore = transaction.objectStore('books');
    let book = { title: title, author: author };
    
    let request = objectStore.add(book);
    request.onsuccess = function() {
        console.log('Book added to the library');
    };

    request.onerror = function(event) {
        console.error('Error adding book:', event.target.errorCode);
    };
}

// Function to read all books from the database
function getBooks() {
    if (!db) {
        console.error('Database is not initialized yet');
        return;
    }
    
    let transaction = db.transaction(['books'], 'readonly');
    let objectStore = transaction.objectStore('books');

    let request = objectStore.openCursor();
    request.onsuccess = function(event) {
        let cursor = event.target.result;
        if (cursor) {
            console.log('Book ID:', cursor.key, 'Title:', cursor.value.title, 'Author:', cursor.value.author);
            cursor.continue();
        } else {
            console.log('No more books');
        }
    };

    request.onerror = function(event) {
        console.error('Error reading books:', event.target.errorCode);
    };
}