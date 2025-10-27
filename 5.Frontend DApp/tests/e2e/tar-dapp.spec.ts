import { test, expect } from '@playwright/test';

test.describe('TAR DApp E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should display homepage correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/TAR DApp/);
    await expect(page.locator('h1')).toContainText('Tokenized Asset Receipt');
    await expect(page.locator('text=連接錢包')).toBeVisible();
  });

  test('should navigate to verify page', async ({ page }) => {
    await page.click('text=立即驗證');
    await expect(page).toHaveURL(/.*\/verify/);
    await expect(page.locator('h2')).toContainText('驗證收據');
  });

  test('should navigate to my receipts page', async ({ page }) => {
    await page.click('text=我的收據');
    await expect(page).toHaveURL(/.*\/my/);
    await expect(page.locator('h1')).toContainText('我的收據');
  });

  test('should show wallet connection prompt on my page when not connected', async ({ page }) => {
    await page.goto('http://localhost:3000/my');
    await expect(page.locator('text=請先連接錢包')).toBeVisible();
    await expect(page.locator('text=連接您的錢包以查看您擁有的 Tokenized Asset Receipt')).toBeVisible();
  });

  test('should show verification form on verify page', async ({ page }) => {
    await page.goto('http://localhost:3000/verify');
    
    await expect(page.locator('input[placeholder="輸入 Token ID"]')).toBeVisible();
    await expect(page.locator('input[placeholder="輸入元數據哈希"]')).toBeVisible();
    await expect(page.locator('text=驗證收據')).toBeVisible();
  });

  test('should validate verification form', async ({ page }) => {
    await page.goto('http://localhost:3000/verify');
    
    // Try to verify without filling fields
    await page.click('text=驗證收據');
    
    // Should show validation error or not submit
    await expect(page.locator('text=驗證收據')).toBeVisible();
  });

  test('should generate QR code when token ID is provided', async ({ page }) => {
    await page.goto('http://localhost:3000/verify?tokenId=123');
    
    // Wait for QR code to load
    await page.waitForSelector('img[alt="QR Code"]', { timeout: 10000 });
    await expect(page.locator('img[alt="QR Code"]')).toBeVisible();
  });

  test('should show issuer page with authorization check', async ({ page }) => {
    await page.goto('http://localhost:3000/issuer');
    
    // Should redirect or show unauthorized message
    await expect(page.locator('text=未授權訪問')).toBeVisible();
  });

  test('should display responsive design on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await expect(page.locator('h1')).toContainText('Tokenized Asset Receipt');
    await expect(page.locator('text=連接錢包')).toBeVisible();
  });

  test('should handle navigation between pages', async ({ page }) => {
    // Start at homepage
    await expect(page.locator('h1')).toContainText('Tokenized Asset Receipt');
    
    // Navigate to verify
    await page.click('text=立即驗證');
    await expect(page).toHaveURL(/.*\/verify/);
    
    // Navigate back to home
    await page.click('text=返回首頁');
    await expect(page).toHaveURL('http://localhost:3000/');
    
    // Navigate to my receipts
    await page.click('text=我的收據');
    await expect(page).toHaveURL(/.*\/my/);
  });

  test('should display error states gracefully', async ({ page }) => {
    // Test with invalid token ID
    await page.goto('http://localhost:3000/verify?tokenId=999999');
    
    // Should handle error gracefully without crashing
    await expect(page.locator('text=驗證收據')).toBeVisible();
  });
});






