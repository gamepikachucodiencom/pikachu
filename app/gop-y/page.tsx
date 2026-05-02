import AppLayout from '@/components/layout/AppLayout';
import { generateMetadata as getSeoMeta } from '@/lib/seo/metadata';

export const generateMetadata = () => getSeoMeta('/gop-y');

export default function GopYPage() {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6 md:p-12 text-gray-200">
        <h1 className="text-3xl font-bold mb-6 text-yellow-400 border-b border-gray-700 pb-4">
          Góp Ý & Báo Lỗi
        </h1>

        <div className="space-y-4 leading-relaxed text-lg">
          <p>
            Chào mừng bạn đến với trang Hỗ trợ của{' '}
            <strong>Game Pikachu Cổ Điển</strong>.
          </p>
          <p>
            Chúng tôi luôn nỗ lực không ngừng để mang đến trải nghiệm chơi game
            mượt mà và hoài niệm nhất cho bạn. Tuy nhiên, trong quá trình phát
            triển và vận hành, những lỗi nhỏ là điều không thể tránh khỏi.
          </p>
          <p>
            Nếu bạn gặp bất kỳ vấn đề gì trong lúc chơi game, hoặc có ý tưởng
            tuyệt vời nào muốn đóng góp, đừng ngần ngại cho chúng tôi biết!
          </p>

          <h2 className="text-xl font-bold text-white mt-6">
            Những vấn đề bạn có thể báo cáo:
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Lỗi không load được game hoặc hình ảnh bị lỗi (đen màn hình, mất
              icon).
            </li>
            <li>
              Lỗi thuật toán nối thú (đường đi hợp lệ nhưng không nối được).
            </li>
            <li>Lỗi âm thanh, giật lag trên thiết bị di động.</li>
            <li>Góp ý thêm các giao diện (theme) mới hoặc tính năng mới.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-6">
            Cách thức liên hệ:
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Gửi email trực tiếp:</strong> Xin vui lòng gửi mô tả lỗi
              (kèm theo ảnh chụp màn hình nếu có) về địa chỉ email:{' '}
              <a
                href="mailto:gamepikachucodien.com@gmail.com"
                className="text-blue-400 hover:underline"
              >
                gamepikachucodien.com@gmail.com
              </a>
              .
            </li>
            <li>
              <strong>Thời gian phản hồi:</strong> Đội ngũ quản trị sẽ cố gắng
              kiểm tra và khắc phục lỗi trong vòng 24 - 48 giờ làm việc.
            </li>
          </ul>

          <p className="mt-8 italic text-gray-400">
            Mọi ý kiến đóng góp của bạn đều là động lực to lớn giúp Game Pikachu
            Cổ Điển ngày càng hoàn thiện hơn. Xin chân thành cảm ơn!
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
