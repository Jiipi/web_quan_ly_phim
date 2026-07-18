import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

const data = await page.evaluate(() => {
  const out = {};
  const samples = [
    [".ambient-orb", "ambient-orb"],
    [".logo-breathe", "logo-breathe"],
    [".divider-flow", "divider-flow"],
    [".aside-scan-beam", "aside-scan-beam"],
    [".heading-shimmer", "heading-shimmer"],
    [".badge-pulse", "badge-pulse"],
    [".number-badge", "number-badge"],
    [".typing-cursor", "typing-cursor"],
    [".hud-corner-bracket", "hud-corner-bracket"],
  ];
  for (const [sel, key] of samples) {
    const el = document.querySelector(sel);
    if (!el) {
      out[key] = "NOT FOUND";
      continue;
    }
    const cs = getComputedStyle(el);
    out[key] = {
      animationName: cs.animationName,
      animationDuration: cs.animationDuration,
      animationPlayState: cs.animationPlayState,
    };
  }
  out.totalAnimated = Array.from(document.querySelectorAll("*")).filter((el) => {
    const cs = getComputedStyle(el);
    return cs.animationName && cs.animationName !== "none";
  }).length;
  return out;
});
console.log(JSON.stringify(data, null, 2));

await page.screenshot({ path: "C:/tmp/anim-frame1.png", fullPage: false });
await page.waitForTimeout(1500);
await page.screenshot({ path: "C:/tmp/anim-frame2.png", fullPage: false });

await browser.close();
