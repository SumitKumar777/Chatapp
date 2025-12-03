import test from "@playwright/test";




test("signin and save save state",async ({page})=>{
   await page.goto("http://localhost:3000/signin");

   await page.fill('input[name="email"]', "e2euser@example.com");
   await page.fill('input[name="password"]', "e2epassword");

   await Promise.all([
      page.waitForURL("**/dashboard"),
      page.getByRole("button", { name: "Sign In" }).click()
   ]);

   await page.context().storageState({ path: 'storageState.json' });
})