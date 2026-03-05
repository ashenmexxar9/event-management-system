"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.me = exports.logout = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const database_1 = require("../database");
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await (0, database_1.getAsync)('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const passwordMatch = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || '34ecc5f48fd9686c043abadd9afe4ec06d7cc06a32de838097aa3b1a6ef8a608', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};
exports.login = login;
const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
};
exports.logout = logout;
const me = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        const user = await (0, database_1.getAsync)('SELECT id, name, email, role FROM users WHERE id = ?', [
            req.user.id,
        ]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Me error:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};
exports.me = me;
const register = async (req, res) => {
    try {
        const { name, email, password, role = 'USER' } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }
        const existingUser = await (0, database_1.getAsync)('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const userId = (0, uuid_1.v4)();
        await (0, database_1.runAsync)('INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)', [userId, name, email, hashedPassword, role]);
        const token = jsonwebtoken_1.default.sign({ id: userId, email, role }, process.env.JWT_SECRET || '34ecc5f48fd9686c043abadd9afe4ec06d7cc06a32de838097aa3b1a6ef8a608', { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        res.json({
            token,
            user: {
                id: userId,
                name,
                email,
                role,
            },
        });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
};
exports.register = register;
//# sourceMappingURL=auth.js.map