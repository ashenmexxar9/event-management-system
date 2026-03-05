"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.createTask = exports.getTasks = exports.deleteScheduleItem = exports.updateScheduleItem = exports.createScheduleItem = exports.getScheduleItems = void 0;
const uuid_1 = require("uuid");
const database_1 = require("../database");
// Schedule Items
const getScheduleItems = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId } = req.params;
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [eventId]);
        if (!event)
            return res.status(404).json({ error: 'Event not found' });
        if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const items = await (0, database_1.allAsync)('SELECT * FROM schedule_items WHERE event_id = ? ORDER BY start_time ASC', [eventId]);
        res.json(items);
    }
    catch (error) {
        console.error('Get schedule items error:', error);
        res.status(500).json({ error: 'Failed to fetch schedule items' });
    }
};
exports.getScheduleItems = getScheduleItems;
const createScheduleItem = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId } = req.params;
        const { title, start_time, end_time, notes } = req.body;
        if (!title || !start_time || !end_time) {
            return res.status(400).json({ error: 'Title, start_time, and end_time are required' });
        }
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [eventId]);
        if (!event)
            return res.status(404).json({ error: 'Event not found' });
        if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const id = (0, uuid_1.v4)();
        await (0, database_1.runAsync)(`INSERT INTO schedule_items (id, event_id, title, start_time, end_time, notes)
       VALUES (?, ?, ?, ?, ?, ?)`, [id, eventId, title, start_time, end_time, notes || null]);
        const item = await (0, database_1.getAsync)('SELECT * FROM schedule_items WHERE id = ?', [id]);
        res.status(201).json(item);
    }
    catch (error) {
        console.error('Create schedule item error:', error);
        res.status(500).json({ error: 'Failed to create schedule item' });
    }
};
exports.createScheduleItem = createScheduleItem;
const updateScheduleItem = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId, scheduleId } = req.params;
        const item = await (0, database_1.getAsync)('SELECT * FROM schedule_items WHERE id = ?', [scheduleId]);
        if (!item)
            return res.status(404).json({ error: 'Schedule item not found' });
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [eventId]);
        if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const { title, start_time, end_time, notes } = req.body;
        await (0, database_1.runAsync)(`UPDATE schedule_items SET title = ?, start_time = ?, end_time = ?, notes = ?
       WHERE id = ?`, [title || item.title, start_time || item.start_time, end_time || item.end_time, notes !== undefined ? notes : item.notes, scheduleId]);
        const updated = await (0, database_1.getAsync)('SELECT * FROM schedule_items WHERE id = ?', [scheduleId]);
        res.json(updated);
    }
    catch (error) {
        console.error('Update schedule item error:', error);
        res.status(500).json({ error: 'Failed to update schedule item' });
    }
};
exports.updateScheduleItem = updateScheduleItem;
const deleteScheduleItem = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId, scheduleId } = req.params;
        const item = await (0, database_1.getAsync)('SELECT * FROM schedule_items WHERE id = ?', [scheduleId]);
        if (!item)
            return res.status(404).json({ error: 'Schedule item not found' });
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [eventId]);
        if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        await (0, database_1.runAsync)('DELETE FROM schedule_items WHERE id = ?', [scheduleId]);
        res.json({ message: 'Schedule item deleted successfully' });
    }
    catch (error) {
        console.error('Delete schedule item error:', error);
        res.status(500).json({ error: 'Failed to delete schedule item' });
    }
};
exports.deleteScheduleItem = deleteScheduleItem;
// Tasks
const getTasks = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId } = req.params;
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [eventId]);
        if (!event)
            return res.status(404).json({ error: 'Event not found' });
        if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const tasks = await (0, database_1.allAsync)('SELECT * FROM tasks WHERE event_id = ? ORDER BY due_date ASC', [eventId]);
        res.json(tasks);
    }
    catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
};
exports.getTasks = getTasks;
const createTask = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId } = req.params;
        const { title, priority = 'Low', status = 'ToDo', due_date, assigned_to } = req.body;
        if (!title)
            return res.status(400).json({ error: 'Title is required' });
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [eventId]);
        if (!event)
            return res.status(404).json({ error: 'Event not found' });
        if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const id = (0, uuid_1.v4)();
        await (0, database_1.runAsync)(`INSERT INTO tasks (id, event_id, title, priority, status, due_date, assigned_to)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [id, eventId, title, priority, status, due_date || null, assigned_to || null]);
        const task = await (0, database_1.getAsync)('SELECT * FROM tasks WHERE id = ?', [id]);
        res.status(201).json(task);
    }
    catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Failed to create task' });
    }
};
exports.createTask = createTask;
const updateTask = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId, taskId } = req.params;
        const task = await (0, database_1.getAsync)('SELECT * FROM tasks WHERE id = ?', [taskId]);
        if (!task)
            return res.status(404).json({ error: 'Task not found' });
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [eventId]);
        if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        const { title, priority, status, due_date, assigned_to } = req.body;
        await (0, database_1.runAsync)(`UPDATE tasks SET title = ?, priority = ?, status = ?, due_date = ?, assigned_to = ?
       WHERE id = ?`, [title || task.title, priority || task.priority, status || task.status, due_date !== undefined ? due_date : task.due_date, assigned_to !== undefined ? assigned_to : task.assigned_to, taskId]);
        const updated = await (0, database_1.getAsync)('SELECT * FROM tasks WHERE id = ?', [taskId]);
        res.json(updated);
    }
    catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ error: 'Failed to update task' });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Not authenticated' });
        const { eventId, taskId } = req.params;
        const task = await (0, database_1.getAsync)('SELECT * FROM tasks WHERE id = ?', [taskId]);
        if (!task)
            return res.status(404).json({ error: 'Task not found' });
        const event = await (0, database_1.getAsync)('SELECT * FROM events WHERE id = ?', [eventId]);
        if (req.user.role !== 'ADMIN' && event.owner_id !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        await (0, database_1.runAsync)('DELETE FROM tasks WHERE id = ?', [taskId]);
        res.json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: 'Failed to delete task' });
    }
};
exports.deleteTask = deleteTask;
//# sourceMappingURL=schedule.js.map