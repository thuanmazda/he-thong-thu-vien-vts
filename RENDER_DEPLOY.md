# 🚀 Hướng dẫn Deploy lên Render

## 📋 Mục lục
1. [Push code lên GitHub](#1-push-code-lên-github)
2. [Tạo Web Service trên Render](#2-tạo-web-service-trên-render)
3. [Cấu hình Environment Variables](#3-cấu-hình-environment-variables)
4. [Deploy và Test](#4-deploy-và-test)

---

## 1. Push code lên GitHub

### Bước 1.1: Kiểm tra Git
```bash
# Kiểm tra git đã được cài chưa
git --version
```

### Bước 1.2: Commit và Push
```bash
# Thêm tất cả files (trừ file nhạy cảm)
git add .

# Commit
git commit -m "feat: Chuyển đổi sang Firebase Firestore + API linh hoệt"

# Push lên GitHub
git push origin main
```

**Lưu ý:** File `config/serviceAccountKey.json` đã được thêm vào `.gitignore`, sẽ không bị push lên GitHub.

---

## 2. Tạo Web Service trên Render

### Bước 2.1: Đăng nhập Render
1. Truy cập [Render Dashboard](https://dashboard.render.com/)
2. Đăng nhập bằng tài khoản GitHub

### Bước 2.2: Tạo Web Service
1. Click **"New +"** → **"Web Service"**
2. Chọn repository: `he-thong-thu-vien-vts`
3. Click **"Connect"**

### Bước 2.3: Cấu hình cơ bản
```
Name: he-thong-thu-vien-vts
Region: Singapore (hoặc gần bạn nhất)
Branch: main
Runtime: Node.js
Build Command: npm install
Start Command: npm start
```

---

## 3. Cấu hình Environment Variables

### Bước 3.1: Thêm Environment Variables

Trong tab **"Environment"**, thêm các biến sau:

| Key | Value | Mô tả |
|-----|-------|-------|
| `NODE_ENV` | `production` | Chế độ production |
| `PORT` | `5000` | Port (Render sẽ tự động set, nhưng để 5000 cho nhất quán) |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | *(Toàn bộ JSON)* | Copy từ file serviceAccountKey.json |

### Bước 3.2: Cách lấy FIREBASE_SERVICE_ACCOUNT_KEY

**Option A: Copy từ file local (Khuyến nghị)**
```bash
# Trên Windows
type config\serviceAccountKey.json

# Copy toàn bộ output (từ { đến })
# Paste vào value của FIREBASE_SERVICE_ACCOUNT_KEY trên Render
```

**Option B: Dùng file JSON (Nếu đã upload lên GitHub)**
```
FIREBASE_KEY_PATH=./config/serviceAccountKey.json
```

⚠️ **Lưu ý quan trọng:**
- Nếu dùng `FIREBASE_SERVICE_ACCOUNT_KEY`: Copy toàn bộ JSON, **KHÔNG** xuống dòng
- Nếu dùng `FIREBASE_KEY_PATH`: Đảm bảo file đã được upload lên GitHub (đã xóa khỏi .gitignore)

### Bước 3.3: Ví dụ FIREBASE_SERVICE_ACCOUNT_KEY

```json
{"type":"service_account","project_id":"he-thong-thu-vien-vts","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-fbsvc@he-thong-thu-vien-vts.iam.gserviceaccount.com",...}
```

**Lưu ý:** Phải là 1 dòng duy nhất, không có xuống dòng!

---

## 4. Deploy và Test

### Bước 4.1: Deploy
1. Click **"Create Web Service"**
2. Render sẽ tự động:
   - Clone code từ GitHub
   - Chạy `npm install`
   - Chạy `npm start`
3. Chờ 2-3 phút để deploy hoàn tất

### Bước 4.2: Xem logs
- Vào tab **"Logs"** để xem quá trình deploy
- Nếu thành công, bạn sẽ thấy:
```
✅ Firebase initialized from environment variable
✅ Firestore database connected
✅ Database đã sẵn sàng
📚 Hệ thống kiểm soát ra vào thư viện
 Server đang chạy tại: http://he-thong-thu-vien-vts.onrender.com
```

### Bước 4.3: Test
1. Truy cập: `https://he-thong-thu-vien-vts.onrender.com`
2. Đăng nhập với tài khoản test:
   - Admin: `nmthuan03@gmail.com` / `admin123`
   - Student: `nguyenvana@example.com` / `123456`

---

## 🔧 Troubleshooting

### Lỗi: "Firebase chưa được khởi tạo"

**Nguyên nhân:** Biến môi trường chưa được cấu hình đúng

**Giải pháp:**
1. Vào Render Dashboard → Web Service → Environment
2. Kiểm tra `FIREBASE_SERVICE_ACCOUNT_KEY` đã được thêm chưa
3. Đảm bảo JSON hợp lệ (không có xuống dòng)
4. Redeploy lại service

### Lỗi: "Invalid credential"

**Nguyên nhân:** JSON credentials bị lỗi format

**Giải pháp:**
1. Copy lại JSON từ file local
2. Đảm bảo không có ký tự xuống dòng (`\n`)
3. Paste vào Render Environment

### Lỗi: "Project not found"

**Nguyên nhân:** `project_id` trong JSON không khớp

**Giải pháp:**
1. Kiểm tra `project_id` trong file serviceAccountKey.json
2. Đảm bảo Firebase project đã được tạo

### Lỗi: "Failed to fetch" từ Frontend

**Nguyên nhân:** API_URL chưa đúng

**Giải pháp:**
- Code đã được cập nhật tự động nhận diện môi trường
- Localhost → `http://localhost:5000/api`
- Render → `https://he-thong-thu-vien-vts.onrender.com/api`

---

## 📊 Seed dữ liệu trên Render

Sau khi deploy thành công, cần seed dữ liệu:

### Bước 1: Mở Shell trên Render
1. Vào Render Dashboard
2. Chọn Web Service của bạn
3. Tab **"Shell"** (góc trên bên phải)

### Bước 2: Chạy seed script
```bash
npm run seed-firebase
```

### Bước 3: Kiểm tra kết quả
Bạn sẽ thấy:
```
🌱 Bắt đầu seed dữ liệu vào Firestore...
📱 Tạo Devices...
  ✅ GATE-001 (entry)
  ✅ GATE-002 (exit)
  ✅ GATE-003 (entry)
👑 Tạo Admin...
  ✅ Admin: m5EkmfkX9YPdD4rPGyP9
👥 Tạo Students...
  ✅ Nguyễn Văn A
  ✅ Trần Thị B
  ✅ Lê Văn C
  ✅ Phạm Thị D
🎉 Seed dữ liệu thành công!
```

---

## 🔥 Cấu hình Firestore Security Rules (Quan trọng)

Sau khi seed dữ liệu, cần cấu hình Security Rules:

### Bước 1: Mở Firebase Console
1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Chọn project: `he-thong-thu-vien-vts`
3. Vào **Firestore Database** → **Rules** tab

### Bước 2: Cập nhật Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users: chỉ admin được đọc/ghi
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

### Bước 3: Publish Rules
1. Click **"Publish"**
2. Đợi 1-2 phút để rules có hiệu lực

---

## ✅ Checklist Deploy

- [ ] Code đã push lên GitHub
- [ ] Đã tạo Web Service trên Render
- [ ] Đã thêm `FIREBASE_SERVICE_ACCOUNT_KEY` vào Environment
- [ ] Deploy thành công (không có lỗi)
- [ ] Đã chạy `npm run seed-firebase` trên Render Shell
- [ ] Đã cấu hình Firestore Security Rules
- [ ] Test đăng nhập thành công
- [ ] Test quét QR hoạt động

---

## 🌐 URLs sau khi deploy

- **Production:** `https://he-thong-thu-vien-vts.onrender.com`
- **Local:** `http://localhost:5000`

---

## 💡 Tips

1. **Auto-deploy:** Render sẽ tự động deploy khi bạn push code lên GitHub
2. **Logs:** Luôn kiểm tra tab Logs nếu có lỗi
3. **Environment Variables:** Có thể cập nhật bất cứ lúc nào
4. **Custom Domain:** Có thể thêm domain riêng trong Settings

---

*Hướng dẫn deploy Render © 2026 - VTS Library System*