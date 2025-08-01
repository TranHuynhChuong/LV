import requests
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from rasa_sdk.events import SlotSet
from datetime import datetime
from .embedding_service import encode_text

class ActionProvideFeature(Action):
    def name(self) -> Text:
        return "action_provide_feature"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: "Tracker",
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        buttons = [
            {
                "title": "Tìm sách",
                "payload": "/find_book"
            },
            {
                "title": "Kiểm tra đơn hàng",
                "payload": "/find_order"
            }
        ]

        dispatcher.utter_message(text="Bạn cần hỗ trợ gì?", buttons=buttons)
        return []
    

UNKNOW = "Không rõ"

class ActionFindBooks(Action):
    def name(self) -> Text:
        return "action_find_books"


    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        book_info = tracker.get_slot("book_info")
        vector = encode_text(book_info)
        data = {
            "vector": vector,
            "limit": 3
        }

        try:
            response = requests.post("http://localhost:3003/api/books/find", json=data)
            if response.status_code == 201:
                books = response.json()
                if books:
                    elements = []
                    for book in books:
                        # map thông tin
                        book_id = book.get("S_id", "0")
                        name = book.get("S_ten", UNKNOW)
                        price = book.get("S_giaGiam", book.get("S_giaBan", UNKNOW))
                        image_url = book.get("S_anh", "https://via.placeholder.com/150")
                        categories_raw = book.get("S_TL", [])
                        if isinstance(categories_raw, list):
                            categories = ", ".join(categories_raw)
                        else:
                            categories = str(categories_raw)
                        auther = book.get("S_tacGia", UNKNOW)
                        publisher = book.get("S_nhaXuatBan", UNKNOW)
                        subtitle = (
                            f"Tác giả: {auther}  \n"
                            f"Thể loại: {categories}  \n"
                            f"NXB: {publisher}"
                        )

                        # Tạo carousel phản hổi kết quả tìm sách 
                        elements.append({
                            "title": name,
                            "subtitle": subtitle,
                            "image_url": image_url,
                            "buttons": [
                                {
                                    "type": "web_url",
                                    "title": f"Giá: {price:,}đ",
                                    "url": f"http://localhost:3002/book/{book_id}"
                                }
                            ]
                        })
                    dispatcher.utter_message(text="Dưới đây là những cuốn sách phù hợp với nội dung bạn đang tìm.")
                    dispatcher.utter_message(attachment={
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": elements
                        }
                    })
                    dispatcher.utter_message(text="Bạn cần hỗ trợ gì khác?", buttons=[
                        {"title": "Tìm sách", "payload": "/find_book"},
                        {"title": "Kiểm tra đơn hàng", "payload": "/find_order"},
                    ])
                else:
                    dispatcher.utter_message(text="❗Không tìm thấy sách nào phù hợp với yêu cầu của bạn.")
                    dispatcher.utter_message(text="Bạn cần hỗ trợ gì khác?", buttons=[
                        {"title": "Tìm sách", "payload": "/find_book"},
                        {"title": "Kiểm tra đơn hàng", "payload": "/find_order"},
                    ])
            else:
                dispatcher.utter_message(text="❗Không thể tìm sách. Vui lòng thử lại!")
                dispatcher.utter_message(text="Bạn cần hỗ trợ gì?", buttons=[
                        {"title": "Tìm sách", "payload": "/find_book"},
                        {"title": "Kiểm tra đơn hàng", "payload": "/find_order"},
                    ])
        except requests.RequestException:
            dispatcher.utter_message(text="❗Không thể tìm sách. Vui lòng thử lại!")
            dispatcher.utter_message(text="Bạn cần hỗ trợ gì?", buttons=[
                        {"title": "Tìm sách", "payload": "/find_book"},
                        {"title": "Kiểm tra đơn hàng", "payload": "/find_order"},
                    ])

        return [SlotSet("book_info", None)]



TRANG_THAI_DON_HANG = {
    "ChoXacNhan": "Chờ xác nhận",
    "ChoVanChuyen": "Chờ vận chuyển",
    "DangVanChuyen": "Đang vận chuyển",
    "GiaoThanhCong": "Đã giao hàng thành công",
    "GiaoThatBai": "Giao hàng thất bại",
    "YeuCauHuy": "Yêu cầu hủy đơn",
    "DaHuy": "Đã hủy"
}


