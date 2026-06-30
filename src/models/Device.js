/**
 * Model Device - Tương tác với bảng Devices trong database (dùng sql.js)
 * Quản lý các thiết bị đọc QR (cổng ra/vào)
 */

const { getDatabase, saveDatabase } = require('../config/database');

class Device {
    /**
     * Helper: lấy tất cả dòng từ prepared statement dạng object
     */
    static _queryAll(stmt, params = []) {
        if (params.length > 0) stmt.bind(params);
        const rows = [];
        while (stmt.step()) {
            rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
    }

    /**
     * Helper: lấy 1 dòng dạng object
     */
    static _queryOne(stmt, params = []) {
        if (params.length > 0) stmt.bind(params);
        let row = null;
        if (stmt.step()) {
            row = stmt.getAsObject();
        }
        stmt.free();
        return row;
    }

    /**
     * Tìm device theo ID
     * @param {string} deviceId
     * @returns {object|null}
     */
    static async findById(deviceId) {
        const db = await getDatabase();
        const stmt = db.prepare('SELECT * FROM Devices WHERE device_id = ?');
        return this._queryOne(stmt, [deviceId]);
    }

    /**
     * Lấy tất cả devices
     * @returns {Array}
     */
    static async findAll() {
        const db = await getDatabase();
        const stmt = db.prepare('SELECT * FROM Devices ORDER BY device_id');
        return this._queryAll(stmt);
    }

    /**
     * Lấy devices theo trạng thái
     * @param {string} status - 'active' | 'inactive' | 'maintenance'
     * @returns {Array}
     */
    static async findByStatus(status) {
        const db = await getDatabase();
        const stmt = db.prepare('SELECT * FROM Devices WHERE status = ?');
        return this._queryAll(stmt, [status]);
    }

    /**
     * Lấy devices theo loại
     * @param {string} type - 'entry' | 'exit' | 'both'
     * @returns {Array}
     */
    static async findByType(type) {
        const db = await getDatabase();
        const stmt = db.prepare('SELECT * FROM Devices WHERE device_type = ?');
        return this._queryAll(stmt, [type]);
    }

    /**
     * Tạo device mới
     * @param {object} data - { device_id, device_type, status }
     * @returns {object} Device vừa tạo
     */
    static async create(data) {
        const db = await getDatabase();
        const stmt = db.prepare(`
            INSERT INTO Devices (device_id, device_type, status)
            VALUES (?, ?, ?)
        `);
        stmt.run([data.device_id, data.device_type, data.status || 'active']);
        stmt.free();
        saveDatabase();

        return this.findById(data.device_id);
    }

    /**
     * Cập nhật thông tin device
     * @param {string} deviceId
     * @param {object} data - { device_type, status }
     * @returns {object} Device sau khi cập nhật
     */
    static async update(deviceId, data) {
        const db = await getDatabase();
        const fields = Object.keys(data);
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => data[f]);

        const stmt = db.prepare(`UPDATE Devices SET ${setClause} WHERE device_id = ?`);
        stmt.run([...values, deviceId]);
        stmt.free();
        saveDatabase();

        return this.findById(deviceId);
    }

    /**
     * Xóa device
     * @param {string} deviceId
     * @returns {boolean}
     */
    static async delete(deviceId) {
        const db = await getDatabase();
        const stmt = db.prepare('DELETE FROM Devices WHERE device_id = ?');
        stmt.run([deviceId]);
        stmt.free();
        saveDatabase();
        return true;
    }

    /**
     * Đếm số devices đang hoạt động
     * @returns {number}
     */
    static async countActive() {
        const db = await getDatabase();
        const stmt = db.prepare("SELECT COUNT(*) as count FROM Devices WHERE status = 'active'");
        const result = this._queryOne(stmt);
        return result.count;
    }
}

module.exports = Device;