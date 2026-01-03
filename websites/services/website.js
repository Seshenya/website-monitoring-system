import "../../config/env.js";
import puppeteer from "puppeteer";
import { Website, WebsiteContent } from "../../models/index.js";
import { sendEmail } from "../../utils/sendEmail.js";
import { normalizeForDiff } from "../../utils/normalizeContent.js";
import { getUser } from "../../users/services/index.js";
import { diffArrays } from "diff";
import { buildGraph } from "../../llm/graph.js";

const monitoredWebsites = new Set();
const monitoringIntervals = new Map();

const graph = buildGraph();

function compareTextContent(oldHtml, newHtml) {
  const oldText = normalizeForDiff(oldHtml);
  const newText = normalizeForDiff(newHtml);

  const diff = diffArrays(oldText.split("\n\n"), newText.split("\n\n")); // block-level diff instead of line diff to reduce false positives

  const changes = diff.filter((part) => part.added || part.removed);

  if (changes.length === 0) {
    return { changed: false, diff: [] };
  }

  return {
    changed: true,
    diff: changes.map((part) => ({
      type: part.added ? "added" : "removed",
      value: Array.isArray(part.value)
        ? part.value.join("\n\n").trim()
        : part.value.trim(),
    })),
  };
}

async function fetchWebsiteContent(websiteUrl) {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const start = Date.now();
    const response = await page.goto(websiteUrl, { waitUntil: "networkidle2" });
    const loadTime = Date.now() - start;

    const statusCode = response.status();
    const textContent = await page.evaluate(() => document.body.innerText);
    await browser.close();

    return { textContent, statusCode, loadTime };
  } catch (error) {
    console.error(`Error fetching content from ${websiteUrl}:`, error.message);
    return { textContent: null, statusCode: null, loadTime: null };
  }
}

async function fetchAndSaveWebsiteData(websiteId, websiteUrl) {
  const { textContent, statusCode, loadTime } = await fetchWebsiteContent(
    websiteUrl
  );

  if (!textContent || !statusCode || !loadTime) {
    throw new Error(`Failed to fetch website content for: ${websiteUrl}`);
  }

  await WebsiteContent.create({
    websiteId,
    textContent,
    statusCode,
    loadTime,
  });

  return { textContent, statusCode, loadTime };
}

async function compareWebsite(websiteId, websiteUrl, keywords) {
  try {
    const latestContentPromise = WebsiteContent.findOne({
      websiteId,
    }).sort({ createdAt: -1 });

    const currentContentPromise = fetchAndSaveWebsiteData(
      websiteId,
      websiteUrl
    );

    const [latestContent, currentContent] = await Promise.all([
      latestContentPromise,
      currentContentPromise,
    ]);

    if (!latestContent) {
      console.log(`No previous content found for: ${websiteUrl}`);
      return { relevant: false };
    }

    const changedTextContent = compareTextContent(
      latestContent.textContent,
      currentContent.textContent
    );

    if (!changedTextContent.changed) {
      return { relevant: false };
    }

    const changesText = changedTextContent.diff
      .map((d) => `${d.type.toUpperCase()}: ${d.value}`)
      .join("\n");

    const result = await graph.invoke({
      keywords,
      changes: changesText,
      attempts: 0,
    });

    return {
      relevant: result.relevanceScore >= 0.7,
      score: result.relevanceScore,
      summary: result.summary,
      reason: result.relevanceReason,
    };
  } catch (error) {
    console.error(
      `Error comparing website data for ${websiteUrl}`,
      error.message
    );
    throw error;
  }
}

