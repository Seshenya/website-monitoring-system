import * as cheerio from "cheerio";

function extractCleanText(html) {
  const $ = cheerio.load(html);

  $("script, style, noscript, iframe").remove();

  const text = $.root().text(); // Get visible text

  return text
    .replace(/\s+/g, " ") // normalize whitespace
    .replace(/\u00A0/g, " ") // non-breaking spaces
    .trim();
}

export function normalizeForDiff(text) {
  const extractedText = extractCleanText(text);
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}
