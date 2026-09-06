import { test, expect } from '@playwright/test';

test.describe('GatherCraft End-to-End Event Lifecycle & Multi-Device Sync', () => {
  test('Dashboard loads correctly and displays sample events', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/GatherCraft/);
    await expect(page.getByRole('heading', { name: /Stop planning parties/i })).toBeVisible();
    await expect(page.getByText(/Friday Sunset Cocktails/i)).toBeVisible();
  });

  test('3-Step Wizard Event Creation and Cross-Browser RSVP Sync', async ({ browser }) => {
    test.setTimeout(90000);

    // Context A: Host creates an event
    const hostContext = await browser.newContext();
    const hostPage = await hostContext.newPage();

    await hostPage.goto('/events/create');
    await expect(hostPage.getByRole('heading', { name: /Choose your event blueprint/i })).toBeVisible();

    // Step 1: Select Blueprint & Next
    await hostPage.click('text=Classic Mixer & Cocktails');
    await hostPage.click('text=Next: Purpose Engine');

    // Step 2: Purpose Engine
    await expect(hostPage.getByRole('heading', { name: /Define your gathering's purpose/i })).toBeVisible();
    await hostPage.click('text=Next: Basics Lock-in');

    // Step 3: Lock in Event Basics
    await expect(hostPage.getByRole('heading', { name: /Set date, location & budget/i })).toBeVisible();
    const titleInput = hostPage.locator('input[placeholder*="Friday Sunset Cocktails"]');
    await expect(titleInput).toBeVisible();
    await titleInput.fill('E2E Cross-Device Celebration');
    await hostPage.click('text=Lock in Event & Manage Guests');

    // Host lands on Event Workspace
    await hostPage.waitForURL(url => url.pathname.startsWith('/events/') && url.pathname !== '/events/create', { timeout: 30000 });
    await expect(hostPage.getByText('E2E Cross-Device Celebration').first()).toBeVisible({ timeout: 30000 });

    // Extract Invite Link from Host Page
    const previewLink = hostPage.locator('a[href^="/invite/"]').first();
    await expect(previewLink).toBeVisible({ timeout: 15000 });
    const inviteHref = await previewLink.getAttribute('href');
    expect(inviteHref).toBeTruthy();

    // Context B: Guest in a fresh browser with EMPTY local storage opens the invite link
    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();

    await guestPage.goto(inviteHref!);

    // Guest sees the real event details from the server
    await expect(guestPage.getByText('E2E Cross-Device Celebration').first()).toBeVisible({ timeout: 15000 });
    await expect(guestPage.getByText("You're Invited")).toBeVisible({ timeout: 15000 });

    // Guest submits RSVP
    await guestPage.fill('input[placeholder*="Jordan Lee"]', 'Sarah Tester');
    await guestPage.fill('input[placeholder*="jordan@example.com"]', 'sarah.tester@example.com');
    await guestPage.click('button:has-text("Submit RSVP")');

    // Guest sees confirmation
    await expect(guestPage.getByText(/You're on the Guest List!/i)).toBeVisible({ timeout: 15000 });
    await expect(guestPage.getByText(/Add to Google Calendar/i)).toBeVisible({ timeout: 15000 });

    // Host context reloads / views updated guests
    await hostPage.reload();
    await expect(hostPage.getByText('Sarah Tester').first()).toBeVisible({ timeout: 15000 });

    await hostContext.close();
    await guestContext.close();
  });

  test('Live Copilot Mode', async ({ page }) => {
    await page.goto('/events/sample-cocktail-party/live');
    await expect(page.getByText(/LIVE MODE ACTIVE/i)).toBeVisible();
  });

  test('Post-Event Aftermath & Retrospective', async ({ page }) => {
    await page.goto('/events/sample-cocktail-party/aftermath');
    await expect(page.getByText(/Post-Event Recap & Gratitude/i)).toBeVisible();
  });
});
