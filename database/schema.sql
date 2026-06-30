-- =============================================================
-- Hệ thống kiểm soát ra vào thư viện bằng mã QR
-- Database Schema cho SQLite
-- =============================================================

-- BẢNG 1: Users - Lưu thông tin người dùng thư viện
CREATE TABLE IF NOT EXISTS Users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    library_code    TEXT    NOT NULL UNIQUE,          -- Mã thẻ thư viện (dùng để tạo QR)
    full_name       TEXT    NOT NULL,                  -- Họ và tên
    email           TEXT    NOT NULL UNIQUE,           -- Email
    phone_number    TEXT    NOT NULL,                  -- Số điện thoại
    password_hash   TEXT    NOT NULL,                  -- Mật khẩu đã băm (bcrypt)
    role            TEXT    NOT NULL DEFAULT 'student' CHECK(role IN ('student', 'admin')),  -- Phân quyền
    school_year     TEXT    DEFAULT NULL,              -- Niên khóa (VD: '2023-2027')
    class_name      TEXT    DEFAULT NULL,              -- Tên lớp (VD: 'ĐT21', 'Cựu')
    created_at      TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))  -- Thời gian tạo
);

-- BẢNG 2: Devices - Lưu thông tin thiết bị đọc QR (cổng ra/vào)
CREATE TABLE IF NOT EXISTS Devices (
    device_id       TEXT    PRIMARY KEY,            -- Mã thiết bị (VD: GATE-001, GATE-002)
    device_type     TEXT    NOT NULL CHECK(device_type IN ('entry', 'exit', 'both')),  -- Loại: cổng vào/ra/cả hai
    status          TEXT    NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'maintenance'))  -- Trạng thái hoạt động
);

-- BẢNG 3: AccessLogs - Lưu lịch sử ra vào
CREATE TABLE IF NOT EXISTS AccessLogs (
    log_id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL,               -- FK -> Users.id
    timestamp       TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),  -- Thời gian quét QR
    device_id       TEXT    NOT NULL,               -- FK -> Devices.device_id
    FOREIGN KEY (user_id)   REFERENCES Users(id)    ON DELETE CASCADE,
    FOREIGN KEY (device_id) REFERENCES Devices(device_id) ON DELETE CASCADE
);

-- Index để tối ưu truy vấn
CREATE INDEX IF NOT EXISTS idx_accesslogs_user_id ON AccessLogs(user_id);
CREATE INDEX IF NOT EXISTS idx_accesslogs_timestamp ON AccessLogs(timestamp);
CREATE INDEX IF NOT EXISTS idx_accesslogs_device_id ON AccessLogs(device_id);
CREATE INDEX IF NOT EXISTS idx_users_library_code ON Users(library_code);