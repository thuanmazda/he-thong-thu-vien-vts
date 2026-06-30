# ⚡ Quick Start - Firebase Firestore

## 🎯 Bắt đầu nhanh trong 5 bước

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình Firebase
```bash
# Copy template
cp .env.example .env

# Mở .env và thêm Firebase credentials
# Xem FIREBASE_SETUP.md để biết cách lấy
```

### 3. Seed dữ liệu
```bash
npm run seed-firebase
```

### 4. Chạy server
```bash
npm start
```

### 5. Test
- Mở browser: `http://localhost:3000`
- Đăng nhập: `nmthuan03@gmail.com` / `admin123`

---

## 🔥 Lấy Firebase Credentials (2 phút)

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Tạo project mới
3. Tạo Firestore Database (Test Mode)
4. Settings → Service Accounts → Generate New Private Key
5. Copy nội dung file JSON vào `.env`:
   ```env
   FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"...",...}
   ```

---

## ✅ Đã hoàn thành chuyển đổi

- ✅ Tất cả Models đã dùng Firestore
- ✅ Tất cả Controllers đã cập nhật
- ✅ Logic Register/Login hoạt động với Firestore
- ✅ Seed script tạo dữ liệu mẫu
- ✅ Không còn phụ thuộc SQLite

---

## 📚 Tài liệu đầy đủ

- `README.md` - Tổng quan hệ thống
- `FIREBASE_SETUP.md` - Hướng dẫn Firebase chi tiết
- `DEPLOY.md` - Hướng dẫn deploy Render
- `MIGRATION.md` - Chi tiết migration từ SQLite

---

*VTS Library System © 2026*