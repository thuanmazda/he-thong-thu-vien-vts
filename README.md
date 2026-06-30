# 📚 Hệ thống kiểm soát ra vào thư viện bằng mã QR

Hệ thống quản lý ra/vào thư viện sử dụng mã QR, được xây dựng với **Node.js + Express (Backend)** và **HTML/CSS/JS thuần (Frontend)**.

---

## 🚀 Cài đặt & Chạy

### 1. Clone & Cài dependencies
```bash
git clone <repo-url>
cd he-thong-thu-vien-vts
npm install
```

### 2. Khởi tạo Database
```bash
npm run init-db
```
→ Tạo file `database/library.db` với 3 bảng + dữ liệu mẫu.

### 3. Chạy Server
```bash
npm start
```
→ Server chạy tại `http://localhost:3000`

---

## 👤 Tài khoản mẫu

| Vai trò | Email | Mật khẩu | Mô tả |
|---------|-------|----------|-------|
| 👑 **Admin** | `admin@vts.edu.vn` | `admin123` | Quét QR, quản lý thành viên, xem thống kê |
| 👥 **Student** | `nguyenvana@example.com` | `123456` | Xem mã QR cá nhân, xem lịch sử |

---

## 🔐 Phân quyền

### Admin (`role = 'admin'`)
- 📷 **Quét QR** (`admin-scan.html`) - Mở camera, quét mã QR thành viên
- 👥 **Quản lý thành viên** (`admin-users.html`) - Xem danh sách, gom nhóm theo lớp, tìm kiếm
- 📊 **Thống kê** (`admin-stats.html`) - Dashboard số liệu: đang có mặt, lượt hôm nay, thời gian TB, người dùng lâu nhất
- 📋 **Lịch sử** (`history.html`)

### Student (`role = 'student'`)
- 🎫 **Thẻ QR** (`dashboard.html`) - Xem mã QR cá nhân
- 📋 **Lịch sử** (`history.html`) - Xem lịch sử ra vào của mình
- 👤 **Tài khoản** - Đăng xuất

---

## 📡 API Endpoints

### Users
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/users/register` | Đăng ký (role mặc định = student) |
| POST | `/api/users/login` | Đăng nhập (trả về role) |
| GET | `/api/users/profile/:id` | Lấy thông tin user |

### Access
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/access/scan` | Quét QR → ghi log ra/vào |
| GET | `/api/access/history/:user_id` | Lịch sử ra vào |

### Admin
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/admin/users` | Danh sách tất cả thành viên (cần quyền admin) |
| GET | `/api/admin/stats` | Thống kê tổng quan (cần quyền admin) |

### Health
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/health` | Kiểm tra server hoạt động |

---

## 🗄️ Database Schema

### Bảng Users
```sql
- id (PK)
- library_code (UNIQUE) - Mã thẻ QR
- full_name
- email (UNIQUE)
- phone_number
- password_hash
- role ('student' | 'admin')
- school_year (VD: '2023-2027')
- class_name (VD: 'ĐT21', 'Cựu')
- created_at
```

### Bảng Devices
```sql
- device_id (PK) - VD: GATE-001, GATE-002
- device_type ('entry' | 'exit' | 'both')
- status ('active' | 'inactive' | 'maintenance')
```

### Bảng AccessLogs
```sql
- log_id (PK)
- user_id (FK → Users)
- timestamp
- device_id (FK → Devices)
```

---

## 🛠️ Công cụ quản lý

### Nâng quyền Admin
```bash
# Theo email
node database/set-admin.js admin@vts.edu.vn

# Theo ID
node database/set-admin.js 1
```

### Khởi tạo lại Database
```bash
npm run init-db
```
⚠️ Lưu ý: Xóa toàn bộ dữ liệu cũ và tạo mới.

---

## 📱 Giao diện

### Luồng người dùng
```
localhost:3000
  ├── Chưa login → pages/login.html
  ├── Admin → pages/admin-scan.html (Quét QR camera)
  │              ├── admin-users.html (Quản lý thành viên)
  │              └── admin-stats.html (Thống kê)
  └── Student → pages/dashboard.html (QR cá nhân)
                  └── pages/history.html (Lịch sử)
```

### Công nghệ Frontend
- **HTML5 + CSS3 + Vanilla JavaScript**
- **html5-qrcode** - Quét QR bằng camera
- **qrcodejs** - Tạo mã QR
- **Responsive** - Tối ưu mobile (max-width: 420px)

---

## 📊 Thống kê Admin Dashboard

1. **Đang có mặt**: Số người hiện tại trong thư viện (log "Vào" gần nhất, chưa có log "Ra")
2. **Lượt hôm nay**: Tổng số ra/vào trong ngày
3. **Thời gian TB**: Thời gian sử dụng trung bình (phút)
4. **Người dùng lâu nhất**: Thành viên có thời gian ở lại lớn nhất trong ngày

---

## 📝 Ghi chú

- Database sử dụng **SQLite** (file `library.db`)
- Mật khẩu được băm bằng **bcrypt**
- Phân quyền dựa trên trường `role` trong localStorage
- Camera QR chỉ hoạt động trên **HTTPS** hoặc **localhost**

---

## 🎯 Tính năng chính

✅ Đăng ký / Đăng nhập có phân quyền  
✅ Tự động sinh mã QR (library_code)  
✅ Quét QR bằng camera (Admin)  
✅ Quản lý thành viên (gom nhóm theo lớp)  
✅ Thống kê thời gian thực  
✅ Lịch sử ra vào có bộ lọc  
✅ Responsive mobile-first  

---

*Phát triển bởi VTS Library System © 2026*