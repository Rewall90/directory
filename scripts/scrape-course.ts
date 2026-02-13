/**
 * Golf Course Website Scraper
 *
 * Uses Playwright to scrape golf course websites and extract structured content
 * for AI analysis. Outputs text content that Claude can parse to extract
 * pricing, contact info, facilities, etc.
 *
 * Usage:
 *   npx tsx scripts/scrape-course.ts "https://www.oslogk.no"
 *
 * Prerequisites:
 *   npm install -g playwright
 *   npx playwright install chromium
 */

import { chromium, Browser, Page } from "playwright";

interface ScrapedPage {
  url: string;
  title: string;
  content: string;
}

interface ScrapedData {
  baseUrl: string;
  scrapedAt: string;
  pages: ScrapedPage[];
  errors: string[];
}

// Norwegian keywords for finding relevant pages
const RELEVANT_PAGE_KEYWORDS = [
  // Pricing
  "pris",
  "priser",
  "greenfee",
  "green fee",
  "medlemskap",
  "kontingent",
  // Contact
  "kontakt",
  "om oss",
  "om klubben",
  // Facilities
  "fasiliteter",
  "anlegg",
  "bane",
  "banen",
  "driving range",
  "simulator",
  // Booking
  "bestill",
  "booking",
  "book",
  // Restaurant
  "restaurant",
  "cafe",
  "kafé",
  "spise",
];

async function waitForPageLoad(page: Page): Promise<void> {
  try {
    await page.waitForLoadState("networkidle", { timeout: 15000 });
  } catch {
    // Fallback to domcontentloaded if networkidle times out
    await page.waitForLoadState("domcontentloaded", { timeout: 5000 });
  }
}

async function extractPageContent(page: Page): Promise<string> {
  return page.evaluate(() => {
    // Remove script and style elements
    const elementsToRemove = document.querySelectorAll("script, style, noscript, iframe, svg");
    elementsToRemove.forEach((el) => el.remove());

    // Get main content areas first (prefer these)
    const mainSelectors = [
      "main",
      "article",
      '[role="main"]',
      ".main-content",
      "#main-content",
      ".content",
      "#content",
    ];

    for (const selector of mainSelectors) {
      const mainEl = document.querySelector(selector);
      if (mainEl && mainEl.textContent && mainEl.textContent.trim().length > 100) {
        return mainEl.textContent
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
          .join("\n");
      }
    }

    // Fallback to body
    return document.body.innerText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");
  });
}

async function findRelevantLinks(page: Page, baseUrl: string): Promise<string[]> {
  const links = await page.evaluate(
    ({ keywords, base }) => {
      const allLinks = Array.from(document.querySelectorAll("a[href]"));
      const relevantHrefs: string[] = [];

      for (const link of allLinks) {
        const href = link.getAttribute("href");
        const text = link.textContent?.toLowerCase().trim() || "";

        if (!href) continue;

        // Skip external links, anchors, and non-http links
        if (
          href.startsWith("mailto:") ||
          href.startsWith("tel:") ||
          href.startsWith("#") ||
          href.startsWith("javascript:")
        ) {
          continue;
        }

        // Check if link text contains relevant keywords
        const isRelevant = keywords.some(
          (keyword: string) =>
            text.includes(keyword.toLowerCase()) ||
            href.toLowerCase().includes(keyword.toLowerCase()),
        );

        if (isRelevant) {
          try {
            const fullUrl = new URL(href, base).href;
            // Only include links from the same domain
            if (fullUrl.startsWith(base) || new URL(fullUrl).hostname === new URL(base).hostname) {
              relevantHrefs.push(fullUrl);
            }
          } catch {
            // Invalid URL, skip
          }
        }
      }

      return [...new Set(relevantHrefs)];
    },
    { keywords: RELEVANT_PAGE_KEYWORDS, base: baseUrl },
  );

  return links;
}

async function scrapePage(browser: Browser, url: string): Promise<ScrapedPage | null> {
  const page = await browser.newPage();

  try {
    await page.goto(url, { timeout: 30000 });
    await waitForPageLoad(page);

    const title = await page.title();
    const content = await extractPageContent(page);

    return {
      url,
      title,
      content,
    };
  } catch (error) {
    console.error(`Failed to scrape ${url}: ${error}`);
    return null;
  } finally {
    await page.close();
  }
}

async function scrapeCourse(url: string): Promise<ScrapedData> {
  const result: ScrapedData = {
    baseUrl: url,
    scrapedAt: new Date().toISOString(),
    pages: [],
    errors: [],
  };

  console.error(`Starting scrape of ${url}...`);

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    // Scrape main page
    const mainPage = await scrapePage(browser, url);
    if (mainPage) {
      result.pages.push(mainPage);
      console.error(`Scraped main page: ${mainPage.title}`);
    } else {
      result.errors.push(`Failed to scrape main page: ${url}`);
      return result;
    }

    // Find relevant subpages
    const page = await browser.newPage();
    await page.goto(url, { timeout: 30000 });
    await waitForPageLoad(page);

    const relevantLinks = await findRelevantLinks(page, url);
    await page.close();

    console.error(`Found ${relevantLinks.length} relevant links to scrape`);

    // Scrape up to 8 relevant subpages
    const linksToScrape = relevantLinks.slice(0, 8);

    for (const link of linksToScrape) {
      // Skip if we already scraped this URL
      if (result.pages.some((p) => p.url === link)) {
        continue;
      }

      console.error(`Scraping: ${link}`);
      const scrapedPage = await scrapePage(browser, link);

      if (scrapedPage) {
        result.pages.push(scrapedPage);
        console.error(`  -> ${scrapedPage.title}`);
      } else {
        result.errors.push(`Failed to scrape: ${link}`);
      }

      // Small delay between requests to be polite
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  } finally {
    await browser.close();
  }

  console.error(
    `Scrape complete. ${result.pages.length} pages scraped, ${result.errors.length} errors.`,
  );

  return result;
}

function formatOutput(data: ScrapedData): string {
  const lines: string[] = [];

  lines.push("=".repeat(80));
  lines.push(`GOLF COURSE WEBSITE SCRAPE`);
  lines.push(`Base URL: ${data.baseUrl}`);
  lines.push(`Scraped at: ${data.scrapedAt}`);
  lines.push(`Pages scraped: ${data.pages.length}`);
  lines.push("=".repeat(80));
  lines.push("");

  for (const page of data.pages) {
    lines.push("-".repeat(80));
    lines.push(`PAGE: ${page.title}`);
    lines.push(`URL: ${page.url}`);
    lines.push("-".repeat(80));
    lines.push("");
    lines.push(page.content);
    lines.push("");
  }

  if (data.errors.length > 0) {
    lines.push("=".repeat(80));
    lines.push("ERRORS:");
    for (const error of data.errors) {
      lines.push(`- ${error}`);
    }
  }

  return lines.join("\n");
}

// Main execution
const url = process.argv[2];

if (!url) {
  console.error("Usage: npx tsx scripts/scrape-course.ts <url>");
  console.error('Example: npx tsx scripts/scrape-course.ts "https://www.oslogk.no"');
  process.exit(1);
}

// Validate URL
try {
  new URL(url);
} catch {
  console.error(`Invalid URL: ${url}`);
  process.exit(1);
}

scrapeCourse(url)
  .then((data) => {
    // Output formatted content to stdout (for AI analysis)
    console.log(formatOutput(data));
  })
  .catch((error) => {
    console.error("Scrape failed:", error);
    process.exit(1);
  });
