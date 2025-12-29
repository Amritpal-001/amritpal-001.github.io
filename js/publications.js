/*
  Client-side publication renderer.

  Why: keep `index.html` clean and avoid copy/pasting repetitive paper HTML.
  How: load markdown files listed in `data/publications.json`, parse YAML frontmatter,
       then render rows that match the existing Jon Barron-style layout.

  Works on GitHub Pages (static hosting) because it just fetches static files.
*/

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripQuotes(s) {
  const t = s.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

function parseFrontmatter(mdText) {
  // Supports a simple YAML subset: key: value (single-line), with quoted strings.
  // Returns: { frontmatter: object, body: string }
  const normalized = mdText.replace(/\r\n/g, "\n");
  if (!normalized.startsWith("---\n")) {
    return { frontmatter: {}, body: normalized };
  }

  const end = normalized.indexOf("\n---\n", 4);
  if (end === -1) {
    return { frontmatter: {}, body: normalized };
  }

  const fmBlock = normalized.slice(4, end).trim();
  const body = normalized.slice(end + "\n---\n".length);

  const fm = {};
  for (const line of fmBlock.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const colon = trimmed.indexOf(":");
    if (colon === -1) continue;
    const key = trimmed.slice(0, colon).trim();
    const value = stripQuotes(trimmed.slice(colon + 1).trim());
    fm[key] = value;
  }

  return { frontmatter: fm, body };
}

function extractFirstImageSrc(mdBody) {
  // Matches: <img src="..." ...>
  const m = mdBody.match(/<img\s+[^>]*src=["']([^"']+)["'][^>]*>/i);
  return m ? m[1] : null;
}

function extractAuthorsLine(mdBody) {
  // Matches: Authors:  ...
  const m = mdBody.match(/\n?Authors:\s*(.+)\n/i);
  return m ? m[1].trim() : null;
}

function toYear(dateStr) {
  // date: YYYY-MM-DD (from your frontmatter)
  const m = String(dateStr || "").match(/(\d{4})/);
  return m ? m[1] : "";
}

function buildPublicationRow(pub) {
  // pub: { title, venue, date, excerpt, paperurl, permalink, image, authors }
  const tr = document.createElement("tr");

  // Optional highlight
  if (pub.highlight) tr.setAttribute("bgcolor", "#ffffd0");

  // Left cell (thumb)
  const tdImg = document.createElement("td");
  tdImg.style.padding = "16px";
  tdImg.style.width = "20%";
  tdImg.style.verticalAlign = "middle";

  const img = document.createElement("img");
  img.src = pub.image || "images/placeholder.png";
  img.style.width = "100%";
  img.alt = pub.title || "publication";
  img.className = "publication-thumb";
  tdImg.appendChild(img);

  // Right cell (text)
  const tdText = document.createElement("td");
  tdText.style.padding = "8px";
  tdText.style.width = "80%";
  tdText.style.verticalAlign = "middle";

  const titleLink = document.createElement("a");
  titleLink.href = pub.paperurl || pub.permalink || "#";

  const titleSpan = document.createElement("span");
  titleSpan.className = "papertitle";
  titleSpan.textContent = pub.title || "(untitled)";
  titleLink.appendChild(titleSpan);
  tdText.appendChild(titleLink);
  tdText.appendChild(document.createElement("br"));

  if (pub.authors) {
    const authors = document.createElement("div");
    authors.textContent = pub.authors;
    tdText.appendChild(authors);
  }

  const venueLine = document.createElement("div");
  const venue = pub.venue || "";
  const year = pub.year || toYear(pub.date);
  venueLine.innerHTML = `${venue ? `<em>${escapeHtml(venue)}</em>` : ""}${venue && year ? ", " : ""}${escapeHtml(year)}`;
  tdText.appendChild(venueLine);

  // Links
  const linkLine = document.createElement("div");
  const links = [];
  if (pub.paperurl) links.push(`<a href="${escapeHtml(pub.paperurl)}">paper</a>`);
  if (pub.permalink) links.push(`<a href="${escapeHtml(pub.permalink)}">page</a>`);
  linkLine.innerHTML = links.join(" / ");
  tdText.appendChild(linkLine);

  // Excerpt
  if (pub.excerpt) {
    const p = document.createElement("p");
    p.textContent = pub.excerpt;
    tdText.appendChild(p);
  }

  tr.appendChild(tdImg);
  tr.appendChild(tdText);
  return tr;
}

async function fetchText(url) {
  const res = await fetch(url, { cache: "no-cache" });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
  }
  return await res.text();
}

async function loadPublication(mdPath) {
  const md = await fetchText(mdPath);
  const { frontmatter, body } = parseFrontmatter(md);

  const image = frontmatter.image || extractFirstImageSrc(body);
  const authors = frontmatter.authors || extractAuthorsLine(body);

  return {
    title: frontmatter.title,
    venue: frontmatter.venue,
    date: frontmatter.date,
    year: frontmatter.year,
    excerpt: frontmatter.excerpt,
    paperurl: frontmatter.paperurl,
    permalink: frontmatter.permalink,
    highlight: frontmatter.highlight === "true" || frontmatter.highlight === true,
    image,
    authors,
    _source: mdPath,
  };
}

export async function renderPublications({
  manifestPath = "data/publications.json",
  mountId = "publications",
} = {}) {
  const mount = document.getElementById(mountId);
  if (!mount) {
    throw new Error(`renderPublications: mount element #${mountId} not found`);
  }

  const manifest = JSON.parse(await fetchText(manifestPath));
  const paths = Array.isArray(manifest) ? manifest : manifest.publications;
  if (!Array.isArray(paths)) {
    throw new Error("publications manifest must be an array or { publications: [...] }");
  }

  // Create a table like the existing layout
  const table = document.createElement("table");
  table.style.width = "100%";
  table.style.border = "0px";
  table.style.borderSpacing = "0px 10px";
  table.style.borderCollapse = "separate";
  table.style.marginRight = "auto";
  table.style.marginLeft = "auto";

  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  const pubs = await Promise.all(paths.map(loadPublication));

  // Sort newest first by date if available
  pubs.sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

  for (const pub of pubs) {
    tbody.appendChild(buildPublicationRow(pub));
  }

  mount.innerHTML = "";
  mount.appendChild(table);
}
