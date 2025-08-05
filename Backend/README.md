# 📦 Backend - Website quản lý và bán sách

Dự án backend được xây dựng bằng **NestJS** và sử dụng **MongoDB Atlas** để lưu trữ dữ liệu. Hệ thống hỗ trợ xác thực bằng JWT, gửi email bằng Gmail/Nodemailer, lưu trữ ảnh trên Cloudinary và tích hợp chức năng tìm kiếm nâng cao bằng **Atlas Search** và **Vector Search** của **MongoDB Atlas** với mô hình `multilingual-e5-small`.

## ✨ Tính năng chính

Hệ thống backend được xây dựng theo kiến trúc Modular Monolith với các chức năng chính sau:

- Quản lý Sách.
- Quản lý Thể loại sách.
- Quản lý Giỏ hàng.
- Quản lý Đơn hàng.
- Quản lý Mã giảm giá & Khuyến mãi.
- Quản lý Đánh giá sách.
- Quản lý Người dùng.
- Quản lý Phí vận chuyển.
- Quản lý thông tin nhận hàng.
- Xác thực và phân quyền.
- Tìm sách:
  - Gợi ý tự động (autocomplete).
  - Tìm kiếm ngữ nghĩa (semantic search) bằng vector, hỗ trợ chatbot và gợi ý sản phẩm.
  - Sắp xếp kết quả tìm kiếm.
- Tìm kiếm theo bộ lọc và phân trang.
- Ghi nhận các lịch sử thao tác trên dữ liệu.

## 🚀 Công nghệ chính sử dụng

- **NestJS** - Node.js framework
- **MongoDB Atlas** - Cơ sở dữ liệu NoSQL
- **JWT (JSON Web Token)** - Xác thực và phân quyền
- **Cloudinary** - Lưu trữ hình ảnh
- **Gmail + Nodemailer** - Gửi email (SMTP)
- **Xenova Transformers** & **Xenova/multilingual-e5-small** - Chuyển đổi văn bản thành vector
- **MongoDB Atlas Search** - Tìm kiếm từ khoá, autocomplete và ngữ nghĩa

## 📁 Cấu trúc thư mục

```plaintext
src/
├── app.module.ts
├── main.ts
├── config/                # Cấu hình ứng dụng và đọc biến môi trường
├── danh-gia/              # Module đánh giá sách
├── dia-chi/               # Module địa chỉ giao hàng
├── don-hang/              # Module đơn hàng + thống kê
├── gio-hang/              # Module giỏ hàng
├── khuyen-mai/            # Module khuyến mãi
├── ma-giam/               # Module mã giảm giá
├── nguoi-dung/            # Module người dùng (khách hàng / nhân viên)
├── phi-van-chuyen/        # Module phí vận chuyển
├── sach/                  # Module sách
├── the-loai/              # Module thể loại sách
├── tt-nhan-hang/          # Module trạng thái nhận hàng
├── xac-thuc/              # Xác thực + quyền truy cập
└── Util/                  # Tiện ích dùng chung
```

## 🧩 Cấu trúc module

```plaintext
<module-name>/
├── <module-name>.controller.ts       # Định nghĩa các API endpoint cho module
├── dto/                              # Chứa các lớp để validate dữ liệu đầu vào (DTO)
│   ├── create-<module-name>.dto.ts   # Dữ liệu tạo mới
│   └── update-<module-name>.dto.ts   # Dữ liệu cập nhật
├── schemas/                          # Định nghĩa schema Mongoose cho module
│   └── <module-name>.schema.ts
├── repositories/                     # Giao tiếp trực tiếp với MongoDB thông qua Mongoose Model
│   └── <module-name>.repository.ts
├── <module-name>.service.ts          # Chứa các logic xử lý chính của module
└── <module-name>.module.ts           # Định nghĩa module, import controller, service, schema,...
```

## ⚙️ Yêu cầu hệ thống

- Node.js v18+
- npm v9+
- Tài khoản MongoDB Atlas
- Tài khoản Cloudinary
- Tài khoản Gmail có App Password (dùng để gửi email qua SMTP)

