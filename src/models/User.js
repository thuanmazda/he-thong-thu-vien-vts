/**
 * Model User - Tương tác với Firestore Collection "users"
 * 
 * Collection: users
 * Document ID: Tự động (Firestore)
 * Fields:
 *   - library_code: string (UNIQUE)
 *   - full_name: string
 *   - email: string (UNIQUE)
 *   - phone_number: string
 *   - password_hash: string
 *   - role: string ('student' | 'admin')
 *   - school_year: string | null
 *   - class_name: string | null
 *   - created_at: timestamp
 */

const { getDatabase } = require('../config/firebase');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const SALT_ROUNDS = 10;
const COLLECTION = 'users';

/**
 * Tạo library_code ngẫu nhiên (LIB-XXXXXX)
 */
function generateLibraryCode() {
    const uuid = uuidv4().replace(/-/g, '').toUpperCase();
    return `LIB-${uuid.substring(0, 6)}`;
}

class User {
    /**
     * Tạo user mới
     */
    static async create(data) {
        const db = getDatabase();
        
        // Kiểm tra email đã tồn tại
        const emailQuery = await db.collection(COLLECTION)
            .where('email', '==', data.email)
            .limit(1)
            .get();
        
        if (!emailQuery.empty) {
            throw new Error('Email này đã được đăng ký');
        }

        // Tạo library_code unique
        let library_code;
        let isUnique = false;
        let attempts = 0;
        
        while (!isUnique && attempts < 10) {
            library_code = generateLibraryCode();
            const codeQuery = await db.collection(COLLECTION)
                .where('library_code', '==', library_code)
                .limit(1)
                .get();
            
            if (codeQuery.empty) {
                isUnique = true;
            }
            attempts++;
        }

        if (!isUnique) {
            throw new Error('Không thể tạo mã thẻ duy nhất');
        }

        // Tạo document
        const userRef = db.collection(COLLECTION).doc();
        const userData = {
            library_code,
            full_name: data.full_name,
            email: data.email,
            phone_number: data.phone_number,
            password_hash: data.password_hash,
            role: data.role || 'student',
            school_year: data.school_year || null,
            class_name: data.class_name || null,
            created_at: new Date().toISOString()
        };

        await userRef.set(userData);

        return {
            id: userRef.id,
            ...userData
        };
    }

    /**
     * Tìm user theo ID
     */
    static async findById(id) {
        const db = getDatabase();
        const doc = await db.collection(COLLECTION).doc(id).get();
        
        if (!doc.exists) {
            return null;
        }

        return {
            id: doc.id,
            ...doc.data()
        };
    }

    /**
     * Tìm user theo email
     */
    static async findByEmail(email) {
        const db = getDatabase();
        const query = await db.collection(COLLECTION)
            .where('email', '==', email)
            .limit(1)
            .get();
        
        if (query.empty) {
            return null;
        }

        const doc = query.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    }

    /**
     * Tìm user theo library_code
     */
    static async findByLibraryCode(libraryCode) {
        const db = getDatabase();
        const query = await db.collection(COLLECTION)
            .where('library_code', '==', libraryCode)
            .limit(1)
            .get();
        
        if (query.empty) {
            return null;
        }

        const doc = query.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        };
    }

    /**
     * Tìm user theo email hoặc phone
     */
    static async findByEmailOrPhone(login) {
        const db = getDatabase();
        
        // Thử tìm theo email
        let query = await db.collection(COLLECTION)
            .where('email', '==', login)
            .limit(1)
            .get();
        
        if (!query.empty) {
            const doc = query.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };
        }

        // Thử tìm theo phone
        query = await db.collection(COLLECTION)
            .where('phone_number', '==', login)
            .limit(1)
            .get();
        
        if (!query.empty) {
            const doc = query.docs[0];
            return {
                id: doc.id,
                ...doc.data()
            };
        }

        return null;
    }

    /**
     * Cập nhật thông tin user
     */
    static async update(id, data) {
        const db = getDatabase();
        const userRef = db.collection(COLLECTION).doc(id);
        
        // Kiểm tra user tồn tại
        const doc = await userRef.get();
        if (!doc.exists) {
            throw new Error('Không tìm thấy người dùng');
        }

        // Cập nhật
        await userRef.update(data);

        // Trả về user mới
        const updatedDoc = await userRef.get();
        return {
            id: updatedDoc.id,
            ...updatedDoc.data()
        };
    }

    /**
     * Lấy tất cả users (cho admin)
     */
    static async findAll() {
        const db = getDatabase();
        const snapshot = await db.collection(COLLECTION).get();
        
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    }

    /**
     * Xóa user
     */
    static async delete(id) {
        const db = getDatabase();
        const userRef = db.collection(COLLECTION).doc(id);
        
        // Kiểm tra user tồn tại
        const doc = await userRef.get();
        if (!doc.exists) {
            throw new Error('Không tìm thấy người dùng');
        }

        await userRef.delete();
        return true;
    }

    /**
     * Đếm tổng số users
     */
    static async count() {
        const db = getDatabase();
        const snapshot = await db.collection(COLLECTION).get();
        return snapshot.size;
    }
}

module.exports = User;