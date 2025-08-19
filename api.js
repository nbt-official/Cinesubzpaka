const axios = require("axios");
const cheerio = require("cheerio");

async function scrapeLinks(videoUrl) {
  try {
    // Step 1: POST request with the video URL
    const response = await axios.post(
      "https://www.saveporn.net/vdownload/",
      new URLSearchParams({ url: videoUrl }), // form-urlencoded body
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36",
          Referer: "https://www.saveporn.net/",
          Origin: "https://www.saveporn.net",
        },
      }
    );

    // Step 2: Load HTML with cheerio
    const $ = cheerio.load(response.data);

    // Step 3: Scrape download links
    let results = [];
    $("#dtable table tr").each((i, el) => {
      const format = $(el).find("td").eq(0).text().trim();
      const quality = $(el).find("td").eq(1).text().trim();
      const link = $(el).find("a.dlbtn").attr("href");

      if (link) {
        results.push({ format, quality, link });
      }
    });

    return results;
  } catch (err) {
    console.error("Error:", err.message);
    return [];
  }
}

// Example usage
(async () => {
  const videoUrl = "https://www.pornhub.com/view_video.php?viewkey=687e14da729aa";
  const links = await scrapeLinks(videoUrl);
  console.log("Scraped download links:", links);
})();
