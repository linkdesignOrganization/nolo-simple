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

## 13 ago 2026 — Revisión conjunta: Argentina es el mercado que funciona

Primer análisis de "Búsqueda #2" con datos comparables (desde el 19 jul, cuando cambió el régimen de
puja). Rango: 24 jul – 12 ago, 20 días.

### El número que importa

Separando los contactos por canal —se infiere del value unitario: WhatsApp cae siempre en 7–10 y
cualquier formulario arranca en 30— aparece el costo por **lead serio** (formulario, copiar correo o
agendar; no WhatsApp):

| | 1–22 jul | 24 jul – 12 ago |
|---|---:|---:|
| Búsqueda #2 | 91,09 USD | **24,85 USD** · 11 serios de 16 contactos (68,8 %) |
| Software #2 | 68,31 USD | **57,34 USD** · 4,97 de 8,97 (55,4 %) |

AR consolidado: **34,98 USD por lead serio y ~24 al mes**. Costa Rica, gastando casi lo mismo
(559 contra 510 USD): **254,97 USD y 3,0 al mes**. Siete veces más barato y ocho veces más volumen.
"Búsqueda #2" es además la **única campaña de la cuenta con ratio > 1** (1,42).

El mix de valor argentino (81,2 %) cruza el umbral del 80 % que pedía el plan de tROAS, pero el
contrafactual aritmético del ×2 da 80,3 %: ahí el umbral está midiendo sobre todo el cambio de
escala, no comportamiento. **No se activó ningún tROAS** — en Argentina tampoco, y menos habiendo
cambiado hoy las acciones de conversión.

### Aplicado: un canal, una acción

Se ejecutó la separación que este documento tenía agendada para hoy. Cuatro acciones nuevas propias
de Nolõ, creadas por API:

| Canal | Label |
|---|---|
| WhatsApp | `zxm7CMGXquEc…` |
| Copiar correo | `tU5ZCMSXquEc…` |
| Agendar reunión | `GPuTCMeXquEc…` |
| Formulario | `ZAj_CMqXquEc…` |

Todas `WEBPAGE`, `ONE_PER_CLICK`, primarias, lookback 30 días. **Categoría DEFAULT**, igual que
"Contacto Argentina": las campañas argentinas usan los objetivos de conversión de la cuenta, donde
`DEFAULT/WEBSITE` puja. Poner otra categoría las habría dejado fuera de la puja sin aviso. Los values
no se tocaron. "Contacto Argentina" queda ENABLED pero ya no se dispara: conserva su histórico.

En el código: `ADS_CONVERSIONS` pasa de dos entradas a cinco en `services/ads.service.ts`, más
`GA_CONVERSION.SEND_TO` en `lead-form/models/lead-form-options.ts`. Cambio espejo de LinkDesign.
46 tests pasan.

**El motivo de urgencia vino de Costa Rica**, y conviene tenerlo presente acá: allá la acción
agrupada escondió durante semanas que la campaña principal había dejado de traer formularios —
seguía marcando "contactos" mientras el 100 % eran clics de WhatsApp. El CRM lo confirmó: el último
formulario de CR es del 7 jul. Argentina no muestra ese patrón (68,8 % de leads serios y un
formulario el 12 ago), pero hasta hoy tampoco había forma de verificarlo sin inferencias. Detalle
completo en `docs/bitacora-ads-values-troas.md` de LinkDesign-simple.

### El pendiente de aislamiento, verificado (y no estaba cumplido)

Se comprobó por API lo que este documento pedía revisar:

- **"Scroll Argentina (2)" NO es secundaria**: está `primary_for_goal = True` y cuenta en la columna
  de conversiones, con categoría DEFAULT (no "Otras").
- **Las campañas argentinas NO tienen objetivo propio a nivel campaña.** `campaign_conversion_goal`
  existe sólo para "Búsqueda" y "Software" (CONTACT/WEBSITE, las de Costa Rica); "Búsqueda #2" y
  "Software #2" usan los objetivos de la **cuenta**, que hacen pujar tanto DEFAULT/WEBSITE como
  CONTACT/WEBSITE.

O sea: son las campañas de **Costa Rica** las que están aisladas, no las argentinas. En la práctica
el riesgo es acotado —una conversión se atribuye al clic que la originó, y nadie llega por un anuncio
argentino para convertir en `linkdesign.cr`— pero la configuración no es la que este pendiente
describía, y ahora hay ocho acciones más en juego. Queda abierto, con el estado real documentado.

## Pendientes

- [ ] **~27 ago 2026** — Recalibrar los values con datos propios por canal, ya con dos semanas de las
      acciones nuevas. Hoy la escala (WhatsApp 10 contra formulario 30–60) es un supuesto sin
      evidencia; el CRM de LinkDesign sugiere que la brecha real es **mayor**.
- [ ] **24–48 h** — Verificar que las cuatro acciones nuevas registran conversiones. Si una queda en
      cero mientras las otras se mueven, el label quedó mal copiado: es el modo de fallo silencioso
      de este cambio.
- [ ] **No tocar pujas por al menos dos semanas.** Separar las acciones reinicia el aprendizaje de
      Smart Bidding; encimar un tROAS haría imposible atribuir el efecto de nada.
- [ ] **~Sept 2026** — Primera lectura con sentido de Search Console de Nolõ, cuando haya varias
      semanas acumuladas. Repetir el análisis de canibalización que se hizo para LinkDesign.
- [ ] Aislamiento de la optimización argentina: ver arriba el estado real verificado el 13 ago.
      Decidir si se le asigna a "Búsqueda #2" y "Software #2" un `campaign_conversion_goal` propio
      con las acciones de Nolõ, y si "Scroll Argentina (2)" pasa a secundaria.
- [x] ~~**13 ago 2026** — Revisión conjunta con LinkDesign; primer análisis de "Búsqueda #2".~~ Hecho.
- [x] ~~**13 ago 2026** — Separar las acciones de conversión por canal.~~ Hecho, ver arriba.

## Nota operativa

La zona horaria de la cuenta es **Costa Rica (UTC-6)** y Argentina va +3h: al cargar horarios de
campaña hay que restar 3 horas. Los sitelinks admiten como máxima granularidad el grupo de anuncios,
no el anuncio.
