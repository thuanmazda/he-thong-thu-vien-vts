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
 * Khởi tạo Firebase Admin SDK (chỉ khởi tạo 1 lần)
 */
function initializeFirebase() {
    try {
        // Kiểm tra xem Firebase đã được khởi tạo chưa
        if (admin.apps.length > 0) {
            console.log('ℹ️  Firebase đã được khởi tạo trước đó');
            db = admin.firestore();
            return db;
        }

        let serviceAccount;

        // Cách 1: Dùng service account key từ biến môi trường (JSON string)
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            console.log('🔑 Đang đọc Firebase credentials từ biến môi trường...');
            try {
                serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
                console.log('✅ Đã parse JSON credentials');
                console.log('   Project ID:', serviceAccount.project_id);
                console.log('   Client Email:', serviceAccount.client_email);
            } catch (parseErr) {
                console.error('❌ Lỗi parse JSON từ FIREBASE_SERVICE_ACCOUNT_KEY:', parseErr.message);
                throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY không phải là JSON hợp lệ');
            }
        }
        // Cách 2: Dùng file JSON
        else if (process.env.FIREBASE_KEY_PATH) {
            console.log('🔑 Đang đọc Firebase credentials từ file:', process.env.FIREBASE_KEY_PATH);
            const keyPath = path.resolve(__dirname, '..', '..', process.env.FIREBASE_KEY_PATH);
            serviceAccount = require(keyPath);
            console.log('✅ Đã đọc file credentials');
            console.log('   Project ID:', serviceAccount.project_id);
        }
        // Cách 3: Dùng Application Default Credentials (chỉ cho Google Cloud)
        else {
            console.log('⚠️  Không tìm thấy FIREBASE_SERVICE_ACCOUNT_KEY hoặc FIREBASE_KEY_PATH');
            console.log('   Sử dụng Application Default Credentials...');
            admin.initializeApp();
            console.log('✅ Firebase initialized with default credentials');
            db = admin.firestore();
            console.log('✅ Firestore database connected');
            return db;
        }

        // Khởi tạo Firebase với service account
        console.log('🚀 Đang khởi tạo Firebase Admin SDK...');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
            projectId: serviceAccount.project_id
        });
        console.log('✅ Firebase Admin SDK đã khởi tạo');

        db = admin.firestore();
        console.log('✅ Firestore database connected');
        
        return db;

    } catch (err) {
        console.error('❌ Firebase initialization error:', err.message);
        console.error('   Stack:', err.stack);
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