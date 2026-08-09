---
name: project-nolo-azure-deploy
description: nolo-simple (ex sowe-simple, marca Nolo tras rebrand 2026-06-15) en Azure SWA; **EN PRODUCCIÓN en nolo.ar** (go-live 2026-06-15; sowe.ar removido); SSG/SEO + páginas /software/:slug LIVE; CRM conectado (routing AR→hola@nolo.ar tras redeploy). Recurso Azure SIGUE llamándose sowe-simple (no se renombra).
metadata:
  node_type: memory
  type: project
  originSessionId: 5bfc44e5-4cd2-4c22-a1ac-1a89ff051a73
---

> **REBRAND 2026-06-15 (ver [[project-nolo-rebrand]]):** la marca AR pasó de **Sowe → Nolo**. El **código/repo
> (`nolo-simple`)/CRM/assets ya están rebrandeados**; el **go-live a `nolo.ar` está pendiente** (infra del cliente +
> commit/push). **Hasta el cutover el sitio sigue sirviéndose en `sowe.ar`.** OJO: el **recurso de Azure y su RG NO se
> renombran** (Azure no renombra) — siguen siendo SWA `sowe-simple` / RG `Sowe-Simple` / host `proud-plant-...`; solo se
> les agregará el custom domain `nolo.ar`. Email del sitio: **hola@nolo.ar**. cal.com: `reunion-con-equipo-nolo`/`meeting-with-nolo-team`.

`nolo-simple` está EN PRODUCCIÓN en Azure desde el 2026-06-12 (como Sowe). **Build con marca Nolo desplegado el 2026-06-15** (commit `600c37a`; el SWA ya sirve "Nolo"). **CRM desplegado** (`6c825ad`) + env `WEB_LEAD_STAGING_ORIGINS`→`nolo.ar`: health 200, acepta `nolo.ar`, rechaza `sowe.ar`, AR→`hola@nolo.ar`.

