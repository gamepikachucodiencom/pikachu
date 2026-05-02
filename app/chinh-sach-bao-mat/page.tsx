import AppLayout from '@/components/layout/AppLayout';
import { generateMetadata as getSeoMeta } from '@/lib/seo/metadata';

export const generateMetadata = () => getSeoMeta('/chinh-sach-bao-mat');

export default function BaoMatPage() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6 md:p-12 text-gray-200">
        <h1 className="text-3xl font-bold mb-6 text-yellow-400 border-b border-gray-700 pb-4">
          Chính Sách Bảo Mật
        </h1>

        <div className="space-y-6 leading-relaxed text-lg">
          <p>
            Sự riêng tư của người chơi là ưu tiên hàng đầu tại{' '}
            <strong>Game Pikachu Cổ Điển</strong>. Chính sách bảo mật này giải
            thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin của bạn
            khi truy cập trang web <code>gamepikachucodien.com</code>.
          </p>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              1. Thông tin chúng tôi thu thập
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Dữ liệu không định danh:</strong> Trang web cung cấp
                trải nghiệm chơi game miễn phí mà không yêu cầu bạn phải tạo tài
                khoản hay cung cấp thông tin cá nhân (như tên, số điện thoại,
                địa chỉ).
              </li>
              <li>
                <strong>Dữ liệu cục bộ (Local Storage/Cookies):</strong> Chúng
                tôi sử dụng Local Storage của trình duyệt để lưu trữ tạm thời
                các cài đặt của bạn (ví dụ: trạng thái bật/tắt âm thanh, điểm số
                cao nhất, theme đang chơi). Dữ liệu này chỉ lưu trên máy của bạn
                và chúng tôi không thu thập chúng về máy chủ.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              2. Công cụ phân tích (Analytics)
            </h2>
            <p>
              Chúng tôi có thể sử dụng các công cụ phân tích bên thứ ba (như
              Google Analytics, Vercel Analytics) để theo dõi lưu lượng truy cập
              và hành vi người dùng trên trang web. Các thông tin này hoàn toàn
              ẩn danh (bao gồm địa chỉ IP đã được mã hóa, loại trình duyệt, thời
              gian truy cập) nhằm mục đích cải thiện hiệu suất web và trải
              nghiệm người dùng.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              3. Quảng cáo và Liên kết bên thứ ba
            </h2>
            <p>
              Trang web có thể hiển thị quảng cáo từ các đối tác bên thứ ba (ví
              dụ: Google AdSense). Các đối tác này có thể sử dụng cookie để hiển
              thị quảng cáo dựa trên các lượt truy cập trước đó của bạn vào
              trang web của chúng tôi hoặc các trang web khác trên Internet. Bạn
              có thể chọn không tham gia quảng cáo cá nhân hóa bằng cách truy
              cập Cài đặt quảng cáo của Google.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              4. Bảo vệ dữ liệu
            </h2>
            <p>
              Trang web của chúng tôi được bảo mật bằng chứng chỉ SSL (HTTPS),
              giúp mã hóa dữ liệu truyền tải giữa thiết bị của bạn và máy chủ,
              đảm bảo an toàn tối đa cho trải nghiệm lướt web của bạn.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              5. Liên hệ với chúng tôi
            </h2>
            <p>
              Nếu bạn có bất kỳ thắc mắc nào về Chính sách bảo mật này hoặc cần
              hỗ trợ về dữ liệu cá nhân, vui lòng liên hệ với chúng tôi qua
              email:{' '}
              <a
                href="mailto:gamepikachucodien.com@gmail.com"
                className="text-blue-400 hover:underline"
              >
                gamepikachucodien.com@gmail.com
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
