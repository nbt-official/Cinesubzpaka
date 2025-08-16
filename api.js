const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 4000;

// --- Scrape token from page ---
async function scrapeToken(url) {
  const browser = await puppeteer.launch({
  headless: true,
  args: ["--no-sandbox", "--disable-setuid-sandbox"]
});
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "networkidle2" });

  let token = null;

  // 1. Look inside page scripts for "token":"..."
  const pageContent = await page.content();
  const tokenMatch = pageContent.match(/"token":"([^"]+)"/);
  if (tokenMatch) {
    token = tokenMatch[1];
  }

  // 2. If not found, also sniff network requests (backup method)
  if (!token) {
    page.on("request", (req) => {
      const body = req.postData();
      if (body && body.includes('"token"')) {
        const match = body.match(/"token":"([^"]+)"/);
        if (match) token = match[1];
      }
    });

    // give network a moment
    await page.waitForTimeout(5000);
  }

  await browser.close();
  return token;
}

// --- API endpoint ---
app.get("/api/token", async (req, res) => {
  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ status: false, error: "Missing ?url parameter" });
  }

  try {
    const token = await scrapeToken(url);
    if (!token) {
      return res.status(404).json({ status: false, error: "Token not found" });
    }
    res.json({ status: true, token });
  } catch (err) {
    res.status(500).json({ status: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ API server running: http://localhost:${PORT}`);
});
