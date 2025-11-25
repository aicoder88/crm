import { test, expect } from '@playwright/test';

test.describe('Customers', () => {
    test.beforeEach(async ({ page }) => {
        // Login first - you'll need to update with actual credentials
        await page.goto('/login');
        await page.fill('[name="email"]', process.env.TEST_EMAIL || 'test@example.com');
        await page.fill('[name="password"]', process.env.TEST_PASSWORD || 'password123');
        await page.click('button[type="submit"]');
        
        // Wait for navigation to dashboard or customers page
        await page.waitForURL(/\/(dashboard|customers)/);
    });

    test('should display customers page', async ({ page }) => {
        await page.goto('/customers');
        
        // Check page title and heading
        await expect(page.getByRole('heading', { name: 'Customers' })).toBeVisible();
        
        // Check for add customer button
        await expect(page.getByRole('button', { name: /add customer/i })).toBeVisible();
        
        // Check for import button
        await expect(page.getByRole('button', { name: /import csv/i })).toBeVisible();
    });

    test('should create a new customer', async ({ page }) => {
        await page.goto('/customers/new');
        
        // Fill out customer form
        await page.fill('[name="store_name"]', 'Test Pet Store');
        await page.selectOption('[name="status"]', 'Qualified');
        await page.fill('[name="email"]', 'test@petstore.com');
        await page.fill('[name="phone"]', '(416) 555-0123');
        await page.fill('[name="city"]', 'Toronto');
        await page.selectOption('[name="province"]', 'ON');
        await page.fill('[name="postal_code"]', 'K1A 0A6');
        
        // Submit form
        await page.click('button[type="submit"]');
        
        // Should redirect to customers list
        await expect(page).toHaveURL(/\/customers$/);
        
        // Should show success message
        await expect(page.getByText('Customer created successfully')).toBeVisible();
    });

    test('should edit an existing customer', async ({ page }) => {
        await page.goto('/customers');
        
        // Find and click on first customer in table
        const firstCustomerRow = page.locator('table tbody tr').first();
        await firstCustomerRow.click();
        
        // Should navigate to customer detail page
        await expect(page).toHaveURL(/\/customers\/[^\/]+$/);
        
        // Click edit button
        await page.click('[data-testid="edit-customer"]');
        
        // Should navigate to edit page
        await expect(page).toHaveURL(/\/customers\/[^\/]+\/edit$/);
        
        // Update store name
        const storeNameInput = page.locator('[name="store_name"]');
        await storeNameInput.clear();
        await storeNameInput.fill('Updated Pet Store');
        
        // Submit form
        await page.click('button[type="submit"]');
        
        // Should show success message
        await expect(page.getByText('Customer updated successfully')).toBeVisible();
    });

    test('should search customers', async ({ page }) => {
        await page.goto('/customers');
        
        // Find search input
        const searchInput = page.locator('[placeholder*="Search"]').first();
        
        // Search for a term
        await searchInput.fill('Pet');
        await searchInput.press('Enter');
        
        // Wait for search results
        await page.waitForTimeout(1000);
        
        // Should show filtered results
        const tableRows = page.locator('table tbody tr');
        await expect(tableRows).toHaveCountGreaterThan(0);
    });

    test('should navigate customer pagination', async ({ page }) => {
        await page.goto('/customers');
        
        // Check if pagination exists (only if there are multiple pages)
        const pagination = page.locator('[aria-label="pagination"]');
        
        if (await pagination.isVisible()) {
            // Click next page
            await page.click('button[aria-label="Next page"]');
            
            // URL should change with page parameter
            await expect(page).toHaveURL(/[?&]page=2/);
            
            // Should show different results
            const tableRows = page.locator('table tbody tr');
            await expect(tableRows).toHaveCountGreaterThan(0);
        }
    });

    test('should validate form inputs', async ({ page }) => {
        await page.goto('/customers/new');
        
        // Try to submit empty form
        await page.click('button[type="submit"]');
        
        // Should show validation error for required field
        await expect(page.getByText('Store name must be at least 2 characters')).toBeVisible();
        
        // Fill store name but use invalid phone format
        await page.fill('[name="store_name"]', 'Test Store');
        await page.fill('[name="phone"]', '123-invalid');
        
        await page.click('button[type="submit"]');
        
        // Should show phone validation error
        await expect(page.getByText(/valid phone number/)).toBeVisible();
        
        // Fix phone and try invalid postal code
        await page.fill('[name="phone"]', '(416) 555-0123');
        await page.fill('[name="postal_code"]', 'invalid');
        
        await page.click('button[type="submit"]');
        
        // Should show postal code validation error
        await expect(page.getByText(/valid Canadian postal code/)).toBeVisible();
    });
});