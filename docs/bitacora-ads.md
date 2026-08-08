# Bitácora — Google Ads de Nolõ (Argentina)

Primera versión: 30 jul 2026. Hasta ahora lo de Nolõ vivía disperso entre la memoria del proyecto y
la bitácora de LinkDesign; esto lo consolida. La convención es que cada sitio lleve la suya
(acordado el 24 jul 2026).

**Sitio gemelo de LinkDesign.** Misma arquitectura Angular (lead-form, lead-score, lead-tracking,
AdsService). Un cambio en uno casi siempre aplica al otro, cambiando IDs, branding y teléfonos.
Carpeta local `Desktop\Nolo\WEB`; repo `linkdesignOrganization/nolo-simple`; dominio **nolo.ar**.
Deploy por push a `main` vía Azure SWA (`azure-swa-nolo.yml`). *Tanto el repo como la carpeta se
llamaron "Sowe" hasta mediados de 2026 — si aparece ese nombre en documentación vieja, es esto.*

## Configuración de conversiones

Comparte la cuenta **AW-16767245191** con LinkDesign, pero con **acciones propias** para no mezclar
Argentina con Costa Rica:

| Acción | Label | Qué agrupa | Value |
|---|---|---|---|
| Contacto Argentina | `-7YECOqL7b8cEIe3n7s-` | WhatsApp, copiar correo, agendar reunión, formulario | variable |
| Scroll Argentina | `P_8YCIf4878cEIe3n7s-` | scroll al 50% | 1 |

Values base tras el ×2: **WhatsApp 10 · copiar correo 50 · agendar 60**; formulario 30–60 por
scoring. Todos modulados por calidad de sesión (0,7–1,0). *La memoria del proyecto todavía dice
5/25/30: quedó desactualizada con el ×2 del 24 jul.*

Detalle de infraestructura que conviene no perder: el `connect-src` del `index.html` incluye
`https://*.google.co.cr` porque **la cuenta de Ads está registrada en Costa Rica** y gtag hace los
pings de enhanced conversion al TLD del país de la cuenta, no al del sitio. Si Nolõ migrara a su
propia cuenta argentina, pasaría a `google.com.ar` y esto sobraría.

## Línea de tiempo

| Fecha | Hecho |
|---|---|
| 16 jun 2026 | Conversiones propias desplegadas y verificadas en producción (Playwright: scroll y WhatsApp disparan `gtag`, respuesta 200 con labels y values correctos). |
| 19 jul 2026 | **Cambio de estrategia de puja: de Maximizar conversiones a Maximizar valor de conversión.** La anterior optimizaba por cantidad y explicaba el mix AR de ~92% scrolls. Reseteó el aprendizaje. |
| 24 jul 2026 | **Réplica del ×2 de values** (commit `e860ca1`), espejo de LinkDesign. Timing deliberado: el aprendizaje ya estaba reseteado por el cambio del 19 jul, así que ambos cambios se absorben en una sola ventana. |
| 30 jul 2026 | Se consolida esta bitácora y se registra el análisis de atribución del embudo. |

**Advertencia para cualquier comparación**: el historial anterior al 19 jul **no es comparable** en
comportamiento de puja (era otro régimen de optimización). De ese período solo sirven las métricas de
mercado: CPCs, volumen, términos de búsqueda, Quality Score.

## Estado actual (30 jul 2026)

Campañas activas, ambas con Maximizar valor de conversión:

| Campaña | Presupuesto |
|---|---|
| Búsqueda #2 | USD 15,00/día |
| Software #2 | USD 15,00/día |

Conversiones ene–29 jul 2026: **Contacto Argentina 34** (valor 522,5) · **Scroll Argentina 234**
(valor 234). El promedio por contacto es 15,4, algo por encima del 13,3 de Costa Rica — pero con 34
conversiones y values que cambiaron a mitad de período, no da para concluir nada sobre el mix.

## Atribución del embudo: aplica igual que en Costa Rica

El análisis completo está en `docs/bitacora-ads-values-troas.md` del repo `LinkDesign-simple`, en la
sección del 30 jul 2026. **Aplica idéntico acá** porque Nolõ comparte el modelo de dos acciones: los
cuatro canales de contacto colapsan en `CONTACTO`, así que hoy tampoco se puede saber qué proporción
de los contactos argentinos llega por WhatsApp, correo, agendar o formulario.

Resumen de lo decidido, todo válido para Nolõ:

- **Descartado GA4** — el sitio ya captura por lead más detalle del que daría, y sumaría una tercera
  cifra de conversiones que no coincidiría con Ads ni con el CRM.
- **Descartado el código de referencia en el mensaje de WhatsApp** — probado antes en otra empresa:
  la gente lo borra, y darle un propósito (descuento) generó desconfianza.
- **Descartado el mini formulario antes de abrir WhatsApp** — fricción inmediata en el canal de más
  volumen, sin volumen suficiente para medir el daño.
- **Descartado medir el desenlace solo con leads de formulario** — muestra sesgada, llevaría a
  descartar keywords útiles o sobrevalorar otras.
- **Abierto: subir conversiones con identificadores hasheados** (`user_identifiers` en vez de
  `gclid`). Sin fricción y cubre WhatsApp y correo. Requiere la **Data Manager API**: desde el
  15 jun 2026 la Google Ads API rechaza estas subidas si el developer token nunca las hizo antes.

