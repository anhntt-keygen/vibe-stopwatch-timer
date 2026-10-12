const { test, expect } = require('@playwright/test');

const APP_URL = 'http://localhost:3000';

test.describe('Vibe Stopwatch & Timer E2E Tests', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(APP_URL);
  });

  test('SC-01: Stopwatch basic operations and Lap tracking', async ({ page }) => {
    // Kiểm tra giao diện ban đầu của Stopwatch
    await expect(page.locator('#stopwatch-display')).toHaveText('00:00:00.00');
    
    const startBtn = page.locator('#sw-start-btn');
    const lapBtn = page.locator('#sw-lap-btn');
    const resetBtn = page.locator('#sw-reset-btn');

    await expect(lapBtn).toBeDisabled();

    // Bắt đầu bấm giờ
    await startBtn.click();
    await expect(startBtn).toHaveText('Tạm dừng');
    await expect(lapBtn).toBeEnabled();

    // Chờ một khoảng thời gian ngắn và ghi vòng 1
    await page.waitForTimeout(500);
    await lapBtn.click();

    // Chờ tiếp và ghi vòng 2
    await page.waitForTimeout(600);
    await lapBtn.click();

    // Tạm dừng
    await startBtn.click();
    await expect(startBtn).toHaveText('Tiếp tục');

    // Kiểm tra danh sách vòng chạy đã được ghi nhận
    const lapRows = page.locator('#laps-list tr');
    await expect(lapRows).toHaveCount(2);

    // Đặt lại (Reset)
    await resetBtn.click();
    await expect(page.