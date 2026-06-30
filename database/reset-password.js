/**
 * Script đổi mật khẩu cho user
 * Cách chạy: node database/reset-password.js <email> <password_mới>
 */

const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const DB_PATH = path.resolve(__dirname, '..', process.env.DB_PATH || './database/library.db');
const SALT_ROUNDS = 10;

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) {
        console.log('❌ Vui lòng cung cấp email và mật khẩu mới.');
        console.log('Cách dùng: node database/reset-password.js <email> <password_mới>');
        console.log('Ví dụ: node database/reset-password.js nmthuan03@gmail.com matkhau123');
        process.exit(1);
    }

    const [email, newPassword] = args;

    if (newPassword.length < 6) {
        console.error('❌ Mật khẩu phải có ít nhất 6 ký tự');
        process.exit(1);
    }

    if (!fs.existsSync(DB_PATH)) {
        console.error('❌ Không tìm thấy file database:', DB_PATH);
        process.exit(1);
    }

    const SQL = await initSqlJs();
    const buffer = fs.readFileSync(DB_PATH);
    const db = new SQL.Database(buffer);

    // Tìm user
    const stmt = db.prepare('SELECT id, full_name, email FROM Users WHERE email = ?');
    stmt.bind([email]);
    if (!stmt.step()) {
        console.error(`❌ Không tìm thấy user với email: ${email}`);
        db.close();
        process.exit(1);
    }
    const user = stmt.getAsObject();
    stmt.free();

    // Hash mật khẩu mới
    const password_hash = bcrypt.hashSync(newPassword, SALT_ROUNDS);

    // Cập nhật
    const updateStmt = db.prepare('UPDATE Users SET password_hash = ? WHERE id = ?');
    updateStmt.run([password_hash, user.id]);
    updateStmt.free();

    // Lưu database
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
    db.close();

    console.log('\n✅ Đổi mật khẩu thành công!');
    console.log(`   👤 Tên:     ${user.full_name}`);
    console.log(`   📧 Email:   ${user.email}`);
    console.log(`   🔑 Mật khẩu mới: ${newPassword}`);
    console.log('\n👉 Bây giờ bạn có thể đăng nhập với mật khẩu mới.');
}

main().catch(err => {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
});