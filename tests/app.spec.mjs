import { test, expect } from '@playwright/test';

const APP_URL = 'http://localhost:3000';

test.describe('Vibe Stopwatch & Timer E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    // Di chuyển tới trang ứng dụng trước mỗi test case
    await page.goto(APP_URL);
  });

  test('[SC-01] Basic Operations - Stopwatch & Lap Analysis', async ({ page }) => {
    // 1. Kiểm tra hiển thị mặc định ban đầu
    const display = page.locator('#stopwatch-display');
    await expect(display).toHaveText('00:00:00.00');

    const startBtn = page.locator('#sw-start-btn');
    const lapBtn = page.locator('#sw-lap-btn');
    const resetBtn = page.locator('#sw-reset-btn');

    await expect(lapBtn).toBeDisabled();

    // 2. Bắt đầu chạy Stopwatch
    await startBtn.click();
    await expect(startBtn).toHaveText('Tạm dừng');
    await expect(lapBtn).toBeEnabled();

    // Chờ một khoảng thời gian ngắn để bộ đếm tăng lên
    await page.waitForTimeout(500);
    const timeAfterStart = await display.innerText();
    expect(timeAfterStart).not.toBe('00:00:00.00');

    // 3. Ghi nhận vòng chạy (Lap 1)
    await lapBtn.click();
    const firstLapRow = page.locator('#laps-list tr').first();
    await expect(firstLapRow).toContainText('Vòng 1');

    // Chờ tiếp và ghi nhận vòng chạy (Lap 2)
    await page.waitForTimeout(600);
    await lapBtn.click();
    
    const lapRows = page.locator('#laps-list tr');
    await expect(lapRows).toHaveCount(2);

    // 4. Tạm dừng Stopwatch
    await startBtn.click();
    await expect(startBtn).toHaveText('Tiếp tục');
    await expect(lapBtn).toBeDisabled();

    // 5. Đặt lại (Reset)
    await resetBtn.click();
    await expect(display).toHaveText('00:00:00.00');
    await expect(lapRows).toHaveCount(0);
    await expect(startBtn).toHaveText('Bắt đầu');
  });

  test('[SC-02] Timer Countdown, Progress Ring & Alarm', async ({ page }) => {
    // Chuyển sang tab Hẹn Giờ
    await page.click('#tab-timer-btn');
    await expect(page.locator('#timer-section')).toHaveClass(/active/);

    // Thiết lập thời gian: 0 giờ, 0 phút, 2 giây để test nhanh
    await page.selectOption('#timer-hours', '0');
    await page.selectOption('#timer-minutes', '0');
    await page.selectOption('#timer-seconds', '2');

    const startBtn = page.locator('#timer-start-btn');
    const cancelBtn = page.locator('#timer-cancel-btn');
    const timerDisplay = page.locator('#timer-display');

    // Bắt đầu đếm ngược
    await startBtn.click();
    await expect(startBtn).toHaveText('Tạm dừng');
    await expect(cancelBtn).toBeEnabled();
    await expect(page.locator('#timer-inputs')).not.toBeVisible();

    // Chờ 2.5 giây để bộ hẹn giờ hoàn thành và kích hoạt chuông báo
    await page.waitForTimeout(2500);

    // Xác nhận trạng thái hoàn thành (Alarm Active)
    await expect(page.locator('.app-container')).toHaveClass(/alarm-active/);
    await expect(startBtn).toHaveText('Xong');

    // Tắt cảnh báo bằng cách nhấn Hủy (Cancel)
    await cancelBtn.click();
    await expect(page.locator('.app-container')).not.toHaveClass(/alarm-active/);
    await expect(page.locator('#timer-inputs')).toBeVisible();
  });

  test('[SC-03] Persistence via LocalStorage', async ({ page }) => {
    // 1. Thao tác trên Stopwatch để tạo trạng thái
    const startBtn = page.locator('#sw-start-btn');
    await startBtn.click();
    await page.waitForTimeout(400);
    await page.locator('#sw-lap-btn').click();
    await startBtn.click(); // Tạm dừng để giữ nguyên giá trị tĩnh dễ so sánh

    const timeBeforeReload = await page.locator('#stopwatch-display').innerText();

    // 2. Tải lại trang (F5)
    await page.reload();

    // 3. Kiểm tra trạng thái khôi phục
    const timeAfterReload = await page.locator('#stopwatch-display').innerText();
    expect(timeAfterReload).toBe(timeBeforeReload);
    await expect(page.locator('#laps-list tr')).toHaveCount(1);
  });

  test('[SC-04] Responsive UI & Mobile Viewport Compatibility', async ({ page }) => {
    // Thiết lập kích thước màn hình di động chuẩn (iPhone 12 Pro)
    await page.setViewportSize({ width: 390, height: 844 });

    // Kiểm tra tính hiển thị của các thành phần cốt lõi
    await expect(page.locator('.app-container')).toBeVisible();
    await expect(page.locator('#tab-stopwatch-btn')).toBeVisible();
    await expect(page.locator('#tab-timer-btn')).toBeVisible();

    // Kiểm tra nút bấm có kích thước chạm tối thiểu dễ dàng trên mobile (>= 44px)
    const startBtnBox = await page.locator('#sw-start-btn').boundingBox();
    expect(startBtnBox.height).toBeGreaterThanOrEqual(44);
  });

});