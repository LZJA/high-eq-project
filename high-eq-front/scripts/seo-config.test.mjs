import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(projectRoot, "..");

const sitemap = fs.readFileSync(
  path.join(projectRoot, "client/public/sitemap.xml"),
  "utf8"
);
const prerenderScript = fs.readFileSync(
  path.join(projectRoot, "scripts/prerender-home.mjs"),
  "utf8"
);
const nginxConfig = fs.readFileSync(
  path.join(repoRoot, "deployment/nginx-front.conf"),
  "utf8"
);

test("sitemap contains only canonical public pages", () => {
  assert.match(sitemap, /<loc>https:\/\/www\.higheq\.top\/<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/www\.higheq\.top\/talktype<\/loc>/);
  assert.match(sitemap, /<loc>https:\/\/www\.higheq\.top\/high-eq-reply<\/loc>/);
  assert.doesNotMatch(sitemap, /<loc>https:\/\/www\.higheq\.top\/app<\/loc>/);
  assert.doesNotMatch(sitemap, /<loc>https:\/\/www\.higheq\.top\/eq-score<\/loc>/);
  assert.doesNotMatch(sitemap, /<loc>https:\/\/www\.higheq\.top\/eq-emergency<\/loc>/);
});

test("high-eq-reply is a prerendered public SEO route", () => {
  assert.match(prerenderScript, /"\/high-eq-reply"/);
  assert.match(prerenderScript, /high-eq-reply\.html/);
  assert.match(prerenderScript, /https:\/\/www\.higheq\.top\/high-eq-reply/);
  assert.match(prerenderScript, /高情商回复生成器/);
  assert.match(prerenderScript, /风格标签/);
  assert.match(prerenderScript, /继续聊/);
  assert.match(prerenderScript, /长上下文/);
});

test("nginx redirects apex domain to canonical www host", () => {
  assert.match(nginxConfig, /server_name\s+higheq\.top;/);
  assert.match(
    nginxConfig,
    /return\s+301\s+https:\/\/www\.higheq\.top\$request_uri;/
  );
});

test("app-only routes are marked noindex", () => {
  assert.match(
    nginxConfig,
    /location\s+~\s+\^\(\/app|\/login|\/register|\/history|\/favorites|\/profiles|\/admin\)/
  );
  assert.match(
    nginxConfig,
    /add_header\s+X-Robots-Tag\s+"noindex, nofollow"\s+always;/
  );
  assert.match(nginxConfig, /try_files\s+\/index\.html\s+=404;/);
});

test("public SPA routes can serve prerendered html files", () => {
  assert.match(nginxConfig, /try_files\s+\$uri\s+\$uri\.html\s+\$uri\/\s+\/index\.html;/);
});
