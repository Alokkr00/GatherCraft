import { test, expect } from '@playwright/test';

test.describe('GatherCraft End-to-End Event Lifecycle & Multi-Device Sync', () => {
  test('Dashboard loads correctly and displays sample events', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/GatherCraft/);
    await expect(page.getByRole('heading', { name: /Bring people together/i })).toBeVisible();
    await expect(page.getByText(/Friday Sunset Cocktails/i)).toBeVisible();
  });

  test('Brand-new host onboarding funnel: landing page prompt -> wizard -> workspace', async ({ page }) => {
    test.setTimeout(90000);
    await page.goto('/');
    
    // 1. Host enters raw purpose into landing prompt card
    const purposeInput = page.locator('input[placeholder*="What are you gathering people for?"]');
    await expect(purposeInput).toBeVisible();
    await purposeInput.fill('Reconnect college roommates after 5 years apart');
    await page.click('button:has-text("Start Gathering")');

    // 2. Transits directly to Purpose Engine step in wizard with purpose pre-populated
    await page.waitForURL(url => url.pathname === '/events/create' && url.searchParams.has('purpose'), { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /Define your gathering's purpose/i })).toBeVisible();
    await expect(page.locator('textarea')).toHaveValue(/Reconnect college roommates/);

    // 3. Advances to basics lock-in
    await page.click('text=Next: Basics Lock-in');
    await expect(page.getByRole('heading', { name: /Where and when is it happening\?|Set date, location & budget/i })).toBeVisible();

    const titleInput = page.locator('input[placeholder*="Friday Sunset Cocktails"]');
    await expect(titleInput).toBeVisible();
    await titleInput.fill('Roommates 5-Year Reunion');
    await page.click('text=Lock in Event & Manage Guests');

    // 4. Lands on workspace with pinned purpose
    await page.waitForURL(url => url.pathname.startsWith('/events/') && url.pathname !== '/events/create', { timeout: 30000 });
    await expect(page.getByText('Roommates 5-Year Reunion').first()).toBeVisible({ timeout: 30000 });
    await expect(page.getByText("Tonight's purpose")).toBeVisible({ timeout: 15000 });
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
