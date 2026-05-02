import AppLayout from '@/components/layout/AppLayout';
import { generateMetadata as getSeoMeta } from '@/lib/seo/metadata';

export const generateMetadata = () => getSeoMeta('/dieu-khoan-su-dung');

export default function DieuKhoanPage() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6 md:p-12 text-gray-200">
        <h1 className="text-3xl font-bold mb-6 text-yellow-400 border-b border-gray-700 pb-4">
          Điều Khoản Sử Dụng
        </h1>

        <div className="space-y-6 leading-relaxed text-lg">
          <p>
            Chào mừng bạn đến với <strong>Game Pikachu Cổ Điển</strong> (truy
            cập tại địa chỉ <code>gamepikachucodien.com</code>). Khi bạn truy
            cập và sử dụng trang web này, đồng nghĩa với việc bạn đã đọc, hiểu
            và đồng ý tuân thủ các điều khoản dưới đây.
          </p>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              1. Mục đích sử dụng
            </h2>
            <p>
              Game Pikachu Cổ Điển là nền tảng cung cấp các trò chơi xếp hình,
              nối thú trực tuyến hoàn toàn miễn phí, nhằm mục đích giải trí. Bạn
              được phép truy cập, trải nghiệm trò chơi trên mọi thiết bị (PC,
              Mobile, Tablet) mà không cần cài đặt.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              2. Trách nhiệm của người chơi
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Bạn đồng ý sử dụng trang web vào mục đích giải trí lành mạnh.
              </li>
              <li>
                Không sử dụng các công cụ, phần mềm thứ 3 (bot, cheat, hack) để
                can thiệp vào mã nguồn, thay đổi kết quả trò chơi hoặc phá hoại
                hệ thống.
              </li>
              <li>
                Không sao chép, chỉnh sửa hoặc phân phối lại mã nguồn, tài
                nguyên hình ảnh của trang web khi chưa có sự cho phép.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              3. Bản quyền và Sở hữu trí tuệ
            </h2>
            <p>
              Các tài nguyên, hình ảnh (bao gồm nhưng không giới hạn ở hình ảnh
              Pokemon, đồ ăn, động vật...) trong trò chơi được lấy cảm hứng từ
              các phiên bản Pikachu cổ điển. Chúng tôi tôn trọng quyền sở hữu
              trí tuệ của các tác giả gốc và không sử dụng cho mục đích thương
              mại hóa bán lẻ tài nguyên. Cốt lõi hệ thống web và mã nguồn thuộc
              bản quyền của Game Pikachu Cổ Điển.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              4. Từ chối trách nhiệm
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Trang web được cung cấp theo hiện trạng "có sẵn". Chúng tôi
                không đảm bảo rằng trò chơi sẽ luôn hoạt động liên tục 100%
                không có lỗi hoặc không bị gián đoạn bởi các sự cố mạng lưới.
              </li>
              <li>
                Chúng tôi không chịu trách nhiệm về việc mất mát dữ liệu điểm
                số, cấp độ chơi (lưu tạm trong trình duyệt của bạn) do việc xóa
                bộ nhớ đệm (cache) hoặc thay đổi thiết bị truy cập.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">
              5. Thay đổi điều khoản
            </h2>
            <p>
              Chúng tôi có quyền thay đổi, chỉnh sửa các Điều khoản sử dụng này
              vào bất kỳ lúc nào mà không cần báo trước. Việc bạn tiếp tục sử
              dụng trang web sau khi có thay đổi đồng nghĩa với việc bạn chấp
              nhận các điều khoản mới đó.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
