---
name: landing-software-ar
description: Hub /desarrollo-de-software-argentina + 6 fichas de demo (ES/EN), en prod e indexable desde 2026-09-10; contrato, gotchas y qué es provisional
metadata:
  type: project
---

# Hub «desarrollo de software en Argentina» y fichas de demo

**Estado:** en producción e indexable desde el 10 sep 2026 (`9ceb2c9`). Espejo del hub de Costa Rica
de LinkDesign-simple (`/desarrollo-de-software-costa-rica`), portado el 9–10 sep con el método de olas
(bitácora completa en `~/dev/WebSite/PLAN-FICHAS-NOLO.md`).

**Dónde vive:** `src/app/pages/software-ar-content.ts` (hub ES+EN, tabla de 8 precios),
`software-ar-cases-content.ts` (6 fichas, EN como overlay con `Omit`), `software-ar-page.ts`,
`software-ar-case-page.ts`, entrada del hub y rama `caseMatch` en `services/seo-content.ts`,
`SOFTWARE_AR_HUB` y migas con `parent: '/software'` en `seo.service.ts`, `SOFTWARE_AR_NAV` en `app.ts`,
`detail` + intro por trozos en los viewcases de `app.routes.ts`, secciones «Así se ve un sistema como
este» y «Cuánto cuesta en Argentina» en `system-detail-page.ts`, segmento en
`lead-form/models/lead-form-options.ts`. Getters con `lang` obligatorio.

**Decisiones de Robert (9 sep 2026):** Nolõ es un **estudio propio argentino con sede en Buenos Aires**
(no «la marca de Link Design»): el «Quiénes somos» no menciona a Link Design ni a Costa Rica y no
publica «desde 2020» ni «26 proyectos» (Nolõ no los afirma en ninguna parte). Precios y plazos
**idénticos a Costa Rica** (USD; hay prueba que compara byte a byte). Grafía: «Nolo» en lo que lee
Google (títulos, JSON-LD, sitemaps) y «Nolõ» en copy visible. Título del hub «Empresa de desarrollo
de software en Argentina | Nolo» (keyword); el copy dice «estudio».

**Provisional (confirmado por Robert el 10 sep, sigue marcado `// PROVISIONAL`):** discovery en sitio en
Buenos Aires cuando la operación lo requiere; plazo «8 a 13 semanas»; stat «07 tipos de sistema».

**Gotchas:** todo enlace a cal.com/wa.me lleva `(click)` al `AdsService` (specs de página lo cubren con
mutación); `lead-tracking.landing.spec.ts` se pone rojo si una ruta con formulario no está en
`LANDING_BY_PATH_SEGMENT` (no ajustar la prueba: agregar la clasificación); el reveal de la página de
sistema va por scroll + rAF (un `IntersectionObserver` armado una vez quedaba mudo al cambiar de
slug); el `@graph` de marca salió de `index.html` y lo emite `setBrandJsonLd()` (si vuelve, doble
Organization); si cambian cifras hay que tocar contenido, `llms.txt`, `sitemap-videos.xml` y las
descriptions en el mismo push; `npm run build` reescribe el portafolio (usar `npx ng build` para
verificar); el workflow corre `npm test` antes del build y un spec rojo deja el sitio viejo en prod
sin error visible.
