'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { mapShippingFeeFromDto, ShippingFee } from '@/models/shipping';

export default function ShippingPolicyPage() {
  const [shippingFees, setShippingFees] = useState<ShippingFee[]>([]);

  useEffect(() => {
    const fetchShippingFees = async () => {
      try {
        const res = await api.get('/shipping');
        const dtoList = res.data || [];

        // mapShippingFeeFromDto là async nên cần Promise.all
        const mappedList = await Promise.all(dtoList.map(mapShippingFeeFromDto));

        setShippingFees(mappedList);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách phí vận chuyển:', error);
      }
    };

    fetchShippingFees();
  }, []);

  return (
    <div className="w-full p-6 space-y-6  bg-white rounded-md shadoe border ">
      <div>
        <h1 className="text-2xl font-semibold text-center mb-2">CHÍNH SÁCH VẬN CHUYỂN/ĐÓNG GÓI</h1>
        <h2 className="text-sm font-semibold mb-6 text-center">
          Áp dụng cho toàn bộ đơn hàng của Quý Khách tại Dật Lạc
        </h2>
      </div>

      <section className="space-y-2">
        <h3 className="font-semibold">1. Chính sách vận chuyển:</h3>
        <div className="text-sm indent-8">
          <p>
            Dật Lạc cung cấp dịch vụ giao hàng toàn quốc, gửi hàng tận nơi đến địa chỉ cung cấp của
            Quý khách. Thời gian giao hàng dự kiến phụ thuộc vào kho có hàng và địa chỉ nhận hàng
            của Quý khách. Với đa phần đơn hàng, Dật Lạc cần vài giờ làm việc để kiểm tra thông tin
            và đóng gói hàng. Nếu các sản phẩm đều có sẵn hàng, Dật Lạc sẽ nhanh chóng bàn giao cho
            đối tác vận chuyển. Nếu đơn hàng có sản phẩm sắp phát hành, Dật Lạc sẽ ưu tiên giao
            những sản phẩm có hàng trước cho Quý khách hàng.
          </p>
          <ul className=" italic text-xs  space-y-2">
            <p className="font-semibold">*Lưu ý:</p>
            <li>
              Trong một số trường hợp, hàng nằm không có sẵn tại kho gần nhất, thời gian giao hàng
              có thể chậm hơn so với dự kiến do điều hàng. Các phí vận chuyển phát sinh, Dật Lạc sẽ
              hỗ trợ hoàn toàn.
            </li>
            <li>
              Ngày làm việc là từ thứ hai đến thứ sau, không tính thứ bảy, chủ nhật và ngày nghỉ lễ,
              tết, nghỉ bù, và không bao gồm các tuyến huyện đảo xa.
            </li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-semibold">2. Bảng giá phi vận chuyển</h3>
        <div className="overflow-x-auto w-full pl-6">
          <table className=" text-left border-zinc-700 rounded-md  w-fit">
            <thead className=" text-sm uppercase font-medium border border-zinc-700">
              <tr>
                <th className="px-4 py-3">Khu vực giao</th>
                <th className="px-4 py-3">Phí vận chuyển</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-zinc-700 border border-zinc-700">
              {shippingFees.map((fee, index) => (
                <tr key={fee.id ?? index}>
                  <td className="px-4 py-3">{fee.province}</td>
                  <td className="px-4 py-3">
                    {fee.fee?.toLocaleString()} VNĐ / {(fee.weight ?? 0) / 1000}kg
                    {fee.surcharge && fee.surchargeUnit
                      ? ` (+${fee.surcharge.toLocaleString()} VNĐ mỗi ${
                          fee.surchargeUnit ?? 0
                        }g tiếp theo)`
                      : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pl-6">
            <p className="text-sm text-gray-600 mt-3">
              * Quý khách kiểm tra phí vận chuyển tại bước <strong>“Thanh toán”</strong>.
            </p>
            <p className="text-sm text-gray-600">
              *Lưu ý: Phụ thu áp dụng khi khối lượng vượt quá giới hạn mặc định.
            </p>
          </div>
        </div>
      </section>
      <section className="space-y-2">
        <h3 className="font-semibold">3. Một số lưu ý khi nhận hàng:</h3>
        <ul className="list-disc pl-12 text-sm">
          <li>
            Trước khi tiến hành giao hàng cho Quý khách, bưu tá của Đối tác vận chuyển sẽ liên hệ
            qua số điện thoại của Quý khách trước khoảng 3 đến 5 phút để xác nhận giao hàng.
          </li>
          <li>
            Nếu Quý khách không thể có mặt trong đợt nhận hàng thứ nhất, Dật Lạc sẽ cố gắng liên lạc
            lại thêm ít nhất 2 lần nữa (trong 02 ca giao hàng khác nhau) để sắp xếp thời gian giao
            hàng, Quý khách vui lòng để ý điện thoại để liên hệ được với bưu tá giao hàng.
          </li>
          <li>
            Nếu qua 3 lần liên hệ giao hàng, Dật Lạc vẫn không thể liên lạc được với Quý khách để
            giao hàng, Dật Lạc sẽ thông báo cho Quý khách về việc hủy đơn hàng.
          </li>
          <li>
            Trong trường hợp Quý khách không đồng ý nhận hàng với xuất phát nguyên nhân từ hàng hóa
            của Dật Lạc không đảm bảo, không đúng như mô tả, giao trễ so với cam kết,... Đơn hàng
            của Quý khách sẽ được hoàn lại cho chúng tôi và được hủy trên hệ thống Dật Lạc. Nếu Quý
            khách đã thanh toán trước cho đơn hàng, Quý khách sẽ nhận lại tiền vào tài khoản trong
            vòng 5 - 7 ngày làm việc, phụ thuộc vào tiến độ xử lý của ngân hàng. Số tiền Quý khách
            nhận lại sẽ là toàn bộ số tiền đã thanh toán cho đơn hàng (bao gồm phí vận chuyển).
          </li>
          <li>
            Trong trường hợp đơn hàng đang giao đến Quý khách có ngoại quan bên ngoài hộp hàng hóa
            có dấu hiệu bị rách, móp, ướt, thủng, mất niêm phong,…Quý khách vui lòng kiểm tra kỹ
            chất lượng sản phẩm bên trong trước khi nhận hàng. Quý khách hoàn toàn có quyền từ chối
            nhận hàng và báo về cho chúng tôi qua hotline 1900 1234 để được hỗ trợ giao lại đơn hàng
            mới hoặc hủy đơn hàng, hoàn tiền.
          </li>
          <li>
            Trong trường hợp Quý khách không có nhu cầu nhận hàng, Quý khách có thể báo với bên vận
            chuyển và/hoặc CSKH (qua Hotline 1900 1234) về việc này. Đơn hàng của Quý khách sẽ được
            hoàn lại cho chúng tôi và được hủy trên hệ thống.
          </li>
          <li>
            Trường hợp phát sinh chậm trễ trong việc giao hàng, nếu Quý khách không còn nhu cầu nhận
            hàng, Dật Lạc cam kết sẽ hỗ trợ Quý khách hủy đơn hàng, nếu Quý khách đã thanh toán
            trước cho đơn hàng, Quý khách sẽ nhận lại tiền vào tài khoản trong vòng 5 - 7 ngày làm
            việc, phụ thuộc vào tiến độ xử lý của ngân hàng. Số tiền Quý khách nhận lại sẽ là toàn
            bộ số tiền đã thanh toán cho đơn hàng (bao gồm phí vận chuyển).
          </li>
          <li>
            Sản phẩm được đóng gói theo tiêu chuẩn đóng gói của Dật Lạc, nếu Quý khách có nhu cầu
            đóng gói đặc biệt khác, vui lòng báo trước cho chúng tôi khi đặt hàng hàng và cho phép
            chúng tôi được tính thêm phí cho nhu cầu đặc biệt này.
          </li>
          <li>
            Mọi thông tin về việc thay đổi sản phẩm hay hủy bỏ đơn hàng, đề nghị Quý khách thông báo
            sớm để Dật Lạc có thể điều chỉnh lại đơn hàng. Quý khách có thể liên hệ với chúng tôi
            qua số điện thoại hotline: 1900 1234 hoặc qua địa chỉ email cskh@datlac.vn.
          </li>
        </ul>
      </section>
      <section className="space-y-2">
        <h3 className="font-semibold">4. Tra cứu thông tin vận chuyển đơn hàng:</h3>

        <p className="text-sm pl-4">
          Quý khách hoàn toàn có thể tự tra cứu thông tin lộ trình vận chuyển Đơn hàng bằng 02 cách
          sau đây:
        </p>
        <ul className="list-disc pl-12 text-sm">
          <li>Quý khách tự truy cập trang web nhập mã đơn hàng để tiến hành tra cứu.</li>
          <li>
            Quý khách liên hệ với bộ phận chăm sóc khách hàng của Dật Lạc qua hotline 1900 1234 để
            được hỗ trợ tra cứu tình hình vận chuyển đơn hàng.
          </li>
        </ul>
      </section>
    </div>
  );
}
