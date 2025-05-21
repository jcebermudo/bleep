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
    await page.waitForSelector(".T7rvce");
    const icon = await page.$eval(".T7rvce", (item: Element) => {
        const iconElement = item.querySelector("img");
        if (!iconElement) return null;
        return iconElement.getAttribute("src");
    });
    const name = await page.$eval(".T7rvce", (item: Element) => {
        const nameElement = item.querySelector("h1");
        if (!nameElement) return null;
        return nameElement.textContent?.trim();
    });
    const description = await page.$eval(".T7rvce", (item: Element) => {
        const descriptionElement = item.querySelector("p");
        if (!descriptionElement) return null;
        return descriptionElement.textContent?.trim();
    });
    return {
        icon: icon || "",
        name: name || "",
        description: description || "",
    };
}   
