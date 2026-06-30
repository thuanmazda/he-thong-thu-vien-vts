/**
 * Model Device - Tương tác với Firestore Collection "devices"
 * 
 * Collection: devices
 * Document ID: device_id (tự định nghĩa)
 * Fields:
 *   - device_type: string ('entry' | 'exit' | 'both')
 *   - status: string ('active' | 'inactive' | 'maintenance')
 */

const { getDatabase } = require('../config/firebase');

const COLLECTION = 'devices';

class Device {
    /**
     * Tạo device mới
     */
    static async create(data) {
        const db = getDatabase();
        
        const deviceRef = db.collection(COLLECTION).doc(data.device_id);
        const deviceData = {
            device_id: data.device_id,
            device_type: data.device_type || 'both',
            status: data.status || 'active'
        };

        await deviceRef.set(deviceData);

        return {
            device_id: deviceRef.id,
            ...deviceData
        };
    }

    /**
     * Tìm device theo ID
     */
    static async findById(deviceId) {
        const db = getDatabase();
        const doc = await db.collection(COLLECTION).doc(deviceId).get();
        
        if (!doc.exists) {
            return null;
        }

        return {
            device_id: doc.id,
            ...doc.data()
        };
    }

    /**
     * Lấy tất cả devices
     */
    static async findAll() {
        const db = getDatabase();
        const snapshot = await db.collection(COLLECTION).get();
        
        return snapshot.docs.map(doc => ({
            device_id: doc.id,
            ...doc.data()
        }));
    }

    /**
     * Cập nhật device
     */
    static async update(deviceId, data) {
        const db = getDatabase();
        const deviceRef = db.collection(COLLECTION).doc(deviceId);
        
        // Kiểm tra device tồn tại
        const doc = await deviceRef.get();
        if (!doc.exists) {
            throw new Error('Không tìm thấy thiết bị');
        }

        // Cập nhật
        await deviceRef.update(data);

        // Trả về device mới
        const updatedDoc = await deviceRef.get();
        return {
            device_id: updatedDoc.id,
            ...updatedDoc.data()
        };
    }

    /**
     * Xóa device
     */
    static async delete(deviceId) {
        const db = getDatabase();
        const deviceRef = db.collection(COLLECTION).doc(deviceId);
        
        // Kiểm tra device tồn tại
        const doc = await deviceRef.get();
        if (!doc.exists) {
            throw new Error('Không tìm thấy thiết bị');
        }

        await deviceRef.delete();
        return true;
    }

    /**
     * Đếm tổng số devices
     */
    static async count() {
        const db = getDatabase();
        const snapshot = await db.collection(COLLECTION).get();
        return snapshot.size;
    }
}

module.exports = Device;