/**
 * Routes dành riêng cho Admin
 * 
 * GET /api/admin/users - Lấy danh sách tất cả thành viên
 * GET /api/admin/stats - Lấy thống kê tổng quan
 */

const express = require('express');
const router = express.Router();
const { getAllUsers, getStats } = require('../controllers/adminController');
const adminAuth = require('../middleware/adminAuth');

// GET /api/admin/users - Lấy danh sách users (yêu cầu quyền admin)
router.get('/users', adminAuth, getAllUsers);

// GET /api/admin/stats - Lấy thống kê (yêu cầu quyền admin)
router.get('/stats', adminAuth, getStats);

module.exports = router;