"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const database_1 = require("./database");
const auth_1 = __importDefault(require("./routes/auth"));
const events_1 = __importDefault(require("./routes/events"));
const guests_1 = __importDefault(require("./routes/guests"));
const budget_1 = __importDefault(require("./routes/budget"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const tickets_1 = __importDefault(require("./routes/tickets"));
const registrations_1 = __importDefault(require("./routes/registrations"));
const sponsors_1 = __importDefault(require("./routes/sponsors"));
const sponsorships_1 = __importDefault(require("./routes/sponsorships"));
const feedbacks_1 = __importDefault(require("./routes/feedbacks"));
const users_1 = __importDefault(require("./routes/users"));
const notifications_2 = require("./controllers/notifications");
require('dotenv').config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
// Initialize database
(0, database_1.initializeDatabase)().catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
// Simple in-memory reminder scheduler for event notifications
const startReminderScheduler = () => {
    const CHECK_INTERVAL_MS = 60 * 1000; // check every minute
    const checkReminders = async () => {
        try {
            const now = new Date();
            // Load all events; for a small app this is fine
            const events = await (0, database_1.allAsync)('SELECT id, owner_id, title, date, time FROM events', []);
            for (const event of events) {
                if (!event.date || !event.time)
                    continue;
                const eventDateTime = new Date(`${event.date}T${event.time}:00`);
                if (isNaN(eventDateTime.getTime()))
                    continue;
                // Skip events that finished long ago
                if (eventDateTime.getTime() < now.getTime() - 5 * 60 * 1000) {
                    continue;
                }
                const ensureReminder = async (offsetMinutes, type, titleSuffix, message) => {
                    const targetTime = new Date(eventDateTime.getTime() - offsetMinutes * 60 * 1000);
                    // Fire if we're within 1 minute of the target window
                    const diff = Math.abs(targetTime.getTime() - now.getTime());
                    if (diff > CHECK_INTERVAL_MS)
                        return;
                    const existing = await (0, database_1.getAsync)('SELECT id FROM notifications WHERE event_id = ? AND user_id = ? AND type = ?', [event.id, event.owner_id, type]);
                    if (!existing) {
                        await (0, notifications_2.createNotification)(event.owner_id, event.id, type, `${event.title} ${titleSuffix}`, message, targetTime.toISOString());
                    }
                };
                // 5 minutes before
                await ensureReminder(5, 'reminder_5m', '(starting in 5 minutes)', `Your event "${event.title}" starts at ${event.time} in 5 minutes.`);
                // 1 minute before
                await ensureReminder(1, 'reminder_1m', '(starting in 1 minute)', `Your event "${event.title}" starts at ${event.time} in 1 minute.`);
                // At start time
                await ensureReminder(0, 'reminder_now', '(starting now)', `Your event "${event.title}" is starting now at ${event.time}.`);
            }
        }
        catch (err) {
            console.error('Reminder scheduler error:', err);
        }
    };
    // Initial delay, then interval
    setTimeout(() => {
        checkReminders();
        setInterval(checkReminders, CHECK_INTERVAL_MS);
    }, 10 * 1000);
};
startReminderScheduler();
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/events', events_1.default);
app.use('/api/guests', guests_1.default);
app.use('/api/budget', budget_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/events/:eventId/tickets', tickets_1.default);
app.use('/api/events/:eventId/registrations', registrations_1.default);
app.use('/api/sponsors', sponsors_1.default);
app.use('/api/events/:eventId/sponsorships', sponsorships_1.default);
app.use('/api/events', feedbacks_1.default);
app.use('/api/users', users_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map