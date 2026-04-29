# Hướng dẫn Tùy chỉnh Giao diện (Styling Guide)

## Giới thiệu

Dự án này sử dụng **Native CSS** (CSS thuần, không dùng framework như Tailwind hay Mantine) để đạt hiệu năng cao (Performance > 95) và tối ưu SEO. Toàn bộ giao diện được chia thành **hai tầng**:

1. **Giao diện chung (Global Theme)** — Màu sắc, font, khoảng cách áp dụng cho cả website.
2. **Giao diện chi tiết (Component Styles)** — Giao diện riêng cho từng thành phần (menu, bàn cờ, nút bấm, v.v.).

Chỉ cần chỉnh đúng tầng, bạn có thể thay đổi giao diện mà không ảnh hưởng phần còn lại.

---

## Phần 1: Giao diện Chung (Global Theme)

### Bảng điều khiển: `app/globals.css`

File `app/globals.css` là **bảng điều khiển** toàn cục. Các biến trong `:root` (như `--color-primary`, `--font-body`) sẽ cập nhật giao diện cho **toàn bộ** ứng dụng.

| Biến                                           | Mô tả                              | Ví dụ giá trị           |
| ---------------------------------------------- | ---------------------------------- | ----------------------- |
| `--color-primary`                              | Màu chủ đạo (viền, nút, nhấn mạnh) | `#8b4513` (nâu)         |
| `--color-secondary`                            | Màu phụ (nền bàn cờ, phụ)          | `#f4a460`               |
| `--color-accent`                               | Màu nhấn (highlights)              | `#d2691e`               |
| `--color-bg-page`                              | Màu nền trang                      | `#faebd7`               |
| `--color-bg-surface`                           | Màu nền thẻ / khối                 | `#fff8dc`               |
| `--color-text-main`                            | Màu chữ chính                      | `#2c1810`               |
| `--color-text-muted`                           | Màu chữ phụ                        | `#5d4037`               |
| `--color-danger`                               | Màu báo lỗi / đỏ                   | `#ef4444`               |
| `--color-success`                              | Màu thành công / xanh              | `#22c55e`               |
| `--font-heading`                               | Font tiêu đề                       | `'Merriweather', serif` |
| `--font-body`                                  | Font nội dung                      | `'Inter', sans-serif`   |
| `--spacing-sm`, `--spacing-md`, `--spacing-lg` | Khoảng cách                        | `8px`, `16px`, `24px`   |
| `--radius-sm`, `--radius-md`, `--radius-lg`    | Bo góc                             | `4px`, `8px`, `12px`    |

### Ví dụ: Đổi màu chủ đạo từ Nâu sang Đỏ

Mở `app/globals.css`, tìm `:root` và sửa:

```css
:root {
  /* Trước (Nâu) */
  --color-primary: #8b4513;

  /* Sau (Đỏ) */
  --color-primary: #b91c1c;
}
```

Lưu file và tải lại trang — màu nút, viền và các chỗ dùng `var(--color-primary)` sẽ chuyển sang đỏ.

---

## Phần 2: Tùy chỉnh Chi tiết (Component Styles)

Các chức năng cụ thể có file CSS riêng trong thư mục tương ứng. Mỗi file dạng `TênComponent.module.css` đi kèm component `TênComponent.tsx`.

### Bảng tra cứu: Vị trí file CSS theo giao diện

