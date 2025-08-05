# 🤖 Chatbot — Website quản lý & bán sách
Chatbot hỗ trợ người dùng tìm kiếm và tra cứu thông tin về sách và đơn hàng, được xây dựng bằng Rasa Open Source. Dự án sử dụng Python, triển khai trên máy chủ riêng, tích hợp với frontend (Next.js) thông qua rasa-webchat và backend để xử lý tìm kiếm.

## 🚀 Công nghệ chính sử dụng
- Python 3.10+
- Rasa Open Source 3.1
- rasa-webchat: Hiển thị giao diện chat trong frontend
- Sentence Transfomer: Thư viện sinh vector từ văn bản  
- intfloat/multilingual-e5-small: Mô hình chuyển đổi văn bản thành vector (dùng cho chuyển yêu cầu tìm sách thành vector)

## 📌 Chức năng chính
### 🧠 Cách chatbot hoạt động
- **Rasa** gồm 2 phần:
  - **NLU (Natural Language Understanding):** Hiểu câu người dùng (ý định - intent, thực thể - entity)
  - **Core (Dialogue Management):** Điều phối hội thoại theo kịch bản đã học

### 🎯 Kịch bản chính

#### 1. **Tìm sách**
- Người dùng nhập yêu cầu tìm sách (ví dụ: *"Tôi muốn tìm sách về trí tuệ nhân tạo"*).
- Chatbot hỏi lại nếu yêu cầu tìm sách không rõ ràng (ví dụ: *"Tôi muốn tìm sách"*)
- Chatbot gọi custom action để  **chuyển thành vector** bằng mô hình `multilingual-e5-small` và truy vấn backend với Vector này để thực hiện tìm kiếm dựa trên **Atlas Vector Search**.
- Kết quả được gửi lại và hiển thị trong cửa sổ chat.

#### 2. **Tra cứu đơn hàng**
- Người dùng nhập yêu cầu kiểm tra đơn hàng (ví dụ: *"Tôi muốn kiểm tra đơn hàng ABC123456789"*).
- Chatbot hỏi lại nếu yêu cầu không cung cấp mã đơn hàng (ví dụ: *"Tôi muốn kiểm tra đơn hàng"*)
- Chatbot gọi custom action để truy vấn backend, lấy thông tin chi tiết đơn hàng.

---

## 📁 Cấu trúc thư mục

```plaintext
/
├── data/                       # Training data: nlu, rules, stories
├── domain.yml                  # Định nghĩa intent, entity, slot, form, response, action
├── config.yml                  # Cấu hình pipeline NLU & policy
├── credentials.yml             # Cấu hình kênh kết nối
├── endpoints.yml               # Cấu hình endpoint
├── actions/                    # Python custom actions
│   └── actions.py              # Các action tùy chỉnh
│   └── embedding_service.py    # Hàm xử lý chuyển yêu cầu thành vector
├── models/                     # Mô hình đã huấn luyện
├── components/                 # Các component tùy chỉnh
└── tests/                      # Test conversation

```

## ⚙️ Yêu cầu hệ thống
- Python 3.10
- pip

## 📦 Cài đặt
-  Tạo môi trường ảo (Tại Windows):
```bash
python -m venv .venv
```
- Kích hoạt môi trường ảo
```bash
.venv\Scripts\activate  
```

- Cài đặt các gói phụ thuộc (Sau khi đã kích hoạt môi trường ảo)
```bash
pip install -r requirements.txt
```

## 🚀 Khởi chạy ứng dụng
- Di chuyển vào thư mục `rasa-chatbot` hoặc tên thư mục đã đổi tên
- Kích hoạt môi trường ảo (Nếu chưa)
```bash
.venv\Scripts\activate  
```
_Sau khi kích hoạt thành công, bạn sẽ thấy tên môi trường hiện trước dấu nhắc lệnh, ví dụ:_
```bash
(.venv) user@device:~/rasa-chatbot$
```
- Chạy action server
```bash
rasa run actions 
```
- Khởi chạy chatbot (rasa server)
```bash
rasa run --enable-api --cors "*" --debug
```
_Mặc định chạy tại <http://localhost:5005>_

_Dấu "*" cho phép mọi origin. Có thể thay bằng domain cụ thể._

_❗Đảm bảo cổng **5005** không bị ứng dụng khác chiếm dụng để tránh lỗi khi khởi động._

_❗Đảm bảo tại frntend rasa webchat kết nối đúng với địa chỉ của rasa server đang chạy._
## 🛠️ Huấn luyện + thử nghiệm
- Huấn luyện mô hình
```bash
rasa train
```
_Huấn luyện xong sẽ tạo ra file .tar.gz trong thư mục models/_

- Kiểm thử giao tiếp
```bash
rasa shell
```

- Kiểm thử riêng NLU 
```bash
rasa shell nlu
```


## ⚠️ Lưu ý
### 🔹 Tạo và kích hoạt môi trường ảo (tùy chọn - khuyến khích).

Để tránh xung đột thư viện giữa các dự án Python, nên tạo môi trường ảo (virtual environment) trước khi cài đặt Rasa.

### 🐞 Lỗi không nhận được tin nhắn phản hồi từ rasa 
Khi nhận tin nhắn được gửi đến rasa nhưng không nhận được phản hồi. Khi khởi động gặp lỗi sau:
```bash
RuntimeWarning: coroutine 'AsyncServer.enter_room' was never awaited
```
#### Nguyên nhân chính
Hàm sio.enter_room(...) trong Rasa (file rasa\core\channels\socketio.py) đã được định nghĩa là async, nhưng lại không được await, dẫn tới cảnh báo:
#### Cách khắc phục tạm thời
Mở file:
```bash
rasa\core\channels\socketio.py
```
Tìm đoạn trong hàm session_request, dòng tương tự như:
```bash
sio.enter_room(sid, data["session_id"])
```
→ Sửa lại thành:
```bash
await sio.enter_room(sid, data["session_id"])
```


## ✍️ Người thực hiện
Dự án được thực hiện bởi **Trần Huỳnh Chương**, trong khuôn khổ luận văn tốt nghiệp.

## 📄 Giấy phép
Dự án sử dụng cho mục đích học tập và nghiên cứu. Không sử dụng cho mục đích thương mại nếu không có sự cho phép.