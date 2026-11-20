/*
 * NỘI DUNG TRANG — chỉ cần sửa file này, không phải đụng tới HTML/CSS/JS khác.
 *
 * Tách riêng ra đây vì người sửa nội dung (tên các chú, lời chúc, video) thường không phải người
 * viết code: sửa nhầm 1 dấu ngoặc trong main.js là hỏng cả trang, còn ở đây chỉ là danh sách chữ.
 * Lưu ý khi sửa: mỗi dòng chữ nằm trong dấu nháy "...", các mục cách nhau bằng dấu phẩy.
 */
window.LOI_CHUC = {
  // Hiện ở cuối lá thư. Để "" nếu không muốn ghi tên đơn vị.
  donVi: "",
  kyTen: "Các chú bộ đội",

  // Khi mở link không kèm ?ten=... thì trang gọi người xem như thế này.
  nguoiNhanMacDinh: "các cô giáo mầm non",

  // Lá thư — mỗi chuỗi là 1 đoạn, hiện ra theo kiểu đang gõ chữ.
  thu: [
    "Hôm nay là ngày 20 tháng 11 — Ngày Nhà giáo Việt Nam. Từ nơi đóng quân, các chú bộ đội xin gửi tới cô lời chúc mừng chân thành nhất.",
    "Các chú biết nghề cô giáo mầm non vất vả lắm: dậy từ sớm đón các bé, dỗ bạn khóc nhè, đút bạn ăn chậm, ru bạn ngủ trưa, rồi lại tập cho các bé từng bài hát, từng nét vẽ. Có hôm về nhà giọng đã khàn mà cô vẫn mỉm cười.",
    "Nếu các chú giữ bình yên cho đất nước, thì các cô giữ bình yên cho những tâm hồn bé nhỏ nhất. Cảm ơn cô đã là người mẹ thứ hai của biết bao em nhỏ.",
    "Chúc cô luôn khỏe mạnh, xinh đẹp, hạnh phúc và mãi yêu nghề như ngày đầu đứng lớp!"
  ],

  // Câu hiện trong bong bóng khi chạm vào các chú ở đầu trang (xoay vòng lần lượt).
  chaoHoi: [
    "Chào cô ạ!",
    "Chúc cô 20/11 vui vẻ!",
    "Cô vất vả rồi ạ!",
    "Các bé ngoan là nhờ cô!",
    "Chúc cô luôn xinh đẹp!",
    "Cả đơn vị gửi lời chào cô!"
  ],

  // Phụ đề 4 cảnh của "thước phim nhỏ" (hình vẽ cố định theo thứ tự: đêm biên cương →
  // nhớ trường mầm non → cô ươm mầm → tặng hoa 20/11).
  phim: [
    "Nơi biên cương lộng gió, các chú vẫn ngày đêm canh giữ bình yên…",
    "…và vẫn luôn nhớ về những mái trường mầm non, nơi có các cô hiền như mẹ.",
    "Mỗi ngày, cô kiên nhẫn ươm những mầm non bé bỏng thành cây xanh.",
    "Các chú kính chúc cô một ngày 20/11 thật trọn vẹn!"
  ],

  // Thư tay từng chú — thêm/bớt thoải mái, mỗi chú 1 cặp { ten, loiChuc }.
  cacChu: [
    { ten: "Chú Tân", loiChuc: "Chúc cô luôn tươi tắn như những bông hoa trong lớp, để sáng nào các bé đến trường cũng được thấy cô cười." },
    { ten: "Chú Ngọc", loiChuc: "Ngoài thao trường các chú tập nghiêm, trong lớp cô dạy các bé ngoan. Mỗi người một mặt trận — chúc cô luôn vững vàng!" },
    { ten: "Chú Lộc", loiChuc: "Cảm ơn cô đã kiên nhẫn với những bạn nhỏ khóc nhè, ăn chậm, ngủ trễ. Chúc cô 20/11 thật nhiều niềm vui." },
    { ten: "Chú Thân", loiChuc: "Chúc cô giáo mầm non sức khỏe dồi dào, giọng hát luôn trong và trái tim luôn ấm áp." },
    { ten: "Chú Đạt", loiChuc: "Các chú gác súng nơi biên cương, cô giữ ấm những giấc ngủ trưa. Chúc cô một ngày Nhà giáo thật hạnh phúc!" },
    { ten: "Chú Ninh", loiChuc: "Gửi cô một cái chào thật nghiêm trang và một lời chúc thật dịu dàng: 20/11 vui vẻ, cô nhé!" }
  ],

  // Hộp quà bí mật — trang bốc ngẫu nhiên 3 món mỗi lần xem.
  quaBiMat: [
    { tieuDe: "Một bó hoa thật to", noiDung: "Bó hoa đẹp nhất thao trường — không bao giờ héo vì được tưới bằng lòng biết ơn của các chú." },
    { tieuDe: "Một tràng pháo tay", noiDung: "Cả đơn vị đứng nghiêm, vỗ tay thật to: cảm ơn cô đã chăm từng bữa ăn, giấc ngủ cho các bé!" },
    { tieuDe: "Một lời hứa", noiDung: "Các chú hứa giữ vững bình yên nơi biên cương để cô yên tâm ươm mầm cho những mầm non của đất nước." },
    { tieuDe: "Một phiếu bé ngoan", noiDung: "Tặng cô một phiếu bé ngoan to nhất — vì cô đã kiên nhẫn dỗ dành cả lớp mỗi ngày." },
    { tieuDe: "Một cái chào nghiêm trang", noiDung: "Nghiêm! Chào cô! Đây là cái chào kính trọng nhất mà các chú dành cho người giáo viên." }
  ],

  /*
   * Video lời chúc thật (quay bằng điện thoại). Để trống [] thì trang tự ẩn mục này.
   * Hai cách thêm:
   *  1) File trong repo:  { tieuDe: "Lời chúc của tiểu đội 1", file: "assets/video/loi-chuc-1.mp4" }
   *     (GitHub giới hạn 25MB/file khi tải lên bằng web — nén video trước, xem README)
   *  2) YouTube (đăng ở chế độ "Không công khai"):  { tieuDe: "Cả đơn vị hát tặng cô", youtube: "MÃ_VIDEO" }
   *     MÃ_VIDEO là phần sau "v=" trong link, vd youtube.com/watch?v=abc123XYZ → "abc123XYZ"
   * Có thể thêm  poster: "assets/video/anh-bia-1.jpg"  để có ảnh bìa trước khi bấm phát.
   */
  video: [],

  /*
   * Nhạc nền: đặt file mp3 vào assets/audio/ rồi ghi đường dẫn, vd "assets/audio/nhac-nen.mp3".
   * Để "" thì trang tự chơi một giai điệu hộp nhạc tạo bằng code (không cần file, không lo bản quyền).
   */
  nhacNen: ""
};
