// indexedDB-setup.js
const dbName = "FaceModelDB";
const storeName = "models";

let db;
const request = indexedDB.open(dbName, 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    db.createObjectStore(storeName);
};

request.onsuccess = (event) => {
    db = event.target.result;
    console.log("Database opened successfully");
};

request.onerror = (event) => {
    console.error("Database error: " + event.target.errorCode);
};
