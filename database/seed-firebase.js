/**
 * Script seed dữ liệu mẫu vào Firebase Firestore
 * Chạy: npm run seed-firebase
 * 
 * Lưu ý: 
 * - Cần set FIREBASE_SERVICE_ACCOUNT_KEY hoặc FIREBASE_KEY_PATH trong .env
 * - Script sẽ tạo: 1 admin, 4 students, 3 devices, và access logs
 */

const admin = require('firebase-admin');
const path = require('path');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const { initializeFirebase, getDatabase, closeDatabase } = require('../src/config/firebase');

const SALT_ROUNDS = 10;

async function seed() {
    console.log('🌱 Bắt đầu seed dữ liệu vào Firestore...\n');

    // Khởi tạo Firebase
    let db;
    try {
        db = initializeFirebase();
    } catch (err) {
        console.error('❌ Lỗi khởi tạo Firebase:', err.message);
        console.log('💡 Hãy đảm bảo đã set FIREBASE_SERVICE_ACCOUNT_KEY hoặc FIREBASE_KEY_PATH trong .env');
        process.exit(1);
    }

    try {
        // ===== 1. Tạo Devices =====
        console.log('📱 Tạo Devices...');
        const devices = [
            { device_id: 'GATE-001', device_type: 'entry', status: 'active' },
            { device_id: 'GATE-002', device_type: 'exit', status: 'active' },
            { device_id: 'GATE-003', device_type: 'entry', status: 'active' }
        ];

        for (const device of devices) {
            await db.collection('devices').doc(device.device_id).set(device);
            console.log(`  ✅ ${device.device_id} (${device.device_type})`);
        }

        // ===== 2. Tạo Admin =====
        console.log('\n👑 Tạo Admin...');
        const adminPassword = bcrypt.hashSync('admin123', SALT_ROUNDS);
        const adminRef = db.collection('users').doc();
        await adminRef.set({
            library_code: 'LIB-ADMIN001',
            full_name: 'Nguyễn Minh Thuận',
            email: 'nmthuan03@gmail.com',
            phone_number: '0979781761',
            password_hash: adminPassword,
            role: 'admin',
            school_year: '2020-2023',
            class_name: 'Cựu',
            created_at: new Date().toISOString()
        });
        console.log(`  ✅ Admin: ${adminRef.id} (nmthuan03@gmail.com / admin123)`);

        // ===== 3. Tạo Students =====
        console.log('\n👥 Tạo Students...');
        const students = [
            {
                full_name: 'Nguyễn Văn A',
                email: 'nguyenvana@example.com',
                phone_number: '0912345678',
                password: '123456',
                school_year: '2023-2027',
                class_name: 'ĐT21'
            },
            {
                full_name: 'Trần Thị B',
                email: 'tranthib@example.com',
                phone_number: '0923456789',
                password: '123456',
                school_year: '2023-2027',
                class_name: 'ĐT21'
            },
            {
                full_name: 'Lê Văn C',
                email: 'levanc@example.com',
                phone_number: '0934567890',
                password: '123456',
                school_year: '2022-2026',
                class_name: 'Cơ điện tử'
            },
            {
                full_name: 'Phạm Thị D',
                email: 'phamthid@example.com',
                phone_number: '0945678901',
                password: '123456',
                school_year: '2021-2025',
                class_name: 'Cựu'
            }
        ];

        const studentRefs = [];
        for (const student of students) {
            const password_hash = bcrypt.hashSync(student.password, SALT_ROUNDS);
            const userRef = db.collection('users').doc();
            await userRef.set({
                library_code: `LIB-${userRef.id.substring(0, 6).toUpperCase()}`,
                full_name: student.full_name,
                email: student.email,
                phone_number: student.phone_number,
                password_hash: password_hash,
                role: 'student',
                school_year: student.school_year,
                class_name: student.class_name,
                created_at: new Date().toISOString()
            });
            studentRefs.push(userRef);
            console.log(`  ✅ ${student.full_name} (${student.email} / ${student.password})`);
        }

        // ===== 4. Tạo Access Logs mẫu =====
        console.log('\n📝 Tạo Access Logs mẫu...');
        
        const adminUser = { id: adminRef.id, full_name: 'Nguyễn Minh Thuận' };
        const studentUsers = studentRefs.map((ref, index) => ({
            id: ref.id,
            full_name: students[index].full_name
        }));

        const now = new Date();
        const today = now.toISOString().split('T')[0];
        
        // Admin vào lúc 8h sáng
        await db.collection('access_logs').doc().set({
            user_id: adminUser.id,
            user_name: adminUser.full_name,
            device_id: 'GATE-001',
            type: 'Vào',
            timestamp: `${today} 08:00:00`
        });

        // Tạo logs cho students (vào/ra)
        for (let i = 0; i < 3; i++) {
            const user = studentUsers[i];
            const hour = 8 + i * 2;
            const entryTime = `${today} ${hour.toString().padStart(2, '0')}:00:00`;
            const exitTime = `${today} ${(hour + 3).toString().padStart(2, '0')}:00:00`;

            // Vào
            await db.collection('access_logs').doc().set({
                user_id: user.id,
                user_name: user.full_name,
                device_id: 'GATE-001',
                type: 'Vào',
                timestamp: entryTime
            });

            // Ra
            await db.collection('access_logs').doc().set({
                user_id: user.id,
                user_name: user.full_name,
                device_id: 'GATE-002',
                type: 'Ra',
                timestamp: exitTime
            });
        }

        console.log('  ✅ Đã tạo 7 access logs (1 admin + 6 student logs)');

        // ===== 5. Tạo logs cho "đang có mặt" =====
        console.log('\n🚶 Tạo logs cho người đang có mặt...');
        
        // Student cuối cùng đang ở trong thư viện (chưa ra)
        const lastStudent = studentUsers[3];
        await db.collection('access_logs').doc().set({
            user_id: lastStudent.id,
            user_name: lastStudent.full_name,
            device_id: 'GATE-001',
            type: 'Vào',
            timestamp: `${today} 14:00:00`
        });

        console.log(`  ✅ ${lastStudent.full_name} đang có mặt trong thư viện`);

        console.log('\n🎉 Seed dữ liệu thành công!');
        console.log('\n📋 Tài khoản test:');
        console.log('  👑 Admin: nmthuan03@gmail.com / admin123');
        console.log('  👥 Students:');
        students.forEach(s => {
            console.log(`     - ${s.email} / ${s.password}`);
        });

        console.log('\n Truy cập: http://localhost:3000');

    } catch (err) {
        console.error('\n❌ Lỗi khi seed dữ liệu:', err.message);
        process.exit(1);
    } finally {
        closeDatabase();
    }
}

// Chạy seed
seed();