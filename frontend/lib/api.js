/**
 * Cấu hình kết nối đến Backend API
 * 
 * File này định nghĩa URL gốc của Backend và cung cấp các hàm
 * gọi API để tất cả các trang Front-end có thể tái sử dụng.
 * 
 * Cách import:
 *   <script src="../lib/api.js"></script>
 * 
 * Sử dụng fetch API (JavaScript thuần, không cần thư viện bên ngoài)
 */

// --- Cấu hình: URL của Backend ---
const API_URL = 'http://localhost:3000/api';

/**
 * Hàm gọi API tổng quát (GET)
 * @param {string} endpoint - Ví dụ: '/users/profile/1'
 * @returns {Promise<object>} Dữ liệu JSON từ server
 */
async function apiGet(endpoint) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Lỗi không xác định');
    }

    return response.json();
}

/**
 * Hàm gọi API tổng quát (POST)
 * @param {string} endpoint - Ví dụ: '/access/scan'
 * @param {object} body - Dữ liệu gửi đi
 * @returns {Promise<object>} Dữ liệu JSON từ server
 */
async function apiPost(endpoint, body) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || data.message || 'Lỗi không xác định');
    }

    return data;
}

/**
 * Hàm gọi API (GET) - trả về toàn bộ response
 * Dùng khi cần kiểm tra status, headers, v.v.
 * @param {string} endpoint 
 * @returns {Promise<Response>}
 */
async function apiGetRaw(endpoint) {
    return fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}

/**
 * Hàm gọi API (POST) - trả về toàn bộ response
 * @param {string} endpoint 
 * @param {object} body 
 * @returns {Promise<Response>}
 */
async function apiPostRaw(endpoint, body) {
    return fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });
}