## 📦 Cài đặt

Cài đặt thư viện

```bash
npm install
```

Tạo file môi trường .env tại thư mục gốc với các biến môi trường cần thiết. Xem chi tiết trong phần `🔧Cấu hình môi trường (.env)`.

## ⚙️ Cấu hình dịch vụ

#### MongoDB Atlas

- Tạo tài khoản tại <https://www.mongodb.com/cloud/atlas>
- Tạo Project và Cluster theo hướng dẫn chính thức
- Cập nhật Network Access (IP Whitelist) với địa chỉ IP máy hoặc dùng 0.0.0.0/0 để cho phép mọi IP
- Tạo Index Atlas Search tại Atlas Search cho tìm kiếm nâng cao:
  - Tạo Index có tên `default` với cấu hình:
  ```json
  {
    "mappings": {
      "fields": {
        "S_nhaXuatBan": [{ "type": "autocomplete" }, { "type": "string" }],
        "S_tacGia": [{ "type": "autocomplete" }, { "type": "string" }],
        "S_ten": [{ "type": "autocomplete" }, { "type": "string" }]
      }
    }
  }
  ```
  - Tạo Vector Search Index tên `vector_index` với cấu hình:
  ```json
  {
    "fields": [
      {
        "numDimensions": 384,
        "path": "S_eTomTat",
        "similarity": "cosine",
        "type": "vector"
      }
    ]
  }
  ```

#### Cloudinary

Tạo tài khoản tại <https://cloudinary.com/> và lấy các thông số trong phần Product Environment

- cloudName
- apiKey
- apiSecret

#### Gmail

Tạo App Password trong phần quản lý tài khoản Google để sử dụng gửi email qua SMTP

## 🔧 Cấu hình môi trường (.env)

Dự án sử dụng file .env để cấu hình các biến môi trường cần thiết. Cần tạo file .env trong thư mục gốc với các biến sau:

```env
# MongoDB Atlas
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority&appName=<your-app-name>

# Cổng chạy ứng dụng
PORT=3003

# Cloudinary (lưu trữ ảnh)
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

# Gmail SMTP
EMAIL_USER=<your_email@gmail.com>
EMAIL_PASS=<your_gmail_app_password>

# JWT
JWT_SECRET=<your_jwt_secret>

# Tài khoản quản trị mặc định
CODE=<your_code>
PASS=<your_password>

# URL frontend (Danh sách domain frontend được phép truy cập (CORS))
FE_URL=http://localhost:3001,http://localhost:3002
```

## 🚀 Khởi chạy ứng dụng

- Chạy ứng dụng ở môi trường phát triển

```bash
npm run start:dev
```

- Build và chạy ở môi trường sản xuất

```bash
npm run build
npm run start:prod
```

_Ứng dụng sẽ mặc định chạy tại địa chỉ:_

```bash
http://localhost:3003
```

_❗Đảm bảo cổng 3003 không bị ứng dụng khác chiếm dụng để tránh lỗi khi khởi động._

## ⚠️ Lưu ý

### 🗂️ Nhập dữ liệu địa chỉ hành chính

Sau khi đã khởi động ứng dụng và kết nối thành công với MongoDB Atlas:

- Truy cập MongoDB Atlas hoặc sử dụng MongoDB Compass
- Tìm collection có tên diachis trong database của dự án
- Import dữ liệu địa chỉ từ file mẫu **db/diachis.json** nằm trong thư mục **db**.

#### 📥 Hướng dẫn import với MongoDB Compass:

- Mở MongoDB Compass và kết nối đến cluster MongoDB Atlas đã tạo
- Chọn database và collection diachis
- Click ADD DATA → Import JSON
- Chọn file **db/diachis.json** → Import

## ✍️ Người thực hiện

Dự án được thực hiện bởi **Trần Huỳnh Chương**, trong khuôn khổ luận văn tốt nghiệp.

## 📄 Giấy phép

Dự án sử dụng cho mục đích học tập và nghiên cứu. Không sử dụng cho mục đích thương mại nếu không có sự cho phép.
