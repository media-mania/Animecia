import { mkdir, readdir, rm, writeFile } from "node:fs/promises";

const base = "https://media-mania.github.io/Animecia";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are required.");
}

const outDir = "anime";
const pageSize = 500;

function esc(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function text(value = "") {
  return String(value).replace(/\s+/g, " ").trim();
}

function jsonLd(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

async function fetchAnimePage(offset) {
  const url = new URL("/rest/v1/anime", supabaseUrl);
  url.searchParams.set(
    "select",
    "id,title,title_japanese,title_english,title_native,english_title,description,synopsis,cover_image,banner_image,start_date,end_date,episodes,duration,status,format,season,season_year,source,average_score,popularity,favourites_count,updated_at,anime_genres(genres(name))"
  );
  url.searchParams.set("order", "id.asc");
  url.searchParams.set("limit", String(pageSize));
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

function mainTitle(anime) {
  return text(
    anime.title_japanese ||
    anime.title ||
    anime.title_native ||
    anime.title_english ||
    anime.english_title ||
    `Animecia作品 #${anime.id}`
  );
}

function description(anime) {
  const value = text(anime.description || anime.synopsis);
  if (value) return value.slice(0, 155);
  return `${mainTitle(anime)}のあらすじ、評価、ジャンル、放送情報、キャラクター、スタッフ、配信情報などをAnimeciaで確認できます。`.slice(0, 155);
}

function genres(anime) {
  return (anime.anime_genres || [])
    .map(row => row?.genres?.name)
    .filter(Boolean)
    .map(text);
}

function page(anime) {
  const title = mainTitle(anime);
  const desc = description(anime);
  const canonical = `${base}/anime/${encodeURIComponent(anime.id)}/`;
  const detail = `${base}/anime-detail.html?id=${encodeURIComponent(anime.id)}`;
  const image = /^https?:\/\//i.test(String(anime.cover_image || "")) ? anime.cover_image : "";
  const genreList = genres(anime);
  const genreHtml = genreList.length
    ? `<div class="genres">${genreList.map(g => `<span>${esc(g)}</span>`).join("")}</div>`
    : "";
  const synopsis = text(anime.synopsis || anime.description);
  const meta = [
    ["形式", anime.format],
    ["放送状況", anime.status],
    ["放送年", anime.season_year],
    ["話数", anime.episodes],
    ["平均評価", anime.average_score],
  ].filter(([,v]) => v !== null && v !== undefined && String(v).trim() !== "");

  const schema = {
    "@context": "https://schema.org",
    "@type": anime.format === "Movie" ? "Movie" : "TVSeries",
    name: title,
    url: canonical,
    description: desc,
    image: image || undefined,
    genre: genreList.length ? genreList : undefined,
    dateCreated: anime.start_date || undefined,
    dateModified: anime.updated_at || undefined,
    aggregateRating: anime.average_score
      ? {
          "@type": "AggregateRating",
          ratingValue: Number(anime.average_score),
          bestRating: 10,
          worstRating: 0,
        }
      : undefined,
  };

  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} | 評価・あらすじ・作品情報 | Animecia</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="index,follow">
<link rel="canonical" href="${esc(canonical)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Animecia">
<meta property="og:title" content="${esc(title)} | Animecia">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(canonical)}">
${image ? `<meta property="og:image" content="${esc(image)}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${jsonLd(schema)}</script>
<style>
body{margin:0;background:#f6f6f6;color:#222;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Yu Gothic",Meiryo,sans-serif;line-height:1.7}
main{max-width:900px;margin:0 auto;padding:32px 20px}
.card{background:#fff;border-radius:16px;padding:24px;box-shadow:0 4px 20px rgba(0,0,0,.06)}
h1{line-height:1.35;margin-top:0}
.cover{max-width:280px;max-height:390px;object-fit:cover;border-radius:10px}
.genres{display:flex;flex-wrap:wrap;gap:8px;margin:16px 0}.genres span{padding:5px 10px;border-radius:999px;background:#eee}
.meta{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin:20px 0}.meta div{padding:10px;background:#f5f5f5;border-radius:8px}
a.button{display:inline-block;padding:11px 16px;background:#111;color:#fff;text-decoration:none;border-radius:8px}
small{color:#666}
</style>
</head>
<body>
<main>
<div class="card">
<p><small>Animecia / アニメ作品情報</small></p>
<h1>${esc(title)}</h1>
${image ? `<img class="cover" src="${esc(image)}" alt="${esc(title)}の画像" loading="eager">` : ""}
${genreHtml}
${synopsis ? `<h2>あらすじ・作品紹介</h2><p>${esc(synopsis)}</p>` : ""}
${meta.length ? `<div class="meta">${meta.map(([k,v]) => `<div><strong>${esc(k)}</strong><br>${esc(v)}</div>`).join("")}</div>` : ""}
<p><a class="button" href="${esc(detail)}">Animeciaで詳細を見る</a></p>
<p><small>評価・レビュー・キャラクター・スタッフ・配信情報などの詳細は作品ページで確認できます。</small></p>
</div>
</main>
</body>
</html>`;
}

const animeRows = [];
for (let offset = 0; ; offset += pageSize) {
  const rows = await fetchAnimePage(offset);
  animeRows.push(...rows);
  if (rows.length < pageSize) break;
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

for (const anime of animeRows) {
  if (!anime?.id) continue;
  const dir = `${outDir}/${anime.id}`;
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}/index.html`, page(anime), "utf8");
}

console.log(`Generated ${animeRows.length} static SEO anime pages.`);
