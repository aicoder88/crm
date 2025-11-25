import { test, expect } from '@playwright/test';

test.describe('Invoices', () => {
    test.beforeEach(async ({ page }) => {
        // Login first
        await page.goto('/login');
        await page.fill('[name="email"]', process.env.TEST_EMAIL || 'test@example.com');
        await page.fill('[name="password"]', process.env.TEST_PASSWORD || 'password123');
        await page.click('button[type="submit"]');
        await page.waitForURL(/\/(dashboard|invoices)/);
    });

    test('should display invoices page', async ({ page }) => {
        await page.goto('/invoices');
        
        // Check page elements
        await expect(page.getByRole('heading', { name: 'Invoices' })).toBeVisible();
        await expect(page.getByRole('button', { name: /create invoice/i })).toBeVisible();
        
        // Check for invoice stats/metrics
        await expect(page.getByText(/total/i)).toBeVisible();
        await expect(page.getByText(/pending/i)).toBeVisible();
    });

    test('should create a new invoice', async ({ page }) => {
        await page.goto('/invoices/new');
        
        // Select customer
        await page.click('[data-testid="customer-select"]');
        await page.click('[data-testid="customer-option"]');
        
        // Add invoice items
        await page.click('[data-testid="add-item-button"]');
        
        // Fill first item
        await page.fill('[name="items.0.description"]', 'Premium Cat Food');
        await page.fill('[name="items.0.quantity"]', '2');
        await page.fill('[name="items.0.unit_price"]', '25.99');
        
        // Add another item
        await page.click('[data-testid="add-item-button"]');
        await page.fill('[name="items.1.description"]', 'Cat Toy');
        await page.fill('[name="items.1.quantity"]', '1');
        await page.fill('[name="items.1.unit_price"]', '12.50');
        
        // Set due date
        const dueDateInput = page.locator('[name="due_date"]');
        await dueDateInput.fill('2024-12-31');
        
        // Add notes
        await page.fill('[name="notes"]', 'Thank you for your business!');
        
        // Save invoice
        await page.click('button[type="submit"]');
        
        // Should redirect to invoices list
        await expect(page).toHaveURL(/\/invoices$/);
        
        // Should show success message
        await expect(page.getByText(/invoice created/i)).toBeVisible();
    });

    test('should view invoice details', async ({ page }) => {
        await page.goto('/invoices');
        
        // Click on first invoice in table
        const firstInvoiceRow = page.locator('table tbody tr').first();
        await firstInvoiceRow.click();
        
        // Should navigate to invoice detail page
        await expect(page).toHaveURL(/\/invoices\/[^\/]+$/);
        
        // Check invoice details
        await expect(page.getByText(/invoice #/i)).toBeVisible();
        await expect(page.getByText(/customer/i)).toBeVisible();
        await expect(page.getByText(/total/i)).toBeVisible();
        
        // Check for action buttons
        await expect(page.getByRole('button', { name: /send/i })).toBeVisible();
        await expect(page.getByRole('button', { name: /edit/i })).toBeVisible();
    });

    test('should send invoice', async ({ page }) => {
        await page.goto('/invoices');
        
        // Find a draft invoice
        const draftInvoice = page.locator('tr:has(td:has-text("Draft"))').first();
        
        if (await draftInvoice.isVisible()) {
            await draftInvoice.click();
            
            // Click send button
            await page.click('button:has-text("Send")');
            
            // Should show confirmation dialog
            await expect(page.getByText(/send this invoice/i)).toBeVisible();
            
            // Confirm send
            await page.click('button:has-text("Send Invoice")');
            
            // Should show success message
            await expect(page.getByText(/invoice sent/i)).toBeVisible();
            
            // Status should update
            await expect(page.getByText('Sent')).toBeVisible();
        }
    });

    test('should edit invoice', async ({ page }) => {
        await page.goto('/invoices');
        
        // Find a draft invoice and click edit
        const draftInvoice = page.locator('tr:has(td:has-text("Draft"))').first();
        
        if (await draftInvoice.isVisible()) {
            await draftInvoice.click();
            await page.click('[data-testid="edit-invoice"]');
            
            // Should navigate to edit page
            await expect(page).toHaveURL(/\/invoices\/[^\/]+\/edit$/);
            
            // Update notes
            const notesField = page.locator('[name="notes"]');
            await notesField.clear();
            await notesField.fill('Updated notes for this invoice');
            
            // Save changes
            await page.click('button[type="submit"]');
            
            // Should show success message
            await expect(page.getByText(/invoice updated/i)).toBeVisible();
        }
    });

    test('should filter invoices by status', async ({ page }) => {
        await page.goto('/invoices');
        
        // Find status filter dropdown
        const statusFilter = page.locator('[data-testid="status-filter"]');
        
        if (await statusFilter.isVisible()) {
            // Filter by paid invoices
            await statusFilter.selectOption('paid');
            
            // Wait for filter to apply
            await page.waitForTimeout(1000);
            
            // Check that only paid invoices are shown
            const invoiceRows = page.locator('table tbody tr');
            const rowCount = await invoiceRows.count();
            
            for (let i = 0; i < rowCount; i++) {
                const row = invoiceRows.nth(i);
                await expect(row).toContainText('Paid');
            }
        }
    });

    test('should calculate invoice totals correctly', async ({ page }) => {
        await page.goto('/invoices/new');
        
        // Select customer
        await page.click('[data-testid="customer-select"]');
        await page.click('[data-testid="customer-option"]');
        
        // Add item with known values
        await page.click('[data-testid="add-item-button"]');
        await page.fill('[name="items.0.quantity"]', '3');
        await page.fill('[name="items.0.unit_price"]', '10.00');
        
        // Check that total is calculated (3 * $10.00 = $30.00)
        await expect(page.getByText('$30.00')).toBeVisible();
        
        // Add tax if applicable
        const taxField = page.locator('[name="tax"]');
        if (await taxField.isVisible()) {
            await taxField.fill('3.90'); // 13% tax on $30
            
            // Check final total ($30.00 + $3.90 = $33.90)
            await expect(page.getByText('$33.90')).toBeVisible();
        }
    });

    test('should validate required fields', async ({ page }) => {
        await page.goto('/invoices/new');
        
        // Try to submit without customer
        await page.click('button[type="submit"]');
        
        // Should show validation error
        await expect(page.getByText(/customer is required/i)).toBeVisible();
        
        // Select customer but don't add items
        await page.click('[data-testid="customer-select"]');
        await page.click('[data-testid="customer-option"]');
        
        await page.click('button[type="submit"]');
        
        // Should show error about missing items
        await expect(page.getByText(/at least one item/i)).toBeVisible();
    });
});