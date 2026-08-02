import { test, expect } from '@playwright/test';

test.describe('GatherCraft End-to-End Event Lifecycle', () => {
  test('Dashboard loads correctly and displays sample events', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/GatherCraft/);
    await expect(page.getByRole('heading', { name: /Stop planning parties/i })).toBeVisible();
    await expect(page.getByText(/Friday Sunset Cocktails/i)).toBeVisible();
  });

  test('3-Step Wizard Event Creation Flow', async ({ page }) => {
    await page.goto('/events/create');
    await expect(page.getByRole('heading', { name: /Choose your event blueprint/i })).toBeVisible();

    // Select Blueprint
    await page.click('text=Classic Mixer & Cocktails');
    await page.click('text=Next: Purpose Engine');

    // Purpose Engine
    await expect(page.getByRole('heading', { name: /Define your gathering's purpose/i })).toBeVisible();
    await page.click('text=Next: Basic Details');

    // Basics Lock-in
    await expect(page.getByRole('heading', { name: /Lock in core event basics/i })).toBeVisible();
    await page.fill('input[placeholder*="Event Title"]', 'E2E Test Gathering');
    await page.click('button[type="submit"]');

    // Redirected to Event Workspace
    await expect(page.url()).toContain('/events/');
    await expect(page.getByText('E2E Test Gathering')).toBeVisible();
  });

  test('Public Guest RSVP Flow', async ({ page }) => {
    await page.goto('/invite/sample-cocktail-party');
    await expect(page.getByText('Friday Sunset Cocktails & Bites')).toBeVisible();

    // Fill RSVP Form
    await page.fill('input[placeholder*="Your Full Name"]', 'Jordan Lee');
    await page.fill('input[placeholder*="email@example.com"]', 'jordan@example.com');
    await page.click('button[type="submit"]');

    // Confirmation screen
    await expect(page.getByText(/RSVP Confirmed/i)).toBeVisible();
    await expect(page.getByText(/Add to Google Calendar/i)).toBeVisible();
  });

  test('Live Copilot Mode', async ({ page }) => {
    await page.goto('/events/sample-cocktail-party/live');
    await expect(page.getByText(/LIVE MODE ACTIVE/i)).toBeVisible();
    await expect(page.getByText(/Live Arrival Ticker/i)).toBeVisible();
    await expect(page.getByText(/AI Host Coaching Prompt/i)).toBeVisible();
  });

  test('Post-Event Aftermath & Retrospective', async ({ page }) => {
    await page.goto('/events/sample-cocktail-party/aftermath');
    await expect(page.getByText(/Post-Event Recap & Gratitude/i)).toBeVisible();
    await expect(page.getByText(/AI Guest Appreciation Generator/i)).toBeVisible();
  });
});
