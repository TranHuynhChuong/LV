import Image from 'next/image';

export default function AboutUsPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6 text-zinc-800 bg-white rounded-md border shadow">
      {/* Tiêu đề */}
      <h1 className="text-2xl font-bold text-center text-zinc-900">Dật Lạc</h1>

      {/* Giới thiệu */}
      <section className="space-y-4 text-justify text-sm">
        <h2 className="text-lg font-semibold ">Giới thiệu</h2>
        <div className="flex space-x-5">
          <div className="space-y-4">
            <p>
              Để xây dựng Thương hiệu mạnh, một trong những định hướng quan trọng hàng đầu của
              FAHASA là chiến lược phát triển nguồn nhân lực - mấu chốt của mọi sự thành công.
            </p>
            <p>
              Dật Lạc là nhà sách trực tuyến với sứ mệnh lan tỏa tri thức và nuôi dưỡng đam mê đọc
              sách trong cộng đồng. Chúng tôi tự hào cung cấp hàng ngàn tựa sách thuộc nhiều thể
              loại, từ văn học, thiếu nhi, đến kỹ năng sống, kinh tế và giáo dục.
            </p>
            <p>
              Với đội ngũ giàu đam mê và kinh nghiệm trong lĩnh vực xuất bản, Dật Lạc mong muốn mang
              đến trải nghiệm mua sắm tiện lợi, uy tín và giá trị cho mọi độc giả.
            </p>
          </div>
          <Image src="/logo/logoName1.png" alt="Logo" width={150} height={50} />
        </div>
      </section>
      {/* Sứ mệnh - Tầm nhìn */}
      <section className="space-y-4 text-sm">
        <h2 className="text-lg font-semibold">Sứ mệnh & Tầm nhìn</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Lan tỏa tình yêu sách đến mọi miền đất nước.</li>
          <li>Trở thành địa chỉ mua sách trực tuyến đáng tin cậy.</li>
          <li>Hỗ trợ tác giả và nhà xuất bản lan tỏa giá trị tri thức.</li>
        </ul>
      </section>

      {/* Lịch sử hình thành */}
      <section className="space-y-4 text-justify text-sm">
        <h2 className="text-lg font-semibold">Hành trình phát triển</h2>
        <p>
          Dật Lạc bắt đầu từ một cửa hàng nhỏ vào năm 2020 với chỉ vài trăm đầu sách. Trải qua hành
          trình phát triển, chúng tôi không ngừng mở rộng danh mục sản phẩm, cải tiến dịch vụ, và
          đầu tư mạnh mẽ vào nền tảng công nghệ để mang đến trải nghiệm tốt nhất cho người dùng.
        </p>
        <p>
          Dật Lạc với hi họng trogn tương lai sẽ trở thành lựa chọn tin cậy cho cộng đồng yêu sách
          khắp cả nước.
        </p>
      </section>

      {/* Thông tin liên hệ */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-zinc-800">Liên hệ</h2>
        <div className="text-zinc-600 space-y-1 text-sm">
          <p>
            <strong>Địa chỉ:</strong> 123 Đường Sách, Quận 1, TP. Hồ Chí Minh
          </p>
          <p>
            <strong>Email:</strong>
            <p>hotro@datlac.vn</p>
          </p>
          <p>
            <strong>Điện thoại:</strong>
            <p>1900 1234</p>
          </p>
          <p>
            <strong>Giờ làm việc:</strong> 8:00 - 20:00 (Thứ 2 - Chủ nhật)
          </p>
        </div>
      </div>

      {/* Lời cảm ơn */}
      <section className="bg-zinc-100 p-6 rounded-lg shadow-sm text-center">
        <h3 className="text-lg font-medium mb-2">Trân trọng cảm ơn quý khách hàng</h3>
        <p>
          Cảm ơn bạn đã đồng hành cùng Dật Lạc trên hành trình lan tỏa tri thức. Chúng tôi cam kết
          luôn nỗ lực để mang lại giá trị thiết thực và trải nghiệm tuyệt vời cho từng khách hàng.
        </p>
      </section>
    </div>
  );
}
