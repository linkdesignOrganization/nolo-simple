---
name: google-ads-conversiones
description: "Modelo de conversiones de Google Ads para LinkDesign (legacy + nuevo) y SOWE — 2 acciones (Contacto/Scroll), cuenta compartida y estado de implementación"
metadata: 
  node_type: memory
  type: project
  originSessionId: 3a7e88fe-82f0-455a-92a3-18c6bd19d33a
---

LinkDesign (Costa Rica) y SOWE (Argentina, misma empresa) comparten **una sola cuenta de Google Ads: `AW-16767245191`**.

**Tres sitios en juego:**
- **Legacy** `C:\Users\Roberth Castillo\Desktop\LinkDesign\webOld\LinkDesign2.0` (Angular 14) — EN PRODUCCIÓN, es el que alimenta Ads hoy y define el modelo correcto.
- **Nuevo** `C:\Users\Roberth Castillo\Desktop\LinkDesign\WEB\LinkDesign-simple` (Angular 21) — reemplazará al legacy.
- **Nolõ** `C:\Users\Roberth Castillo\Desktop\Nolo\WEB` (Angular 21) — copia del nuevo, para Argentina. Divergió un poco (sin SeoService/isNotFound en su `app.ts`). *La carpeta se llamó `Sowe` hasta el 30 jul 2026.*

**Modelo correcto = SOLO 2 acciones de conversión** (definido por el legacy):
- **CONTACTO** (`AW-16767245191/qSMFCN2ek-YZEIe3n7s-`): WhatsApp (10), copiar correo (50), agendar reunión (60), formulario (30-60 por scoring). Categoría "Contacto". **Values ×2 desde el 23-24 jul 2026** — antes eran 5/25/30 y 15-30.
- **SCROLL** (`AW-16767245191/qZoeCOfls-oZEIe3n7s-`): scroll al 50% (value 1). Conviene marcarla **Secundaria** (no optimizar hacia ella).
- Las 3 "clicks to call" en la cuenta son automáticas de Google (0 conversiones).

**Bug corregido (2026-06-13):** el sitio nuevo y SOWE mandaban "agendar reunión" al label de SCROLL (lo nombraban erróneamente HIGH_INTENT). Se renombró el enum a `CONTACTO/SCROLL` en `ads.service.ts`, se corrigió agendar→CONTACTO, se agregó la conversión de scroll (listener global en `app.ts`, 50%, una vez por página, excluye privacidad/404) y se engancharon los CTAs de agendar del hero (`landing-page.ts` + `web-hero.component.ts`, detección por `cal.com`). Ambos builds verificados OK. El sitio nuevo va **sin teléfono** a propósito.

**Estado SOWE (2026-06-16): DESPLEGADO Y VERIFICADO EN PRODUCCIÓN.** Las 2 conversion actions propias de SOWE están conectadas, commiteadas (`91bd74b`) y desplegadas a nolo.ar vía GitHub Actions → Azure SWA (workflow `azure-swa-nolo.yml`, push a `main`). Verificado con Playwright: scroll 50% y click de WhatsApp disparan `gtag` y los requests a `googleadservices.com/pagead/conversion/16767245191/` responden **200** con labels y values correctos. Labels: "Contacto Argentina" = `-7YECOqL7b8cEIe3n7s-` (CONTACTO, value 10/50/60/scoring desde el ×2 del 24 jul 2026, commit `e860ca1`), "Scroll Argentina" = `P_8YCIf4878cEIe3n7s-` (SCROLL, value 1), USD. Repo: `github.com/linkdesignOrganization/nolo-simple` (renombrado desde `sowe-simple`; remote local aún apunta al viejo, GitHub redirige). Entorno: `node_modules` venía incompleto (faltaban `@angular/ssr`/`@angular/platform-server`); se corrió `npm install`.

**✓ CSP resuelto (commit `7f7f77c`, desplegado y verificado):** se agregó `https://*.google.co.cr` al `connect-src` de `src/index.html`. La cuenta de Ads está registrada en CR, así que gtag hace pings de enhanced/1p-conversion a `google.co.cr` aunque Nolo sea 100% para Argentina (el TLD lo define el país de la cuenta, no el del sitio). Re-verificado en producción con Playwright: los requests a `google.co.cr/pagead/1p-conversion/` ahora responden **200** (antes [FAILED] csp), sin errores de consola; enhanced conversions completas. Si Nolo migrara a su propia cuenta de Ads argentina, el ping pasaría a `google.com.ar` y esto ya no haría falta.

**Naming:** "Sowe" es la marca anterior; hoy todo es **Nolõ** (nolo.ar, hola@nolo.ar). Repo `nolo-simple` y carpeta local `Desktop\Nolo` — ambos renombrados. Las conversion actions siguen llamándose "Contacto Argentina" / "Scroll Argentina".

**Bitácora:** `docs/bitacora-ads.md` en el repo (creada el 30 jul 2026) — es la fuente de verdad del trabajo de Ads de Nolõ; esta memoria queda como referencia de implementación.

**Pendiente en Google Ads (lo maneja el usuario):**
1. Conversion actions ya creadas. "Scroll Argentina" debe ir en categoría **Otras** (no Contacto) y marcarse **secundaria**; "Contacto Argentina" principal con "usar valores distintos por conversión". (Una acción no se "saca" de su objetivo estándar: eso lo define su categoría.)
2. Objetivo de conversión **personalizado** ("Contacto Argentina") asignado **a nivel de campaña** (no como predeterminado de cuenta), para separar la optimización de LinkDesign. Google advierte que custom goals pueden bajar la eficiencia del bidding; vale la pena igual (datos de CR contaminarían AR).
3. Campaña nueva (copia de LinkDesign vía Google Ads Editor). Zona horaria de la cuenta = **Costa Rica (UTC-6)**; Argentina va +3h → restar 3h al cargar horarios. Sitelinks: máx granularidad = grupo de anuncios (no por anuncio).

Conexión con [[sowe-google-ads-cuenta]] si se crea.
