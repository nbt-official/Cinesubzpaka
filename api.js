// getLinkWithToken.js
const axios = require("axios");

async function clickButtonAndGetToken(pageUrl) {
  const headers = {
    "Content-Type": "application/json",
    "Referer": pageUrl,
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
    "sec-ch-ua": '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
  };

  // Step 1: simulate button click, ask server to generate token
  const body = {
    v: 3,
    u: "cinesubz",
    direct: true,
  };

  const res = await axios.post(pageUrl, body, { headers });
  if (!res.data || !res.data.token) {
    throw new Error("No token received after button click");
  }

  console.log("Fresh token:", res.data.token);
  return res.data.token;
}

async function getDirectLink(pageUrl) {
  const token = await clickButtonAndGetToken(pageUrl);

  const headers = {
    "Content-Type": "application/json",
    "Referer": pageUrl,
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36",
  };

  // Step 2: use the fresh token to get the actual direct link
  const body = {
    v: 3,
    u: "cinesubz",
    direct: true,
    token: token,
  };

  const res = await axios.post(pageUrl, body, { headers });
  if (res.data?.url) {
    console.log("Direct link:", res.data.url);
    return res.data.url;
  } else {
    throw new Error("Direct link not found in response");
  }
}

// Example usage
const url =
  "https://drive2.cscloud12.online/server3/lyppijeepgwshlzadesu/Drive03/Leo%20(2023)%20Tamil%20WEB-DL-%5BCineSubz.co%5D-480p?ext=mp4";

getDirectLink(url).catch(console.error);
