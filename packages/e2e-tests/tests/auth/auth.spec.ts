import {test, expect} from '@playwright/test';


test.describe("Site load and auth buttons Displaying",()=>{

   test("site is loading and displaying button",async ({page})=>{
      
      await page.goto("http://localhost:3000");
      await expect(page.getByText("Connect Instantly")).toBeVisible()

      await expect(page.getByRole("link",{name:"SignUp"})).toBeVisible()
      await expect(page.getByRole("link",{name:"SignIn"})).toBeVisible()

   })

})


test.describe("Signup and signIn Tests",()=>{

   test("signup test",async ({page})=>{

      await page.goto("http://localhost:3000");

      await page.getByRole("link",{name:"SignUp"}).click();

      await page.fill('input[name="username"]',"kingkhan");
      await page.fill('input[name="email"]',"kingkhan@gmail.com");

      await page.fill('input[name="password"]',"kingkhan123");

      await Promise.all([
         page.waitForURL("**/signin"),
       page.getByRole("button", { name: "Sign Up" }).click()

      ])

      await page.fill('input[name="email"]', "kingkhan@gmail.com");

      await page.fill('input[name="password"]', "kingkhan123");

      await Promise.all([
         page.waitForURL("**/dashboard"),
          page.getByRole("button", { name: "Sign In" }).click()

      ])


      await expect(page.getByText("PaaPay Chat")).toBeVisible();



   })
})
    