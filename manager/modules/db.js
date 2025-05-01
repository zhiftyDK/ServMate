// modules/db.js
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'user.db');
const db = new Database(dbPath);

// Initialize the user table (only 1 user allowed)
db.prepare(`
    CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY,
        username TEXT UNIQUE,
        passwordHash TEXT,
        email TEXT
    )
`).run();

module.exports = db;
