import { test, expect, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await page.goto("/login");
    await page.fill("#username", "admin");
    await page.fill("#password", "changeme");
    await page.click('button[type="submit"]');

    try {
      await page.waitForURL("**/dashboard", { timeout: 10000 });
      return; // success
    } catch {
      // Backend may not be ready on cold start — wait and retry
      await page.waitForTimeout(2000);
    }
  }
  throw new Error("Failed to login after 3 attempts");
}

test.describe("Admin Flow", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("should login as admin and see dashboard", async ({ page }) => {
    await expect(page).toHaveURL(/dashboard/);
  });

  test("should navigate to admin page", async ({ page }) => {
    // Use sidebar link instead of page.goto to avoid full reload race condition
    await page.click('a[href="/admin"]');
    await expect(page.getByRole("main").getByRole("heading", { name: "Admin Panel" })).toBeVisible({ timeout: 10000 });
  });

  test("should create an invite", async ({ page }) => {
    // Navigate via sidebar link to preserve auth state
    await page.click('a[href="/admin"]');
    await expect(page.getByRole("main").getByRole("heading", { name: "Admin Panel" })).toBeVisible({ timeout: 10000 });

    // Click create invite button (in page header)
    await page.getByRole("main").getByRole("button", { name: "Create Invite" }).click();

    // Wait for dialog (custom dialog, no role="dialog" — use title text)
    const dialogTitle = page.getByRole("heading", { name: "Create New Invite" });
    await expect(dialogTitle).toBeVisible({ timeout: 5000 });

    // Click create button in the dialog footer
    const dialogCreateBtn = page.locator(".fixed.inset-0.z-50").getByRole("button", { name: "Create Invite" });
    await dialogCreateBtn.click();

    // Wait for dialog to close
    await expect(dialogTitle).not.toBeVisible({ timeout: 10000 });

    // Verify invite appears in the list (token hash prefix like "a1b2c3d4...")
    await expect(page.getByRole("main").locator("text=/[a-f0-9]{8}\\.\\.\\./").first()).toBeVisible({ timeout: 5000 });
  });

  test("should show invite stats", async ({ page }) => {
    // Navigate via sidebar link to preserve auth state
    await page.click('a[href="/admin"]');
    await expect(page.getByRole("main").getByRole("heading", { name: "Admin Panel" })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole("main").locator("text=Total Invites")).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole("main").locator("text=Used")).toBeVisible();
    await expect(page.getByRole("main").locator("text=Pending")).toBeVisible();
  });
});
