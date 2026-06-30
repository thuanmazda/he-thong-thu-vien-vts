# 🔄 Hướng dẫn Migration từ SQLite sang Firebase Firestore

## 📋 Tổng quan

Hệ thống đã được chuyển đổi hoàn toàn từ **SQLite** sang **Firebase Firestore**. Tài liệu này giải thích các thay đổi và cách xử lý các file legacy.

---

## ✅ Đã chuyển đổi

### Backend
- ✅ `src/config/firebase.js` - Kết nối Firestore
- ✅ `src/models/User.js` - Collection: `users`
- ✅ `src/models/AccessLog.js` - Collection: `access_logs`
- ✅ `src/models/Device.js` - Collection: `devices`
- ✅ `src/controllers/userController.js` - Đã cập nhật logic
- ✅ `src/controllers/accessController.js` - Đã cập nhật logic
- ✅ `src/controllers/adminController.js` - Đã cập nhật logic
- ✅ `src/app.js` - Khởi tạo Firebase

### Scripts
- ✅ `database/seed-firebase.js` - Seed dữ liệu vào Firestore
- ✅ `database/check-firebase.js` - Kiểm tra kết nối Firebase

### Documentation
- ✅ `FIREBASE_SETUP.md` - Hướng dẫn cấu hình Firebase
- ✅ `README.md` - Cập nhật thông tin
- ✅ `.env.example` - Template biến môi trường

---

## 📦 Files Legacy (SQLite) - Không còn sử dụng

Các file sau đã **không còn hoạt động** với Firebase:

### Database Files (SQLite)
```
❌ database/library.db          - File SQLite (không còn dùng)
❌ database/schema.sql          - Schema SQLite cũ
❌ database/init.js             - Script init SQLite cũ
❌ database/set-admin.js        - Script nâng quyền SQLite
❌ database/check-user.js       - Kiểm tra user SQLite
❌ database/test-login.js       - Test login SQLite
❌ database/reset-password.js   - Reset password SQLite
```

### Config Files (SQLite)
```
❌ src/config/database.js       - Module kết nối SQLite
```

---

## 🚀 Cách sử dụng hệ thống mới (Firebase)

### 1. Cấu hình Firebase
```bash
# Copy template
cp .env.example .env

# Chỉnh sửa .env, thêm Firebase credentials
# Xem FIREBASE_SETUP.md để biết chi tiết
```

### 2. Seed dữ liệu
```bash
npm run seed-firebase
```

### 3. Chạy server
```bash
npm start
```

### 4. Kiểm tra kết nối
```bash
node database/check-firebase.js
```

---

## 🔍 Kiểm tra code đã chuyển đổi

### UserController - Register
```javascript
// ✅ Đã chuyển sang Firestore
const newUser = await User.create({
    full_name, email, phone_number, password_hash,
    school_year, class_name
});
// Model sẽ tự động:
// 1. Kiểm tra email đã tồn tại
// 2. Tạo library_code unique
// 3. Lưu vào Collection "users"
```

### UserController - Login
```javascript
// ✅ Đã chuyển sang Firestore
const user = await User.findByEmailOrPhone(login);
// Model sẽ query Firestore collection "users"
// với filter email == login OR phone_number == login
```

### UserController - GetProfile
```javascript
// ✅ Đã chuyển sang Firestore (string ID)
const user = await User.findById(id);
// id là string (Firestore document ID)
// Không còn parseInt() như SQLite
```

---

## 📊 Cấu trúc Firestore Collections

### Collection: `users`
```
Document ID: Auto-generated (string)
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

### Collection: `access_logs`
```
Document ID: Auto-generated (string)
Fields:
  - user_id: string (reference to users)
  - device_id: string
  - timestamp: string (ISO format)
```

### Collection: `devices`
```
Document ID: device_id (VD: GATE-001)
Fields:
  - device_id: string
  - device_type: string ('entry' | 'exit' | 'both')
  - status: string ('active' | 'inactive' | 'maintenance')
```

---

## ⚠️ Lưu ý quan trọng

### 1. ID Format
- **SQLite**: Số nguyên (1, 2, 3...)
- **Firestore**: String (auto-generated ID)

### 2. Query Syntax
- **SQLite**: `SELECT * FROM users WHERE email = ?`
- **Firestore**: 
  ```javascript
  db.collection('users')
    .where('email', '==', email)
    .limit(1)
    .get()
  ```

### 3. Transactions
- **SQLite**: ACID transactions
- **Firestore**: Batched writes (max 500 operations)

### 4. Real-time Updates
- **SQLite**: Không có
- **Firestore**: Có thể dùng `onSnapshot()` để listen real-time

---

## 🛠️ Nếu cần quay lại SQLite (Không khuyến nghị)

Nếu bạn cần quay lại SQLite cho mục đích test:

1. Restore code từ Git:
   ```bash
   git checkout <commit-sqlite>
   ```

2. Hoặc giữ cả 2 phiên bản:
   - Branch `firebase` - Phiên bản Firebase (hiện tại)
   - Branch `sqlite` - Phiên bản SQLite (legacy)

---

## 📝 Checklist Migration

- [x] Cấu hình Firebase Firestore
- [x] Chuyển Models (User, AccessLog, Device)
- [x] Cập nhật Controllers
- [x] Tạo script seed-firebase.js
- [x] Tạo script check-firebase.js
- [x] Cập nhật documentation
- [x] Test đăng ký/đăng nhập
- [x] Test CRUD operations
- [x] Test admin features

---

## 🎯 Ưu điểm của Firebase

✅ **Không bị mất data** khi server restart  
✅ **Cloud database** - truy cập từ mọi nơi  
✅ **Scalable** - tự động scale theo traffic  
✅ **Real-time** - có thể mở rộng thêm sau  
✅ **Free tier** - 50k reads, 20k writes/ngày  
✅ **Security Rules** - bảo vệ data ở server level  

---

## 📚 Tài liệu tham khảo

- [Firebase Setup Guide](./FIREBASE_SETUP.md)
- [Deploy Guide](./DEPLOY.md)
- [Main README](./README.md)

---

*Migration completed © 2026 - VTS Library System*