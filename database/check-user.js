/**
 * Script kiểm tra thông tin user trong database
 * Cách chạy: node database/check-user.js <email hoặc id>
 */

const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const DB_PATH = path.resolve(__dirname, '..', process.env.DB_PATH || './database/library.db');

async function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('❌ Vui lòng cung cấp email hoặc ID.');
        console.log('Cách dùng: node database/check-user.js <email> hoặc <id>');
        process.exit(1);
    }

    const input = args[0];
    const isId = /^\d+$/.test(input);

    if (!fs.existsSync(DB_PATH)) {
        console.error('❌ Không tìm thấy file database:', DB_PATH);
        process.exit(1);
    }

    const SQL = await initSqlJs();
    const buffer = fs.readFileSync(DB_PATH);
    const db = new SQL.Database(buffer);

    let user;
    if (isId) {
        const stmt = db.prepare('SELECT id, full_name, email, role, library_code FROM Users WHERE id = ?');
        stmt.bind([parseInt(input)]);
        if (stmt.step()) user = stmt.getAsObject();
        stmt.free();
    } else {
        const stmt = db.prepare('SELECT id, full_name, email, role, library_code FROM Users WHERE email = ?');
        stmt.bind([input]);
        if (stmt.step()) user = stmt.getAsObject();
        stmt.free();
    }

    if (!user) {
        console.error(`❌ Không tìm thấy user với ${isId ? 'ID' : 'email'}: ${input}`);
        db.close();
        process.exit(1);
    }

    console.log('\n=== THÔNG TIN USER ===');
    console.log(`ID:      ${user.id}`);
    console.log(`Tên:     ${user.full_name}`);
    console.log(`Email:   ${user.email}`);
    console.log(`Mã thẻ:  ${user.library_code}`);
    console.log(`Role:    ${user.role}`);
    console.log(`\n✅ Role hiện tại: ${user.role.toUpperCase()}`);

    if (user.role !== 'admin') {
        console.log('\n⚠️  CẢNH BÁO: User này KHÔNG phải admin!');
        console.log('Để nâng quyền, chạy: node database/set-admin.js ' + user.email);
    } else {
        console.log('\n✅ User này đã là ADMIN.');
    }

    db.close();
}

main().catch(err => {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
});