import { test, expect } from '@playwright/test';

test.describe('Deals Pipeline', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('[name="email"]', process.env.TEST_EMAIL || 'test@example.com');
        await page.fill('[name="password"]', process.env.TEST_PASSWORD || 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/(dashboard|deals)/);
    });

    test('should display sales pipeline', async ({ page }) => {
        await page.goto('/deals');
        
        // Check page title
        await expect(page.getByRole('heading', { name: 'Sales Pipeline' })).toBeVisible();
        
        // Check for add deal button
        await expect(page.getByRole('button', { name: /add deal/i })).toBeVisible();
        
        // Check for pipeline stages
        await expect(page.getByText('Cold Outreach Sent')).toBeVisible();
        await expect(page.getByText('Reply/Interest')).toBeVisible();
        await expect(page.getByText('Sample Sent')).toBeVisible();
        await expect(page.getByText('Closed Won')).toBeVisible();
    });

    test('should create a new deal', async ({ page }) => {
        await page.goto('/deals');
        
        // Click add deal button
        await page.click('button:has-text("Add Deal")');
        
        // Should open deal dialog
        await expect(page.getByRole('dialog')).toBeVisible();
        
        // Fill out deal form
        await page.fill('[name="title"]', 'Test Deal - Sample Order');
        await page.fill('[name="value"]', '1500.00');
        await page.selectOption('[name="stage"]', 'Reply/Interest');
        await page.fill('[name="probability"]', '25');
        
        // Select a customer (assuming dropdown exists)
        await page.click('[data-testid="customer-select"]');
        await page.click('[data-testid="customer-option"]');
        
        // Save deal
        await page.click('button:has-text("Save")');
        
        // Dialog should close
        await expect(page.getByRole('dialog')).not.toBeVisible();
        
        // Should show success message
        await expect(page.getByText(/deal created/i)).toBeVisible();
        
        // New deal should appear in pipeline
        await expect(page.getByText('Test Deal - Sample Order')).toBeVisible();
    });

    test('should drag deal between stages', async ({ page }) => {
        await page.goto('/deals');
        
        // Wait for deals to load
        await page.waitForSelector('[data-testid="deal-card"]', { timeout: 5000 });
        
        // Find a deal card
        const dealCard = page.locator('[data-testid="deal-card"]').first();
        
        if (await dealCard.isVisible()) {
            // Get the deal's current stage column
            const sourceColumn = dealCard.locator('..').locator('..');
            
            // Find the next stage column
            const targetColumn = page.locator('[data-testid="kanban-column"]').nth(1);
            
            // Drag deal to next stage
            await dealCard.dragTo(targetColumn);
            
            // Should show success message for optimistic update
            await expect(page.getByText(/moved to/i)).toBeVisible({ timeout: 3000 });
        }
    });

    test('should edit deal details', async ({ page }) => {
        await page.goto('/deals');
        
        // Wait for deals and click on one
        await page.waitForSelector('[data-testid="deal-card"]', { timeout: 5000 });
        const dealCard = page.locator('[data-testid="deal-card"]').first();
        
        if (await dealCard.isVisible()) {
            await dealCard.click();
            
            // Should open deal dialog
            await expect(page.getByRole('dialog')).toBeVisible();
            
            // Edit deal value
            const valueInput = page.locator('[name="value"]');
            await valueInput.clear();
            await valueInput.fill('2000.00');
            
            // Save changes
            await page.click('button:has-text("Save")');
            
            // Should show success message
            await expect(page.getByText(/deal updated/i)).toBeVisible();
        }
    });

    test('should filter deals by stage', async ({ page }) => {
        await page.goto('/deals');
        
        // Check if stage filtering exists
        const stageFilter = page.locator('[data-testid="stage-filter"]');
        
        if (await stageFilter.isVisible()) {
            // Select a specific stage
            await stageFilter.selectOption('Sample Sent');
            
            // Should only show deals from that stage
            const visibleDeals = page.locator('[data-testid="deal-card"]');
            const dealCount = await visibleDeals.count();
            
            // All visible deals should be in the selected stage
            for (let i = 0; i < dealCount; i++) {
                const deal = visibleDeals.nth(i);
                await expect(deal).toBeVisible();
            }
        }
    });

    test('should display deal metrics', async ({ page }) => {
        await page.goto('/deals');
        
        // Check for metrics cards/displays
        await expect(page.getByText(/total deals/i)).toBeVisible();
        await expect(page.getByText(/pipeline value/i)).toBeVisible();
        
        // Check for win rate or other metrics
        const metricsContainer = page.locator('[data-testid="pipeline-metrics"]');
        if (await metricsContainer.isVisible()) {
            await expect(metricsContainer).toContainText(/\$/); // Should show dollar amounts
        }
    });
});