/**
 * Controller xử lý các API dành riêng cho Admin
 * 
 * API:
 * GET /api/admin/users - Lấy danh sách tất cả thành viên
 * GET /api/admin/stats - Lấy thống kê tổng quan
 */

const User = require('../models/User');
const AccessLog = require('../models/AccessLog');

/**
 * GET /api/admin/users
 * Lấy toàn bộ danh sách thành viên
 */
async function getAllUsers(req, res, next) {
    try {
        const users = await User.findAll();
        res.status(200).json({
            success: true,
            data: users
        });
    } catch (err) {
        console.error('[Admin GetAllUsers Error]', err.message);
        next(err);
    }
}

/**
 * GET /api/admin/stats
 * Lấy thống kê tổng quan cho Admin Dashboard
 */
async function getStats(req, res, next) {
    try {
        // 1. Số người hiện đang có mặt trong thư viện
        const currentlyInside = await AccessLog.getCurrentlyInside();

        // 2. Thống kê lượt sử dụng hôm nay
        const todayStats = await AccessLog.getTodayStats();

        // 3. Thời gian sử dụng trung bình hôm nay
        const avgDuration = await AccessLog.getAverageDurationToday();

        // 4. Người sử dụng lâu nhất hôm nay
        const longestSession = await AccessLog.getLongestSessionToday();

        // 5. Tổng số thành viên
        const allUsers = await User.findAll();
        const totalUsers = allUsers.length;
        const totalStudents = allUsers.filter(u => u.role === 'student').length;
        const totalAdmins = allUsers.filter(u => u.role === 'admin').length;

        res.status(200).json({
            success: true,
            data: {
                currently_inside: {
                    count: currentlyInside.length,
                    users: currentlyInside.map(u => ({
                        id: u.user_id,
                        name: u.full_name,
                        library_code: u.library_code,
                        class_name: u.class_name,
                        entry_time: u.timestamp
                    }))
                },
                today: {
                    total_visits: todayStats.total,
                    by_device: todayStats.byDevice
                },
                average_duration: avgDuration,
                longest_session: longestSession ? {
                    user_id: longestSession.user_id,
                    name: longestSession.full_name,
                    library_code: longestSession.library_code,
                    class_name: longestSession.class_name,
                    entry_time: longestSession.entry_time,
                    exit_time: longestSession.exit_time,
                    duration_minutes: longestSession.duration_minutes
                } : null,
                users: {
                    total: totalUsers,
                    students: totalStudents,
                    admins: totalAdmins
                }
            }
        });

    } catch (err) {
        console.error('[Admin GetStats Error]', err.message);
        next(err);
    }
}

module.exports = { getAllUsers, getStats };