**El argumento de volumen pesa más acá.** Con 34 conversiones de contacto en siete meses contra 197
de Costa Rica, cualquier medición de desenlace en Argentina va a tardar bastante más en decir algo.
Si se prueba la subida por identificadores, conviene empezar por Costa Rica y traerlo a Nolõ recién
cuando haya dado resultado.

## Search Console (7 ago 2026): montado, pero el contador arranca hoy

LinkDesign lee su Search Console por API desde el 7 ago 2026 (montaje completo en
`docs/bitacora-google-ads-api-basic.md` del repo `LinkDesign-simple`). Se replicó acá el mismo día.
**Nolõ no tenía propiedad en Search Console**: se creó tipo **Dominio**, se verificó por DNS y la
service account quedó con permiso **Completo**. `gsc.NOLO` ya funciona.

**El dominio es `nolo.ar`.** No existe `nolo.cr` — conviene dejarlo escrito porque la confusión con
el `.cr` de LinkDesign es fácil y verificar el dominio equivocado no da ningún error útil.

### Cómo se verificó

DNS en **DNSimple** (cuenta `147334`), donde viven ambos dominios. Se **agregó** un TXT en la raíz:

```
"google-site-verification=H6k8J_ZgfIwYLlPrAoIjT-BdreKTYMY8UfQF3roQ0LQ"
```

> **Se agregó, no se reemplazó**, y esto importa para el futuro: `nolo.ar` ya tenía otro
> `google-site-verification=z011Cqngh…`, y como el dominio lleva el correo en **Google Workspace**
> (MX → `SMTP.GOOGLE.COM`, SPF, DKIM en `google._domainkey`, DMARC), ese registro viejo es su
> verificación. **Pisarlo habría podido romper el correo.** Un dominio admite varios TXT
> `google-site-verification` conviviendo. Control post-cambio: 15 → 16 registros, ninguno eliminado y
> ninguno modificado salvo el serial del SOA, que se incrementa solo.

Detalle operativo: los TXT de esta zona están almacenados **con comillas literales** en el valor, así
que el registro nuevo se creó igual para no quedar disparejo con los que ya funcionaban.

### El dato que condiciona el 13 ago: no hay histórico

Verificado el mismo día, y conviene no olvidarlo: **Search Console no rellena hacia atrás**. Empieza
a acumular datos desde que se crea la propiedad, así que las consultas contra `nolo.ar` devuelven
**cero en cualquier ventana** — 16 meses, 30 días o 7 días, incluso con `dataState='all'`.

No es un problema del sitio ni del montaje:

- La URL Inspection API sobre `https://nolo.ar/` da **PASS · "Enviada e indexada"**, último rastreo
  el 4 ago 2026 y canónica correcta. Google conoce y rastrea el sitio.
- El mismo método contra `linkdesign.cr` devuelve 31 días con datos. La vía funciona.

Simplemente **la serie de Nolõ arranca el 7 ago 2026**. Es el mismo patrón que
`paid_organic_search_term_view` tras vincular Search Console con Ads: sin backfill.

**Para el 13 ago habrá ~6 días de datos.** No bloquea la revisión —el criterio del plan de tROAS se
calcula solo con datos de Ads— pero conviene no esperar de acá un panorama de demanda argentina
todavía. Eso llega hacia septiembre, con algunas semanas acumuladas.

Contexto de por qué vale la pena igual: en LinkDesign el hallazgo fue que **no hay canibalización
pago/orgánico**. La contraparte argentina era un punto ciego real, porque el orgánico que se estaba
midiendo es el de `linkdesign.cr`, que en Argentina casi no existe (12 consultas y 46 impresiones en
16 meses) — el dominio equivocado para esa pregunta.

## Pendientes

- [ ] **~Sept 2026** — Primera lectura con sentido de Search Console de Nolõ, cuando haya varias
      semanas acumuladas. Repetir el análisis de canibalización que se hizo para LinkDesign.
- [ ] **13 ago 2026** — Revisión conjunta con LinkDesign (misma cita del plan de tROAS). Para Nolõ:
      primer análisis con datos comparables de "Búsqueda #2", que quedó pospuesto en julio por
      insuficiencia de datos (~4 días hábiles post-cambio). Ventana útil: desde el 19 jul.
- [ ] **13 ago 2026** — Separar las acciones de conversión por canal (WhatsApp, copiar correo,
      agendar, formulario), todas primarias con sus values. Es lo que destraba saber el mix por
      keyword. Aplicar después del corte para no perturbar el aprendizaje en curso.
- [ ] Verificar en Google Ads que "Scroll Argentina" quedó en categoría **Otras** y marcada
      **secundaria**, y que el objetivo personalizado "Contacto Argentina" está asignado **a nivel de
      campaña** (no como predeterminado de cuenta), para que los datos de Costa Rica no contaminen la
      optimización argentina.

## Nota operativa

La zona horaria de la cuenta es **Costa Rica (UTC-6)** y Argentina va +3h: al cargar horarios de
campaña hay que restar 3 horas. Los sitelinks admiten como máxima granularidad el grupo de anuncios,
no el anuncio.
