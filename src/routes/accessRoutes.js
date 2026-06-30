/**
 * Routes cho module Kiểm soát ra vào (Access)
 * 
 * Định nghĩa endpoint API quét mã QR
 * và mapping tới hàm xử lý trong Controller.
 */

const express = require('express');
const router = express.Router();
const accessController = require('../controllers/accessController');

// POST /api/access/scan - Xử lý quét mã QR
router.post('/scan', accessController.scan);

// GET /api/access/history/:user_id - Lấy lịch sử ra vào của user
router.get('/history/:user_id', accessController.getHistory);

module.exports = router;
