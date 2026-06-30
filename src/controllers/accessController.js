/**
 * Controller xử lý API quét mã QR kiểm soát ra vào
 * 
 * API:
 * POST /api/access/scan - Ghi nhận lượt quét QR ra/vào thư viện
 */

const User = require('../models/User');
const AccessLog = require('../models/AccessLog');

/**
 * POST /api/access/scan
 * 
 * Mô tả: Xử lý dữ liệu từ máy quét QR.
 * Kiểm tra library_code tồn tại, sau đó ghi log ra/vào.
 * 
 * Body: { library_code, device_id }
 * 
 * Response thành công (200):
 * {
 *   status: "success",
 *   message: "Đã ghi nhận ra vào thành công",
 *   user_name: "Nguyễn Văn A"
 * }
 */
async function scan(req, res, next) {
    try {
        const { library_code, device_id } = req.body;

        // --- Validate đầu vào ---
        if (!library_code || !device_id) {
            return res.status(400).json({
                status: 'error',
                message: 'Thiếu thông tin: library_code và device_id là bắt buộc'
            });
        }

        // --- Kiểm tra library_code có tồn tại trong bảng Users không ---
        const user = await User.findByLibraryCode(library_code);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Mã QR không hợp lệ'
            });
        }

        // --- Ghi log ra/vào ---
        await AccessLog.create({
            user_id: user.id,
            device_id: device_id
        });

        // --- Trả về kết quả thành công ---
        res.status(200).json({
            status: 'success',
            message: 'Đã ghi nhận ra vào thành công',
            user_name: user.full_name
        });

    } catch (err) {
        console.error('[AccessScan Error]', err.message);
        next(err);
    }
}

/**
 * GET /api/access/history/:user_id
 * 
 * Mô tả: Lấy lịch sử ra vào của một người dùng.
 * Trả về mảng các bản ghi sắp xếp theo thời gian mới nhất.
 * 
 * Params: user_id - ID của người dùng
 * 
 * Response thành công (200):
 * {
 *   status: "success",
 *   data: [
 *     {
 *       log_id: 1,
 *       timestamp: "2026-06-29 07:30:00",
 *       device_id: "GATE-001",
 *       device_type: "entry"
 *     },
 *     ...
 *   ]
 * }
 */
async function getHistory(req, res, next) {
    try {
        const { user_id } = req.params;

        // --- Validate user_id ---
        const userId = parseInt(user_id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({
                status: 'error',
                message: 'ID người dùng không hợp lệ'
            });
        }

        // --- Kiểm tra user có tồn tại không ---
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'Người dùng không tồn tại'
            });
        }

        // --- Lấy danh sách lịch sử ra vào ---
        const logs = await AccessLog.findByUserId(userId);

        res.status(200).json({
            status: 'success',
            data: logs
        });

    } catch (err) {
        console.error('[AccessHistory Error]', err.message);
        next(err);
    }
}

module.exports = { scan, getHistory };
