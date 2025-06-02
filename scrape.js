const puppeteer = require('puppeteer');

(async () => {
  console.log("🚀 Launching browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const url = process.argv[2]; // Receive URL from command line
  if (!url) {
    console.error("❌ No URL provided");
    process.exit(1);
  }

  console.log("🌐 Opening page...");
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  console.log("🔍 Collecting restaurant names from <h1> tags...");
  const restaurantNames = await page.$$eval('h1', els =>
    els.map(el => el.innerText.trim()).filter(Boolean)
  );

  await browser.close();

  if (restaurantNames.length <= 1) {
    console.log("⚠️ Not enough restaurants found.");
    return;
  }

  // Remove the first item (usually "عدد المتاجر")
  const filtered = restaurantNames.slice(1);

  console.log("🍽️ Restaurant Names:");
  filtered.forEach((name, i) => {
    console.log(`${i + 1}. ${name}`);
  });

  // Output to JSON if needed (optional)
  // console.log(JSON.stringify(filtered));
})();