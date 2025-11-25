const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./bus_system.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        createTables();
    }
});

function createTables() {
    db.serialize(() => {
        // Members Table
        db.run(`CREATE TABLE IF NOT EXISTS members (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            contact TEXT,
            balance REAL DEFAULT 0.0
        )`);

        // Payments Table
        db.run(`CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            receipt_number TEXT NOT NULL,
            date TEXT NOT NULL,
            FOREIGN KEY (member_id) REFERENCES members (id)
        )`);

        // Trips Table
        db.run(`CREATE TABLE IF NOT EXISTS trips (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER,
            amount REAL,
            date TEXT,
            conductor_id TEXT,
            FOREIGN KEY (member_id) REFERENCES members (id)
        )`);

        // Settings Table (for admin password and fare prices)
        db.run(`CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )`, (err) => {
            if (!err) {
                // Insert default password if not exists
                db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_password', 'admin123')`);
                // Insert default fare prices if not exist
                db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('fare_one_way', '6.28')`);
                db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('fare_two_way', '12.56')`);
            }
        });

        // Users Table (for authentication)
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('admin', 'conductor'))
        )`, (err) => {
            if (!err) {
                // Insert default users if not exist
                db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin')`);
                db.run(`INSERT OR IGNORE INTO users (username, password, role) VALUES ('conductor', 'conductor123', 'conductor')`);
            }
        });

        console.log('Tables created or already exist.');
    });
}

module.exports = db;
