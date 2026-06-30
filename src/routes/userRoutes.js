/**
 * Routes cho module Người dùng (Users)
 * 
 * Định nghĩa các endpoint API liên quan đến Users
 * và mapping tới các hàm xử lý trong Controller.
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// POST /api/users/register - Đăng ký tài khoản mới
router.post('/register', userController.register);

// POST /api/users/login - Đăng nhập
router.post('/login', userController.login);

// GET /api/users/profile/:id - Lấy thông tin chi tiết user (hiển thị QR)
router.get('/profile/:id', userController.getProfile);

module.exports = router;