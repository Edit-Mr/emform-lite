/** @format */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Ensure the 'db' directory exists
const dbPath = path.resolve(__dirname,"data.sqlite");
const db = new sqlite3.Database(dbPath, err => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
        db.run(
            `
      CREATE TABLE IF NOT EXISTS user_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        club TEXT,
        position TEXT,
        profile TEXT,
        gender TEXT,
        firstChoice TEXT,
        reason1 TEXT,
        secondChoice TEXT,
        reason2 TEXT,
        moreInfo TEXT,
        DCusername TEXT,
        DCID TEXT
      )
    `,
            err => {
                if (err) {
                    console.error("Error creating table:", err.message);
                }
            }
        );
    }
});

module.exports = db;
