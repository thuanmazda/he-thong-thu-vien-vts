/**
 * Model AccessLog - Tương tác với Firestore Collection "access_logs"
 * 
 * Collection: access_logs
 * Document ID: Tự động (Firestore)
 * Fields:
 *   - user_id: string (ID của user)
 *   - user_name: string (Họ tên - để hiển thị nhanh)
 *   - device_id: string
 *   - type: string ('Vào' | 'Ra')
 *   - timestamp: timestamp (server timestamp)
 */

const { getDatabase } = require('../config/firebase');

const COLLECTION = 'access_logs';

class AccessLog {
    /**
     * Tạo log mới
     */
    static async create(data) {
        const db = getDatabase();
        
        const logRef = db.collection(COLLECTION).doc();
        const logData = {
            user_id: data.user_id,
            user_name: data.user_name,
            device_id: data.device_id,
            type: data.type || 'Vào',
            timestamp: data.timestamp || new Date().toISOString()
        };

        await logRef.set(logData);

        return {
            log_id: logRef.id,
            ...logData
        };
    }

    /**
     * Tìm log theo ID
     */
    static async findById(logId) {
        const db = getDatabase();
        const doc = await db.collection(COLLECTION).doc(logId).get();
        
        if (!doc.exists) {
            return null;
        }

        return {
            log_id: doc.id,
            ...doc.data()
        };
    }

    /**
     * Tìm logs theo user_id (không dùng orderBy để tránh cần index)
     */
    static async findByUserId(userId) {
        const db = getDatabase();
        const query = await db.collection(COLLECTION)
            .where('user_id', '==', userId)
            .get();
        
        // Sort trong JavaScript thay vì Firestore
        const logs = query.docs.map(doc => ({
            log_id: doc.id,
            ...doc.data()
        }));
        
        // Sắp xếp theo timestamp giảm dần
        logs.sort((a, b) => {
            const timeA = new Date(a.timestamp || 0);
            const timeB = new Date(b.timestamp || 0);
            return timeB - timeA; // DESC
        });
        
        return logs;
    }

    /**
     * Tìm logs theo device_id
     */
    static async findByDeviceId(deviceId) {
        const db = getDatabase();
        const query = await db.collection(COLLECTION)
            .where('device_id', '==', deviceId)
            .orderBy('timestamp', 'desc')
            .get();
        
        return query.docs.map(doc => ({
            log_id: doc.id,
            ...doc.data()
        }));
    }

    /**
     * Lấy log gần nhất của một user
     * Dùng để xác định lần tiếp theo là Vào hay Ra
     */
    static async getLatestLogByUserId(userId) {
        const db = getDatabase();
        const query = await db.collection(COLLECTION)
            .where('user_id', '==', userId)
            .orderBy('timestamp', 'desc')
            .limit(1)
            .get();
        
        if (query.empty) {
            return null;
        }

        const doc = query.docs[0];
        return {
            log_id: doc.id,
            ...doc.data()
        };
    }

    /**
     * Lấy danh sách người đang có mặt trong thư viện
     * (có log "Vào" gần nhất nhưng chưa có log "Ra" sau đó)
     */
    static async getCurrentlyInside() {
        const db = getDatabase();
        
        // Lấy tất cả logs, sắp xếp theo user và thời gian
        const query = await db.collection(COLLECTION)
            .orderBy('timestamp', 'desc')
            .get();
        
        const allLogs = query.docs.map(doc => ({
            log_id: doc.id,
            ...doc.data()
        }));

        // Gom log theo user, lấy log mới nhất của mỗi user
        const userLatestLog = {};
        allLogs.forEach(log => {
            if (!userLatestLog[log.user_id]) {
                userLatestLog[log.user_id] = log;
            }
        });

        // Lọc những user có log mới nhất là "Vào"
        const currentlyInside = Object.values(userLatestLog).filter(log => {
            return log.type === 'Vào';
        });

        return currentlyInside;
    }

