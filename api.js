const axios = require("axios");

/**
 * Fetch page HTML and extract fresh JWT token
 */
async function getFreshToken(pageUrl) {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  };

  const res = await axios.get(pageUrl, { headers });
  const html = res.data;

  // Regex to grab JWT from inline script
  const match = html.match(
    /token\s*=\s*"([A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+)"/
  );
  if (!match) throw new Error("Token not found in page");

  return match[1];
}

/**
 * Use the fresh token to request direct download link
 */
async function getDirectLink(pageUrl) {
  const token = await getFreshToken(pageUrl);

  const payload = {
    v: 3,
    u: "cinesubz",
    direct: true,
    token,
  };

  const headers = {
    "Content-Type": "application/json",
    Referer: pageUrl,
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
  };

  const res = await axios.post(pageUrl, payload, { headers });
  if (!res.data?.url) throw new Error("No direct link returned");

  return res.data.url;
}

// Example usage
(async () => {
  try {
    const pageUrl =
      "https://drive2.cscloud12.online/server3/lyppijeepgwshlzadesu/Drive03/Leo%20(2023)%20Tamil%20WEB-DL-%5BCineSubz.co%5D-480p?ext=mp4";

    const directLink = await getDirectLink(pageUrl);
    console.log("✅ Direct link:", directLink);
  } catch (err) {
    console.error("Error:", err.message);
  }
})();
