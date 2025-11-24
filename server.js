const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./database');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Constants ---
const FARE_ONE_WAY = 6.28;
const FARE_TWO_WAY = 12.56;
const LOW_BALANCE_THRESHOLD = 12.56;

// --- Double Deduction Prevention ---
// Track recent trip deductions to prevent duplicates
const recentDeductions = new Map(); // key: member_id, value: { timestamp, fare, conductor_id }
const DEDUCTION_COOLDOWN_MS = 3000; // 3 seconds cooldown between deductions for same member

// Clean up old entries every minute
setInterval(() => {
    const now = Date.now();
    for (const [memberId, deduction] of recentDeductions.entries()) {
        if (now - deduction.timestamp > DEDUCTION_COOLDOWN_MS) {
            recentDeductions.delete(memberId);
        }
    }
}, 60000);

// --- API Endpoints ---

// 1. Add Member
app.post('/api/members', (req, res) => {
    const { name, contact, initial_payment } = req.body;
    const initialAmount = parseFloat(initial_payment) || 0;

    db.run(`INSERT INTO members (name, contact, balance) VALUES (?, ?, ?)`,
        [name, contact, initialAmount],
        function (err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            const memberId = this.lastID;

            // If there's an initial payment, log it
            if (initialAmount > 0) {
                const receiptNumber = 'REC-' + Date.now();
                const date = new Date().toISOString();
                db.run(`INSERT INTO payments (member_id, amount, receipt_number, date) VALUES (?, ?, ?, ?)`,
                    [memberId, initialAmount, receiptNumber, date],
                    (err) => {
                        if (err) console.error("Error logging initial payment:", err);
                    }
                );
            }

            res.json({ id: memberId, name, balance: initialAmount, message: "Member added successfully" });
        }
    );
});

