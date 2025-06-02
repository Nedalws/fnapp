const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer-extra');
const stealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(stealthPlugin());

const app = express();
const PORT = 5500;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // يخدم index.html

app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  console.log("🔗 Scraping URL:", url);

  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // اجلب العناصر الموجودة في <h1>
    let restaurantNames = await page.$$eval('h1', elements =>
      elements.map(el => el.innerText.trim()).filter(name =>
        name && !name.includes('هنقرستيشن')
      )
    );

    // حذف أول عنصر من القائمة
    if (restaurantNames.length > 0) {
      restaurantNames = restaurantNames.slice(1);
    }

    await browser.close();

    console.log("🍽️ Found Restaurants (after slice):", restaurantNames.length);
    res.json({ restaurants: restaurantNames });

  } catch (error) {
    console.error("❌ Scrape error:", error.message);
    res.status(500).json({ error: 'Scraping failed' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});