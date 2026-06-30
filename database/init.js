/**
 * Script khởi tạo Cơ sở dữ liệu cho Hệ thống kiểm soát ra vào thư viện
 * 
 * Cách chạy: node database/init.js
 */

const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// --- Cấu hình ---
const DB_PATH = path.resolve(__dirname, '..', process.env.DB_PATH || './database/library.db');
const SCHEMA_PATH = path.resolve(__dirname, 'schema.sql');
const SALT_ROUNDS = 10;

// --- Helper: lấy kết quả SELECT dạng object array ---
function queryAll(db, sql, params = []) {
    const stmt = db.prepare(sql);
    if (params.length > 0) stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
        rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
}

// --- Helper: lấy 1 dòng dạng object ---
function queryOne(db, sql, params = []) {
    const rows = queryAll(db, sql, params);
    return rows.length > 0 ? rows[0] : null;
}

// --- Helper: thực thi INSERT/UPDATE/DELETE ---
function runSQL(db, sql, params = []) {
    const stmt = db.prepare(sql);
    if (params.length > 0) stmt.bind(params);
    stmt.step();
    stmt.free();
}

// --- Helper: thực thi nhiều câu lệnh (tạo bảng) ---
function execSQL(db, sql) {
    db.exec(sql);
}

async function main() {
    console.log('=== KHỞI TẠO CƠ SỞ DỮ LIỆU ===\n');
    console.log(`📁 Database path: ${DB_PATH}`);

    // --- Bước 1: Tạo thư mục database nếu chưa có ---
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
        console.log('✅ Đã tạo thư mục database');
    }

    // --- Bước 2: Khởi tạo sql.js và tạo database ---
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    db.run('PRAGMA foreign_keys = ON;');
    console.log('✅ Đã khởi tạo SQLite (sql.js)');

    // --- Bước 3: Đọc và thực thi schema.sql ---
    try {
        const schemaSQL = fs.readFileSync(SCHEMA_PATH, 'utf-8');
        execSQL(db, schemaSQL);
        console.log('✅ Đã tạo các bảng từ schema.sql');
    } catch (err) {
        console.error('❌ Lỗi khi thực thi schema:', err.message);
        process.exit(1);
    }

    // --- Bước 4: Lấy danh sách bảng ---
    const tables = queryAll(db, "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    console.log('\n📋 Danh sách bảng trong database:');
    tables.forEach(t => console.log(`   - ${t.name}`));

    // --- Bước 5: Chèn dữ liệu mẫu (seed) ---
    const userCount = queryOne(db, 'SELECT COUNT(*) as count FROM Users');
    const deviceCount = queryOne(db, 'SELECT COUNT(*) as count FROM Devices');

    if (userCount.count > 0 || deviceCount.count > 0) {
        console.log('\n⚠️  Database đã có dữ liệu, bỏ qua bước seed');
    } else {
        console.log('\n🌱 Đang chèn dữ liệu mẫu...');

        // --- Seed Users (có school_year + class_name) ---
        const users = [
            { library_code: 'LIB-001', full_name: 'Admin VTS',      email: 'admin@vts.edu.vn',  phone: '0901234560', password: 'admin123', role: 'admin',   school_year: null,          class_name: null },
            { library_code: 'LIB-002', full_name: 'Nguyễn Văn A',   email: 'nguyenvana@example.com',  phone: '0901234561', password: '123456', role: 'student', school_year: '2023-2027', class_name: 'ĐT21' },
            { library_code: 'LIB-003', full_name: 'Trần Thị B',     email: 'tranthib@example.com',    phone: '0901234562', password: '123456', role: 'student', school_year: '2023-2027', class_name: 'ĐT21' },
            { library_code: 'LIB-004', full_name: 'Lê Văn C',       email: 'levanc@example.com',      phone: '0901234563', password: '123456', role: 'student', school_year: '2022-2026', class_name: 'Cơ điện tử' },
            { library_code: 'LIB-005', full_name: 'Phạm Thị D',     email: 'phamthid@example.com',    phone: '0901234564', password: '123456', role: 'student', school_year: '2021-2025', class_name: 'Cựu' },
            { library_code: 'LIB-006', full_name: 'Hoàng Văn E',    email: 'hoangvane@example.com',   phone: '0901234565', password: '123456', role: 'student', school_year: '2020-2024', class_name: 'Cựu' },
        ];

        for (const user of users) {
            const password_hash = bcrypt.hashSync(user.password, SALT_ROUNDS);
            runSQL(db,
                'INSERT INTO Users (library_code, full_name, email, phone_number, password_hash, role, school_year, class_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [user.library_code, user.full_name, user.email, user.phone, password_hash, user.role, user.school_year, user.class_name]
            );
        }
        console.log(`✅ Đã chèn ${users.length} người dùng mẫu`);
        console.log(`   👤 Admin: admin@vts.edu.vn / admin123`);
        console.log(`   👥 Student: 5 tài khoản (có niên khóa + lớp)`);

        // --- Seed Devices ---
        const devices = [
            { device_id: 'GATE-001', device_type: 'entry', status: 'active' },
            { device_id: 'GATE-002', device_type: 'exit',  status: 'active' },
            { device_id: 'GATE-003', device_type: 'both',  status: 'maintenance' },
        ];

        for (const d of devices) {
            runSQL(db,
                'INSERT INTO Devices (device_id, device_type, status) VALUES (?, ?, ?)',
                [d.device_id, d.device_type, d.status]
            );
        }
        console.log(`✅ Đã chèn ${devices.length} thiết bị mẫu`);

        // --- Seed AccessLogs ---
        const accessLogs = [
            { user_id: 2, device_id: 'GATE-001', timestamp: '2026-06-29 07:30:00' },
            { user_id: 3, device_id: 'GATE-001', timestamp: '2026-06-29 07:35:00' },
            { user_id: 4, device_id: 'GATE-001', timestamp: '2026-06-29 08:00:00' },
            { user_id: 2, device_id: 'GATE-002', timestamp: '2026-06-29 11:30:00' },
            { user_id: 3, device_id: 'GATE-002', timestamp: '2026-06-29 11:45:00' },
            { user_id: 5, device_id: 'GATE-001', timestamp: '2026-06-29 13:00:00' },
            { user_id: 6, device_id: 'GATE-001', timestamp: '2026-06-29 13:15:00' },
            { user_id: 4, device_id: 'GATE-002', timestamp: '2026-06-29 17:00:00' },
        ];

        for (const log of accessLogs) {
            runSQL(db,
                'INSERT INTO AccessLogs (user_id, timestamp, device_id) VALUES (?, ?, ?)',
                [log.user_id, log.timestamp, log.device_id]
            );
        }
        console.log(`✅ Đã chèn ${accessLogs.length} bản ghi ra/vào mẫu`);
    }

    // --- Bước 6: Lưu database xuống file ---
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
    console.log('\n💾 Đã lưu database vào file');

    // --- Bước 7: Xác nhận ---
    console.log('\n🔍 Kiểm tra dữ liệu:');
    const stats = {
        users:   queryOne(db, 'SELECT COUNT(*) as count FROM Users').count,
        devices: queryOne(db, 'SELECT COUNT(*) as count FROM Devices').count,
        logs:    queryOne(db, 'SELECT COUNT(*) as count FROM AccessLogs').count,
    };
    console.log(`   - Users:      ${stats.users} người dùng`);
    console.log(`   - Devices:    ${stats.devices} thiết bị`);
    console.log(`   - AccessLogs: ${stats.logs} bản ghi`);

    // --- Đóng kết nối ---
    db.close();
    console.log('\n✅ KHỞI TẠO DATABASE HOÀN TẤT!');
    console.log(`📦 File database: ${DB_PATH}`);
}

main().catch(err => {
    console.error('❌ Lỗi không mong muốn:', err);
    process.exit(1);
});