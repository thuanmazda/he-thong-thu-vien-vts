/**
 * Middleware kiểm tra quyền Admin
 * Chỉ cho phép user có role = 'admin' truy cập
 */

async function adminAuth(req, res, next) {
    try {
        // Lấy thông tin user từ query (GET) hoặc body (POST/PUT)
        // Ưu tiên: body > query > params
        const source = req.method === 'GET' ? req.query : (req.body || req.query);
        const { user_id } = source;
        
        if (!user_id) {
            return res.status(401).json({
                success: false,
                error: 'Không có thông tin xác thực'
            });
        }

        // Lấy thông tin user từ database
        const User = require('../models/User');
        const user = await User.findById(user_id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy người dùng'
            });
        }

        // Kiểm tra role
        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Bạn không có quyền truy cập. Chỉ Admin mới được phép.'
            });
        }

        // Lưu thông tin user vào request để controller sử dụng
        req.adminUser = user;
        next();

    } catch (err) {
        console.error('[AdminAuth Error]', err.message);
        res.status(500).json({
            success: false,
            error: 'Lỗi xác thực quyền truy cập'
        });
    }
}

module.exports = adminAuth;