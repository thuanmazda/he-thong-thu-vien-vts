/**
 * Controller xử lý các API liên quan đến Người dùng (Users)
 * 
 * Các API:
 * 1. POST /api/users/register   - Đăng ký tài khoản mới (role luôn = 'student')
 * 2. POST /api/users/login      - Đăng nhập (trả về role để phân luồng)
 * 3. GET  /api/users/profile/:id - Lấy thông tin chi tiết user
 */

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const SALT_ROUNDS = 10;

function generateLibraryCode() {
    const uuid = uuidv4().replace(/-/g, '').toUpperCase();
    return `LIB-${uuid.substring(0, 6)}`;
}

/**
 * Loại bỏ trường password_hash trước khi trả về response
 * Giữ lại role để Front-end phân luồng
 */
function sanitizeUser(user) {
    if (!user) return null;
    const { password_hash, ...safeUser } = user;
    return safeUser;
}

/**
 * POST /api/users/register
 * Role luôn được set = 'student' (xử lý ở Model)
 * Hỗ trợ thêm school_year và class_name
 */
async function register(req, res, next) {
    try {
        const { full_name, email, phone_number, password, school_year, class_name } = req.body;

        if (!full_name || !email || !phone_number || !password) {
            return res.status(400).json({
                success: false,
                error: 'Vui lòng nhập đầy đủ: full_name, email, phone_number, password'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, error: 'Email không hợp lệ' });
        }

        if (password.length < 6) {
            return res.status(400).json({ success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }

        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
            return res.status(409).json({ success: false, error: 'Email này đã được đăng ký' });
        }

        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        let library_code;
        let isUnique = false;
        while (!isUnique) {
            library_code = generateLibraryCode();
            const exist = await User.findByLibraryCode(library_code);
            if (!exist) isUnique = true;
        }

        const newUser = await User.create({
            library_code,
            full_name,
            email,
            phone_number,
            password_hash,
            school_year: school_year || null,
            class_name: class_name || null
        });

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công',
            data: {
                user: sanitizeUser(newUser),
                library_code: newUser.library_code
            }
        });

    } catch (err) {
        console.error('[Register Error]', err.message);
        next(err);
    }
}

/**
 * POST /api/users/login
 * Trả về thông tin user KÈM role để Front-end phân luồng
 */
async function login(req, res, next) {
    try {
        const { login, password } = req.body;

        if (!login || !password) {
            return res.status(400).json({
                success: false,
                error: 'Vui lòng nhập login (email/phone) và password'
            });
        }

        const user = await User.findByEmailOrPhone(login);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Tài khoản không tồn tại' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Mật khẩu không chính xác' });
        }

        const safeUser = sanitizeUser(user);
        console.log('[Login Debug] User:', safeUser.full_name, '| Role:', safeUser.role);
        
        // Trả về user kèm role
        res.status(200).json({
            success: true,
            message: 'Đăng nhập thành công',
            data: {
                user: safeUser
            }
        });

    } catch (err) {
        console.error('[Login Error]', err.message);
        next(err);
    }
}

/**
 * GET /api/users/profile/:id
 */
async function getProfile(req, res, next) {
    try {
        const { id } = req.params;
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ success: false, error: 'ID người dùng không hợp lệ' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
        }

        res.status(200).json({
            success: true,
            data: { user: sanitizeUser(user) }
        });

    } catch (err) {
        console.error('[GetProfile Error]', err.message);
        next(err);
    }
}

module.exports = { register, login, getProfile };