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
const blockedHosts = new Set([
  "hm.baidu.com",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
]);

const pageSeo = {
  "/": {
    title: "HighEQ 高情商回复生成助手 - 5条候选、截图识别和继续聊",
    description:
      "HighEQ 根据聊天内容、关系和真实想法生成 5 条高情商回复，支持动态风格标签、人物档案、聊天截图识别和继续聊上下文记录。",
    keywords:
      "HighEQ,高情商回复,AI回复生成,AI聊天助手,智能回复生成,社交聊天,情商助手,聊天技巧,聊天截图识别,继续聊,风格标签,人物档案,恋爱聊天回复,职场沟通",
    canonicalUrl: "https://www.higheq.top/",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "高情商回复生成助手",
        alternateName: "HighEQ",
        url: "https://www.higheq.top/",
        description:
          "HighEQ 是 AI 高情商回复生成助手，支持聊天截图识别、5 条智能候选、动态风格标签、人物档案和继续聊上下文记录，帮你把一段聊天自然接下去。",
        applicationCategory: "UtilitiesApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "CNY",
        },
      },
    ],
  },
  "/talktype": {
    title: "TalkType 情商测试 - 免费测你的高情商沟通人格",
    description:
      "完成 24 道真实沟通场景题，测出你的 TalkType 沟通人格、SWBC 四维代码、表达优势和沟通盲区。",
    keywords:
      "TalkType,沟通人格测试,情商测试,EQ测试,高情商测试,MBTI式人格测试,高情商回复",
    canonicalUrl: "https://www.higheq.top/talktype",
    twitterCard: "summary",
    structuredData: [
      {
        "@context": "https://schema.org",
        "@type": "Quiz",
        name: "TalkType 沟通人格测试",
        description:
          "完成 24 道真实沟通场景题，测出你的 TalkType 沟通人格、SWBC 四维代码、表达优势和沟通盲区。",
        url: "https://www.higheq.top/talktype",
        inLanguage: "zh-CN",
        educationalUse: "Self assessment",
        assesses: ["沟通人格", "情绪洞察", "表达温度", "边界稳定", "局势掌控"],
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "TalkType 是情商测试吗？",
            acceptedAnswer: {
              "@type": "Answer",
              text: "TalkType 更像一个高情商沟通人格测试，会用真实聊天场景观察你的表达倾向。它适合自我了解和沟通训练，不等同于心理诊断或正式测评。",
            },
          },
          {
            "@type": "Question",
            name: "测试会保存我的聊天隐私吗？",
            acceptedAnswer: {
              "@type": "Answer",
              text: "TalkType 使用的是预设沟通场景题，不需要上传真实聊天记录。结果只用于展示你的沟通人格、四维分数和表达建议。",
            },
          },
          {
            "@type": "Question",
            name: "结果是怎么算出来的？",
            acceptedAnswer: {
              "@type": "Answer",
              text: "每个选项会影响 S 情绪洞察、W 表达温度、B 边界稳定、C 局势掌控四个维度，再匹配最接近的 TalkType 人格中心点。",
            },
          },
          {
            "@type": "Question",
            name: "为什么不是直接给一个 EQ 分数？",
            acceptedAnswer: {
              "@type": "Answer",
              text: "单一分数很难解释你到底哪里强、哪里容易踩坑。TalkType 更关注你的沟通风格，所以会给人格类型和四维画像。",
            },
          },
        ],
      },
    ],
  },
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

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function indentBlock(value, spaces = 6) {
  const padding = " ".repeat(spaces);
  return value
    .split("\n")
    .map((line) => `${padding}${line}`)
    .join("\n");
}

function renderMetaTag(attributes) {
  const renderedAttributes = Object.entries(attributes)
    .map(([key, value]) => `${key}="${escapeHtml(value)}"`)
    .join(" ");
  return `    <meta ${renderedAttributes} />`;
}

function renderSeoBlock(seo) {
  const tags = [
    "    <!-- SEO:PAGE_START -->",
    `    <title>${escapeHtml(seo.title)}</title>`,
    renderMetaTag({ name: "description", content: seo.description }),
    renderMetaTag({ name: "keywords", content: seo.keywords }),
    renderMetaTag({ name: "robots", content: "index,follow" }),
    `    <link rel="canonical" href="${escapeHtml(seo.canonicalUrl)}" />`,
    renderMetaTag({ property: "og:type", content: "website" }),
    renderMetaTag({ property: "og:url", content: seo.canonicalUrl }),
    renderMetaTag({ property: "og:title", content: seo.title }),
    renderMetaTag({ property: "og:description", content: seo.description }),
    renderMetaTag({ property: "og:site_name", content: "HighEQ" }),
  ];

  if (seo.twitterCard) {
    tags.push(
      renderMetaTag({ name: "twitter:card", content: seo.twitterCard }),
      renderMetaTag({ name: "twitter:title", content: seo.title }),
      renderMetaTag({ name: "twitter:description", content: seo.description })
    );
  }

  for (const item of seo.structuredData || []) {
    tags.push(
      "    <script type=\"application/ld+json\">",
      indentBlock(JSON.stringify(item, null, 2)),
      "    </script>"
    );
  }

  tags.push("    <!-- SEO:PAGE_END -->");
  return tags.join("\n");
}

function validatePrerenderConfig() {
  for (const route of prerenderRoutes) {
    if (!pageSeo[route.path]) {
      throw new Error(`Missing SEO config for prerender route: ${route.path}`);
    }
  }
}

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
      const normalizedPath = path.normalize(rawPath).replace(/^[/\\]+/, "");
      let filePath = path.resolve(distDir, normalizedPath);
      if (!filePath.startsWith(distDir + path.sep) && filePath !== distDir) {
        res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Forbidden");
        return;
      }

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

async function closeStaticServer(server) {
  if (!server.listening) {
    return;
  }
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

async function main() {
  validatePrerenderConfig();
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
        if (message.text().includes("Failed to load resource: net::ERR_FAILED")) {
          return;
        }
        console.warn(`[prerender console] ${message.text()}`);
      }
    });

    await page.route("**/*", async (route) => {
      const hostname = new URL(route.request().url()).hostname;
      if (blockedHosts.has(hostname)) {
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
        .replace(seoBlockPattern, renderSeoBlock(pageSeo[route.path]))
        .replace('<div id="root"></div>', `<div id="root">${rootHtml}</div>`);

      const outputPath = path.join(distDir, route.output);
      await fs.writeFile(outputPath, prerenderedHtml, "utf8");
      console.log(`Prerendered ${route.path} into ${path.relative(projectRoot, outputPath)}`);
    }
  } finally {
    if (browser) {
      await browser.close();
    }
    await closeStaticServer(server);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
