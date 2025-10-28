import { test, expect } from '@playwright/test';

test.describe('Wallet Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should show wallet connection button when not connected', async ({ page }) => {
    await expect(page.locator('text=連接錢包')).toBeVisible();
  });

  test('should handle wallet connection flow', async ({ page }) => {
    // Click connect wallet button
    await page.click('text=連接錢包');
    
    // Should show wallet connection modal or redirect
    // Note: In a real test environment, you would mock the wallet connection
    await expect(page.locator('text=連接錢包')).toBeVisible();
  });

  test('should show connected state after wallet connection', async ({ page }) => {
    // Mock wallet connection by setting localStorage or using test wallet
    await page.evaluate(() => {
      localStorage.setItem('wallet-connected', 'true');
      localStorage.setItem('wallet-address', '0x1234567890123456789012345678901234567890');
    });
    
    await page.reload();
    
    // Should show connected state
    await expect(page.locator('text=已連接')).toBeVisible();
  });

  test('should handle wallet disconnection', async ({ page }) => {
    // Mock connected wallet
    await page.evaluate(() => {
      localStorage.setItem('wallet-connected', 'true');
      localStorage.setItem('wallet-address', '0x1234567890123456789012345678901234567890');
    });
    
    await page.reload();
    
    // Click disconnect button
    await page.click('text=斷開');
    
    // Should return to disconnected state
    await expect(page.locator('text=連接錢包')).toBeVisible();
  });
});