    /**
     * Thống kê lượt sử dụng trong ngày hôm nay
     */
    static async getTodayStats() {
        const db = getDatabase();
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        
        // Lấy tất cả logs của hôm nay
        const query = await db.collection(COLLECTION).get();
        const allLogs = query.docs.map(doc => doc.data());
        
        // Lọc logs hôm nay
        const todayLogs = allLogs.filter(log => {
            return log.timestamp && log.timestamp.startsWith(today);
        });

        // Thống kê theo thiết bị
        const byDevice = {};
        todayLogs.forEach(log => {
            const device = log.device_id;
            byDevice[device] = (byDevice[device] || 0) + 1;
        });

        return {
            total: todayLogs.length,
            byDevice: Object.entries(byDevice).map(([device_id, count]) => ({
                device_id,
                count
            }))
        };
    }

    /**
     * Tính thời gian sử dụng trung bình trong ngày
     */
    static async getAverageDurationToday() {
        const db = getDatabase();
        const today = new Date().toISOString().split('T')[0];

        // Lấy tất cả logs
        const query = await db.collection(COLLECTION).get();
        const allLogs = query.docs.map(doc => ({
            log_id: doc.id,
            ...doc.data()
        }));

        // Lọc logs hôm nay
        const todayLogs = allLogs.filter(log => {
            return log.timestamp && log.timestamp.startsWith(today);
        });

        // Gom theo user
        const userLogs = {};
        todayLogs.forEach(log => {
            if (!userLogs[log.user_id]) {
                userLogs[log.user_id] = [];
            }
            userLogs[log.user_id].push(log);
        });

        // Tính thời gian mỗi user
        const durations = [];
        Object.values(userLogs).forEach(logs => {
            // Sắp xếp theo thời gian
            logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            // Tìm cặp vào/ra
            let entryTime = null;
            logs.forEach(log => {
                if (log.type === 'Vào') {
                    entryTime = new Date(log.timestamp);
                } else if (log.type === 'Ra' && entryTime) {
                    const exitTime = new Date(log.timestamp);
                    const duration = (exitTime - entryTime) / (1000 * 60); // phút
                    if (duration > 0) {
                        durations.push(duration);
                    }
                    entryTime = null;
                }
            });
        });

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
        const db = getDatabase();
        const today = new Date().toISOString().split('T')[0];

        // Lấy tất cả logs
        const query = await db.collection(COLLECTION).get();
        const allLogs = query.docs.map(doc => ({
            log_id: doc.id,
            ...doc.data()
        }));

        // Lọc logs hôm nay
        const todayLogs = allLogs.filter(log => {
            return log.timestamp && log.timestamp.startsWith(today);
        });

        // Gom theo user
        const userLogs = {};
        todayLogs.forEach(log => {
            if (!userLogs[log.user_id]) {
                userLogs[log.user_id] = [];
            }
            userLogs[log.user_id].push(log);
        });

        // Tìm session dài nhất
        let longest = null;
        let maxDuration = 0;

        Object.entries(userLogs).forEach(([userId, logs]) => {
            // Sắp xếp theo thời gian
            logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
            
            // Tìm cặp vào/ra
            let entryTime = null;
            let entryLog = null;
            
            logs.forEach(log => {
                if (log.type === 'Vào') {
                    entryTime = new Date(log.timestamp);
                    entryLog = log;
                } else if (log.type === 'Ra' && entryTime) {
                    const exitTime = new Date(log.timestamp);
                    const duration = (exitTime - entryTime) / (1000 * 60); // phút
                    
                    if (duration > maxDuration) {
                        maxDuration = duration;
                        longest = {
                            user_id: userId,
                            user_name: entryLog.user_name,
                            library_code: logs[0].library_code || '---',
                            class_name: logs[0].class_name || '---',
                            entry_time: entryLog.timestamp,
                            exit_time: log.timestamp,
                            duration_minutes: Math.round(duration)
                        };
                    }
                    entryTime = null;
                    entryLog = null;
                }
            });
        });

        return longest;
    }
}

module.exports = AccessLog;