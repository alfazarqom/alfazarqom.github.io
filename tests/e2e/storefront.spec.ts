import { expect, test } from "@playwright/test";

const catalog = {
  success: true,
  total: 2,
  data: [
    {
      id: "ditoopropink",
      item_group_id: "ditoopro",
      title: "Ditoo Pro",
      description: "Speaker Bluetooth dengan display pixel.",
      availability: "in stock",
      price: 1_250_000,
      sale_price: 1_100_000,
      image_link: "https://example.com/ditoo-pro-pink.jpg",
      brand: "Divoom",
      product_type: "Speaker",
      color: "Pink",
    },
    {
      id: "ditooproblack",
      item_group_id: "ditoopro",
      title: "Ditoo Pro",
      description: "Speaker Bluetooth dengan display pixel.",
      availability: "in stock",
      price: 1_250_000,
      image_link: "https://example.com/ditoo-pro-black.jpg",
      brand: "Divoom",
      product_type: "Speaker",
      color: "Black",
    },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.route("**/functions/v1/get-divoom-products", route =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(catalog),
    })
  );
});

test("responsive header and navigation work from mobile through desktop", async ({ page }) => {
  for (const width of [320, 390, 767]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Temukan gaya yang/ })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Navigasi bawah" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Navigasi utama" })).toBeHidden();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
  }

  for (const width of [768, 1023, 1024, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole("navigation", { name: "Navigasi utama" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Navigasi bawah" })).toBeHidden();
    const dimensions = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(dimensions.content, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(dimensions.viewport);
  }
});

test("product card opens the grouped product detail route and browser back works", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.getByRole("button", { name: "Lihat detail Ditoo Pro" }).click();

  await expect(page).toHaveURL(/\/products\/ditoopro$/);
  await expect(page.getByRole("heading", { name: "Ditoo Pro" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Pink" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Black" })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL(/#home$/);
  await expect(page.getByRole("heading", { name: /Temukan gaya yang/ })).toBeVisible();
});

test("direct product URL survives a browser refresh", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/products/ditoopro");
  await expect(page.getByRole("heading", { name: "Ditoo Pro" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Ditoo Pro" })).toBeVisible();
  await expect(page).toHaveURL(/\/products\/ditoopro$/);
});
