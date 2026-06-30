/**
 * Cấu hình kết nối SQLite Database dùng sql.js
 * sql.js là SQLite thuần JavaScript (WebAssembly), không cần biên dịch native
 */

const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const DB_PATH = path.resolve(__dirname, '..', '..', process.env.DB_PATH || './database/library.db');

let db = null;
let SQL = null; // Lưu tham chiếu đến module sql.js để tạo DB mới

/**
 * Khởi tạo kết nối database (Singleton pattern)
 * @returns {Promise<Database>} Instance của sql.js database
 */
async function getDatabase() {
    if (db) return db;

    // Khởi tạo module sql.js (load WebAssembly)
    if (!SQL) {
        SQL = await initSqlJs();
    }

    // Kiểm tra file database đã tồn tại chưa
    if (fs.existsSync(DB_PATH)) {
        // Đọc file database có sẵn
        const buffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(buffer);
    } else {
        // Tạo database mới
        db = new SQL.Database();
    }

    // Bật ràng buộc khóa ngoại (mặc định SQLite tắt)
    db.run('PRAGMA foreign_keys = ON;');

    console.log(`[Database] Kết nối thành công: ${DB_PATH}`);
    return db;
}

/**
 * Lưu database từ memory xuống file
 * Phải gọi sau mỗi lần ghi dữ liệu (INSERT/UPDATE/DELETE)
 */
function saveDatabase() {
    if (!db) return;
    const data = db.export();
    const buffer = Buffer.from(data);
    
    // Đảm bảo thư mục database tồn tại
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    fs.writeFileSync(DB_PATH, buffer);
}

/**
 * Đóng kết nối database và lưu (dùng khi tắt server)
 */
function closeDatabase() {
    if (db) {
        saveDatabase();
        db.close();
        db = null;
        console.log('[Database] Đã đóng kết nối');
    }
}

module.exports = { getDatabase, saveDatabase, closeDatabase };