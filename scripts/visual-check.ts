import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function runVisualCheck() {
    const browser = await chromium.launch();
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();

    const baseUrl = 'http://localhost:3000';
    const routes = [
        '/',
        '/dashboard',
        '/customers',
        '/invoices/new', // The page with the fix
        // Add more routes as needed
    ];

    const screenshotDir = path.join(process.cwd(), 'screenshots');
    if (!fs.existsSync(screenshotDir)) {
        fs.mkdirSync(screenshotDir);
    }

    console.log('Starting visual check...');

    for (const route of routes) {
        try {
            const url = `${baseUrl}${route}`;
            console.log(`Navigating to ${url}...`);
            await page.goto(url, { waitUntil: 'networkidle' });

            // Wait a bit for animations
            await page.waitForTimeout(1000);

            const screenshotPath = path.join(screenshotDir, `${route.replace(/\//g, '_') || 'home'}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`Captured screenshot: ${screenshotPath}`);

            // Check for horizontal overflow
            const scrollWidth = await page.evaluate(() => document.body.scrollWidth);
            const viewportWidth = await page.viewportSize()?.width || 0;

            if (scrollWidth > viewportWidth) {
                console.warn(`WARNING: Horizontal overflow detected on ${route} (Scroll width: ${scrollWidth}, Viewport: ${viewportWidth})`);
            }

        } catch (error) {
            console.error(`Error checking ${route}:`, error);
        }
    }

    await browser.close();
    console.log('Visual check complete.');
}

runVisualCheck().catch(console.error);
