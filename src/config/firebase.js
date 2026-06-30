/**
 * Firebase Firestore Configuration
 * 
 * Cách sử dụng:
 * 1. Tạo project trên Firebase Console
 * 2. Tạo Service Account Key (JSON)
 * 3. Set biến môi trường FIREBASE_SERVICE_ACCOUNT_KEY (JSON string)
 *    HOẶC để file JSON vào project và set FIREBASE_KEY_PATH
 */

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

let db;

/**
 * Khởi tạo Firebase Admin SDK
 */
function initializeFirebase() {
    try {
        // Cách 1: Dùng service account key từ biến môi trường (JSON string)
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id
            });
            console.log('✅ Firebase initialized from environment variable');
        }
        // Cách 2: Dùng file JSON
        else if (process.env.FIREBASE_KEY_PATH) {
            const serviceAccount = require(path.resolve(__dirname, '..', '..', process.env.FIREBASE_KEY_PATH));
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id
            });
            console.log('✅ Firebase initialized from file:', process.env.FIREBASE_KEY_PATH);
        }
        // Cách 3: Dùng Application Default Credentials (chỉ cho Google Cloud)
        else {
            admin.initializeApp();
            console.log('✅ Firebase initialized with default credentials');
        }

        db = admin.firestore();
        console.log('✅ Firestore database connected');
        
        return db;

    } catch (err) {
        console.error('❌ Firebase initialization error:', err.message);
        throw err;
    }
}

/**
 * Lấy instance Firestore database
 */
function getDatabase() {
    if (!db) {
        throw new Error('Firebase chưa được khởi tạo. Gọi initializeFirebase() trước.');
    }
    return db;
}

/**
 * Đóng kết nối Firebase (không cần thiết cho Firestore)
 */
function closeDatabase() {
    // Firestore không cần đóng kết nối như SQLite
    console.log('ℹ️  Firestore không cần đóng kết nối');
}

module.exports = {
    initializeFirebase,
    getDatabase,
    closeDatabase
};