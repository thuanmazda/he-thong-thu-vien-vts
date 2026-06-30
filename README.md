# 📚 Hệ thống kiểm soát ra vào thư viện bằng mã QR

Hệ thống quản lý ra/vào thư viện sử dụng mã QR, được xây dựng với **Node.js + Express (Backend)** và **HTML/CSS/JS thuần (Frontend)**. Database sử dụng **Firebase Firestore** (NoSQL cloud database).

---

## 🚀 Cài đặt & Chạy

### 1. Clone & Cài dependencies
```bash
git clone <repo-url>
cd he-thong-thu-vien-vts
npm install
```

### 2. Cấu hình Firebase
```bash
# Copy file .env.example thành .env
cp .env.example .env

# Chỉnh sửa .env, thêm FIREBASE_SERVICE_ACCOUNT_KEY hoặc FIREBASE_KEY_PATH
# Xem hướng dẫn chi tiết trong FIREBASE_SETUP.md
```

### 3. Seed dữ liệu mẫu
```bash
npm run seed-firebase
```

### 4. Chạy Server
```bash
npm start
```
→ Server chạy tại `http://localhost:3000`

---

## 👤 Tài khoản mẫu

| Vai trò | Email | Mật khẩu | Mô tả |
|---------|-------|----------|-------|
| 👑 **Admin** | `nmthuan03@gmail.com` | `admin123` | Quét QR, quản lý thành viên, xem thống kê |
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

## 🗄️ Database Schema (Firestore)

### Collection: `users`
```
Document ID: Auto-generated
Fields:
  - library_code: string (UNIQUE)
  - full_name: string
  - email: string (UNIQUE)
  - phone_number: string
  - password_hash: string
  - role: string ('student' | 'admin')
  - school_year: string | null
  - class_name: string | null
  - created_at: timestamp
```

### Collection: `devices`
```
Document ID: device_id (VD: GATE-001)
Fields:
  - device_id: string
  - device_type: string ('entry' | 'exit' | 'both')
  - status: string ('active' | 'inactive' | 'maintenance')
```

### Collection: `access_logs`
```
Document ID: Auto-generated
Fields:
  - user_id: string (reference to users)
  - device_id: string
  - timestamp: string (ISO format)
```

---

## 🛠️ Công cụ quản lý

### Seed dữ liệu mẫu
```bash
npm run seed-firebase
```

### Kiểm tra kết nối Firebase
```bash
node database/check-firebase.js
```

### Nâng quyền Admin (Legacy - SQLite)
```bash
# Chỉ dùng cho SQLite, với Firebase dùng seed-firebase.js
node database/set-admin.js admin@vts.edu.vn
```

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

## 🔥 Firebase Setup

Xem hướng dẫn chi tiết trong file **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)**

### Tóm tắt:
1. Tạo Firebase project
2. Tạo Firestore database
3. Tạo Service Account Key (JSON)
4. Cấu hình biến môi trường
5. Chạy `npm run seed-firebase`

---

## 🚀 Deploy lên Render

Xem hướng dẫn chi tiết trong file **[DEPLOY.md](./DEPLOY.md)**

### Lưu ý quan trọng:
- **Firebase Firestore**: Không bị mất data khi restart (khác SQLite)
- **Environment Variables**: Cần set `FIREBASE_SERVICE_ACCOUNT_KEY` trên Render
- **HTTPS**: Render tự động cấp SSL, camera QR hoạt động tốt

---

## 📝 Ghi chú

- Database: **Firebase Firestore** (NoSQL cloud)
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
✅ Firebase Firestore (không bị mất data)  

---

## 📚 Tài liệu

- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - Hướng dẫn cấu hình Firebase
- [DEPLOY.md](./DEPLOY.md) - Hướng dẫn deploy lên Render
- [README.md](./README.md) - Tài liệu chính (file này)

---

*Phát triển bởi VTS Library System © 2026*