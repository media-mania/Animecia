import { writeFile, readdir, unlink } from "node:fs/promises";

const base = "https://media-mania.github.io/Animecia";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are required.");
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

async function fetchAnimePage(offset) {
  const url = new URL("/rest/v1/anime", supabaseUrl);
  url.searchParams.set("select", "id,updated_at");
  url.searchParams.set("order", "id.asc");
  url.searchParams.set("limit", "1000");
  url.searchParams.set("offset", String(offset));

  const response = await fetch(url, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

function urlEntry(loc, lastmod) {
  return [
    "  <url>",
    `    <loc>${esc(loc)}</loc>`,
    lastmod ? `    <lastmod>${esc(new Date(lastmod).toISOString())}</lastmod>` : "",
    "  </url>",
  ].filter(Boolean).join("\n");
}

const fixedPages = [
  `${base}/`,
  `${base}/anime.html`,
  `${base}/ranking.html`,
  `${base}/compare.html`,
  `${base}/season.html`,
];

const animeRows = [];
for (let offset = 0; ; offset += 1000) {
  const rows = await fetchAnimePage(offset);
  animeRows.push(...rows);
  if (rows.length < 1000) break;
}

const pageXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...fixedPages.map(loc => urlEntry(loc)),
  "</urlset>",
].join("\n");

await writeFile("sitemap-pages.xml", pageXml, "utf8");

const chunkSize = 5000;
const sitemapFiles = [];
for (let i = 0, chunkIndex = 1; i < animeRows.length; i += chunkSize, chunkIndex++) {
  const chunk = animeRows.slice(i, i + chunkSize);
  const filename = `sitemap-anime-${chunkIndex}.xml`;
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...chunk.map(row => urlEntry(`${base}/anime/${encodeURIComponent(row.id)}/`, row.updated_at)),
    "</urlset>",
  ].join("\n");
  await writeFile(filename, xml, "utf8");
  sitemapFiles.push(filename);
}

const existing = await readdir(".");
for (const filename of existing) {
  if (/^sitemap-anime-\d+\.xml$/.test(filename) && !sitemapFiles.includes(filename)) {
    await unlink(filename);
  }
}

const indexXml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  '  <sitemap><loc>' + base + '/sitemap-pages.xml</loc></sitemap>',
  ...sitemapFiles.map(filename => `  <sitemap><loc>${base}/${filename}</loc></sitemap>`),
  "</sitemapindex>",
].join("\n");
await writeFile("sitemap.xml", indexXml, "utf8");

console.log(`Generated sitemap for ${animeRows.length} anime records across ${sitemapFiles.length} anime sitemap files.`);
