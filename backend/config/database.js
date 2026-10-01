const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.join(
    __dirname,
    "../database/electronic_store.db"
);

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Kết nối SQLite thất bại:", err.message);
    } else {
        console.log("Kết nối SQLite thành công");
    }
});

db.run("PRAGMA foreign_keys = ON");

module.exports = db;