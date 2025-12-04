import { test, expect } from "@playwright/test";

test.describe("Site load and auth buttons Displaying", () => {
  test("site is loading and displaying button", async ({ page }) => {
    await page.goto("http://localhost:3000");
    await expect(page.getByText("Connect Instantly")).toBeVisible();

    await expect(page.getByRole("link", { name: "SignUp" })).toBeVisible();
    await expect(page.getByRole("link", { name: "SignIn" })).toBeVisible();
  });
});

test.describe("signIn Tests", () => {
  test("signin test", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("http://localhost:3000/signin");

    await page.fill('input[name="email"]', "e2euser@example.com");

    await page.fill('input[name="password"]', "e2epassword");

    await Promise.all([
      page.getByRole("button", { name: "Sign In" }).click(),
      page.waitForURL("**/dashboard"),
    ]);

    await expect(page.getByText("PaaPay Chat")).toBeVisible();
  });
});
