# Website quản lý & bán sách
Website quản lý & bán sách giúp theo dõi và thao tác các chức năng **quản lý**, hỗ trợ **tìm kiếm** và **đặt mua sách**, tích hợp **chatbot** trong hỗ trợ tìm kiếm.

Hệ thống bao gồm:
- **Backend** được xây dựng bằng `NestJS`, sử dụng `MongoDB Atlas` và `Cloudinary` trong lưu trữ.
- **Frontend** sử dụng `NextJS` và thư viện `shadcn/ui` để xây dựng giao diện người dùng.
- **Chatbot** xây dựng bằng `Rasa Open Source`, tích hợp với Frontend bằng `Rasa Webchat`.
 
## 🚀 Công nghệ chính sử dụng
- **Rasa Open Source 3.1**
- **NestJS**
- **MongoDB Atlas**
- **Cloudinary**
- **Xenova Transformers**
- **Sentence Transformers**
- **Mô hình multilingual-e5-small**
- **NextJS**
- **shadcn/ui**
- **TailwindCSS**
- **rasa webchat**
- **zustand**
- **Axios**


## ✨ Đối tượng sử dụng và tính năng chính
Hệ thống phục phục cho hai nhóm đối tượng sử dụng chính là **Khách hàng** và **Nhân viên**
#### Khách hàng
Gồm 2 đối tượng chính:
- **Khách vãng lai:** Người dùng không đăng nhập
- **Khách thành viên:** Người dùng đã đăng nhập

#### Nhân viên
Gồm 3 vai trò:
- **Quản trị viên:** Có toàn quyền nhân viên và các quyền đặc biệt (Quản lý tài khoản, xem thao tác trên dữ liệu,..).
- **Nhân viên quản lý:** Có các quyền cơ bản và các quyền quản lý trên các dữ liệu (Quản lý sách, quản lý thể loại,..).
- **Nhân viên bán hàng:** Có các quyền cơ bản và các quyền quản lý trên đơn hàng.

### Tính năng chính
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
- Chatbot: Hỗ trợ tìm sách và đơn hàng
---

## 📁 Cấu trúc thư mục

```plaintext
/
├── Backend/                    # Backend Xử lý logic nghiệp vụ
├── FronEnd/                    # Frontend Giao diện người dùng
│   └── Customer/               # Giao diện trang khách hàng
│   └── Staff/                  # Giao diện trang nhân viên
└── Chatbot/                    # Chatbot Xử lý hội thoại

```

## ⚙️ Yêu cầu hệ thống
- Python 3.10
- pip
- Node.js v18+
- npm v9+
- Tài khoản MongoDB Atlas
- Tài khoản Cloudinary
- Tài khoản Gmail có App Password (dùng để gửi email qua SMTP)

## 📦 Cài đặt
Clone toàn bộ mã nguồn về máy
```bash
git clone <repo-url>
cd <your-repo-name>
```
Cài đặt từng phần riêng biệt

Vui lòng truy cập (di chuyển) vào từng thư mục con để xem hướng dẫn chi tiết tại file `README.md` tương ứng.
```bash
cd <tên-thư-mục>
```
- Backend – Hướng dẫn tại Backend/README.md
- FrontEnd (FrontEnd/Customer và FrontEnd/Staff) Hướng dẫn tại FrontEnd/Customer/README.md và FrontEnd/Staff/README.md
- Chatbot – Hướng dẫn tại Chatbot/README.md


## ⚠️ Lưu ý khởi chạy ứng dụng
Khi chạy ứng dụng tại môi trường phát triển (localhost), mặc định ứng dụng sẽ chạy tại các cổng sau:
- Backend: 3003
- Frontend: 3001 và 3002
- Chatbot: 5005
_Đảm bảo các cổng trên không bị ứng dụng khác chiếm dụng để tránh lỗi khi khởi động._

Chạy dự án nhanh (Sau khi đã cấu hình và chạy thành công theo hướng dẫn cụ thể tại từng thư mục)
```plaintext
/
├── start-all.bat/                        # Khởi chạy nhanh toàn bộ dự án
├── start-backend.bat/                    # Khởi chạy nhanh backend
├── start-chatbot.bat/                    # Khởi chạy nhanh chatbot
├── start-frontend-customer.bat/          # Khỏi chạy nhanh frontend khách hàng
└── start-frontend-staff.bat/             # Khởi chạy nhanh frontend nhân viên

```
_Đảm bảo backend và các frontend đã build thành công, chatbot đã chạy thành công để chạy nhanh dự án thông qua các file `.bat`._


## ✍️ Người thực hiện

Dự án được thực hiện bởi **Trần Huỳnh Chương**, trong khuôn khổ luận văn tốt nghiệp.

## 📄 Giấy phép

Dự án sử dụng cho mục đích học tập và nghiên cứu. Không sử dụng cho mục đích thương mại nếu không có sự cho phép.