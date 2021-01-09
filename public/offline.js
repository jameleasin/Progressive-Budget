// CREATE OFFLINE DATABASE
let db;
const request = window.indexedDB.open("offlineBudget", 1);

// CREATE SCHEMA
request.onupgradeneeded = event => {
    const db = event.target.result;
    db.createObjectStore("offlineBudget", { autoIncrement: true });
};

// ON SUCCESS
request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.onLine) {
        checkDatabase();
    }
};

// ON ERROR
request.onerror = function (event) {
    console.log(`Error: ${event.target.errorCode}`);
};

// SAVE RECORD FUNCTION
function saveRecord(data) {
    const transaction = db.transaction(["offlineBudget"], "readwrite");
    const store = transaction.objectStore("offlineBudget");  
    store.add(data);
}

// CHECK DATABASE CONNECTION
function checkDatabase() {
    
  const transaction = db.transaction(["offlineBudget"], "readwrite");
  const store = transaction.objectStore("offlineBudget");
  const getAll = store.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.length > 0) {
      fetch("/api/transaction/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(() => {
        
        const transaction = db.transaction(["offlineBudget"], "readwrite");
        const store = transaction.objectStore("offlineBudget");
        store.clear();
      });
    }
  };
}

// CHECK DATABASE ONLINE
window.addEventListener("online", checkDatabase);