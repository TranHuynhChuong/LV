import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full h-fit bg-white border-t">
      <div className="container mx-auto w-full h-fit">
        <div className="  ">
          <div className="px-4 pb-10 pt-6 grid grid-cols-2   gap-6">
            {/* Cột 1: Giới thiệu + Logo */}
            <div className="space-y-2">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-3xl font-bold">DẬT LẠC</span>
              </Link>
              <p className="text-sm ">
                Nền tảng mua sắm thân thiện, tiện lợi và cam kết phục vụ khách hàng tận tâm.
              </p>
              <p className="text-sm ">
                <strong>Địa chỉ:</strong> 387 – 389 Hai Bà Trưng, P. Võ Thị Sáu, Q.3, TP.HCM
              </p>
            </div>

            {/* Cột 2: Liên kết */}
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div>
                <h3 className="font-semibold  mb-3">Hỗ trợ</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link className="hover:underline" href="/about-us">
                      Giới thiệu
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:underline" href="/shipping-policy">
                      Chính sách vận chuyển
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold  mb-3">Dịch vụ</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link className="hover:underline" href="/terms-of-service">
                      Điều khoản sử dụng
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:underline" href="/private-policy">
                      Chính sách bảo mật
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="text-sm mt-10">
                <strong>Email:</strong>
                <a href="mailto:cskh@datlac.vn" className="hover:underline">
                  cskh@datlac.vn
                </a>
              </div>
              <div className="text-sm mt-10">
                <strong>Hotline:</strong>
                <a href="tel:19001234" className="hover:underline">
                  1900 1234
                </a>
              </div>
            </div>
          </div>

          {/* Dòng bản quyền */}
          <div className="text-center text-xs py-4 border-t">
            © {new Date().getFullYear()} Dật Lạc. Đã đăng ký bản quyền.
          </div>
        </div>
      </div>
    </footer>
  );
}
