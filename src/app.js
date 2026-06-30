/**
 * Entry point - Hệ thống kiểm soát ra vào thư viện bằng mã QR
 * Express Server
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// Khởi tạo Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware log request để debug
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// --- Serve static files từ thư mục frontend ---
// Đường dẫn: src/app.js → ../frontend
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// --- Route mặc định: tự động gửi index.html ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

// --- Routes API ---
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/access', require('./routes/accessRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Hệ thống kiểm soát ra vào thư viện đang hoạt động',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route không tồn tại' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('[Error]', err.stack);
    res.status(err.status || 500).json({
        error: err.message || 'Lỗi máy chủ nội bộ'
    });
});

// Khởi động server
app.listen(PORT, () => {
    console.log(`📚 Hệ thống kiểm soát ra vào thư viện`);
    console.log(` Server đang chạy tại: http://localhost:${PORT}`);
    console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;