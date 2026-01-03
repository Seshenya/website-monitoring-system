import {
  createWebsiteData,
  getWebsiteData,
  startAllWebsitesMonitor,
  disableWebsiteCrawling,
} from "../services/index.js";

async function addWebsiteData(req, res) {
  const websiteUrl = req.body.website;
  const timeDiff = req.body.timeDiff;
  const keywords = req.body.keywords;
  const userId = req.body.userId;

  if (!websiteUrl) {
    return res
      .status(400)
      .send({ message: "Missing 'website url' in request parameters." });
  }

  if (!userId) {
    return res
      .status(400)
      .send({ message: "Missing 'user id' in request parameters." });
  }

  createWebsiteData(websiteUrl, timeDiff, keywords, userId)
    .then((website) => {
      res.status(201).json(website);
    })
    .catch((error) => {
      console.error("Error creating website data:", error);

      if (error.code === "WEBSITE_ALREADY_CRAWLED") {
        return res.status(409).json({
          message: error.message,
          website: error.data,
        });
      }

      res.status(500).json({
        message:
          "We couldn't add the website data right now. Please try again later.",
      });
    });
}

async function fetchWebsiteData(req, res) {
  const websiteId = req.params.id;

  if (!websiteId) {
    return res
      .status(400)
      .send({ message: "Missing 'website id' in request parameters." });
  }
  getWebsiteData(websiteId)
    .then((websiteChanges) => {
      res.send(websiteChanges);
    })
    .catch((error) => {
      console.error("Error fetching website data:", error);

      res.status(500).json({
        message:
          "We couldn't fetch the website data right now. Please try again later.",
      });
    });
}

async function startMonitoring() {
  try {
    await startAllWebsitesMonitor();
    console.log("Monitoring started for all websites");
  } catch (error) {
    console.error("Failed while monitoring websites", error);
    throw new Error("Monitoring could not be started. Please try again later.");
  }
}

async function stopWebsiteCrawling(req, res) {
  const websiteId = req.params.id;

  if (!websiteId) {
    return res
      .status(400)
      .send({ message: "Missing 'website id' in request parameters." });
  }
  disableWebsiteCrawling(websiteId)
    .then(() => {
      res.status(200).json({ success: true });
    })
    .catch((error) => {
      console.error("Error stopping website crawling:", error);

      res.status(500).json({
        message:
          "We couldn't stop the website crawling right now. Please try again later.",
      });
    });
}

export {
  addWebsiteData,
  fetchWebsiteData,
  startMonitoring,
  stopWebsiteCrawling,
};
