import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

// Find all elements with animation, grouped by animation name
const animData = await page.evaluate(() => {
  const byName = {};
  const seen = new Set();
  for (const el of document.querySelectorAll("*")) {
    const cs = getComputedStyle(el);
    const name = cs.animationName;
    if (!name || name === "none" || seen.has(el)) continue;
    seen.add(el);
    if (!byName[name]) byName[name] = [];
    byName[name].push({
      tag: el.tagName,
      class: el.className.substring(0, 120),
      id: el.id,
    });
  }
  return byName;
});
console.log("=== Animations running ===");
for (const [name, els] of Object.entries(animData)) {
  console.log(`\n${name} (${els.length} elements):`);
  els.slice(0, 3).forEach((e) => console.log(`  ${e.tag} .${e.class} #${e.id}`));
}

await page.screenshot({ path: "C:/tmp/anim-frame1.png", fullPage: true });
await browser.close();
