#!/usr/bin/env node
/**
 * Prebuild del portafolio — nolo.ar consume el CRM.
 *
 * Genera `src/app/generated/portfolio.data.json` desde el endpoint público del CRM:
 *   GET <CRM>/api/public/portfolio?site=AR
 * Base del CRM: https://linkdesign-crm-api.azurewebsites.net (override con la env
 * `CRM_PORTFOLIO_API`, p. ej. `CRM_PORTFOLIO_API=http://localhost:3000` en dev).
 *
 * CUÁNDO CORRE:
 *   - Automáticamente antes de `ng build` (hook npm "prebuild" en package.json).
 *   - `npm start` (ng serve) NO lo corre: en dev se usa el JSON ya commiteado.
 *     Para refrescarlo a mano: `node scripts/generate-portfolio.mjs`.
 *
 * QUÉ HACE:
 *   1. Trae los proyectos visibles del sitio AR, ya ordenados por el CRM (sortOrder).
 *   2. Assets: los paths RELATIVOS (`/media/...`, los 26 iniciales) quedan tal cual —
 *      ya viven en public/. Las URLs ABSOLUTAS (proyectos futuros, pipeline de media
 *      del CRM) se descargan a `public/media/portfolio/<slug>-<pieza>.<ext>` (el hero
 *      a `public/media/hero/<slug>.mp4`) y el JSON queda con el path relativo local.
 *      Idempotente: `src/app/generated/portfolio.assets.json` registra la URL de origen
 *      (con nombre versionado) de cada asset descargado — solo re-descarga si cambió.
 *   3. Escribe `{ es, en, slugs }`; cada fila con el shape de PortfolioRow + `slug`
 *      (beacon del contador de clicks) + `heroSrc`. REGLA DEL HERO (anti-desconexión,
 *      2ª capa — el carrusel de /web jamás referencia un render inexistente):
 *        · heroSrc = path      → el proyecto tiene render de hero: slide de video
 *        · heroSrc = ''        → el proyecto NO tiene ningún video: slide de solo
 *                                póster, deliberado
 *        · heroSrc = null      → tiene video web pero NO render de hero (ej. R. Loría):
 *                                EXCLUIDO del carrusel; se restituye solo cuando el
 *                                pipeline del CRM genere la variante
 *   4. Regenera la sección "## Portafolio web (clientes)" de `public/llms.txt`
 *      (la intro de la sección se conserva tal cual; solo se reescribe la lista).
 *
 * FALLBACK: si el CRM no responde (o responde mal), NO se toca nada — el JSON
 * commiteado es el fallback —, se imprime un WARNING claro y se sale con código 0:
 * el build nunca se rompe por el CRM.
 *
 * Node puro (>=18, usa fetch global), sin dependencias.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const SITE = 'AR'; // nolo.ar
const DEFAULT_CRM_BASE = 'https://linkdesign-crm-api.azurewebsites.net';
const FETCH_TIMEOUT_MS = 20_000;
const DOWNLOAD_TIMEOUT_MS = 120_000;

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const generatedDir = path.join(rootDir, 'src', 'app', 'generated');
const dataFile = path.join(generatedDir, 'portfolio.data.json');
const manifestFile = path.join(generatedDir, 'portfolio.assets.json');
const publicDir = path.join(rootDir, 'public');
const llmsFile = path.join(publicDir, 'llms.txt');

const LLMS_SECTION_HEADER = '## Portafolio web (clientes)';

function warnFallback(reason) {
  console.warn('');
  console.warn('[portfolio] ⚠️  WARNING: no se pudo refrescar el portafolio desde el CRM.');
  console.warn(`[portfolio] ⚠️  Motivo: ${reason}`);
  console.warn(
    '[portfolio] ⚠️  El build sigue con el JSON commiteado (src/app/generated/portfolio.data.json) y el llms.txt actual.'
  );
  console.warn('');
}

// ---------- Fetch del CRM ----------

async function fetchPortfolio(crmBase) {
  const url = `${crmBase.replace(/\/+$/, '')}/api/public/portfolio?site=${SITE}`;
  console.log(`[portfolio] GET ${url}`);
  const res = await fetch(url, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} en ${url}`);
  }
  const body = await res.json();
  if (!body || !Array.isArray(body.data)) {
    throw new Error(`respuesta sin "data" (array) en ${url}`);
  }
  if (body.data.length === 0) {
    // Un portafolio vacío nunca es intencional acá: se trata como respuesta mala.
    throw new Error(`el CRM devolvió 0 proyectos para site=${SITE}`);
  }
  return body.data;
}

// ---------- Descarga de assets nuevos (URLs absolutas del pipeline del CRM) ----------

const isAbsoluteUrl = (value) => /^https?:\/\//i.test(value);

function extFromUrl(url, fallbackExt) {
  const clean = url.split(/[?#]/)[0];
  return path.extname(clean) || fallbackExt;
}

async function downloadTo(url, absPath) {
  const res = await fetch(url, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT_MS) });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} descargando ${url}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  const tmpPath = `${absPath}.download`;
  fs.writeFileSync(tmpPath, buffer);
  fs.renameSync(tmpPath, absPath);
}

/**
 * Devuelve el path que va al JSON para un asset:
 *  - vacío → '' (el proyecto no tiene esa pieza)
 *  - relativo (`/media/...`) → tal cual (ya vive en public/)
 *  - absoluto → descarga a `localRelPath` (si la URL versionada cambió o el archivo
 *    no está) y devuelve el path relativo local.
 */