- **Static Web App** `sowe-simple` (Standard, **no se renombra**) en sub **CEFSA-prod**, RG **Sowe-Simple**, East US 2. Host: proud-plant-0952cba0f.7.azurestaticapps.net.
- **CI/CD**: GitHub Actions (`.github/workflows/azure-swa-nolo.yml`), secret `AZURE_STATIC_WEB_APPS_API_TOKEN_SOWE` (nombre **mantenido** en el rebrand — es solo un identificador; renombrarlo obliga a recargar el token en GitHub Settings). Deploy en push a `main`. Output `dist/website/browser`. `public/staticwebapp.config.json` con responseOverrides 404 + mime mp4. `.npmrc` legacy-peer-deps.
- **SSG/SEO LIVE (2026-06-14)**: SSG/prerendering (`angular.json`: `outputMode: static` + `server: src/main.server.ts`; `app.config.server.ts`, `app.routes.server.ts` con `getPrerenderParams`; `main.server.ts`). `SeoService` + `seo-content.ts` (title/description/OG/canonical/hreflang/JSON-LD por ruta, voseo) por `effect` en `app.ts`. **26 rutas prerenderizadas** (13 es + 13 en tras el EN indexable). `sitemap.xml`/`robots.txt`/`llms.txt` en `public/` (ya con `nolo.ar`). Gotcha: varios componentes necesitaron `isPlatformBrowser` (corren en prerender). Meta description de sistema = "Qué es" recortado por oración.
- **Páginas de detalle de sistema (2026-06-14)**: `/software/:slug` (7 sistemas), `pages/system-detail-page.ts` + `pages/systems-content.ts`; se entra desde el título del services-stack. El **footer identifica el lead en el CRM**: antepone `[Consulta desde la página del sistema: <nombre>]` al `message`.
- **Dominio**: **`nolo.ar` + `www.nolo.ar` Ready (SSL), sirviendo la marca Nolo** (go-live 2026-06-15). `sowe.ar`/`www.sowe.ar` **removidos del SWA** el 2026-06-15 (la baja en el SWA propaga ~15 min; el registro `sowe.ar` en NIC.ar lo da de baja el cliente). **Sin 301** (sowe.ar se elimina).
- **Email del sitio**: **hola@nolo.ar** (debe crearse la casilla).
- **Google Ads**: ⚠️ **ACTUALIZACIÓN 2026-06-16: AHORA SÍ hay Ads real** — el equipo de campaña conectó conversiones reales (commits `91bd74b` Contacto/Scroll AR + `7f7f77c` CSP `google.co.cr`); ver `services/ads.service.ts` + `index.html` para el ID/labels actuales. **SUPERA** lo siguiente: ~~NO tiene cuenta de Google Ads — CONFIRMADO 2026-06-14~~ (por el cliente; verificado: nunca hubo `AW-` real en el repo, solo placeholder). El placeholder `AW-XXXXXXXXXX` es **intencional y no-op seguro**, **NO es un pendiente**. El único `AW-` real del workspace es `AW-16767245191`, de **Link Design (CR)**. `calendarLink` real (**cal.com**, por idioma): ES `cal.com/nolo.ar/reunion-con-equipo-nolo`, EN `cal.com/nolo.ar/meeting-with-nolo-team` (handles a crear en cal.com; antes Sowe usaba `cal.com/sowe.ar/...`). Resuelto con `lang()` vía `ContactInfo.calendarLinkEn` (cableado en `contactInfo` de `app.routes.ts` + `contact-page.ts` + `system-detail-page.ts`). **WhatsApp** `+54 9 11 3333-7180` → `wa.me/5491133337180` (se mantiene en el rebrand).
- **CRM**: el form manda leads al MISMO CRM que Link Design (`https://linkdesign-crm-api.azurewebsites.net/api/v1/leads`). Repo `linkdesignOrganization/crm`, **clonado en `~/dev/WebSite/crm`** (referencia; tiene su propio CI/CD `deploy-backend.yml`). `environment.prod.ts` con crmEndpoint real + crmApiKey (= `WEB_LEAD_API_KEY`, pública). **CONECTADO Y PROBADO** (2026-06-12: `POST /api/v1/leads` → **201**). El CRM distingue el sitio por el **Origin** (`webLeadDomainMap`).
  - **Allowlist** (`settings.service.ts` DEFAULTS, no hay doc en DB): CR (`linkdesign.cr`) + AR. **Rebrand 2026-06-15**: AR = **solo `nolo.ar` + `www.nolo.ar`**; `sowe.ar`/`www.sowe.ar` **quitados** (sowe.ar se da de baja, sin transición). ⚠️ **Pendiente en el App Service del CRM**: la env `WEB_LEAD_STAGING_ORIGINS=https://sowe.ar,https://www.sowe.ar` hay que **cambiarla a `nolo.ar`** (o vaciarla y confiar en el default) — si no, el CRM seguiría aceptando sowe.ar y NO nolo.ar hasta el redeploy. Cambiarla = restart breve.
  - **Email por país** (`resolveRecipients()` en `web-lead.email.service.ts`, vía `WEB_LEAD_COUNTRY_RECIPIENTS` en `shared/constants.ts`): **separación estricta**: AR → SOLO **`hola@nolo.ar`** (cambiado de `hola@sowe.ar` en el rebrand; **requiere redeploy del CRM**); CR → lista global/central (incluye `hola@linkdesign.cr`, **obligatorio**, intacto). `hola@nolo.ar` debe existir.
  - ⚠️ **Secuencia**: el CRM debe estar deployado con `nolo.ar` en allowlist + AR→`hola@nolo.ar` **ANTES** de que el sitio nuevo mande leads (si no → **401**).
  - **PENDIENTE**: el scoring (`lead-score.ts` en CRM y su copia en el sitio) premia país `CR` — revisar para `AR`.

Análogo a [[project-linkdesign-azure-deploy]]. Rebrand completo en [[project-nolo-rebrand]].
