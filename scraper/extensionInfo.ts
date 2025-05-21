import chromium from "@sparticuz/chromium-min";
import puppeteer from "puppeteer-core";
import { setTimeout } from "node:timers/promises";
import dayjs from "dayjs";

interface ExtensionInfo {
  icon: string;
  name: string;
  description: string;
}

export async function getExtensionInfo(link: string): Promise<ExtensionInfo> {
  const isLocal = !!process.env.CHROME_EXECUTABLE_PATH;
  const browser = await puppeteer.launch({
    args: isLocal ? puppeteer.defaultArgs() : chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath:
      process.env.CHROME_EXECUTABLE_PATH ||
      (await chromium.executablePath(
        "https://github.com/Sparticuz/chromium/releases/download/v133.0.0/chromium-v133.0.0-pack.tar",
      )),
    headless: chromium.headless,
  });
  const page = await browser.newPage();
  await page.goto(link, {
    waitUntil: "networkidle2",
  });
  await page.waitForSelector(".rBxtY");
  const icon = await page.$eval(".rBxtY", (el) => el.getAttribute("src"));
  if (!icon) {
    throw new Error("Icon not found");
  }
  await page.waitForSelector(".Pa2dE");
  const name = await page.$eval(".Pa2dE", (el) => el.textContent?.trim());
  if (!name) {
    throw new Error("Name not found");
  }
  await page.waitForSelector(".MHH2Z");
  const seeMoreExists = await page.waitForSelector('[jsname="rs1XOd"]');
  if (seeMoreExists) {
    await page.locator('[jsname="rs1XOd"]').click();
  }
  await page.waitForSelector('[jsname="ij8cu"]');
  const description = await page.$eval('[jsname="ij8cu"]', (el) => {
    // Get all p tags within the element
    const paragraphs = Array.from(el.getElementsByTagName("p"));
    // Extract text content from each p tag and join with spaces
    return paragraphs
      .map((p) => p.textContent?.trim())
      .filter(Boolean)
      .join(" ");
  });
  if (!description) {
    throw new Error("Description not found");
  }
  console.log(icon, name, description);
  return {
    icon: icon || "",
    name: name || "",
    description: description || "",
  };
}