async function resolveAsset(url, localRelPath, manifest, stats) {
  if (!url) {
    return '';
  }
  if (!isAbsoluteUrl(url)) {
    return url;
  }
  const absPath = path.join(publicDir, localRelPath.replace(/^\//, ''));
  if (manifest[localRelPath] === url && fs.existsSync(absPath)) {
    stats.reused += 1;
    return localRelPath;
  }
  await downloadTo(url, absPath);
  manifest[localRelPath] = url;
  stats.downloaded.push(`${localRelPath}  ←  ${url}`);
  return localRelPath;
}

// ---------- Armado de las filas (shape de PortfolioRow + slug + heroSrc) ----------

async function buildRows(items, manifest, stats) {
  const es = [];
  const en = [];
  const slugs = [];

  for (const item of items) {
    const slug = item.slug;
    const logo = await resolveAsset(
      item.logoUrl,
      `/media/portfolio/${slug}-logo${extFromUrl(item.logoUrl, '.png')}`,
      manifest,
      stats
    );
    const videoSrc = await resolveAsset(
      item.videoWebUrl,
      `/media/portfolio/${slug}-web${extFromUrl(item.videoWebUrl, '.mp4')}`,
      manifest,
      stats
    );
    // La variante mobile se descarga para tenerla versionada junto al resto (los sitios
    // hoy sirven un único mp4 por proyecto: videoSrc). No se referencia en el JSON.
    await resolveAsset(
      item.videoMobileUrl,
      `/media/portfolio/${slug}-mobile${extFromUrl(item.videoMobileUrl, '.mp4')}`,
      manifest,
      stats
    );
    const poster = await resolveAsset(
      item.posterUrl,
      `/media/portfolio/${slug}-poster${extFromUrl(item.posterUrl, '.jpg')}`,
      manifest,
      stats
    );
    const heroPath = await resolveAsset(item.videoHeroUrl, `/media/hero/${slug}.mp4`, manifest, stats);

    // Regla del hero (anti-desconexión, 2ª capa) — ver cabecera del script.
    const heroSrc = item.videoHeroUrl ? heroPath : item.videoWebUrl ? null : '';

    const base = { client: item.clientName, logo, link: item.link, videoSrc, poster, slug, heroSrc };
    es.push({
      client: base.client,
      logo: base.logo,
      industry: item.industryEs,
      projectType: item.projectTypeEs,
      link: base.link,
      videoSrc: base.videoSrc,
      poster: base.poster,
      slug: base.slug,
      heroSrc: base.heroSrc
    });
    en.push({
      client: base.client,
      logo: base.logo,
      industry: item.industryEn,
      projectType: item.projectTypeEn,
      link: base.link,
      videoSrc: base.videoSrc,
      poster: base.poster,
      slug: base.slug,
      heroSrc: base.heroSrc
    });
    slugs.push(slug);
  }

  return { es, en, slugs };
}

// ---------- llms.txt: regenerar SOLO la lista de la sección del portafolio ----------

function regenerateLlms(esRows) {
  if (!fs.existsSync(llmsFile)) {
    console.warn(`[portfolio] ⚠️  No existe ${llmsFile} — se omite la regeneración del llms.txt.`);
    return;
  }
  const original = fs.readFileSync(llmsFile, 'utf8');
  const lines = original.split('\n');

  const headerIdx = lines.findIndex((line) => line.trim() === LLMS_SECTION_HEADER);
  if (headerIdx === -1) {
    console.warn(
      `[portfolio] ⚠️  llms.txt sin la sección "${LLMS_SECTION_HEADER}" — se omite la regeneración.`
    );
    return;
  }

  let nextSectionIdx = lines.length;
  for (let i = headerIdx + 1; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) {
      nextSectionIdx = i;
      break;
    }
  }

  // Intro de la sección = todo lo anterior a la primera línea de lista ("- ["); se conserva tal cual.
  let firstBulletIdx = -1;
  for (let i = headerIdx + 1; i < nextSectionIdx; i++) {
    if (lines[i].startsWith('- [')) {
      firstBulletIdx = i;
      break;
    }
  }
  const intro = lines.slice(headerIdx + 1, firstBulletIdx === -1 ? nextSectionIdx : firstBulletIdx);
  while (intro.length && intro[intro.length - 1].trim() === '') {
    intro.pop();
  }

  const bullets = esRows.map((row) => `- [${row.client}](${row.link}): ${row.industry}.`);
  const rebuilt = [
    ...lines.slice(0, headerIdx + 1),
    ...intro,
    '',
    ...bullets,
    '',
    ...lines.slice(nextSectionIdx)
  ].join('\n');

  if (rebuilt === original) {
    console.log('[portfolio] llms.txt: sección del portafolio sin cambios.');
  } else {
    fs.writeFileSync(llmsFile, rebuilt);
    console.log(`[portfolio] llms.txt: sección del portafolio regenerada (${bullets.length} clientes).`);
  }
}

// ---------- Main ----------

async function main() {
  const crmBase = process.env.CRM_PORTFOLIO_API || DEFAULT_CRM_BASE;

  let items;
  try {
    items = await fetchPortfolio(crmBase);
  } catch (err) {
    warnFallback(err instanceof Error ? err.message : String(err));
    return; // exit 0 — fallback al JSON commiteado
  }

  // El CRM ya ordena por sortOrder; se reordena defensivamente por si acaso.
  items.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const manifest = fs.existsSync(manifestFile)
    ? JSON.parse(fs.readFileSync(manifestFile, 'utf8'))
    : {};
  const stats = { downloaded: [], reused: 0 };

  let data;
  try {
    data = await buildRows(items, manifest, stats);
  } catch (err) {
    // Falló una descarga: no dejamos un JSON a medias — fallback completo.
    warnFallback(err instanceof Error ? err.message : String(err));
    return;
  }

  fs.mkdirSync(generatedDir, { recursive: true });
  fs.writeFileSync(dataFile, `${JSON.stringify(data, null, 2)}\n`);
  if (Object.keys(manifest).length > 0 || fs.existsSync(manifestFile)) {
    fs.writeFileSync(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  const excluded = data.es.filter((row) => row.heroSrc === null).map((row) => row.slug);
  const posterOnly = data.es.filter((row) => row.heroSrc === '').map((row) => row.slug);
  console.log(
    `[portfolio] OK — ${data.es.length} proyectos (site=${SITE}) → src/app/generated/portfolio.data.json`
  );
  console.log(
    `[portfolio] Assets: ${stats.downloaded.length} descargados · ${stats.reused} reutilizados · el resto ya es relativo al sitio.`
  );
  for (const line of stats.downloaded) {
    console.log(`[portfolio]   ↓ ${line}`);
  }
  if (excluded.length) {
    console.log(`[portfolio] Hero: excluidos por no tener render (heroSrc null): ${excluded.join(', ')}`);
  }
  if (posterOnly.length) {
    console.log(`[portfolio] Hero: slides de solo póster (sin video): ${posterOnly.join(', ')}`);
  }

  regenerateLlms(data.es);
}

main().catch((err) => {
  // Último recurso: jamás romper el build por el prebuild del portafolio.
  warnFallback(err instanceof Error ? err.message : String(err));
});
