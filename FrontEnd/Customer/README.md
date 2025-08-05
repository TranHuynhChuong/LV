# 📚 Frontend — Website quản lý & bán sách dành cho khách hàng

Giao diện frontend dành cho **khách hàng**, hỗ trợ **tìm kiếm** và **đặt mua sách**, được phát triển với **Next.js** kết hợp **shadcn/ui**, tích hợp chatbot **Rasa Open Source** thông qua **rasa-webchat**.

## 👥 Đối tượng sử dụng

- Khách hàng không đăng nhập
- Khách hàng đăng nhập

## ✨ Giao diện

Hệ thống xây dựng giao diện dành cho 2 nhóm người dùng chính, bao gồm các trang chung cho mọi khách hàng và trang chức năng riêng cho khách hàng đăng nhập:

#### Trang chung

- Trang chủ
- Trang đăng nhập/đăng ký
- Tìm kiếm sách
- Giỏ hàng
- Đặt hàng
- Chatbot hỗ trợ trực tuyến

#### Khách hàng đăng nhập

- Quản lý tài khoản cá nhân
- Quản lý thông tin nhận hàng
- Theo dõi đơn hàng
- Sử dụng thông tin nhận hàng khi đặt hàng
- Sử dụng mã giảm giá khi đặt hàng
- Đánh giá sách

_Giỏ hàng được lưu tùy theo tình trạng đăng nhập hoặc localstore tại trình duyệt._

## 🚀 Công nghệ chính sử dụng

- **Next.js 15**: Framework React, sử dụng App Router
- **shadcn/ui**: Thư viện UI react, dựa trên Tailwind
- **Lucide Icons**: Thư viện biểu tượng mã nguồn mở
- **Axios**: Gọi API backend
- **zustand**: Quản lý giỏ hàng tạm và sản phẩm đặt hàng
- **rasa webchat**: Giao tiếp với chatbot Rasa
- **TailwindCSS**: Framework CSS

## 📁 Cấu trúc thư mục

```plaintext
src/
├── app/                 # Routing chính theo App Router
│   └── route/           # Route
│   └── api/             # Api của next server
├── components/          # Component giao diện
├── chatbot/             # Widget chatbot
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

#### 🤖 Kết nối Chatbot Rasa

_⚠️ Ứng dụng sử dụng rasa-webchat để kết nối với Rasa chatbot qua giao thức WebSocket tại địa chỉ:_

```bash
http://localhost:5005
```

_❗Đảm bảo Rasa server đang chạy và mở WebSocket tại địa chỉ trên, hoặc điều chỉnh cấu hình nếu sử dụng domain/cổng khác._

_ ⚠️Ứng dụng sẽ mặc định chạy tại địa chỉ:_

```bash
http://localhost:3002
```

_❗Đảm bảo cổng 3002 không bị ứng dụng khác chiếm dụng để tránh lỗi khi khởi động._

## ✍️ Người thực hiện

Dự án được thực hiện bởi **Trần Huỳnh Chương**, trong khuôn khổ luận văn tốt nghiệp.

## 📄 Giấy phép

Dự án sử dụng cho mục đích học tập và nghiên cứu. Không sử dụng cho mục đích thương mại nếu không có sự cho phép.
