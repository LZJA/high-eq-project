import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const distDir = path.join(projectRoot, "dist");
const indexPath = path.join(distDir, "index.html");
const seoBlockPattern = /    <!-- SEO:PAGE_START -->[\s\S]*?    <!-- SEO:PAGE_END -->/;

const pageSeoBlocks = {
  "/": `    <!-- SEO:PAGE_START -->
    <title>高情商回复生成助手 - AI智能聊天助手</title>
    <meta name="description" content="AI 智能生成高情商聊天回复,帮你在各种社交场景下说出得体的话。" />
    <meta name="keywords" content="higheq,HighEQ,高情商回复,AI聊天助手,智能回复生成,社交聊天,情商助手,聊天技巧" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="https://www.higheq.top/" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.higheq.top/" />
    <meta property="og:title" content="高情商回复生成助手 - AI智能聊天助手" />
    <meta property="og:description" content="AI 智能生成高情商聊天回复，支持聊天截图识别、角色背景适配和多种语气风格，帮你在职场、恋爱、朋友和家庭沟通中说出得体的话。" />
    <meta property="og:site_name" content="HighEQ" />
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "高情商回复生成助手",
        "alternateName": "HighEQ",
        "url": "https://www.higheq.top/",
        "description": "AI 智能生成高情商聊天回复，支持聊天截图识别、角色背景适配和多种语气风格，帮你在职场、恋爱、朋友和家庭沟通中说出得体的话。",
        "applicationCategory": "UtilitiesApplication",
        "operatingSystem": "Web",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "CNY"
        }
      }
    </script>
    <!-- SEO:PAGE_END -->`,
  "/talktype": `    <!-- SEO:PAGE_START -->
    <title>TalkType 情商测试 - 免费测你的高情商沟通人格</title>
    <meta name="description" content="完成 24 道真实沟通场景题，测出你的 TalkType 沟通人格、SWBC 四维代码、表达优势和沟通盲区。" />
    <meta name="keywords" content="TalkType,沟通人格测试,情商测试,EQ测试,高情商测试,MBTI式人格测试,高情商回复" />
    <meta name="robots" content="index,follow" />
    <link rel="canonical" href="https://www.higheq.top/talktype" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://www.higheq.top/talktype" />
    <meta property="og:title" content="TalkType 情商测试 - 免费测你的高情商沟通人格" />
    <meta property="og:description" content="完成 24 道真实沟通场景题，测出你的 TalkType 沟通人格、SWBC 四维代码、表达优势和沟通盲区。" />
    <meta property="og:site_name" content="HighEQ" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="TalkType 情商测试 - 免费测你的高情商沟通人格" />
    <meta name="twitter:description" content="完成 24 道真实沟通场景题，测出你的 TalkType 沟通人格、SWBC 四维代码、表达优势和沟通盲区。" />
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "Quiz",
        "name": "TalkType 沟通人格测试",
        "description": "完成 24 道真实沟通场景题，测出你的 TalkType 沟通人格、SWBC 四维代码、表达优势和沟通盲区。",
        "url": "https://www.higheq.top/talktype",
        "inLanguage": "zh-CN",
        "educationalUse": "Self assessment",
        "assesses": ["沟通人格", "情绪洞察", "表达温度", "边界稳定", "局势掌控"]
      }
    </script>
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "TalkType 是情商测试吗？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "TalkType 更像一个高情商沟通人格测试，会用真实聊天场景观察你的表达倾向。它适合自我了解和沟通训练，不等同于心理诊断或正式测评。"
            }
          },
          {
            "@type": "Question",
            "name": "测试会保存我的聊天隐私吗？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "TalkType 使用的是预设沟通场景题，不需要上传真实聊天记录。结果只用于展示你的沟通人格、四维分数和表达建议。"
            }
          },
          {
            "@type": "Question",
            "name": "结果是怎么算出来的？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "每个选项会影响 S 情绪洞察、W 表达温度、B 边界稳定、C 局势掌控四个维度，再匹配最接近的 TalkType 人格中心点。"
            }
          },
          {
            "@type": "Question",
            "name": "为什么不是直接给一个 EQ 分数？",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "单一分数很难解释你到底哪里强、哪里容易踩坑。TalkType 更关注你的沟通风格，所以会给人格类型和四维画像。"
            }
          }
        ]
      }
    </script>
    <!-- SEO:PAGE_END -->`,
};

const prerenderRoutes = [
  { path: "/", output: "index.html", waitForText: "HighEQ" },
  { path: "/talktype", output: "talktype.html", waitForText: "TalkType 沟通人格测试" },
];

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

    const indexHtml = await fs.readFile(indexPath, "utf8");
    if (!indexHtml.includes('<div id="root"></div>')) {
      throw new Error('Expected empty <div id="root"></div> in dist/index.html.');
    }
    if (!seoBlockPattern.test(indexHtml)) {
      throw new Error("Expected SEO marker block in dist/index.html.");
    }

    for (const route of prerenderRoutes) {
      await page.goto(`${origin}${route.path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForFunction(
        (text) => {
          const root = document.getElementById("root");
          return !!root && root.children.length > 0 && !!root.textContent?.includes(text);
        },
        route.waitForText,
        { timeout: 30000 }
      );
      await page.waitForTimeout(1000);

      const rootHtml = await page.$eval("#root", (element) => element.innerHTML);
      if (!rootHtml.trim()) {
        throw new Error(`Rendered #root is empty for ${route.path}.`);
      }

      const prerenderedHtml = indexHtml
        .replace(seoBlockPattern, pageSeoBlocks[route.path])
        .replace('<div id="root"></div>', `<div id="root">${rootHtml}</div>`);

      const outputPath = path.join(distDir, route.output);
      await fs.writeFile(outputPath, prerenderedHtml, "utf8");
      console.log(`Prerendered ${route.path} into ${path.relative(projectRoot, outputPath)}`);
    }
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
