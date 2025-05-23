import { test, expect } from '@playwright/test';

test('TC2-1,3,4,5', async ({ page }) => {
    test.setTimeout(120000);
    //TC2-1
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(1000);

    await page.getByRole('link', { name: 'Login' }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('EL40630@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('123456');
    
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForTimeout(2000);

    await page.getByRole('link', { name: 'My Reservations' }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Review the Car' }).click();
    await page.waitForTimeout(1000);

    await page.locator('div').filter({ hasText: /^Rating$/ }).getByRole('button').nth(2).click();
    await page.getByRole('textbox', { name: 'Review' }).click();
    await page.getByRole('textbox', { name: 'Review' }).fill('Test');
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Submit Review' }).click();
    await page.waitForTimeout(2000);

    //TC2-5
    await page.getByRole('link', { name: 'Home' }).click();
    await page.waitForTimeout(1000);

    await page.locator('div:has(h3:has-text("Toyota Supra"))').getByRole('link', { name: 'View Details' }).first().click();
    await page.waitForTimeout(1000);

    await page.getByText('Engkarat Leckngam').first().click();
    await page.waitForTimeout(1000);
    
    //TC2-3
    await page.getByRole('link', { name: 'My Reviews' }).click();
    await page.waitForTimeout(1000);

    await page.locator('button.text-gray-400').first().click();
    await page.waitForTimeout(1000);

    await page.waitForSelector('textarea[placeholder="Write your review..."]', { timeout: 60000 });
    await page.locator('textarea[placeholder="Write your review..."]').fill('Updated review text');
    await page.waitForTimeout(1000);

    await page.locator('button:has(.h-5.w-5)').filter({ hasText: '' }).nth(3).click();
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Save' }).click();
    await page.waitForTimeout(2000);

    //TC2-4
    page.once('dialog', async dialog => {
        console.log(`Dialog message: ${dialog.message()}`);
        await dialog.accept();
    });

    await page.waitForSelector('button.text-red-400', { state: 'visible', timeout: 60000 });
    await page.locator('button.text-red-400').first().click();
    await page.waitForTimeout(2000);
    
    await page.getByRole('link', { name: 'My Reviews' }).click();
    await page.waitForTimeout(1000);
    await page.waitForSelector('h3:text("No reviews yet")', { timeout: 60000 });
});

test('TC2-2', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    await page.waitForTimeout(1000);

    await page.getByRole('link', { name: 'Login' }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('textbox', { name: 'Email address' }).click();
    await page.getByRole('textbox', { name: 'Email address' }).fill('EL40630@gmail.com');
    await page.getByRole('textbox', { name: 'Password' }).click();
    await page.getByRole('textbox', { name: 'Password' }).fill('123456');
    
    await page.getByRole('button', { name: 'Sign in' }).click();
    await page.waitForTimeout(2000);

    await page.getByRole('link', { name: 'View Details' }).first().click();
    await page.waitForTimeout(1000);

    await page.locator('div').filter({ hasText: /^Pick-up Date$/ }).getByRole('textbox').fill('2025-05-10');
    await page.locator('div').filter({ hasText: /^Return Date$/ }).getByRole('textbox').fill('2025-06-12');
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Request Reservation' }).click();
    await page.waitForTimeout(2000);

    await page.getByRole('link', { name: 'My Reservations' }).click();
    await page.waitForTimeout(1000);
    
    try {
        await page.getByRole('button', { name: 'Review the Car' }).click();
        throw new Error('Review the Car should not be possible at this stage');
    } catch (error) {
        console.log('Expected error occurred: Cannot review car before completing reservation');
    }
});