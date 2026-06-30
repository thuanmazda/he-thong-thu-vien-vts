/**
 * Script kiểm tra kết nối Firebase Firestore
 * Chạy: node database/check-firebase.js
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { initializeFirebase, getDatabase, closeDatabase } = require('../src/config/firebase');

async function main() {
    console.log('🔍 Kiểm tra kết nối Firebase Firestore...\n');

    let db;
    try {
        // Khởi tạo Firebase
        db = initializeFirebase();
        console.log('✅ Firebase đã khởi tạo thành công\n');

        // Test đọc/ghi
        console.log('📝 Test ghi dữ liệu...');
        const testRef = db.collection('test').doc('connection-test');
        await testRef.set({
            message: 'Kết nối thành công!',
            timestamp: new Date().toISOString()
        });
        console.log('✅ Ghi dữ liệu thành công\n');

        console.log('📖 Test đọc dữ liệu...');
        const doc = await testRef.get();
        if (doc.exists) {
            console.log('✅ Đọc dữ liệu thành công');
            console.log('   Data:', doc.data());
        } else {
            console.log('❌ Document không tồn tại');
        }

        // Xóa test document
        await testRef.delete();
        console.log('🗑️  Đã xóa test document\n');

        // Kiểm tra collections
        console.log('📊 Kiểm tra collections...');
        const collections = ['users', 'access_logs', 'devices'];
        for (const collection of collections) {
            const snapshot = await db.collection(collection).limit(1).get();
            const count = snapshot.size;
            console.log(`  - ${collection}: ${count} document(s)`);
        }

        console.log('\n✅ Tất cả kiểm tra đã thành công!');
        console.log('🔥 Firebase Firestore đã sẵn sàng sử dụng.');

    } catch (err) {
        console.error('\n❌ Lỗi kết nối Firebase:', err.message);
        console.log('\n💡 Hướng dẫn khắc phục:');
        console.log('1. Kiểm tra file .env có FIREBASE_SERVICE_ACCOUNT_KEY hoặc FIREBASE_KEY_PATH');
        console.log('2. Đảm bảo JSON key hợp lệ');
        console.log('3. Kiểm tra Firebase project đã được tạo');
        console.log('4. Xem chi tiết trong FIREBASE_SETUP.md');
        process.exit(1);
    } finally {
        closeDatabase();
    }
}

main();