const axios = require("axios");

async function getJobUrl(resourceId, itemId) {
  // Step 1: trigger the download job
  const res = await axios.post(
    "https://webtor.io/download-file",
    new URLSearchParams({
      "resource-id": resourceId,
      "item-id": itemId
    }),
    { maxRedirects: 0 } // we don’t follow redirects
  );

  // Step 2: extract the job log URL
  const match = res.data.match(/\/queue\/download\/job\/([a-f0-9]+)\/log/);
  if (!match) {
    throw new Error("Job ID not found in response!");
  }

  const jobUrl = `https://webtor.io/queue/download/job/${match[1]}/log`;
  console.log("Job Log URL:", jobUrl);
  return jobUrl;
}

getJobUrl(
  "d0592cfa1f3aeb8318ceafca42191d1f8663faae", // resource-id
  "7ca875a0075b0a9c629e21d82de16141f49f6640"  // item-id
);
