/**
 * Script test đăng nhập để kiểm tra role trả về
 * Cách chạy: node database/test-login.js
 */

const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const DB_PATH = path.resolve(__dirname, '..', process.env.DB_PATH || './database/library.db');

async function main() {
    const email = 'nmthuan03@gmail.com';
    const password = '123456'; // Mật khẩu test

    console.log('=== TEST ĐĂNG NHẬP ===\n');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('');

    if (!fs.existsSync(DB_PATH)) {
        console.error('❌ Không tìm thấy database:', DB_PATH);
        process.exit(1);
    }

    const SQL = await initSqlJs();
    const buffer = fs.readFileSync(DB_PATH);
    const db = new SQL.Database(buffer);

    // Tìm user
    const stmt = db.prepare('SELECT * FROM Users WHERE email = ?');
    stmt.bind([email]);
    if (!stmt.step()) {
        console.error('❌ Không tìm thấy user với email:', email);
        db.close();
        process.exit(1);
    }
    const user = stmt.getAsObject();
    stmt.free();

    console.log('📋 Thông tin user trong DB:');
    console.log('  ID:', user.id);
    console.log('  Tên:', user.full_name);
    console.log('  Email:', user.email);
    console.log('  Role:', user.role);
    console.log('  Password hash:', user.password_hash.substring(0, 20) + '...');
    console.log('');

    // Kiểm tra mật khẩu
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    console.log('🔐 Kiểm tra mật khẩu:', isMatch ? '✅ ĐÚNG' : '❌ SAI');
    console.log('');

    // Giả lập response API
    const { password_hash, ...safeUser } = user;
    console.log('📤 Response API sẽ trả về:');
    console.log(JSON.stringify({
        success: true,
        data: {
            user: safeUser
        }
    }, null, 2));
    console.log('');

    if (safeUser.role === 'admin') {
        console.log('✅ Frontend sẽ redirect đến: admin-scan.html');
    } else {
        console.log('✅ Frontend sẽ redirect đến: dashboard.html');
    }

    db.close();
}

main().catch(err => {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
});