class ActionCheckOrder(Action):
    def name(self) -> Text:
        return "action_check_order"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        order_id = tracker.get_slot("orderId")

        try:
            response = requests.get(f"http://localhost:3003/api/orders/find/{order_id}")
            if response.status_code != 200:
                dispatcher.utter_message(text="❗Không thể tìm đơn hàng. Vui lòng thử lại sau.")
                dispatcher.utter_message(text="Bạn cần hỗ trợ gì khác?", buttons=[
                        {"title": "Tìm sách", "payload": "/find_book"},
                        {"title": "Kiểm tra đơn hàng", "payload": "/find_order"},
                    ])
                return [SlotSet("orderId", None)]

            try:
                order = response.json()
            except ValueError:
                order = None

            if not isinstance(order, dict):
                dispatcher.utter_message(text=f"❗Không tìm thấy đơn hàng với mã: {order_id}.")
                dispatcher.utter_message(text="Bạn cần hỗ trợ gì khác?", buttons=[
                        {"title": "Tìm sách", "payload": "/find_book"},
                        {"title": "Kiểm tra đơn hàng", "payload": "/find_order"},
                    ])
                return [SlotSet("orderId", None)]

            # 1. Map trạng thái
            raw_status = order.get("DH_trangThai", UNKNOW)
            trang_thai = TRANG_THAI_DON_HANG.get(raw_status, raw_status)

            # 2. Ngày tạo
            ngay_tao_raw = order.get("DH_ngayTao")
            ngay_tao = datetime.fromisoformat(ngay_tao_raw.rstrip("Z")).strftime("%d/%m/%Y %H:%M") if ngay_tao_raw else UNKNOW

            # 3. Họ tên người đặt
            ho_ten = order.get("thongTinNhanHang", {}).get("NH_hoTen", UNKNOW)

            # 4. Tổng thanh toán = sum(giá mua * số lượng) + phí VC - giảm giá HD - giảm giá VC
            chi_tiet = order.get("chiTietDonHang", [])
            tong_san_pham = sum(sp.get("CTDH_giaMua", 0) * sp.get("CTDH_soLuong", 0) for sp in chi_tiet)

            phi_vc = order.get("DH_phiVC", 0)
            giam_hd = order.get("DH_giamHD", 0)
            giam_vc = order.get("DH_giamVC", 0)

            tong_thanh_toan = tong_san_pham + phi_vc - giam_hd - giam_vc


            # 5. Danh sách sách
            ds_sach = []
            for s in chi_tiet:
                ten = s.get("S_ten", UNKNOW)
                sl = s.get("CTDH_soLuong", 0)
                gia = s.get("CTDH_giaMua", 0)
                ds_sach.append(f"  - {ten}: {sl} x {gia:,}₫")

            s_text = "\n".join(ds_sach)

            # 6. Tổng hợp thông tin
            reply = (
                f"Mã đơn hàng: {order_id}  \n"
                f"Ngày tạo: {ngay_tao}  \n"
                f"Trạng thái: {trang_thai}  \n"
                f"Người nhận: {ho_ten}  \n"
                f"Tổng thanh toán: {tong_thanh_toan:,}₫  \n"
                f"Sách:  \n{s_text}"
            )

            dispatcher.utter_message(text=reply, markdown=True)
            dispatcher.utter_message(text="Bạn cần hỗ trợ gì khác?", buttons=[
                        {"title": "Tìm sách", "payload": "/find_book"},
                        {"title": "Kiểm tra đơn hàng", "payload": "/find_order"},
                    ])

        except requests.RequestException:
            dispatcher.utter_message(text="❗Không thể tìm đơn hàng. Vui lòng thử lại sau.")
            dispatcher.utter_message(text="Bạn cần hỗ trợ gì?", buttons=[
                        {"title": "Tìm sách", "payload": "/find_book"},
                        {"title": "Kiểm tra đơn hàng", "payload": "/find_order"},
                    ])

        return [SlotSet("orderId", None)]
