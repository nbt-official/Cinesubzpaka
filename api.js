const axios = require("axios");
const { JSDOM } = require("jsdom");

// Polyfill fetch for jsdom scripts
const fetch = require("node-fetch");
global.fetch = fetch;

async function getTokenAfterClick() {
  const url =
    "https://drive2.cscloud12.online/server3/lyppijeepgwshlzadesu/Drive03/Leo%20(2023)%20Tamil%20WEB-DL-%5BCineSubz.co%5D-480p?ext=mp4";

  // Step 1: fetch the page HTML
  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
    },
  });

  // Step 2: load HTML into jsdom
  const dom = new JSDOM(res.data, {
    url, // pretend this is the page URL
    runScripts: "dangerously", // allow inline scripts
    resources: "usable", // load external <script src="">
    pretendToBeVisual: true,
  });

  return new Promise((resolve, reject) => {
    dom.window.document.addEventListener("DOMContentLoaded", async () => {
      try {
        // Step 3: simulate button click
        const btn = dom.window.document.querySelector("#directButton");
        if (!btn) return reject("❌ Direct button not found");

        // monkey-patch fetch to capture POST data
        const origFetch = dom.window.fetch;
        dom.window.fetch = async (reqUrl, options) => {
          if (options && options.body) {
            try {
              const data = JSON.parse(options.body);
              if (data.token) {
                console.log("✅ Token captured:", data.token);
                resolve(data.token);
              }
            } catch (e) {}
          }
          return origFetch(reqUrl, options);
        };

        // Trigger click
        btn.click();
      } catch (e) {
        reject(e);
      }
    });
  });
}

getTokenAfterClick().catch(console.error);