// 2. Get All Members (for testing/viewing)
app.get('/api/members', (req, res) => {
    db.all(`SELECT * FROM members`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 3. Get Single Member Balance & Details
app.get('/api/members/:id', (req, res) => {
    const id = req.params.id;
    db.get(`SELECT * FROM members WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Member not found" });
        res.json(row);
    });
});

// 4. Update Payment (Recharge)
app.post('/api/payments', (req, res) => {
    const { member_id, amount } = req.body;
    const payAmount = parseFloat(amount);

    if (!member_id || isNaN(payAmount) || payAmount <= 0) {
        return res.status(400).json({ error: "Invalid member ID or amount" });
    }

    db.get(`SELECT balance FROM members WHERE id = ?`, [member_id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Member not found" });

        const newBalance = row.balance + payAmount;
        const receiptNumber = 'REC-' + Date.now();
        const date = new Date().toISOString();

        db.run(`UPDATE members SET balance = ? WHERE id = ?`, [newBalance, member_id], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            db.run(`INSERT INTO payments (member_id, amount, receipt_number, date) VALUES (?, ?, ?, ?)`,
                [member_id, payAmount, receiptNumber, date],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({
                        member_id,
                        old_balance: row.balance,
                        new_balance: newBalance,
                        receipt_number: receiptNumber,
                        message: "Recharge successful"
                    });
                }
            );
        });
    });
});

// 5. Deduct Trip (Conductor)
app.post('/api/trips', (req, res) => {
    const { member_id, conductor_id, trip_type } = req.body; // trip_type: 'one-way' or 'two-way' (default one-way)

    // Default to one-way if not specified or invalid
    const fare = (trip_type === 'two-way') ? FARE_TWO_WAY : FARE_ONE_WAY;

    // Check for duplicate deduction
    const now = Date.now();
    if (recentDeductions.has(member_id)) {
        const lastDeduction = recentDeductions.get(member_id);
        const timeSinceLastDeduction = now - lastDeduction.timestamp;

        if (timeSinceLastDeduction < DEDUCTION_COOLDOWN_MS) {
            // Check if it's the same fare and conductor (likely duplicate)
            if (lastDeduction.fare === fare && lastDeduction.conductor_id === conductor_id) {
                return res.status(429).json({
                    error: `Duplicate deduction detected. Please wait ${Math.ceil((DEDUCTION_COOLDOWN_MS - timeSinceLastDeduction) / 1000)} seconds before deducting again.`,
                    cooldown_remaining_seconds: Math.ceil((DEDUCTION_COOLDOWN_MS - timeSinceLastDeduction) / 1000)
                });
            }
        }
    }

    db.get(`SELECT * FROM members WHERE id = ?`, [member_id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.status(404).json({ error: "Member not found" });

        if (row.balance < fare) {
            return res.status(400).json({
                error: "Insufficient balance. Please recharge.",
                current_balance: row.balance,
                required: fare
            });
        }

        const newBalance = row.balance - fare;
        const date = new Date().toISOString();

        db.run(`UPDATE members SET balance = ? WHERE id = ?`, [newBalance, member_id], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            db.run(`INSERT INTO trips (member_id, amount, date, conductor_id) VALUES (?, ?, ?, ?)`,
                [member_id, fare, date, conductor_id || 'Unknown'],
                (err) => {
                    if (err) return res.status(500).json({ error: err.message });

                    // Record this deduction to prevent duplicates
                    recentDeductions.set(member_id, {
                        timestamp: now,
                        fare: fare,
                        conductor_id: conductor_id || 'Unknown'
                    });

                    let warning = null;
                    if (newBalance < LOW_BALANCE_THRESHOLD) {
                        warning = "Balance running low. Please recharge soon.";
                    }

                    res.json({
                        member_id,
                        member_name: row.name,
                        deducted: fare,
                        old_balance: row.balance,
                        new_balance: newBalance,
                        warning: warning,
                        message: "Trip deducted successfully"
                    });
                }
            );
        });
    });
});

// 6. View Logs (Trips & Payments)
app.get('/api/logs/:member_id', (req, res) => {
    const memberId = req.params.member_id;

    const logs = {};

    db.all(`SELECT * FROM payments WHERE member_id = ? ORDER BY date DESC`, [memberId], (err, payments) => {
        if (err) return res.status(500).json({ error: err.message });
        logs.payments = payments;

        db.all(`SELECT * FROM trips WHERE member_id = ? ORDER BY date DESC`, [memberId], (err, trips) => {
            if (err) return res.status(500).json({ error: err.message });
            logs.trips = trips;
            res.json(logs);
        });
    });
});

// 7. Dashboard Stats
app.get('/api/stats', (req, res) => {
    const stats = {};

    db.get(`SELECT count(*) as count FROM members`, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.total_members = row.count;

        db.get(`SELECT sum(amount) as total FROM trips`, [], (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.total_revenue = row.total || 0;

            // Get recent 5 trips
            db.all(`SELECT 'Trip' as type, amount, date, member_id FROM trips ORDER BY date DESC LIMIT 5`, [], (err, trips) => {
                if (err) return res.status(500).json({ error: err.message });

                // Get recent 5 payments
                db.all(`SELECT 'Payment' as type, amount, date, member_id FROM payments ORDER BY date DESC LIMIT 5`, [], (err, payments) => {
                    if (err) return res.status(500).json({ error: err.message });

                    // Combine and sort by date descending, take top 5
                    const allActivity = [...trips, ...payments];
                    allActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
                    stats.recent_activity = allActivity.slice(0, 5);

                    res.json(stats);
                });
            });
        });
    });
});

// 8. Delete Member
app.delete('/api/members/:id', (req, res) => {
    const id = req.params.id;
    const { admin_password } = req.body;

    db.get(`SELECT value FROM settings WHERE key = 'admin_password'`, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        const currentPassword = row ? row.value : 'admin123'; // Fallback

        if (admin_password !== currentPassword) {
            return res.status(403).json({ error: "Invalid admin password" });
        }

        db.run(`DELETE FROM members WHERE id = ?`, [id], function (err) {
            if (err) return res.status(500).json({ error: err.message });
            if (this.changes === 0) return res.status(404).json({ error: "Member not found" });

            // Also delete related records
            db.run(`DELETE FROM payments WHERE member_id = ?`, [id]);
            db.run(`DELETE FROM trips WHERE member_id = ?`, [id]);

            res.json({ message: "Member deleted successfully" });
        });
    });
});

// 9. Change Admin Password
app.post('/api/settings/password', (req, res) => {
    const { current_password, new_password } = req.body;

    if (!new_password || new_password.length < 4) {
        return res.status(400).json({ error: "New password must be at least 4 characters" });
    }

    db.get(`SELECT value FROM settings WHERE key = 'admin_password'`, [], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });

        const dbPassword = row ? row.value : 'admin123';

        if (current_password !== dbPassword) {
            return res.status(403).json({ error: "Incorrect current password" });
        }

        db.run(`UPDATE settings SET value = ? WHERE key = 'admin_password'`, [new_password], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Password updated successfully" });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
