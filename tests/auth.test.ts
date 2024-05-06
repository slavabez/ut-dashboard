import { expect, test } from "@playwright/test";

const CLIENT_STATE_PATH = "tests/.auth-states/client-state.json";
const EMPLOYEE_STATE_PATH = "tests/.auth-states/employee-state.json";
const MANAGER_STATE_PATH = "tests/.auth-states/manager-state.json";
const ADMIN_STATE_PATH = "tests/.auth-states/admin-state.json";

test("authenticate as client", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Вход" }).click();

  await page
    .getByRole("textbox", { name: "+7 777 777 7777" })
    .fill("+77050000000");

  await page
    .getByRole("textbox", { name: "*********" })
    .fill("client-password");

  await page.getByRole("button", { name: "Войти на сайт" }).click();

  const h1CenterFont = page.getByRole("heading", { name: "Профиль" });
  await expect(h1CenterFont).toHaveText("Профиль");

  const ddClientUsername = page.getByText("client user");
  await expect(ddClientUsername).toBeVisible();

  const ddClientRole = page.getByText("Клиент");
  await expect(ddClientRole).toBeVisible();

  const ddClientPhone = page.getByText("+77050000000");
  await expect(ddClientPhone).toBeVisible();

  await page.context().storageState({ path: CLIENT_STATE_PATH });
});

test("authenticate as employee", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Вход" }).click();

  await page
    .getByRole("textbox", { name: "+7 777 777 7777" })
    .fill("+77050000001");

  await page
    .getByRole("textbox", { name: "*********" })
    .fill("employee-password");

  await page.getByRole("button", { name: "Войти на сайт" }).click();

  const h1CenterFont = page.getByRole("heading", { name: "Профиль" });
  await expect(h1CenterFont).toHaveText("Профиль");

  const ddEmployeeUsername = page.getByText("employee user");
  await expect(ddEmployeeUsername).toBeVisible();

  const ddEmployeeRole = page.getByText("Сотрудник");
  await expect(ddEmployeeRole).toBeVisible();

  const ddEmployeePhone = page.getByText("+77050000001");
  await expect(ddEmployeePhone).toBeVisible();

  await page.context().storageState({ path: EMPLOYEE_STATE_PATH });
});

test("authenticate as manager", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Вход" }).click();

  await page
    .getByRole("textbox", { name: "+7 777 777 7777" })
    .fill("+77050000002");

  await page
    .getByRole("textbox", { name: "*********" })
    .fill("manager-password");

  await page.getByRole("button", { name: "Войти на сайт" }).click();

  const h1CenterFont = page.getByRole("heading", { name: "Профиль" });
  await expect(h1CenterFont).toHaveText("Профиль");

  const ddManagerUsername = page.getByText("manager user");
  await expect(ddManagerUsername).toBeVisible();

  const ddManagerRole = page.getByText("Менеджер");
  await expect(ddManagerRole).toBeVisible();

  const ddManagerPhone = page.getByText("+77050000002");
  await expect(ddManagerPhone).toBeVisible();

  await page.context().storageState({ path: MANAGER_STATE_PATH });
});

test("authenticate as admin", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Вход" }).click();

  await page
    .getByRole("textbox", { name: "+7 777 777 7777" })
    .fill("+77050000003");

  await page.getByRole("textbox", { name: "*********" }).fill("admin-password");

  await page.getByRole("button", { name: "Войти на сайт" }).click();

  const h1CenterFont = page.getByRole("heading", { name: "Профиль" });
  await expect(h1CenterFont).toHaveText("Профиль");

  const ddAdminUsername = page.getByText("admin user");
  await expect(ddAdminUsername).toBeVisible();

  const ddAdminRole = page.getByText("Администратор");
  await expect(ddAdminRole).toBeVisible();

  const ddAdminPhone = page.getByText("+77050000003");
  await expect(ddAdminPhone).toBeVisible();

  await page.context().storageState({ path: ADMIN_STATE_PATH });
});
