# Nolõ — sitio `nolo.ar` (Argentina)

Fork del sitio de LinkDesign para el mercado argentino. Angular 22 con TypeScript 6 y SSR, misma
arquitectura. Repo `linkdesignOrganization/nolo-simple`; deploy por push a `main` vía Azure Static
Web Apps (`.github/workflows/azure-swa-nolo.yml`), que además acepta `workflow_dispatch` para
redesplegar sin commit.

```
npm start          # ng serve
npm run build      # el prebuild corre scripts/generate-portfolio.mjs
npm test           # vitest
```

> El repo y la carpeta se llamaron **"Sowe"** hasta mediados de 2026. Si ese nombre aparece en
> documentación vieja, es esto.

## Sitio gemelo

`Desktop\LinkDesign\WEB\LinkDesign-simple` (dominio `linkdesign.cr`, Costa Rica) es el original.
Comparten arquitectura: `ads.service.ts`, lead-form, lead scoring, SEO por effect en `app.ts`. Un
cambio en uno casi siempre aplica al otro cambiando IDs, branding y teléfonos — antes de cerrar un
cambio estructural, preguntá si corresponde replicarlo.

## Google Ads y Search Console

Las campañas argentinas ("Búsqueda #2" y "Software #2") **no están en una cuenta propia**: viven en
la cuenta `6364218319` de Link Design, junto con las de Costa Rica. Se distinguen por campaña y por
acciones de conversión propias (`Contacto Argentina`, `Scroll Argentina`). Hay acceso por API:
invocá la skill **`google-ads`** antes de escribir cualquier script de análisis.

Bitácora: **`docs/bitacora-ads.md`** — configuración de conversiones, línea de tiempo y pendientes.
Leerla antes de proponer cambios.

Dos advertencias que ya costaron caro:

- **El historial anterior al 19 jul 2026 no es comparable** en comportamiento de puja: ese día se
  cambió de Maximizar conversiones a Maximizar valor de conversión, o sea otro régimen de
  optimización. De ese período sólo sirven las métricas de mercado (CPCs, volumen, términos de
  búsqueda, Quality Score).
- **Search Console arranca el 7 ago 2026.** La propiedad `sc-domain:nolo.ar` se creó ese día y
  Search Console no rellena histórico, así que una consulta anterior devuelve cero aunque el sitio
  lleve años indexado. No es un fallo del sitio ni del montaje.

## Detalle de infraestructura que conviene no perder

El `connect-src` del `index.html` incluye `https://*.google.co.cr` porque **la cuenta de Ads está
registrada en Costa Rica**: gtag hace los pings de enhanced conversion al TLD del país de la cuenta,
no al del sitio. Si Nolõ migrara a una cuenta argentina propia, pasaría a `google.com.ar` y esto
sobraría.

La zona horaria de la cuenta de Ads es **Costa Rica (UTC−6)** y Argentina va +3h: al cargar horarios
de campaña hay que restar 3 horas.
