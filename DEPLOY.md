# 🚀 Hướng dẫn Deploy lên Render.com

## 📋 Kiểm tra cấu hình đã sẵn sàng

### ✅ package.json
```json
"scripts": {
  "start": "node src/app.js",
  "dev": "nodemon src/app.js",
  "init-db": "node database/init.js"
}
```

### ✅ src/app.js - Port linh hoạt
```javascript
const PORT = process.env.PORT || 3000;
```

### ✅ CORS đã bật
```javascript
app.use(cors());
```

---

## 🎯 Các bước deploy lên Render

### Bước 1: Chuẩn bị GitHub
1. Đẩy code lên GitHub repository
2. Đảm bảo file `.gitignore` có:
   ```
   node_modules/
   database/library.db
   .env
   ```

### Bước 2: Tạo Web Service trên Render

1. **Đăng nhập** [Render.com](https://render.com)
2. Click **"New +"** → chọn **"Web Service"**
3. **Connect GitHub** → chọn repository của bạn
4. **Cấu hình:**
   - **Name**: `vts-library-system` (tên tự chọn)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (hoặc Starter $7/tháng)

5. **Advanced Settings** (quan trọng):
   ```
   Node Version: 18.x hoặc 20.x
   ```

6. Click **"Create Web Service"**

### Bước 3: Chờ deploy
- Render sẽ tự động:
  1. Clone code từ GitHub
  2. Chạy `npm install`
  3. Chạy `npm start`
  4. Cấp phát domain: `https://vts-library-system.onrender.com`

### Bước 4: Khởi tạo Database
Sau khi deploy xong, bạn cần khởi tạo database:

**Cách 1: Dùng Render Shell**
1. Vào dashboard → Click **"Shell"** tab
2. Chạy lệnh:
   ```bash
   npm run init-db
   ```

**Cách 2: Tạo API endpoint init (khuyến nghị)**
Thêm vào `src/app.js`:
```javascript
// Chỉ cho phép trong môi trường development
if (process.env.NODE_ENV !== 'production') {
    app.get('/api/init-db', async (req, res) => {
        // Gọi script init database
        res.json({ success: true, message: 'Database initialized' });
    });
}
```

---

## ⚠️ LƯU Ý QUAN TRỌNG về Database

### Vấn đề: SQLite trên Render
- **SQLite lưu file** (`library.db`) trên disk
- Render có **ephemeral filesystem** - file sẽ **bị mất** khi:
  - Service restart
  - Deploy lại
  - Server ngủ (free plan)

### Giải pháp:

#### Option 1: Dùng PostgreSQL (Khuyến nghị)
1. Trên Render, tạo **PostgreSQL** database (Free tier)
2. Cài đặt: `npm install pg`
3. Chuyển từ sql.js sang PostgreSQL

#### Option 2: Dùng SQLite + Backup định kỳ
- Chấp nhận mất data khi restart
- Export database thường xuyên

#### Option 3: Dùng SQLite + External Storage
- Lưu file DB lên S3, Cloudinary...

---

## 🔧 Cấu hình Environment Variables

Trên Render → Settings → Environment:

| Key | Value | Mô tả |
|-----|-------|-------|
| `PORT` | *(Render tự cấp)* | Không cần set |
| `NODE_ENV` | `production` | Chế độ production |
| `DB_PATH` | `./database/library.db` | Đường dẫn DB |
| `JWT_SECRET` | `your-secret-key-here` | Đổi thành key ngẫu nhiên |

---

## 📱 Test trên điện thoại

Sau khi deploy:
1. Mở browser điện thoại
2. Truy cập: `https://vts-library-system.onrender.com`
3. Đăng nhập với tài khoản admin:
   - Email: `admin@vts.edu.vn`
   - Password: `admin123`

---

## 🛠️ Troubleshooting

### Lỗi "Application failed to respond"
- Kiểm tra logs trên Render dashboard
- Đảm bảo `npm start` chạy đúng
- Kiểm tra port có đang lắng nghe `process.env.PORT`

### Lỗi CORS
- Đã có `app.use(cors())` trong code
- Nếu vẫn lỗi, thêm:
  ```javascript
  app.use(cors({ origin: '*' }));
  ```

### Database bị mất
- Xem phần "Lưu ý về Database" ở trên
- Chuyển sang PostgreSQL hoặc init DB lại

---

## 📊 Monitoring

Trên Render dashboard bạn có thể xem:
- **Logs**: Xem console.log real-time
- **Metrics**: CPU, Memory, Request count
- **Events**: Deploy history, crashes

---

## 💰 Chi phí

| Plan | Giá | Phù hợp |
|------|-----|---------|
| Free | $0/tháng | Test, demo |
| Starter | $7/tháng | Production nhỏ |
| Standard | $25/tháng | Production vừa |

**Free tier limitations:**
- 512 MB RAM
- Service ngủ sau 15 phút không có request
- 100 GB bandwidth/tháng

---

## 🎯 Checklist trước khi deploy

- [ ] Code đã push lên GitHub
- [ ] `.gitignore` đã cấu hình đúng
- [ ] `package.json` có `"start": "node src/app.js"`
- [ ] `src/app.js` dùng `process.env.PORT`
- [ ] CORS đã bật
- [ ] Đã test local: `npm start` → `http://localhost:3000`
- [ ] Đã test init DB: `npm run init-db`

---

## 📝 Ghi chú thêm

### Tự động deploy
- Mỗi lần push code lên GitHub → Render tự động rebuild
- Có thể tắt trong Settings → Auto-Deploy

### Custom Domain
- Render cho phép kết nối domain riêng
- Vào Settings → Custom Domain

### SSL/HTTPS
- Render tự động cấp phát SSL certificate miễn phí
- Truy cập qua `https://` không cần config thêm

---

*Hệ thống VTS Library © 2026 - Deploy Guide*