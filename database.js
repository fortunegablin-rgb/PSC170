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

        // Settings Table (for admin password)
        db.run(`CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )`, (err) => {
            if (!err) {
                // Insert default password if not exists
                db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_password', 'admin123')`);
            }
        });

        console.log('Tables created or already exist.');
    });
}

module.exports = db;
