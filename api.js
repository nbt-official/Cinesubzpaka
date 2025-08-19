// getRealLink.js
const fs = require("fs");
const axios = require("axios");

// Parse cookies.txt (Netscape format) into a single string
function parseCookies(filePath, domain) {
  if (!fs.existsSync(filePath)) return "";
  const data = fs.readFileSync(filePath, "utf8");
  const lines = data.split("\n");
  const cookies = [];
  for (const line of lines) {
    if (!line.trim() || line.startsWith("#")) continue;
    const parts = line.split("\t");
    if (parts.length >= 7) {
      const cookieDomain = parts[0].trim();
      const name = parts[5].trim();
      const value = parts[6].trim();
      if (
        cookieDomain === domain ||
        (cookieDomain.startsWith(".") &&
          domain.endsWith(cookieDomain.substring(1)))
      ) {
        cookies.push(`${name}=${value}`);
      }
    }
  }
  return cookies.join("; ");
}

async function getDirectLink(pageUrl) {
  const domain = new URL(pageUrl).hostname;
  const cookieHeader = parseCookies("cookies.txt", domain);

  const headers = {
    "Content-Type": "application/json",
    "Referer": pageUrl,
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
    "sec-ch-ua":
      '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
  };
  if (cookieHeader) headers["Cookie"] = cookieHeader;

  // Step 1: simulate button click
  const clickRes = await axios.post(
    pageUrl,
    { v: 3, u: "cinesubz", direct: true },
    { headers }
  );

  if (!clickRes.data?.token) {
    throw new Error("Failed to get fresh token. Response: " + JSON.stringify(clickRes.data));
  }

  const token = clickRes.data.token;
  console.log("Got fresh token:", token);

  // Step 2: request direct link using token
  const finalRes = await axios.post(
    pageUrl,
    { v: 3, u: "cinesubz", direct: true, token },
    { headers }
  );

  if (finalRes.data?.url) {
    console.log("✅ Direct link:", finalRes.data.url);
    return finalRes.data.url;
  } else {
    throw new Error("No URL in final response: " + JSON.stringify(finalRes.data));
  }
}

// Example usage
const url =
  "https://drive2.cscloud12.online/server3/lyppijeepgwshlzadesu/Drive03/Leo%20(2023)%20Tamil%20WEB-DL-%5BCineSubz.co%5D-480p?ext=mp4";

getDirectLink(url).catch((err) => console.error("Error:", err.message));
