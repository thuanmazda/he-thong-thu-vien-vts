/**
 * Model AccessLog - Tương tác với bảng AccessLogs trong database (dùng sql.js)
 */

const { getDatabase, saveDatabase } = require('../config/database');

class AccessLog {
    static _queryAll(stmt, params = []) {
        if (params.length > 0) stmt.bind(params);
        const rows = [];
        while (stmt.step()) {
            rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
    }

    static _queryOne(stmt, params = []) {
        if (params.length > 0) stmt.bind(params);
        let row = null;
        if (stmt.step()) {
            row = stmt.getAsObject();
        }
        stmt.free();
        return row;
    }

    static async create(data) {
        const db = await getDatabase();
        const stmt = db.prepare(`
            INSERT INTO AccessLogs (user_id, device_id)
            VALUES (?, ?)
        `);
        stmt.run([data.user_id, data.device_id]);
        stmt.free();
        saveDatabase();

        const idStmt = db.prepare('SELECT MAX(log_id) as log_id FROM AccessLogs');
        const result = this._queryOne(idStmt);
        return this.findById(result.log_id);
    }

    static async findById(logId) {
        const db = await getDatabase();
        const stmt = db.prepare('SELECT * FROM AccessLogs WHERE log_id = ?');
        return this._queryOne(stmt, [logId]);
    }

    static async findByUserId(userId) {
        const db = await getDatabase();
        const stmt = db.prepare(`
            SELECT al.*, u.full_name, u.library_code 
            FROM AccessLogs al
            JOIN Users u ON al.user_id = u.id
            WHERE al.user_id = ?
            ORDER BY al.timestamp DESC
        `);
        return this._queryAll(stmt, [userId]);
    }

    static async findByDeviceId(deviceId) {
        const db = await getDatabase();
        const stmt = db.prepare(`
            SELECT al.*, u.full_name, u.library_code 
            FROM AccessLogs al
            JOIN Users u ON al.user_id = u.id
            WHERE al.device_id = ?
            ORDER BY al.timestamp DESC
        `);
        return this._queryAll(stmt, [deviceId]);
    }

    /**
     * Lấy danh sách người đang có mặt trong thư viện
     * (có log "Vào" gần nhất nhưng chưa có log "Ra" sau đó)
     */
    static async getCurrentlyInside() {
        const db = await getDatabase();
        
        // Lấy tất cả log, sắp xếp theo user và thời gian
        const stmt = db.prepare(`
            SELECT al.*, u.full_name, u.library_code, u.class_name
            FROM AccessLogs al
            JOIN Users u ON al.user_id = u.id
            ORDER BY al.user_id, al.timestamp DESC
        `);
        const allLogs = this._queryAll(stmt);

        // Gom log theo user, lấy log mới nhất của mỗi user
        const userLatestLog = {};
        allLogs.forEach(log => {
            if (!userLatestLog[log.user_id]) {
                userLatestLog[log.user_id] = log;
            }
        });

        // Lọc những user có log mới nhất là "Vào" (device_type = 'entry')
        const currentlyInside = Object.values(userLatestLog).filter(log => {
            // Giả sử device_type = 'entry' là vào, 'exit' là ra
            // Trong thực tế cần thêm cột device_type, nhưng hiện tại dựa vào device_id
            // GATE-001: vào, GATE-002: ra
            return log.device_id === 'GATE-001' || log.device_id === 'GATE-003';
        });

        return currentlyInside;
    }

    /**
     * Thống kê lượt sử dụng trong ngày hôm nay
     */
    static async getTodayStats() {
        const db = await getDatabase();
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Tổng số lượt hôm nay
        const totalStmt = db.prepare(`
            SELECT COUNT(*) as count 
            FROM AccessLogs 
            WHERE DATE(timestamp) = ?
        `);
        const totalResult = this._queryOne(totalStmt, [today]);

        // Thống kê theo thiết bị
        const deviceStmt = db.prepare(`
            SELECT device_id, COUNT(*) as count
            FROM AccessLogs
            WHERE DATE(timestamp) = ?
            GROUP BY device_id
        `);
        const deviceStats = this._queryAll(deviceStmt, [today]);

        return {
            total: totalResult.count,
            byDevice: deviceStats
        };
    }

    /**
     * Tính thời gian sử dụng trung bình trong ngày
     * (Tính từ log "Vào" đến log "Ra" của mỗi user trong ngày)
     */
    static async getAverageDurationToday() {
        const db = await getDatabase();
        const today = new Date().toISOString().split('T')[0];

        // Lấy các cặp Vào/Ra trong ngày
        const stmt = db.prepare(`
            SELECT 
                u.id as user_id,
                u.full_name,
                MIN(CASE WHEN al.device_id IN ('GATE-001', 'GATE-003') THEN al.timestamp END) as entry_time,
                MAX(CASE WHEN al.device_id = 'GATE-002' THEN al.timestamp END) as exit_time
            FROM AccessLogs al
            JOIN Users u ON al.user_id = u.id
            WHERE DATE(al.timestamp) = ?
            GROUP BY u.id, DATE(al.timestamp)
            HAVING entry_time IS NOT NULL
        `);
        const sessions = this._queryAll(stmt, [today]);

        // Tính thời gian mỗi session (phút)
        const durations = sessions
            .filter(s => s.exit_time)
            .map(s => {
                const entry = new Date(s.entry_time.replace(' ', 'T'));
                const exit = new Date(s.exit_time.replace(' ', 'T'));
                return (exit - entry) / (1000 * 60); // phút
            })
            .filter(d => d > 0);

        if (durations.length === 0) {
            return {
                average: 0,
                unit: 'phút',
                sessions: 0
            };
        }

        const total = durations.reduce((sum, d) => sum + d, 0);
        const average = Math.round(total / durations.length);

        return {
            average: average,
            unit: 'phút',
            sessions: durations.length
        };
    }

    /**
     * Tìm người sử dụng lâu nhất trong ngày
     */
    static async getLongestSessionToday() {
        const db = await getDatabase();
        const today = new Date().toISOString().split('T')[0];

        const stmt = db.prepare(`
            SELECT 
                u.id as user_id,
                u.full_name,
                u.library_code,
                u.class_name,
                MIN(CASE WHEN al.device_id IN ('GATE-001', 'GATE-003') THEN al.timestamp END) as entry_time,
                MAX(CASE WHEN al.device_id = 'GATE-002' THEN al.timestamp END) as exit_time
            FROM AccessLogs al
            JOIN Users u ON al.user_id = u.id
            WHERE DATE(al.timestamp) = ?
            GROUP BY u.id, DATE(al.timestamp)
            HAVING entry_time IS NOT NULL AND exit_time IS NOT NULL
        `);
        const sessions = this._queryAll(stmt, [today]);

        if (sessions.length === 0) {
            return null;
        }

        // Tìm session dài nhất
        let longest = null;
        let maxDuration = 0;

        sessions.forEach(s => {
            const entry = new Date(s.entry_time.replace(' ', 'T'));
            const exit = new Date(s.exit_time.replace(' ', 'T'));
            const duration = (exit - entry) / (1000 * 60); // phút

            if (duration > maxDuration) {
                maxDuration = duration;
                longest = {
                    ...s,
                    duration_minutes: Math.round(duration)
                };
            }
        });

        return longest;
    }
}

module.exports = AccessLog;