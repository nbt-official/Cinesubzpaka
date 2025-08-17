const axios = require("axios");
const { JSDOM } = require("jsdom");
const fetch = require("node-fetch");
global.fetch = fetch; // polyfill for jsdom

const url =
  "https://drive2.cscloud12.online/server3/lyppijeepgwshlzadesu/Drive03/Leo%20(2023)%20Tamil%20WEB-DL-%5BCineSubz.co%5D-480p?ext=mp4";

async function getDirectLink() {
  // 1. Fetch live page HTML
  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });

  // 2. Load into jsdom so scripts execute
  const dom = new JSDOM(res.data, {
    url,
    runScripts: "dangerously",
    resources: "usable",
    pretendToBeVisual: true,
  });

  const { window } = dom;

  return new Promise((resolve, reject) => {
    let capturedToken = null;

    // 3. Patch fetch to capture token from POST body
    const origFetch = window.fetch;
    window.fetch = async (reqUrl, options) => {
      if (options && options.body) {
        try {
          const body = JSON.parse(options.body);
          if (body.token) {
            capturedToken = body.token;
            console.log("✅ Captured token:", capturedToken);

            // 4. Build POST payload
            const payload = {
              v: 3,
              u: "cinesubz",
              direct: true,
              token: capturedToken,
            };

            const headers = {
              "Content-Type": "application/json",
              Referer: url,
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
              "sec-ch-ua":
                '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"Windows"',
            };

            // 5. Send POST with Axios
            const postRes = await axios.post(url, payload, { headers });
            console.log("🎯 Server response:", postRes.data);

            if (postRes.data.url) {
              console.log("🚀 Direct Download Link:", postRes.data.url);
              resolve(postRes.data.url);
            }
          }
        } catch (err) {
          reject(err);
        }
      }
      return origFetch(reqUrl, options);
    };

    // 6. Wait a bit for page JS to inject button then click
    setTimeout(() => {
      const btn = window.document.getElementById("directButton");
      if (!btn) return reject("❌ Direct button not found in DOM");
      console.log("👆 Clicking Direct Download button...");
      btn.click();
    }, 2000);
  });
}

getDirectLink().catch(console.error);
