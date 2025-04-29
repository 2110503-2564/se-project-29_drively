import { test, expect } from '@playwright/test';

// test('test', async ({ page }) => {
//   await page.goto('http://localhost:3000/');
//   await page.getByRole('link', { name: 'Register' }).click();
//   await page.locator('.relative > div > div:nth-child(2)').first().click();
//   await page.getByRole('textbox', { name: 'Full Name' }).click();
//   await page.getByRole('textbox', { name: 'Full Name' }).fill('Kaewkla Sroykabkaewwwww');
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('KS');
//   await page.getByRole('textbox', { name: 'Full Name' }).click();
//   await page.getByRole('textbox', { name: 'Full Name' }).fill('Kaewkla Sroykabkaewwwwwww');
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('KS7@gmail.com');
//   await page.getByRole('textbox', { name: 'Telephone Number' }).click();
//   await page.getByRole('textbox', { name: 'Telephone Number' }).fill('0987654321');
//   await page.getByRole('textbox', { name: 'Driver License' }).click();
//   await page.getByRole('textbox', { name: 'Driver License' }).fill('1234567890');
//   await page.getByRole('textbox', { name: 'Password' }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('123456');
//   await page.getByRole('button', { name: 'Create Account' }).click();
//   await expect(page.getByText('Drively Home Available Cars My Reservations My ReviewsKaewkla Sroykabkaewwwwwww (')).toBeVisible();
//   await page.getByRole('button', { name: 'Logout' }).click();
// });
//  
// test('test', async ({ page }) => {
//   await page.goto('http://localhost:3000/');
//   await page.getByRole('link', { name: 'Login' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('KS6@gmail.com');
//   await page.getByRole('textbox', { name: 'Password' }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('123456');
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
//   await page.getByRole('button', { name: 'Logout' }).click();
// });

// test('test', async ({ page }) => {
//   await page.goto('http://localhost:3000/');
//   await page.getByRole('link', { name: 'Login' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('EL40630@gmail.com');
//   await page.getByRole('textbox', { name: 'Password' }).click();
//   await page.getByRole('textbox', { name: 'Password' }).fill('123456');
//   await page.getByRole('button', { name: 'Sign in' }).click();
//   await page.getByRole('link', { name: 'Engkarat Leckngam (car' }).click();
//   await page.getByRole('button', { name: 'Edit Profile' }).click();
//   await page.getByRole('textbox', { name: 'Full Name' }).click();
//   await page.getByRole('textbox', { name: 'Full Name' }).press('ArrowRight');
//   await page.getByRole('textbox', { name: 'Full Name' }).fill('Engkarat Leckngam');
//   await page.getByRole('button', { name: 'Save' }).click();
//   await expect(page.getByText('Engkarat Leckngam', { exact: true })).toBeVisible();
//   await page.getByRole('button', { name: 'Logout' }).click();
// });

test('test', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('EL40630@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('123456');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('admintest@test.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('123456');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
  await page.getByRole('button', { name: 'Logout' }).click();
});