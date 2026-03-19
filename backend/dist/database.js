"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = exports.allAsync = exports.getAsync = exports.runAsync = exports.db = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const dbPath = process.env.DATABASE_PATH || './data/events.db';
exports.db = new sqlite3_1.default.Database(dbPath, (err) => {
    if (err) {
        console.error('Database connection failed:', err);
    }
    else {
        console.log(`Connected to SQLite database at ${dbPath}`);
    }
});
// Enable foreign keys
exports.db.run('PRAGMA foreign_keys = ON');
// Helper to run queries with promises
const runAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        exports.db.run(sql, params, function (err) {
            if (err)
                reject(err);
            else
                resolve({ id: this.lastID });
        });
    });
};
exports.runAsync = runAsync;
// Helper to get a single row
const getAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        exports.db.get(sql, params, (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row);
        });
    });
};
exports.getAsync = getAsync;
// Helper to get all rows
const allAsync = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        exports.db.all(sql, params, (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows || []);
        });
    });
};
exports.allAsync = allAsync;
const initializeDatabase = async () => {
    // Create Users table
    await (0, exports.runAsync)(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'USER',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // Create Events table
    await (0, exports.runAsync)(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      location TEXT,
      status TEXT DEFAULT 'Draft',
      cover_image TEXT,
      -- When 1, non-admin users can see this event.
      -- This lets the system admin create "global" events.
      is_public INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `);
    // Backfill column for existing databases.
    // SQLite doesn't support "IF NOT EXISTS" for ADD COLUMN.
    try {
        await (0, exports.runAsync)('ALTER TABLE events ADD COLUMN is_public INTEGER DEFAULT 0');
    }
    catch {
        // Column already exists (or DB can't be altered). Safe to ignore here.
    }
    // Create Guests table
    await (0, exports.runAsync)(`
    CREATE TABLE IF NOT EXISTS guests (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      tag TEXT,
      rsvp_status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `);
    // Create Tasks table
    await (0, exports.runAsync)(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      title TEXT NOT NULL,
      priority TEXT DEFAULT 'Low',
      status TEXT DEFAULT 'ToDo',
      due_date TEXT,
      assigned_to TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `);
    // Create Vendors table
    await (0, exports.runAsync)(`
    CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      name TEXT NOT NULL,
      service_type TEXT NOT NULL,
      contact TEXT,
      price_estimate REAL,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `);
    // Create Expenses table
    await (0, exports.runAsync)(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      title TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_status TEXT DEFAULT 'Unpaid',
      receipt_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `);
    // Create Notifications table
    await (0, exports.runAsync)(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      event_id TEXT,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      reminder_time TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `);
    // Create Venues table
    await (0, exports.runAsync)(`
    CREATE TABLE IF NOT EXISTS venues (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT,
      capacity INTEGER,
      price_per_day REAL,
      contact_person TEXT,
      contact_number TEXT,
      availability_status TEXT DEFAULT 'Available',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
    // Create Tickets table
    await (0, exports.runAsync)(`
    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      total_quantity INTEGER NOT NULL,
      sold_quantity INTEGER DEFAULT 0,
      sale_start_date TEXT,
      sale_end_date TEXT,
      status TEXT DEFAULT 'Active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `);
    // Create Registrations table
    await (0, exports.runAsync)(`
    CREATE TABLE IF NOT EXISTS registrations (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      ticket_id TEXT NOT NULL,
      attendee_name TEXT NOT NULL,
      attendee_email TEXT,
      attendee_phone TEXT,
      payment_status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE
    )
  `);
    // Create Sponsors table
    await (0, exports.runAsync)(`
    CREATE TABLE IF NOT EXISTS sponsors (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      company_type TEXT,
      contact_person TEXT,
      contact_email TEXT,
      contact_phone TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id)
    )
  `);
    // Create SponsorshipDeals table
    await (0, exports.runAsync)(`
    CREATE TABLE IF NOT EXISTS sponsorship_deals (
      id TEXT PRIMARY KEY,
      sponsor_id TEXT NOT NULL,
      event_id TEXT NOT NULL,
      amount REAL,
      package TEXT,
      benefits TEXT,
      deal_status TEXT DEFAULT 'Proposed',
      payment_status TEXT DEFAULT 'Pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sponsor_id) REFERENCES sponsors(id) ON DELETE CASCADE,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
    )
  `);
    // Create Feedbacks table
    await (0, exports.runAsync)(`
    CREATE TABLE IF NOT EXISTS feedbacks (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
    console.log('Database initialized successfully');
};
exports.initializeDatabase = initializeDatabase;
//# sourceMappingURL=database.js.map