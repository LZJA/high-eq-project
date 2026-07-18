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
const nginxConfig = fs.readFileSync(
  path.join(repoRoot, "deployment/nginx-front.conf"),
  "utf8"
);

test("sitemap contains only canonical public pages", () => {
  assert.match(sitemap, /<loc>https:\/\/www\.higheq\.top\/<\/loc>/);
  assert.doesNotMatch(sitemap, /<loc>https:\/\/www\.higheq\.top\/app<\/loc>/);
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
});
