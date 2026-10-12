# ⏱️ Vibe Stopwatch & Timer Application

Ứng dụng bấm giờ (Stopwatch) và hẹn giờ (Timer) chuyên nghiệp, hiệu năng cao, được thiết kế theo chuẩn **Vibecode (BMad 6.12.0 & TEA 1.27.2)**. Ứng dụng hỗ trợ ghi nhận vòng chạy (Lap), phân tích vòng chạy nhanh nhất/chậm nhất, đếm ngược trực quan với vòng tròn tiến trình, lưu trữ trạng thái thông minh qua LocalStorage và tương thích hoàn toàn trên mọi thiết bị di động.

---

## 📖 Kịch Bản Nghiệp Vụ (User Scenarios)

- **[SC-01] Nghiệp vụ Bấm giờ (Stopwatch) & Ghi vòng (Lap):**
  - Giao diện hiển thị bộ đếm thời gian chính xác đến phần trăm giây (`00:00:00.00`).
  - Hỗ trợ các chức năng: **Bắt đầu (Start)**, **Tạm dừng (Pause)**, **Ghi vòng (Lap)**, và **Đặt lại (Reset)**.
  - Tự động tính toán và làm nổi bật vòng chạy **Nhanh nhất (Fastest)** bằng màu xanh lá và **Chậm nhất (Slowest)** bằng màu đỏ.
- **[SC-02] Nghiệp vụ Hẹn giờ (Timer/Countdown) & Cảnh báo:**
  - Cho phép thiết lập thời gian đếm ngược trực quan (Giờ, Phút, Giây).
  - Hiển thị vòng tròn tiến trình (Progress Ring) co giãn mượt mà theo thời gian thực.
  - Phát âm thanh cảnh báo (Beep) và nhấp nháy màn hình khi thời gian đếm ngược kết thúc.
- **[SC-03] Lưu trữ Lịch sử & Trạng thái (Persistence):**
  - Tự động lưu trữ trạng thái hiện tại của Stopwatch, danh sách các vòng chạy (Laps) và cấu hình Timer gần nhất vào `LocalStorage`.
  - Khôi phục trạng thái chính xác khi người dùng tải lại trang (F5).
- **[SC-04] Responsive UI và Trải nghiệm Di động:**
  - Giao diện tối giản (Minimalist Dark Mode) hiện đại, tối ưu hóa không gian hiển thị và kích thước nút bấm cho thiết bị di động.

---

## 🛠️ Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Yêu cầu hệ thống
- Cài đặt sẵn **Node.js** (Phiên bản khuyến nghị: `>= 16.x`).

### 2. Cài đặt các thư viện phụ thuộc
Di chuyển vào thư mục dự án và chạy lệnh sau để cài đặt Express server và Playwright (dùng cho kiểm thử tự động):
```bash
npm install
```

### 3. Khởi chạy ứng dụng
Khởi động máy chủ Node.js cục bộ:
```bash
npm start
```
Sau khi khởi chạy thành công, truy cập ứng dụng tại địa chỉ: [http://localhost:3000](http://localhost:3000)

### 4. Chạy kiểm thử tự động (E2E Test)
Để chạy bộ kiểm thử tự động Playwright kiểm tra toàn bộ các kịch bản nghiệp vụ:
```bash
npm test
```

---

## 📂 Cấu Trúc Thư Mục Dự Án
```text
vibe-stopwatch-timer/
├── package.json
├── server.js
├── README.md
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
└── tests/
    └── app.spec.js
```

---