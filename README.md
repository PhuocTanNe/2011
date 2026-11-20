# Các chú bộ đội chúc mừng 20/11

Trang web một trang (chỉ có frontend) để các chú bộ đội gửi lời chúc Ngày Nhà giáo Việt Nam 20/11 tới các
cô giáo mầm non. Trang được làm cho điện thoại: tất cả nằm trên một trang, chỉ cần cuộn xuống.

**Nội dung trang:** mở phong bì → các chú chào cô (chạm vào được) → lá thư tự gõ chữ → thước phim hoạt
hình 4 cảnh → video lời chúc → thư tay của từng chú (lật thẻ) → vườn hoa chạm để trồng → 3 hộp quà bí mật →
cô nhắn lại các chú và thả tim → pháo hoa.

Không cần cài đặt hay build gì. Mở thẳng `index.html` bằng trình duyệt là xem được.

## Sửa nội dung

Chỉ cần sửa **`assets/js/config.js`**: tên các chú, lời chúc, lá thư, quà, phụ đề phim, video, nhạc nền.
Mỗi dòng chữ nằm trong dấu nháy `"..."`, các mục cách nhau bằng dấu phẩy.

### Thêm video

- **Video ngắn (dưới 25MB):** chép vào thư mục `assets/video/`, rồi thêm vào `video` trong config:
  `{ tieuDe: "Lời chúc của tiểu đội 1", file: "assets/video/loi-chuc-1.mp4" }`
- **Video dài:** đăng lên YouTube ở chế độ *Không công khai*, lấy mã sau `v=` trong link:
  `{ tieuDe: "Cả đơn vị hát tặng cô", youtube: "abc123XYZ" }`

Nên quay dọc hoặc ngang đều được. Để trang tải nhanh trên 4G, nên nén video về 720p (vd bằng HandBrake,
hoặc chức năng xuất 720p trong CapCut).

### Nhạc nền

Mặc định trang tự chơi một giai điệu hộp nhạc tạo bằng code (không cần file). Muốn dùng bài hát riêng:
chép file mp3 vào `assets/audio/`, rồi sửa `nhacNen: "assets/audio/ten-file.mp3"`.

## Link riêng cho từng cô

Thêm `?ten=Tên` vào cuối link, ví dụ `.../?ten=Lan`. Khi đó trang ghi "Gửi cô giáo Lan".
Ở cuối trang có sẵn ô **"Dành cho người gửi: tạo link riêng cho từng cô"**: nhập tên rồi bấm "Chép link".

## Đưa lên GitHub Pages

1. Tạo repository mới trên GitHub, chọn **Public**.
2. Bấm **Add file → Upload files**, kéo thả `index.html`, `README.md` và cả thư mục `assets`, rồi bấm **Commit changes**.
3. Vào **Settings → Pages**. Ở mục *Source* chọn **Deploy from a branch**, chọn nhánh **main**, thư mục **/ (root)**, rồi bấm **Save**.
4. Đợi 1–2 phút. Link trang có dạng `https://<tên-tài-khoản>.github.io/<tên-repo>/`.

Mỗi lần sửa `config.js` trên GitHub (bấm biểu tượng bút chì ở file), trang sẽ tự cập nhật sau khoảng 1 phút.
