import { Suspense } from 'react';

export default function TermsOfServicePage() {
  return (
    <Suspense fallback={<></>}>
      <div className="w-full px-6 py-10 space-y-8 text-sm bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-zinc-800">ĐIỀU KHOẢN SỬ DỤNG</h1>

        <p className="text-justify indent-8">
          Chào mừng quý khách đến mua sắm tại Dật Lạc. Sau khi truy cập vào website Dật Lạc để tham
          khảo hoặc mua sắm, quý khách đã đồng ý tuân thủ và ràng buộc với những quy định của Dật
          Lạc. Vui lòng xem kỹ các quy định và hợp tác với chúng tôi để xây dựng một website ngày
          càng thân thiện và phục vụ tốt những yêu cầu của quý khách. Nếu có bất kỳ câu hỏi nào, vui
          lòng liên hệ với Dật Lạc qua hotline 1900 1234 hoặc email: cskh@datlac.vn.
        </p>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">1. Tài khoản của khách hàng</h2>
          <ul className="pl-6 space-y-2 text-justify list-disc">
            <li>
              Một số dịch vụ yêu cầu đăng ký tài khoản. Quý khách cần cung cấp dữ liệu cá nhân cơ
              bản như họ tên, email, số điện thoại để sử dụng đầy đủ tính năng.
            </li>

            <li>
              Thông tin phục vụ giao dịch bao gồm địa chỉ giao hàng, thanh toán, phương thức thanh
              toán.
            </li>
            <li>
              Thông tin tự nguyện như ngày sinh, giới tính, nghề nghiệp sẽ giúp cá nhân hóa trải
              nghiệm dịch vụ.
            </li>
            <li>
              Quý khách chịu trách nhiệm bảo mật tài khoản, nên thoát sau khi sử dụng và cập nhật
              thông tin khi có thay đổi.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">2. Quyền lợi bảo mật dữ liệu cá nhân</h2>
          <p className="text-justify">
            Dữ liệu chỉ dùng để nâng cao chất lượng dịch vụ, không chia sẻ với bên thứ ba vì mục
            đích thương mại. Nếu quý khách muốn rút lại sự đồng ý, chỉnh sửa, hoặc yêu cầu liên quan
            đến dữ liệu cá nhân, vui lòng thao tác tại website hoặc liên hệ Dật Lạc.
          </p>
          <p className="text-justify">
            Trong trường hợp pháp luật yêu cầu, Dật Lạc sẽ cung cấp thông tin cho cơ quan có thẩm
            quyền.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">3. Trách nhiệm của khách hàng</h2>
          <ul className="pl-6 space-y-2 text-justify list-disc">
            <li>Không can thiệp trái phép vào hệ thống hoặc dữ liệu tại website.</li>
            <li>Không xúc phạm, quấy rối, hoặc đưa ra nhận xét mang tính chính trị, kỳ thị,...</li>
            <li>Cấm mạo nhận là người khác hoặc thành viên của Dật Lạc.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">4. Trách nhiệm và quyền lợi của Dật Lạc</h2>
          <p className="text-justify">
            Chúng tôi tuân thủ nguyên tắc xử lý dữ liệu cá nhân theo quy định pháp luật và chính
            sách bảo mật. Trong trường hợp phát sinh ngoài ý muốn, chúng tôi không chịu trách nhiệm
            về tổn thất.
          </p>
          <p className="text-justify">
            Dật Lạc không cho phép quảng bá sản phẩm trên website nếu chưa được sự đồng ý. Mọi điều
            khoản có thể thay đổi và sẽ được thông báo trên website.
          </p>
          <p className="text-justify">
            Nếu phát hiện lỗi hệ thống, vui lòng liên hệ hotline 1900 1234 hoặc email:
            cskh@datlac.vn.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-semibold">5. Hiệu lực</h2>
          <p className="text-justify">
            Điều khoản này có hiệu lực từ ngày 01/06/2025. Dật Lạc có thể điều chỉnh nội dung này
            bất kỳ lúc nào và đăng tải công khai trên website. Việc tiếp tục sử dụng dịch vụ được
            xem như quý khách đã đồng ý với nội dung cập nhật.
          </p>
        </section>

        <div className="mt-10 text-sm italic text-right text-zinc-600">
          <p>ĐẠI DIỆN CÔNG TY CỔ PHẦN PHÁT HÀNH SÁCH TP CẦN THƠ – DẬT LẠC</p>
          <p>[Đã ký và đóng dấu]</p>
          <p className="font-semibold">TRẦN HUỲNH CHƯƠNG</p>
          <p>Quyền Tổng Giám Đốc</p>
        </div>
      </div>
    </Suspense>
  );
}
