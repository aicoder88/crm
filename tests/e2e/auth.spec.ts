import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test('should login with valid credentials', async ({ page }) => {
        await page.goto('/login');
        
        // Check login page elements
        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
        await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
        await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
        
        // Fill login form
        await page.fill('[name="email"]', process.env.TEST_EMAIL || 'test@example.com');
        await page.fill('[name="password"]', process.env.TEST_PASSWORD || 'password123');
        
        // Submit form
        await page.click('button[type="submit"]');
        
        // Should redirect to dashboard
        await page.waitForURL(/\/(dashboard|customers)/);
        
        // Should show user is logged in
        await expect(page.getByRole('navigation')).toBeVisible();
    });

    test('should show error with invalid credentials', async ({ page }) => {
        await page.goto('/login');
        
        // Fill with invalid credentials
        await page.fill('[name="email"]', 'invalid@example.com');
        await page.fill('[name="password"]', 'wrongpassword');
        
        // Submit form
        await page.click('button[type="submit"]');
        
        // Should show error message
        await expect(page.getByText(/invalid/i)).toBeVisible();
        
        // Should remain on login page
        await expect(page).toHaveURL(/\/login/);
    });

    test('should validate email format', async ({ page }) => {
        await page.goto('/login');
        
        // Fill with invalid email format
        await page.fill('[name="email"]', 'not-an-email');
        await page.fill('[name="password"]', 'password123');
        
        // Submit form
        await page.click('button[type="submit"]');
        
        // Should show validation error
        await expect(page.getByText(/valid email/i)).toBeVisible();
    });

    test('should require both email and password', async ({ page }) => {
        await page.goto('/login');
        
        // Try to submit empty form
        await page.click('button[type="submit"]');
        
        // Should show required field errors
        await expect(page.getByText(/required/i)).toBeVisible();
    });

    test('should logout successfully', async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('[name="email"]', process.env.TEST_EMAIL || 'test@example.com');
        await page.fill('[name="password"]', process.env.TEST_PASSWORD || 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/(dashboard|customers)/);
        
        // Find and click logout button/menu
        const userMenu = page.locator('[data-testid="user-menu"]');
        if (await userMenu.isVisible()) {
            await userMenu.click();
            await page.click('[data-testid="logout-button"]');
        } else {
            // Fallback: look for logout link or button
            await page.click('text=Logout');
        }
        
        // Should redirect to login page
        await page.waitForURL('/login');
        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    });

    test('should redirect to login when accessing protected route', async ({ page }) => {
        // Try to access protected route without login
        await page.goto('/customers');
        
        // Should redirect to login
        await page.waitForURL('/login');
        await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    });

    test('should remember user session', async ({ page, context }) => {
        // Login
        await page.goto('/login');
        await page.fill('[name="email"]', process.env.TEST_EMAIL || 'test@example.com');
        await page.fill('[name="password"]', process.env.TEST_PASSWORD || 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/(dashboard|customers)/);
        
        // Create new page in same context
        const newPage = await context.newPage();
        
        // Should be able to access protected route without login
        await newPage.goto('/customers');
        await expect(newPage.getByRole('heading', { name: 'Customers' })).toBeVisible();
        
        await newPage.close();
    });
});