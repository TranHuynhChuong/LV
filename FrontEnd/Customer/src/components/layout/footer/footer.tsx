import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t h-fit">
      <div className="container w-full mx-auto h-fit">
        <div className="">
          <div className="grid grid-cols-2 gap-6 px-4 pt-6 pb-10">
            <div className="space-y-2">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-3xl font-bold">DẬT LẠC</span>
              </Link>
              <p className="text-sm ">
                Nền tảng mua sắm thân thiện, tiện lợi và cam kết phục vụ khách hàng tận tâm.
              </p>
              <p className="text-sm ">
                <strong>Địa chỉ:</strong> 387 - 389 Hai Bà Trưng, P. Võ Thị Sáu, Q.3, TP.HCM
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 font-semibold">Hỗ trợ</h3>
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
                <h3 className="mb-3 font-semibold">Dịch vụ</h3>
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
              <div className="mt-10 text-sm">
                <strong>Email:</strong>
                <a href="mailto:cskh@datlac.vn" className="hover:underline">
                  cskh@datlac.vn
                </a>
              </div>
              <div className="mt-10 text-sm">
                <strong>Hotline:</strong>
                <a href="tel:19001234" className="hover:underline">
                  1900 1234
                </a>
              </div>
            </div>
          </div>
          <div className="py-4 text-xs text-center border-t">
            © {new Date().getFullYear()} Dật Lạc. Đã đăng ký bản quyền.
          </div>
        </div>
      </div>
    </footer>
  );
}
