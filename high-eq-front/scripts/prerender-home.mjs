import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const indexPath = path.join(distDir, "index.html");

const contentTypes = new Map([
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".txt", "text/plain; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
]);

async function resolveBrowserPath() {
  const candidates = [
    process.env.PRERENDER_BROWSER_PATH,
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/microsoft-edge",
    "/usr/lib64/chromium-browser/headless_shell",
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await fs.access(candidate);
      return candidate;
    } catch {
      // Try the next common browser path.
    }
  }

  throw new Error(
    "No Chrome/Edge executable found. Set PRERENDER_BROWSER_PATH to a Chromium-based browser."
  );
}

async function createStaticServer() {
  const server = http.createServer(async (req, res) => {
    try {
      const requestUrl = new URL(req.url || "/", "http://127.0.0.1");
      const rawPath = decodeURIComponent(requestUrl.pathname);
      const safePath = path.normalize(rawPath).replace(/^(\.\.[/\\])+/, "");
      let filePath = path.join(distDir, safePath);

      const stat = await fs.stat(filePath).catch(() => null);
      if (!stat || stat.isDirectory()) {
        filePath = indexPath;
      }

      const body = await fs.readFile(filePath);
      res.writeHead(200, {
        "Content-Type": contentTypes.get(path.extname(filePath)) || "application/octet-stream",
      });
      res.end(body);
    } catch (error) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end(String(error));
    }
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  return {
    server,
    origin: `http://127.0.0.1:${address.port}`,
  };
}

async function main() {
  const browserPath = await resolveBrowserPath();
  const { server, origin } = await createStaticServer();
  let browser;

  try {
    browser = await chromium.launch({
      executablePath: browserPath,
      headless: true,
    });

    const page = await browser.newPage({
      viewport: { width: 1366, height: 900 },
    });

    page.on("console", (message) => {
      if (message.type() === "error") {
        console.warn(`[prerender console] ${message.text()}`);
      }
    });

    await page.route("**/*", async (route) => {
      const url = route.request().url();
      if (
        url.includes("hm.baidu.com") ||
        url.includes("fonts.googleapis.com") ||
        url.includes("fonts.gstatic.com")
      ) {
        await route.abort();
        return;
      }
      await route.continue();
    });

    await page.goto(`${origin}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForFunction(
      () => {
        const root = document.getElementById("root");
        return !!root && root.children.length > 0 && root.textContent?.includes("HighEQ");
      },
      { timeout: 30000 }
    );
    await page.waitForTimeout(1000);

    const rootHtml = await page.$eval("#root", (element) => element.innerHTML);
    if (!rootHtml.trim()) {
      throw new Error("Rendered #root is empty.");
    }

    const indexHtml = await fs.readFile(indexPath, "utf8");
    if (!indexHtml.includes('<div id="root"></div>')) {
      throw new Error('Expected empty <div id="root"></div> in dist/index.html.');
    }

    const prerenderedHtml = indexHtml.replace(
      '<div id="root"></div>',
      `<div id="root">${rootHtml}</div>`
    );

    await fs.writeFile(indexPath, prerenderedHtml, "utf8");
    console.log(`Prerendered / into ${path.relative(projectRoot, indexPath)}`);
  } finally {
    if (browser) {
      await browser.close();
    }
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
