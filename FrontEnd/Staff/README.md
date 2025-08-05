# 📚 Frontend — Website quản lý & bán sách dành cho nhân viên

Giao diện frontend dành cho nhân viên quản trị hệ thống, giúp theo dõi và thao tác các chức năng quản lý. Được xây dựng bằng **Next.js** kết hợp với **shadcn/ui**.

## 👥 Đối tượng sử dụng

- Quản trị viên
- Nhân viên quản lý
- Nhân viên bán hàng

## ✨ Giao diện

Hệ thống xây dựng giao diện dành cho 3 nhóm người dùng chính, bao gồm các trang chung và trang chức năng riêng theo vai trò:

#### Trang chung

- Trang chủ
- Trang đăng nhập
- Hồ sơ cá nhân

#### Quản trị viên

- Quản lý tài khoản
- Lịch sử thao tác trên chi tiết các dữ liệu
- Các trang của nhân viên quản lý

#### Nhân viên quản lý

- Quản lý thể loại
- Quản lý sách
- Quản lý khuyến mãi (Sách & Mã giảm)
- Quản lý phí vận chuyển
- Thống kê bán hàng
- Các trang của nhân viên bán hàng

#### Nhân viên bán hàng

- Quản lý đơn hàng

## 🚀 Công nghệ chính sử dụng

- **Next.js 15**: Framework React, sử dụng App Router
- **shadcn/ui**: Thư viện UI react, dựa trên Tailwind
- **Lucide Icons**: Thư viện biểu tượng mã nguồn mở
- **Axios**: Gọi API backend
- **TailwindCSS**: framework CSS

## 📁 Cấu trúc thư mục

```plaintext
src/
├── app/                 # Routing chính theo App Router
│   └── route/           # Route
│   └── api/             # Api của next server
├── components/          # Component giao diện
├── contexts/            # Context API
├── hooks/               # Custom hook
├── lib/                 # Thư viện tiện ích
├── models/              # Mô hình dữ liệu
├── utils/               # Hàm tiện ích
├── public/              # Ảnh tĩnh, favicon,...
└── middleware.ts        # Kiểm tra quyền truy cập của người dùng
```

- Các component được tổ chức theo từng route tương ứng trong thư mục app/

## ⚙️ Yêu cầu hệ thống

- Node.js v18+

## 📦 Cài đặt

Cài đặt thư viện

```bash
npm install
```

Tạo file môi trường .env tại thư mục gốc với các biến môi trường cần thiết. Xem chi tiết trong phần `🔧Cấu hình môi trường (.env)`.

## 🔧 Cấu hình môi trường (.env)

Dự án sử dụng file .env để cấu hình các biến môi trường cần thiết. Cần tạo file .env trong thư mục gốc với các biến sau:

```bash
NEXT_PUBLIC_BE_API=http://localhost:3003/api
```

_🔸 Biến môi trường này quy định địa chỉ máy chủ backend mà frontend sẽ giao tiếp. Cần đảm bảo backend đã được khởi chạy thành công và lắng nghe tại cổng 3003._

_🔸 Trong môi trường phát triển, nếu có thay đổi về cổng hoặc domain, cần cập nhật lại biến này cho phù hợp để đảm bảo các lệnh gọi API được thực thi đúng._

## 🚀 Khởi chạy ứng dụng

- Chạy ứng dụng ở môi trường phát triển

```bash
npm run dev
```

- Build và chạy ở môi trường sản xuất

```bash
npm run build
npm run start
```

_Ứng dụng sẽ mặc định chạy tại địa chỉ:_

```bash
http://localhost:3001
```

_❗Đảm bảo cổng 3001 không bị ứng dụng khác chiếm dụng để tránh lỗi khi khởi động._

## ✍️ Người thực hiện

Dự án được thực hiện bởi **Trần Huỳnh Chương**, trong khuôn khổ luận văn tốt nghiệp.

## 📄 Giấy phép

Dự án sử dụng cho mục đích học tập và nghiên cứu. Không sử dụng cho mục đích thương mại nếu không có sự cho phép.