| Giao diện cần sửa             | Đường dẫn file CSS                                               | Ghi chú                                          |
| ----------------------------- | ---------------------------------------------------------------- | ------------------------------------------------ |
| **Thanh điều hướng (Navbar)** | `components/layout/Navbar.module.css`                            | Menu trên, nút burger, drawer di động, logo chữ. |
| **Bàn cờ (Board)**            | `components/game/ChessBoard.module.css`                          | Khung và bố cục bàn cờ.                          |
|                               | `components/game/GameBoard.module.css`                           | Bố cục khu vực chơi.                             |
|                               | `components/game/ResponsiveGameContainer.module.css`             | Khung bàn cờ trên mobile/desktop.                |
|                               | `components/pages/OnlineGamePage.module.css` (`.boardContainer`) | Khung bàn cờ trang Chơi Online.                  |
|                               | `components/pages/PlayWithAIPage.module.css` (`.boardContainer`) | Khung bàn cờ trang Chơi với AI.                  |
| **Quân cờ (Piece)**           | `public/assets/themes/default/theme.json`                        | Màu quân, kích thước, font chữ trên quân.        |
|                               | `public/assets/themes/default/board.svg`                         | Hình ảnh bàn cờ.                                 |
|                               | `public/assets/themes/default/pieces/`                           | Hình nền quân, ô đánh dấu nước đi / ăn quân.     |
| **Nút bấm (Buttons)**         | `app/globals.css`                                                | Kiểu mặc định cho thẻ `<button>`.                |
|                               | `components/layout/Navbar.module.css`                            | Nút menu, đăng nhập, đăng ký, burger.            |
|                               | `components/blog/BlogCard.module.css`                            | Nút "Đọc thêm" trên thẻ bài viết.                |
|                               | `components/auth/LoginPage.module.css`                           | Nút đăng nhập, đăng ký trang auth.               |
|                               | `components/pages/HomePage.module.css`                           | Nút CTA, nút chức năng trang chủ.                |
|                               | `components/shop/ShopPage.module.css`                            | Nút trong trang Cửa hàng.                        |
| **Khu vực Admin**             | `components/admin/AdminLayout.module.css`                        | Thanh bên, header, bố cục chung Admin.           |
|                               | `components/admin/AdminDashboard.module.css`                     | Trang Tổng quan Admin.                           |
|                               | `components/admin/UserListPage.module.css`                       | Trang Danh sách người dùng.                      |
|                               | `components/admin/UserDetailPage.module.css`                     | Trang Chi tiết người dùng.                       |
|                               | `components/admin/BlogListPage.module.css`                       | Trang Danh sách bài viết.                        |
|                               | `components/admin/BlogEditPage.module.css`                       | Trang Soạn / Sửa bài viết.                       |
|                               | `components/admin/TransactionLogsPage.module.css`                | Trang Nhật ký giao dịch.                         |

> **Lưu ý:** Quân cờ và bàn cờ in-game được vẽ bằng engine (Pixi.js) theo file trong `public/assets/themes/default/`. Để đổi giao diện bàn cờ / quân cờ, sửa `theme.json` và thay các file SVG trong thư mục đó.

---

## Phần 3: Câu hỏi thường gặp (FAQ)

### Làm sao để đổi Logo?

- **Biểu tượng favicon (tab trình duyệt):** Thay file `app/favicon.ico` bằng ảnh của bạn (nên dùng kích thước 32×32 hoặc 48×48 px).
- **Logo chữ / icon trên Navbar:** Chữ "Cờ Tướng Online" và icon cờ nằm trong `components/layout/Navbar.tsx`. Màu và kiểu chữ do `components/layout/Navbar.module.css` (ví dụ `.logo`, `.logoText`, `.logoIcon`) điều khiển. Nếu muốn dùng ảnh logo, thay phần nội dung trong `Navbar.tsx` bằng thẻ `<img src="/logo.png" />` và đặt file `logo.png` vào thư mục `public/`.

---

### Web có hỗ trợ điện thoại không?

Có. Ứng dụng dùng **Responsive Design**:

- **Khung chung:** Lớp `.container` trong `app/globals.css` có `max-width: 1200px`, căn giữa và `padding` hai bên (`1rem`) để nội dung không dính sát mép màn hình.
- **Bàn cờ:** Các file `ChessBoard`, `ResponsiveGameContainer`, `OnlineGamePage`, `PlayWithAIPage` có `@media` và `max-width` / `100%` để bàn cờ co giãn theo màn hình.
- **Menu di động:** `Navbar.module.css` có kiểu cho drawer và nút burger; khi thu nhỏ màn hình, menu chuyển sang dạng trượt từ bên phải.

---

### Cần chạy lệnh gì sau khi sửa CSS?

- **Khi đang phát triển:** Chạy `npm run dev`. Trình duyệt thường tự tải lại khi bạn lưu file. Nếu không thấy thay đổi, thử **Refresh** (F5 hoặc Cmd+R) hoặc **Hard Reload** (Ctrl+Shift+R / Cmd+Shift+R).
- **Sau khi sửa xong, chuẩn bị đưa lên môi trường thật:** Chạy `npm run build` rồi `npm start` (hoặc deploy bản build) để kiểm tra bản production. CSS đã được tối ưu trong bước build.

---

_Tài liệu này áp dụng cho phiên bản dùng Native CSS và CSS Modules. Khi thêm component hoặc file CSS mới, nên cập nhật bảng tra cứu ở Phần 2._
