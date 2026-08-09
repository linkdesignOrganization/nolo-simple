---
name: project-nolo-rebrand
description: "REBRAND 2026-06-15 — la marca argentina dejó de ser «Sowe» y pasó a «Nolo» (dominio nolo.ar, email hola@nolo.ar, repo nolo-simple). Código/CRM/assets rebrandeados; GO-LIVE HECHO 2026-06-15 (nolo.ar live, sowe.ar removido). Link Design (CR) NO cambia; voseo se mantiene."
metadata: 
  node_type: memory
  type: project
  originSessionId: 70743840-af7b-4ff7-8a7b-9d3b80ab1290
---

El **2026-06-15** se rebrandeó la marca **argentina**: **Sowe → Nolo**. Motivo: "Sowe" colisionaba con varias
empresas de software (sowe.app/sowe.tech/etc.) → invisible/confuso para buscadores y LLMs; `sowe.ar` tenía <48 h sin
indexar (casi sin equity SEO que perder). El cliente eligió **Nolo** (sabe que hay homónimos —Nolo legal US, Nolo Apps
UK— pero en otros países/verticales). **Link Design (CR) NO se toca.** La **voz voseo argentino se mantiene** (sigue
siendo el sitio AR); solo cambia la palabra de marca.

**Estilización del wordmark (2026-06-15):** la marca **VISIBLE** se escribe **«nolõ»** (última 'o' con virgulilla `õ` U+00F5):
logo (favicon/app SVG, og-image, apple-touch/icon-512 PNG regenerados desde `app.svg`) + textos renderizados (topbar,
`h1` de contacto, eyebrow `Nolõ / 001` + descripciones del home, `©` de footer y privacidad, prosa "En Nolõ…"). PERO
**SEO/metadata/structured-data quedan «Nolo» plano** (títulos `<title>`, OG/Twitter, JSON-LD `name`, `author`, manifest,
`llms.txt`) y el **dominio/email/cal.com** quedan `nolo.ar`/`hola@nolo.ar` — por findability (NO meter la õ ahí).
El `aria-label` también queda "Nolo" (a11y). ⚠️ **No "corregir" la õ del wordmark visible** (es intencional). Solo Nolo (AR).

**Decisiones:** marca **Nolo**/**nolo** (minúscula donde el wordmark va en minúscula: topbar, og, manifest); dominio
**nolo.ar** (+ `www.nolo.ar`); email **hola@nolo.ar**; WhatsApp `+54 9 11 3333-7180` → `wa.me/5491133337180` **se
mantiene** (es un número, no marca); cal.com handles nuevos **`cal.com/nolo.ar/reunion-con-equipo-nolo`** (ES) +
**`meeting-with-nolo-team`** (EN). Azure: **se reutiliza el SWA existente** (recurso sigue llamándose `sowe-simple`, host
`proud-plant-0952cba0f.7.azurestaticapps.net`; Azure no renombra recursos) — solo se le agregará el custom domain `nolo.ar`.

**Hecho por mí (código, sin desplegar todavía):**
- **`nolo-simple` (repo, ex `sowe-simple`):** todo Sowe→Nolo, sowe.ar→nolo.ar, hola@sowe.ar→hola@nolo.ar,
  storage key `sowe-lang`→`nolo-lang`, cal handles, `sitemap.xml`/`robots.txt`/`llms.txt`/`site.webmanifest`,
  `index.html` (title/OG/JSON-LD), specs. **Build SSG verde, 26 rutas, `grep sowe` en `src/`+`public/`+`dist/` = 0.**
  Assets de marca: el usuario dejó `nolofavicon.svg`→`public/faviconnolo.svg` (circular) y `noloapp.svg`→`public/app.svg`
  (rounded-square), vectores reales "nolo". El **único** "sowe" que queda en el repo es el secret name del workflow
  (ver abajo). El inglés indexable `/en/` y todo el SEO siguen OK.
- **GitHub:** repo renombrado `sowe-simple` → **`nolo-simple`** (org `linkdesignOrganization`). Workflow renombrado
  `.github/workflows/azure-swa-sowe.yml` → **`azure-swa-nolo.yml`**. El **secret `AZURE_STATIC_WEB_APPS_API_TOKEN_SOWE`
  se DEJÓ con ese nombre** (renombrarlo obliga a recargar el valor del token Azure en GitHub Settings — solo lo puede
  hacer el usuario; el nombre es solo un identificador, no afecta el deploy).
- **CRM (`crm/`, repo propio):** `WEB_LEAD_COUNTRY_RECIPIENTS.AR` → `['hola@nolo.ar']` (`shared/constants.ts`);
  `webLeadDomainMap` DEFAULTS en `settings.service.ts` = **solo `nolo.ar` + `www.nolo.ar` (→AR)**; `sowe.ar`/`www.sowe.ar`
  **quitados** (decisión 2026-06-15: sowe.ar se da de baja, **sin transición**); comentario de `web-lead.email.service.ts`. Typecheck verde.
- **Docs:** `WebSite/CLAUDE.md` actualizado (banner de rebrand + estado); este conjunto de memorias.

**Pendiente — infra del CLIENTE (bloquea go-live, NO el código):** registrar `nolo.ar` en NIC.ar + DNS (ALIAS @ +
CNAME www → host del SWA) + TXT; agregar custom domain `nolo.ar`/`www.nolo.ar` al SWA + SSL; crear casilla
**hola@nolo.ar** + MX; crear los eventos cal.com (`reunion-con-equipo-nolo`/`meeting-with-nolo-team`); **`og-image.png`** nuevo
1200×630 (los SVG ya están; el og es un banner que el usuario debe diseñar — opcional regenerar `apple-touch-icon.png`/
`icon-512.png` desde `app.svg`).

**Secuencia de go-live (importa el orden, Parte D):** (1) infra; (2) **CRM deployado** con nolo.ar en allowlist +
AR→hola@nolo.ar **ANTES** del sitio nuevo (si no, leads de nolo.ar dan **401**); (3) push de `nolo-simple` → deploy
automático; probar form nolo.ar → 201 en CRM → email a hola@nolo.ar; (4) **dar de baja `sowe.ar`** (quitar custom domain
del SWA + registro NIC.ar; **sin 301**, el dominio desaparece — <48 h, sin equity). El allowlist del CRM ya **no** incluye sowe.ar. **DESPLEGADO a prod el 2026-06-15** (autorizado por el usuario): sitio `nolo-simple` (commit `600c37a`) + CRM
(`6c825ad`) vía sus CI/CD; env del CRM `WEB_LEAD_STAGING_ORIGINS`→`nolo.ar`. Verificado: SWA sirve marca **Nolo**;
CRM health 200, **acepta nolo.ar y rechaza sowe.ar**. **GO-LIVE COMPLETO 2026-06-15**: `nolo.ar` + `www.nolo.ar` Ready (SSL) sirviendo Nolo; `sowe.ar`/`www.sowe.ar` **removidos** del SWA; og-image + íconos PNG (apple-touch/icon-512) regenerados en Nolo desde `app.svg`. Pendiente solo (cliente): casilla `hola@nolo.ar` + MX, eventos cal.com, baja de `sowe.ar` en NIC.ar. Detalle de deploy en [[project-nolo-azure-deploy]]; SEO en [[project-seo-status]]; voz en
[[project-content-voice-by-brand]].
