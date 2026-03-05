"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const uuid_1 = require("uuid");
const database_1 = require("./database");
require('dotenv').config();
const seedDatabase = async () => {
    try {
        // Initialize tables
        await (0, database_1.initializeDatabase)();
        console.log('✅ Database tables created');
        // Create seed users if they don't already exist
        const existingAdmin = await (0, database_1.getAsync)('SELECT id FROM users WHERE email = ?', ['admin@example.com']);
        const existingUser = await (0, database_1.getAsync)('SELECT id FROM users WHERE email = ?', ['user@example.com']);
        const adminId = existingAdmin?.id || (0, uuid_1.v4)();
        const userId = existingUser?.id || (0, uuid_1.v4)();
        const adminPassword = await bcryptjs_1.default.hash('Admin@123', 10);
        const userPassword = await bcryptjs_1.default.hash('User@123', 10);
        if (!existingAdmin) {
            await (0, database_1.runAsync)('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)', [adminId, 'Admin User', 'admin@example.com', adminPassword, 'ADMIN']);
            console.log('✅ Admin user created: admin@example.com / Admin@123');
        }
        else {
            console.log('ℹ️ Admin user already exists, skipping insert');
        }
        if (!existingUser) {
            await (0, database_1.runAsync)('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)', [userId, 'Ashen', 'user@example.com', userPassword, 'USER']);
            console.log('✅ User created: user@example.com / User@123');
        }
        else {
            console.log('ℹ️ Regular user already exists, skipping insert');
        }
        // Create sample events for the user
        const weddingEventId = (0, uuid_1.v4)();
        await (0, database_1.runAsync)(`INSERT INTO events (id, owner_id, title, description, date, time, location, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            weddingEventId,
            userId,
            'Wedding Celebration',
            'A beautiful wedding ceremony and reception',
            '2024-06-15',
            '18:00',
            'Grand Ballroom, City Hotel',
            'Draft',
        ]);
        const conferenceEventId = (0, uuid_1.v4)();
        await (0, database_1.runAsync)(`INSERT INTO events (id, owner_id, title, description, date, time, location, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [
            conferenceEventId,
            userId,
            'Tech Conference 2024',
            'Full-day conference with keynotes and workshops',
            '2024-07-20',
            '09:00',
            'Ocean View Conference Hall',
            'Published',
        ]);
        console.log('✅ Sample events created for user');
        // Add sample guests
        const guestIds = [(0, uuid_1.v4)(), (0, uuid_1.v4)(), (0, uuid_1.v4)()];
        for (let i = 0; i < guestIds.length; i++) {
            await (0, database_1.runAsync)(`INSERT INTO guests (id, event_id, name, email, phone, tag, rsvp_status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                guestIds[i],
                weddingEventId,
                `Guest ${i + 1}`,
                `guest${i + 1}@example.com`,
                `555-000${i}`,
                i === 0 ? 'VIP' : 'Family',
                'Pending',
            ]);
        }
        console.log('✅ Sample guests created');
        // Add sample schedule items
        const scheduleIds = [(0, uuid_1.v4)(), (0, uuid_1.v4)()];
        await (0, database_1.runAsync)(`INSERT INTO schedule_items (id, event_id, title, start_time, end_time, notes)
       VALUES (?, ?, ?, ?, ?, ?)`, [scheduleIds[0], weddingEventId, 'Arrival & Cocktail', '18:00', '19:00', 'Welcome guests']);
        await (0, database_1.runAsync)(`INSERT INTO schedule_items (id, event_id, title, start_time, end_time, notes)
       VALUES (?, ?, ?, ?, ?, ?)`, [scheduleIds[1], weddingEventId, 'Dinner & Dance', '19:00', '23:00', 'Main reception']);
        console.log('✅ Sample schedule items created');
        // Add sample vendors
        const vendorIds = [(0, uuid_1.v4)(), (0, uuid_1.v4)()];
        await (0, database_1.runAsync)(`INSERT INTO vendors (id, event_id, name, service_type, contact, price_estimate, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [vendorIds[0], weddingEventId, 'Grand Catering Co.', 'Catering', 'catering@grand.com', 5000, 'Full menu for 200 guests']);
        await (0, database_1.runAsync)(`INSERT INTO vendors (id, event_id, name, service_type, contact, price_estimate, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [vendorIds[1], weddingEventId, 'Elite Photography', 'Photography', 'photo@elite.com', 1500, 'Professional photographer and videographer']);
        console.log('✅ Sample vendors created');
        // Add sample tasks
        const taskIds = [(0, uuid_1.v4)(), (0, uuid_1.v4)()];
        await (0, database_1.runAsync)(`INSERT INTO tasks (id, event_id, title, priority, status, due_date, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [taskIds[0], weddingEventId, 'Confirm guest list', 'High', 'Doing', '2024-06-01', 'Ashen']);
        await (0, database_1.runAsync)(`INSERT INTO tasks (id, event_id, title, priority, status, due_date, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [taskIds[1], weddingEventId, 'Book venue', 'High', 'Done', '2024-05-01', 'Ashen']);
        console.log('✅ Sample tasks created');
        // Add sample expenses
        const expenseIds = [(0, uuid_1.v4)(), (0, uuid_1.v4)()];
        await (0, database_1.runAsync)(`INSERT INTO expenses (id, event_id, title, amount, payment_status)
       VALUES (?, ?, ?, ?, ?)`, [expenseIds[0], weddingEventId, 'Venue deposit', 1000, 'Paid']);
        await (0, database_1.runAsync)(`INSERT INTO expenses (id, event_id, title, amount, payment_status)
       VALUES (?, ?, ?, ?, ?)`, [expenseIds[1], weddingEventId, 'Decorations', 800, 'Unpaid']);
        console.log('✅ Sample expenses created');
        // Add sample tickets for both events
        const weddingVipTicketId = (0, uuid_1.v4)();
        const weddingStdTicketId = (0, uuid_1.v4)();
        const confStandardTicketId = (0, uuid_1.v4)();
        await (0, database_1.runAsync)(`INSERT INTO tickets (id, event_id, name, price, total_quantity, sold_quantity, sale_start_date, sale_end_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            weddingVipTicketId,
            weddingEventId,
            'VIP',
            15000,
            50,
            10,
            '2024-05-01',
            '2024-06-14',
            'Active',
        ]);
        await (0, database_1.runAsync)(`INSERT INTO tickets (id, event_id, name, price, total_quantity, sold_quantity, sale_start_date, sale_end_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            weddingStdTicketId,
            weddingEventId,
            'Standard',
            8000,
            200,
            60,
            '2024-05-10',
            '2024-06-14',
            'Active',
        ]);
        await (0, database_1.runAsync)(`INSERT INTO tickets (id, event_id, name, price, total_quantity, sold_quantity, sale_start_date, sale_end_date, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            confStandardTicketId,
            conferenceEventId,
            'Conference Pass',
            12000,
            150,
            40,
            '2024-06-01',
            '2024-07-19',
            'Active',
        ]);
        console.log('✅ Sample tickets created');
        // Add sample registrations for tickets
        const regIds = [(0, uuid_1.v4)(), (0, uuid_1.v4)(), (0, uuid_1.v4)()];
        await (0, database_1.runAsync)(`INSERT INTO registrations (id, event_id, ticket_id, attendee_name, attendee_email, attendee_phone, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            regIds[0],
            weddingEventId,
            weddingVipTicketId,
            'Kasun Perera',
            'kasun@example.com',
            '+94 77 123 4567',
            'Paid',
        ]);
        await (0, database_1.runAsync)(`INSERT INTO registrations (id, event_id, ticket_id, attendee_name, attendee_email, attendee_phone, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            regIds[1],
            weddingEventId,
            weddingStdTicketId,
            'Nimali Fernando',
            'nimali@example.com',
            '+94 71 987 6543',
            'Pending',
        ]);
        await (0, database_1.runAsync)(`INSERT INTO registrations (id, event_id, ticket_id, attendee_name, attendee_email, attendee_phone, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            regIds[2],
            conferenceEventId,
            confStandardTicketId,
            'Dev User',
            'devuser@example.com',
            '+94 75 000 0011',
            'Paid',
        ]);
        console.log('✅ Sample registrations created');
        console.log('\n✨ Database seeded successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};
seedDatabase();
//# sourceMappingURL=seed.js.map