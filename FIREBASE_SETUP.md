# 🔥 Hướng dẫn cấu hình Firebase Firestore

## 📋 Mục lục
1. [Tạo Firebase Project](#1-tạo-firebase-project)
2. [Tạo Service Account Key](#2-tạo-service-account-key)
3. [Cấu hình biến môi trường](#3-cấu-hình-biến-môi-trường)
4. [Seed dữ liệu mẫu](#4-seed-dữ-liệu-mẫu)
5. [Deploy lên Render](#5-deploy-lên-render)

---

## 1. Tạo Firebase Project

### Bước 1.1: Truy cập Firebase Console
1. Mở browser, truy cập [Firebase Console](https://console.firebase.google.com/)
2. Đăng nhập bằng tài khoản Google

### Bước 1.2: Tạo Project mới
1. Click **"Add project"** (hoặc **"Tạo dự án"**)
2. **Tên project**: `vts-library-system` (hoặc tên bạn muốn)
3. Click **"Continue"**
4. **Google Analytics**: Có thể tắt (không cần thiết)
5. Click **"Create project"**

### Bước 1.3: Tạo Firestore Database
1. Trong menu bên trái, chọn **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. **Chọn mode**: 
   - Chọn **"Start in test mode"** (cho phép đọc/ghi tự do trong 30 ngày)
   - ⚠️ **Lưu ý**: Sau 30 ngày cần cấu hình Security Rules
4. **Chọn location**: Chọn region gần bạn nhất (VD: `asia-southeast1` cho Singapore)
5. Click **"Enable"**

---

## 2. Tạo Service Account Key

### Bước 2.1: Mở Project Settings
1. Click icon **⚙️ Settings** (góc trên bên phải)
2. Chọn **"Project settings"**

### Bước 2.2: Tạo Service Account
1. Chọn tab **"Service accounts"**
2. Click **"Generate new private key"**
3. Xác nhận bằng cách click **"Generate key"**

### Bước 2.3: Tải file JSON
1. File JSON sẽ tự động tải về máy
2. **LƯU ì file này** - nó chứa thông tin nhạy cảm!
3. File có dạng:
```json
{
  "type": "service_account",
  "project_id": "vts-library-system",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@vts-library-system.iam.gserviceaccount.com",
  ...
}
```

---

## 3. Cấu hình biến môi trường

### Cách 3.1: Dùng biến môi trường (Khuyến nghị cho Production)

**Option A: Lưu toàn bộ JSON vào 1 biến**

Thêm vào file `.env`:
```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"vts-library-system",...}
```

⚠️ **Lưu ý**: 
- Copy toàn bộ nội dung file JSON
- Paste vào sau dấu `=`
- Đảm bảo JSON hợp lệ (không có xuống dòng)

**Option B: Lưu file JSON vào project**

1. Tạo thư mục `config/` trong root project
2. Đặt file JSON vào: `config/serviceAccountKey.json`
3. Thêm vào `.gitignore`:
   ```
   config/serviceAccountKey.json
   ```
4. Thêm vào `.env`:
   ```env
   FIREBASE_KEY_PATH=./config/serviceAccountKey.json
   ```

### Cách 3.2: Test local

Chạy server:
```bash
npm start
```

Bạn sẽ thấy log:
```
✅ Firebase initialized from environment variable
✅ Firestore database connected
✅ Database đã sẵn sàng
```

---

## 4. Seed dữ liệu mẫu

Sau khi cấu hình Firebase xong, chạy lệnh seed dữ liệu:

```bash
npm run seed-firebase
```

Bạn sẽ thấy:
```
🌱 Bắt đầu seed dữ liệu vào Firestore...

📱 Tạo Devices...
  ✅ GATE-001 (entry)
  ✅ GATE-002 (exit)
  ✅ GATE-003 (entry)

👑 Tạo Admin...
  ✅ Admin: xxxxxxxx (nmthuan03@gmail.com / admin123)

👥 Tạo Students...
  ✅ Nguyễn Văn A (nguyenvana@example.com / 123456)
  ✅ Trần Thị B (tranthib@example.com / 123456)
  ✅ Lê Văn C (levanc@example.com / 123456)
  ✅ Phạm Thị D (phamthid@example.com / 123456)

📝 Tạo Access Logs mẫu...
  ✅ Đã tạo 5 access logs

🚶 Tạo logs cho người đang có mặt...
  ✅ Phạm Thị D đang có mặt trong thư viện

🎉 Seed dữ liệu thành công!
```

---

## 5. Deploy lên Render

### Bước 5.1: Thêm Environment Variables trên Render

1. Vào [Render Dashboard](https://dashboard.render.com/)
2. Chọn Web Service của bạn
3. Vào tab **"Environment"**
4. Thêm các biến môi trường:

| Key | Value | Mô tả |
|-----|-------|-------|
| `FIREBASE_SERVICE_ACCOUNT_KEY` | *(Toàn bộ JSON)* | Copy từ file serviceAccountKey.json |
| `NODE_ENV` | `production` | Chế độ production |
| `JWT_SECRET` | `your-secret-key-here` | Đổi thành key ngẫu nhiên |

⚠️ **Lưu ý quan trọng với FIREBASE_SERVICE_ACCOUNT_KEY trên Render:**
- Copy toàn bộ nội dung file JSON
- Paste vào value
- **KHÔNG** xuống dòng trong value (nếu có xuống dòng sẽ bị lỗi)
- Hoặc dùng `FIREBASE_KEY_PATH` nếu đã upload file lên GitHub

### Bước 5.2: Deploy lại

1. Push code lên GitHub (nếu chưa)
2. Render sẽ tự động deploy
3. Sau khi deploy xong, vào **Shell** tab
4. Chạy seed dữ liệu:
   ```bash
   npm run seed-firebase
   ```

### Bước 5.3: Test

Truy cập: `https://[ten-service].onrender.com`

Đăng nhập với tài khoản admin:
- Email: `nmthuan03@gmail.com`
- Password: `admin123`

---

## 🔒 Firestore Security Rules

Sau khi test xong, cần cấu hình Security Rules để bảo vệ data:

### Vào Firestore Database → Rules tab

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users: chỉ admin được đọc, user được đọc thông tin mình
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                   get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Access Logs: chỉ admin được đọc/ghi
    match /access_logs/{logId} {
      allow read, write: if request.auth != null && 
                          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Devices: chỉ admin được đọc/ghi
    match /devices/{deviceId} {
      allow read, write: if request.auth != null && 
                          get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

Click **"Publish"** để áp dụng.

---

## 🐛 Troubleshooting

### Lỗi: "Firebase chưa được khởi tạo"
- Kiểm tra biến môi trường `FIREBASE_SERVICE_ACCOUNT_KEY` hoặc `FIREBASE_KEY_PATH`
- Đảm bảo file JSON hợp lệ

### Lỗi: "Permission denied"
- Kiểm tra Firestore Security Rules
- Đảm bảo đang ở chế độ test mode hoặc đã cấu hình rules đúng

### Lỗi: "Project not found"
- Kiểm tra `project_id` trong service account key
- Đảm bảo Firebase project đã được tạo

### Lỗi khi deploy Render
- Kiểm tra logs trên Render dashboard
- Đảm bảo đã thêm đủ environment variables
- Kiểm tra JSON không có xuống dòng

---

## 📊 Cấu trúc Firestore Collections

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

### Collection: `access_logs`
```
Document ID: Auto-generated
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

## 💡 Tips

1. **Backup data**: Firestore có tính năng export/import trong Console
2. **Monitoring**: Dùng Firebase Console để xem metrics
3. **Testing**: Dùng Firebase Emulator để test local
4. **Cost**: Firestore free tier: 50k reads, 20k writes, 20k deletes/ngày

---

## 📝 Checklist

- [ ] Đã tạo Firebase project
- [ ] Đã tạo Firestore database
- [ ] Đã tải serviceAccountKey.json
- [ ] Đã cấu hình biến môi trường
- [ ] Đã chạy `npm run seed-firebase` thành công
- [ ] Đã test đăng nhập
- [ ] Đã cấu hình Security Rules
- [ ] Đã deploy lên Render (nếu cần)

---

*Hệ thống VTS Library © 2026 - Firebase Setup Guide*