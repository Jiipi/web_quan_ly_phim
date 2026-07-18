import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto("http://localhost:3000", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

const frame1 = await page.screenshot({ path: "C:/tmp/anim1.png", fullPage: false });
await page.waitForTimeout(2000);
const frame2 = await page.screenshot({ path: "C:/tmp/anim2.png", fullPage: false });

// Check if frames are different (animation is moving)
const fs = require("fs");
const f1 = fs.readFileSync("C:/tmp/anim1.png");
const f2 = fs.readFileSync("C:/tmp/anim2.png");
const diff = f1.length !== f2.length || !f1.equals(f2);
console.log("Frames different:", diff);

// Check specifically for the cyber background particles
const particleData = await page.evaluate(() => {
  const particles = document.querySelectorAll(".particle");
  return {
    count: particles.length,
    sample: Array.from(particles)
      .slice(0, 3)
      .map((p) => ({
        cls: p.className,
        style: {
          animationName: getComputedStyle(p).animationName,
          animationDuration: getComputedStyle(p).animationDuration,
          animationPlayState: getComputedStyle(p).animationPlayState,
          position: p.getBoundingClientRect(),
        },
      })),
  };
});
console.log("Particle data:", JSON.stringify(particleData, null, 2));

// Check grid animation
const gridData = await page.evaluate(() => {
  const divs = document.querySelectorAll('div[style*="animation"]');
  return Array.from(divs)
    .slice(0, 5)
    .map((el) => ({
      cls: el.className.substring(0, 80),
      animation: getComputedStyle(el).animationName,
      duration: getComputedStyle(el).animationDuration,
    }));
});
console.log("Grid animations:", JSON.stringify(gridData, null, 2));

await browser.close();
