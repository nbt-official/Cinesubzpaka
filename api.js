const axios = require("axios");
const cheerio = require("cheerio");
const FormData = require("form-data");

async function scrapeFilePage(pageUrl) {
  // Step 1: fetch HTML
  const htmlRes = await axios.get(pageUrl, {
    headers: { "User-Agent": "Mozilla/5.0" }
  });
  const $ = cheerio.load(htmlRes.data);

  // Extract resource-id, item-id
  const resourceId = $('form.download input[name="resource-id"]').val();
  const itemId = $('form.download input[name="item-id"]').val();

  // Extract CSRF + SessionID
  const csrf = htmlRes.data.match(/window\._CSRF\s*=\s*"([^"]+)"/)[1];
  const sessionId = htmlRes.data.match(/window\._sessionID\s*=\s*"([^"]+)"/)[1];

  // Extract filename
  const fileName = $("h1").text().trim();

  console.log("resource-id:", resourceId);
  console.log("item-id:", itemId);
  console.log("csrf:", csrf);
  console.log("sessionId:", sessionId);
  console.log("fileName:", fileName);

  // Step 2: POST /download-file with multipart/form-data
  const form = new FormData();
  form.append("resource-id", resourceId);
  form.append("item-id", itemId);

  const res = await axios.post("https://webtor.io/download-file", form, {
    headers: {
      ...form.getHeaders(),
      "x-csrf-token": csrf,
      "cookie": `session=${sessionId}`,
      "x-requested-with": "XMLHttpRequest",
      "origin": "https://webtor.io",
      "referer": pageUrl,
      "user-agent": "Mozilla/5.0"
    }
  });

  // Step 3: Parse job-id from response
  const jobMatch = res.data.match(/\/queue\/download\/job\/([a-f0-9]+)\/log/);
  if (!jobMatch) throw new Error("Job ID not found!");

  const jobUrl = `https://webtor.io/queue/download/job/${jobMatch[1]}/log`;
  console.log("Job Log URL:", jobUrl);

  return { fileName, jobUrl };
}

scrapeFilePage("https://webtor.io/d0592cfa1f3aeb8318ceafca42191d1f8663faae")
  .then(data => console.log("Result:", data))
  .catch(err => console.error("Error:", err.response?.status, err.response?.data || err));
