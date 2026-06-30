/**
 * Controller xử lý các API liên quan đến Access Logs (Ra/Vào)
 * 
 * Các API:
 * 1. POST /api/access/scan   - Quét QR, ghi log ra/vào
 * 2. GET  /api/access/history/:user_id - Lấy lịch sử ra vào của user
 */

const AccessLog = require('../models/AccessLog');
const User = require('../models/User');

/**
 * POST /api/access/scan
 * Quét mã QR → tìm user → ghi log ra/vào
 * 
 * Request body:
 *   - library_code: string
 *   - device_id: string (VD: GATE-001, GATE-002, ADMIN_PHONE)
 */
async function scanQR(req, res, next) {
    try {
        const { library_code, device_id } = req.body;

        if (!library_code || !device_id) {
            return res.status(400).json({
                success: false,
                error: 'Vui lòng cung cấp library_code và device_id'
            });
        }

        // 1. Tìm user theo library_code
        const user = await User.findByLibraryCode(library_code);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'Không tìm thấy người dùng với mã QR này'
            });
        }

        // 2. Xác định loại log (Vào/Ra)
        // Lấy log gần nhất của user
        const latestLog = await AccessLog.getLatestLogByUserId(user.id);
        
        let logType;
        if (!latestLog) {
            // Chưa có log nào → mặc định là "Vào"
            logType = 'Vào';
        } else {
            // Nếu log gần nhất là "Vào" → lần này là "Ra"
            // Nếu log gần nhất là "Ra" → lần này là "Vào"
            logType = latestLog.type === 'Vào' ? 'Ra' : 'Vào';
        }

        // 3. Tạo log mới
        const log = await AccessLog.create({
            user_id: user.id,
            user_name: user.full_name,
            device_id: device_id,
            type: logType
        });

        console.log(`[Scan] ${user.full_name} (${library_code}) → ${device_id} [${logType}]`);

        // 4. Trả về kết quả
        res.status(200).json({
            success: true,
            message: logType === 'Vào' ? 'Chào mừng bạn vào thư viện!' : 'Tạm biệt! Hẹn gặp lại',
            data: {
                log: log,
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    library_code: user.library_code,
                    class_name: user.class_name,
                    action: logType
                }
            }
        });

    } catch (err) {
        console.error('[Scan Error]', err.message);
        next(err);
    }
}

/**
 * GET /api/access/history/:user_id
 * Lấy lịch sử ra vào của user
 */
async function getHistory(req, res, next) {
    try {
        const { user_id } = req.params;
        
        // Firestore dùng string ID
        if (!user_id || typeof user_id !== 'string') {
            return res.status(400).json({ success: false, error: 'ID người dùng không hợp lệ' });
        }

        // Kiểm tra user tồn tại
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
        }

        // Lấy logs
        const logs = await AccessLog.findByUserId(user_id);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    full_name: user.full_name,
                    library_code: user.library_code
                },
                logs: logs
            }
        });

    } catch (err) {
        console.error('[GetHistory Error]', err.message);
        next(err);
    }
}

module.exports = { scanQR, getHistory };