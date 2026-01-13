import { writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const defaultSiteUrl = "https://time.gritcuriosityandperseverance.org";
const siteUrl = (process.env.SITE_URL || defaultSiteUrl).replace(/\/+$/, "");
const lastmod = new Date().toISOString().split("T")[0];

const urls = [
  {
    loc: `${siteUrl}/`,
    changefreq: "hourly",
    priority: 1,
    lastmod,
  },
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls
    .map(
      (entry) =>
        "  <url>\n" +
        `    <loc>${entry.loc}</loc>\n` +
        `    <lastmod>${entry.lastmod}</lastmod>\n` +
        `    <changefreq>${entry.changefreq}</changefreq>\n` +
        `    <priority>${entry.priority}</priority>\n` +
        "  </url>\n"
    )
    .join("") +
  "</urlset>\n";

const publicDir = path.join(process.cwd(), "public");
await writeFile(path.join(publicDir, "sitemap.xml"), sitemap);
