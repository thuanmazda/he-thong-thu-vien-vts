/**
 * Model User - Tương tác với bảng Users trong database (dùng sql.js)
 */

const { getDatabase, saveDatabase } = require('../config/database');

class User {
    static _queryAll(stmt, params = []) {
        if (params.length > 0) stmt.bind(params);
        const rows = [];
        while (stmt.step()) {
            rows.push(stmt.getAsObject());
        }
        stmt.free();
        return rows;
    }

    static _queryOne(stmt, params = []) {
        if (params.length > 0) stmt.bind(params);
        let row = null;
        if (stmt.step()) {
            row = stmt.getAsObject();
        }
        stmt.free();
        return row;
    }

    static async findById(id) {
        const db = await getDatabase();
        const stmt = db.prepare('SELECT * FROM Users WHERE id = ?');
        return this._queryOne(stmt, [id]);
    }

    static async findByLibraryCode(libraryCode) {
        const db = await getDatabase();
        const stmt = db.prepare('SELECT * FROM Users WHERE library_code = ?');
        return this._queryOne(stmt, [libraryCode]);
    }

    static async findByEmail(email) {
        const db = await getDatabase();
        const stmt = db.prepare('SELECT * FROM Users WHERE email = ?');
        return this._queryOne(stmt, [email]);
    }

    static async findByEmailOrPhone(login) {
        const db = await getDatabase();
        const stmt = db.prepare('SELECT * FROM Users WHERE email = ? OR phone_number = ?');
        return this._queryOne(stmt, [login, login]);
    }

    static async findAll() {
        const db = await getDatabase();
        const stmt = db.prepare(
            'SELECT id, library_code, full_name, email, phone_number, role, school_year, class_name, created_at FROM Users ORDER BY created_at DESC'
        );
        return this._queryAll(stmt);
    }

    /**
     * Tạo user mới - role luôn là 'student', hỗ trợ school_year + class_name
     */
    static async create(data) {
        const db = await getDatabase();
        const stmt = db.prepare(`
            INSERT INTO Users (library_code, full_name, email, phone_number, password_hash, role, school_year, class_name)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        stmt.run([
            data.library_code,
            data.full_name,
            data.email,
            data.phone_number,
            data.password_hash,
            'student',
            data.school_year || null,
            data.class_name || null
        ]);
        stmt.free();
        saveDatabase();

        const idStmt = db.prepare('SELECT MAX(id) as id FROM Users');
        const result = this._queryOne(idStmt);
        return this.findById(result.id);
    }

    static async update(id, data) {
        const db = await getDatabase();
        const fields = Object.keys(data);
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => data[f]);

        const stmt = db.prepare(`UPDATE Users SET ${setClause} WHERE id = ?`);
        stmt.run([...values, id]);
        stmt.free();
        saveDatabase();

        return this.findById(id);
    }

    static async delete(id) {
        const db = await getDatabase();
        const stmt = db.prepare('DELETE FROM Users WHERE id = ?');
        stmt.run([id]);
        stmt.free();
        saveDatabase();
        return true;
    }
}

module.exports = User;