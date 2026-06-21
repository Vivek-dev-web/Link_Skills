/**
 * Generates PNG icons for PWA + Android from public/icon.svg
 * Run once:  node scripts/generate-icons.js
 */
const sharp = require("sharp");
const path  = require("path");
const fs    = require("fs");

const SVG  = path.join(__dirname, "../public/icon.svg");
const OUT  = path.join(__dirname, "../public/icons");

const SIZES = [48, 72, 96, 144, 192, 384, 512];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const svg = fs.readFileSync(SVG);

  for (const size of SIZES) {
    const dest = path.join(OUT, `icon-${size}.png`);
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(dest);
    console.log(`✓ ${dest}`);
  }

  // maskable icon (extra padding so the "A" sits within the safe zone)
  const maskable = path.join(OUT, "icon-512-maskable.png");
  await sharp({
    create: {
      width: 512, height: 512,
      channels: 4,
      background: { r: 27, g: 31, b: 59, alpha: 1 },
    },
  })
    .composite([{
      input: await sharp(svg).resize(360, 360).png().toBuffer(),
      gravity: "centre",
    }])
    .png()
    .toFile(maskable);
  console.log(`✓ ${maskable}`);

  console.log("\nAll icons generated.");
}

main().catch((e) => { console.error(e); process.exit(1); });
