"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const router = (0, express_1.Router)();
router.post('/login', auth_1.login);
router.post('/logout', auth_1.logout);
router.get('/me', auth_1.me);
router.post('/register', auth_1.register);
exports.default = router;
//# sourceMappingURL=auth.js.map