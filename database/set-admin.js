/**
 * Script nâng quyền một tài khoản thành Admin
 * 
 * Cách chạy:
 *   node database/set-admin.js <email hoặc id>
 * 
 * Ví dụ:
 *   node database/set-admin.js admin@vts.edu.vn    (nâng theo email)
 *   node database/set-admin.js 1                    (nâng theo ID)
 */

const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const DB_PATH = path.resolve(__dirname, '..', process.env.DB_PATH || './database/library.db');

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('❌ Vui lòng cung cấp email hoặc ID của tài khoản.');
        console.log('');
        console.log('Cách dùng:');
        console.log('  node database/set-admin.js <email>');
        console.log('  node database/set-admin.js <id>');
        console.log('');
        console.log('Ví dụ:');
        console.log('  node database/set-admin.js admin@vts.edu.vn');
        console.log('  node database/set-admin.js 2');
        process.exit(1);
    }

    const input = args[0];
    const isId = /^\d+$/.test(input);

    console.log('=== NÂNG QUYỀN TÀI KHOẢN ===\n');

    if (!fs.existsSync(DB_PATH)) {
        console.error('❌ Không tìm thấy file database. Hãy chạy npm run init-db trước.');
        process.exit(1);
    }

    const SQL = await initSqlJs();
    const buffer = fs.readFileSync(DB_PATH);
    const db = new SQL.Database(buffer);
    db.run('PRAGMA foreign_keys = ON;');

    // Tìm user
    let user;
    if (isId) {
        const stmt = db.prepare('SELECT id, full_name, email, role FROM Users WHERE id = ?');
        stmt.bind([parseInt(input)]);
        if (stmt.step()) user = stmt.getAsObject();
        stmt.free();
    } else {
        const stmt = db.prepare('SELECT id, full_name, email, role FROM Users WHERE email = ?');
        stmt.bind([input]);
        if (stmt.step()) user = stmt.getAsObject();
        stmt.free();
    }

    if (!user) {
        console.error(`❌ Không tìm thấy tài khoản với ${isId ? 'ID' : 'email'}: ${input}`);
        db.close();
        process.exit(1);
    }

    if (user.role === 'admin') {
        console.log(`ℹ️  Tài khoản "${user.full_name}" (${user.email}) đã là admin.`);
        db.close();
        process.exit(0);
    }

    // Nâng quyền
    const stmt = db.prepare('UPDATE Users SET role = ? WHERE id = ?');
    stmt.run(['admin', user.id]);
    stmt.free();

    // Lưu database
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
    db.close();

    console.log(`✅ Đã nâng quyền Admin thành công!`);
    console.log(`   👤 Tên:     ${user.full_name}`);
    console.log(`   📧 Email:   ${user.email}`);
    console.log(`   🆔 ID:      ${user.id}`);
    console.log(`   🔄 Role:    student → admin`);
    console.log('');
    console.log('👉 Đăng nhập lại để sử dụng quyền Admin.');
}

main().catch(err => {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
});