async function startWebsiteMonitor(
  websiteId,
  websiteUrl,
  timeDiff,
  keywords,
  userId,
  maxRetries = 3,
  retryDelay = 3000
) {
  if (monitoredWebsites.has(websiteUrl)) {
    console.log(`Website ${websiteUrl} is already being monitored.`);
    return;
  }

  let attempts = 0;
  let success = false;

  while (attempts < maxRetries && !success) {
    try {
      attempts++;
      console.log(`Attempt ${attempts} to fetch and save ${websiteUrl}...`);
      await fetchAndSaveWebsiteData(websiteId, websiteUrl);
      success = true;
    } catch (err) {
      console.error(
        `Error fetching/saving ${websiteUrl} (attempt ${attempts}):`,
        err.message
      );
      if (attempts < maxRetries) {
        const backoffDelay = retryDelay * Math.pow(2, attempts - 1);
        console.log(`Retrying in ${backoffDelay / 1000}s...`);
        await new Promise((res) => setTimeout(res, backoffDelay));
      }
    }
  }

  if (!success) {
    console.error(
      `Failed to initialize monitoring for ${websiteUrl} after ${maxRetries} attempts.`
    );
    return;
  }

  monitoredWebsites.add(websiteUrl);

  const intervalId = setInterval(async () => {
    try {
      const changes = await compareWebsite(websiteId, websiteUrl, keywords);
      if (changes.relevant) {
        console.log(
          `Changes detected for ${websiteUrl} with a relevance score of ${changes.score}`,
          changes
        );

        const user = await getUser(userId);

        await sendEmail(
          user.email,
          `Website changes detected.`,
          `Hi ${user.username},\n\nChanges detected on ${websiteUrl}:\n${changes.summary}\n\nRegards,\n${process.env.SENDER_NAME}`,
          `<p>Hi ${user.username},</p>
          <p>Changes detected on <a href="${websiteUrl}">${websiteUrl}</a>:</p>
          <pre>${changes.summary}</pre>
          <p>Regards,<br/>
          ${process.env.SENDER_NAME}</p>`
        );
      } else {
        console.log(`No changes for ${websiteUrl}`);
      }
    } catch (err) {
      console.error(`Error running comparison for ${websiteUrl}:`, err);
    }
  }, timeDiff);

  monitoringIntervals.set(websiteUrl, intervalId);
}

async function createWebsiteData(websiteUrl, timeDiff, keywords, userId) {
  try {
    let website = await Website.findOne({ url: websiteUrl, isActive: true });

    if (website) {
      const error = new Error("Website is already being crawled");
      error.code = "WEBSITE_ALREADY_CRAWLED";
      error.data = website;
      throw error;
    }

    website = await Website.create({
      url: websiteUrl,
      timeDiff,
      keywords,
      userId,
    });
    startWebsiteMonitor(
      website.id,
      website.url,
      website.timeDiff,
      website.keywords,
      website.userId
    );

    return website;
  } catch (error) {
    console.error("Error adding website data ", error.message);
    throw error;
  }
}

async function getWebsiteData(websiteId) {
  try {
    let website = await Website.findById(websiteId);

    if (!website) {
      throw new Error(`Failed to fetch the website for id: ${websiteId}`);
    }
    const { textContent, statusCode, loadTime } = await fetchWebsiteContent(
      website.url
    );

    if (!textContent || statusCode == null || loadTime == null) {
      console.log(`Failed to fetch website content for: ${website.url}`);
      throw new Error(`Failed to fetch website content for: ${website.url}`);
    }

    const latestContent = await WebsiteContent.findOne({
      websiteId,
    }).sort({ createdAt: -1 });

    if (!latestContent) {
      console.log(`No previous content found for: ${website.url}`);
      return {
        relevant: false,
        score: null,
        summary: textContent,
        reason: `No previous content found for: ${website.url}`,
      };
    }

    const changedTextContent = compareTextContent(
      latestContent.textContent,
      textContent
    );

    if (!changedTextContent.changed) {
      return {
        relevant: false,
        score: null,
        summary: null,
        reason: `No change has occured for: ${website.url}`,
      };
    }

    const changesText = changedTextContent.diff
      .map((d) => `${d.type.toUpperCase()}: ${d.value}`)
      .join("\n");

    const result = await graph.invoke({
      keywords,
      changes: changesText,
      attempts: 0,
    });

    return {
      relevant: result.relevanceScore >= 0.7,
      score: result.relevanceScore,
      summary: result.summary,
      reason: result.relevanceReason,
    };
  } catch (error) {
    console.error("Error comparing website data", error.message);
    throw error;
  }
}

async function startAllWebsitesMonitor() {
  try {
    const websites = await Website.find({ isActive: true });
    for (const website of websites) {
      startWebsiteMonitor(
        website._id,
        website.url,
        website.timeDiff,
        website.keywords,
        website.userId
      );
    }
  } catch (error) {
    console.error("Error in websites monitoring", error.message);
    throw error;
  }
}

async function disableWebsiteCrawling(websiteId) {
  try {
    let website = await Website.findById(websiteId);

    if (!website) {
      throw new Error(`Failed to fetch the website for id: ${websiteId}`);
    }

    const intervalId = monitoringIntervals.get(website.url);
    if (intervalId) {
      clearInterval(intervalId);
      monitoringIntervals.delete(website.url);
      monitoredWebsites.delete(website.url);
      console.log(`Stopped monitoring for website: ${website.url}`);
    }

    await Website.findByIdAndUpdate(
      websiteId,
      { isActive: false },
      { new: true }
    );
    return true;
  } catch (error) {
    console.error("Error in disabling crawling for the website", error.message);
    throw error;
  }
}

export {
  createWebsiteData,
  getWebsiteData,
  startAllWebsitesMonitor,
  disableWebsiteCrawling,
};
