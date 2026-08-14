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
| 13 ago 2026 | Separación de las acciones de conversión por canal (cuatro nuevas). Misma tarde: **presupuesto de "Búsqueda #2" 15 → 20 USD/día** por API. Se evaluó y **descartó**, para **las dos** campañas argentinas, pasar la keyword a concordancia amplia y limitar la segmentación a Buenos Aires; "Software #2" queda además con su presupuesto sin cambios. |

**Advertencia para cualquier comparación**: el historial anterior al 19 jul **no es comparable** en
comportamiento de puja (era otro régimen de optimización). De ese período solo sirven las métricas de
mercado: CPCs, volumen, términos de búsqueda, Quality Score.

## Estado actual (30 jul 2026)

Campañas activas, ambas con Maximizar valor de conversión:

| Campaña | Presupuesto |
|---|---|
| Búsqueda #2 | ~~USD 15,00/día~~ → **USD 20,00/día desde el 13 ago 2026** (ver la entrada al final) |
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

> ⚠️ **Corregido el 13 ago 2026, misma tarde.** La columna de 24 jul – 12 ago sobrecontaba los leads
> serios: el criterio declarado arriba es correcto, pero el conteo no se seguía de él. Los valores
> crudos de esa ventana son inequívocos —**8,00 nueve veces y 9,00 dos veces** (WhatsApp modulado),
> contra 48,00 dos veces, 54,00 una y una celda de 2 conversiones por 63,00— o sea **4 o 5 leads
> serios, no 11**. Las cifras de 1–22 jul sí verifican (91,09 y 68,52). Detalle y método al final del
> documento; es el mismo error que se corrigió el mismo día en la bitácora de LinkDesign.

| | 1–22 jul | 24 jul – 12 ago (corregido) |
|---|---:|---:|
| Búsqueda #2 | 91,09 USD | ~~24,85~~ → **60,75 USD** · 4–5 serios de 16 contactos (28 %) |
| Software #2 | 68,31 USD | ~~57,34~~ → **95,88 USD** · 3 de 9 (33 %) |

AR consolidado: ~~34,98~~ → **74,73 USD por lead serio y ~11 al mes**. Costa Rica, gastando casi lo
mismo (559 contra 510 USD): **254,97 USD y 3,0 al mes**. **3,4 veces** más barato —no siete— y unas
cuatro veces más volumen. Sigue siendo el mercado que funciona, pero por un margen bastante menor del
que decía la primera lectura.

Lo que **no** cambia: "Búsqueda #2" es la **única campaña de la cuenta con ratio > 1**. Verificado en
la misma ventana: Búsqueda #2 **1,42** · Software #2 0,75 · Búsqueda (CR) 0,59 · Software (CR) 0,42.
El ratio se calcula sobre el valor total y no depende de la partición por canal.

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

## 13 ago 2026 (misma tarde) — Concordancia, geografía y presupuesto de las dos campañas AR

Las mismas tres preguntas para "Búsqueda #2" y "Software #2" — nacidas de que ese día la campaña
"Software" de Costa Rica había confirmado que le convenía la concordancia **amplia**. De las seis
respuestas, **una sola terminó en cambio**: el presupuesto de "Búsqueda #2".

### "Búsqueda #2": la keyword se queda en frase — la lógica de "Software" no se transfiere

La pregunta venía de que ese mismo día la campaña "Software" (Costa Rica) había confirmado que la
concordancia **amplia** le convenía. No aplica acá, y el motivo es concreto: allá la frase estaba
cara porque el Quality Score era 3. Acá pasa lo contrario.

La misma keyword `desarrollo de sitios web`, en los dos mercados:

| campaña | concordancia | **QS** | CTR esperado | CPC |
|---|---|---:|---|---:|
| **Búsqueda #2 (AR)** | **frase** | **7** | ABOVE_AVERAGE | **1,87 – 2,30** |
| Búsqueda (CR) | amplia | 5 | AVERAGE | 2,81 – 3,19 |

Tiene el clic más barato y el mejor QS de toda la cuenta: no hay nada que arreglar. Tres razones para
no tocarla:

1. **Cambiar la concordancia destruye el QS 7.** Es un borrar-y-crear interno. En "Software" eso dejó
   el QS en 3 y, tres semanas después, el CPC de la amplia nueva (4,13) seguía muy por encima del de
   la amplia vieja ya establecida (2,65). Hacérselo a la única campaña con ratio > 1 es el peor
   movimiento disponible.
2. **No falta alcance, falta presupuesto.** Pierde 24,8–49,2 % de las impresiones por presupuesto
   contra 10,3–32,7 % por ranking. Con amplia se repartiría el mismo dinero entre más subastas,
   muchas peores: diluye en vez de comprar.
3. Con frase la campaña casi no genera términos basura, así que **el trabajo diario de negativas —que
   sí rinde en "Software"— no tendría acá dónde aplicarse.**

### "Búsqueda #2": tampoco limitar la segmentación a Buenos Aires — es donde peor rinde

Los datos van en dirección contraria a la intuición. Desempeño por bloque, 1 jun – 12 ago:

| bloque | % del gasto | CPC | **ratio** | USD/contacto |
|---|---:|---:|---:|---:|
| AMBA (CABA + Prov. Buenos Aires) | 66,1 % | 2,28 | 0,95 | 23,09 |
| **Resto del país** | 13,6 % | 2,02 | **1,17** | **18,21** |
| Córdoba | 11,7 % | 1,77 | 0,67 | 93,62 |
| Santa Fe | 5,5 % | 1,78 | 0,74 | 22,23 |
| Mendoza | 3,1 % | 1,46 | 0,49 | 24,74 |

El **"resto del país"** —94 regiones sueltas— es el bloque más eficiente, y limitar a Buenos Aires lo
cortaría entero. Y "Buenos Aires" tampoco es homogéneo: **CABA + comunas** rinde 1,12 (104 clics,
263,84 USD) contra **0,78 de la Provincia** (129 clics, 267,13 USD). El orden real es: resto del país
› CABA › Provincia de Buenos Aires › Santa Fe › Córdoba › Mendoza. Segmentar "Buenos Aires" juntaría
el segundo mejor con el tercero peor y descartaría el primero.

**Reserva**: el "resto del país" son 54 clics y 6 contactos — no está *probado* que sea mejor, pero
no hay ninguna evidencia para excluirlo. Lo único con señal de bajo rendimiento es **Córdoba**:
11,7 % del gasto (93,62 USD, 53 clics) y **un solo contacto**. Anotado, no ejecutado.

La segmentación queda como estaba: Argentina (país) con `positive_geo_target_type = PRESENCE`, que es
lo correcto — sólo gente físicamente en el país, no gente interesada en él.

### "Búsqueda #2" — aplicado: presupuesto de 15 → 20 USD/día

**Ejecutado por API el 13 ago 2026** sobre `campaignBudgets/15658499227`, con `validate_only` previo y
verificación posterior contra el servidor. El presupuesto es exclusivo de "Búsqueda #2" (no
compartido), así que ninguna otra campaña se ve afectada.

Lo que sostiene la subida, y que **no** es la pérdida de impresiones por presupuesto (esa métrica es
poco confiable con Maximizar valor sin target, porque el algoritmo puja hasta gastar lo que haya):

- **La campaña toca el techo casi todos los días.** De 40 días con actividad, **31 superan el diario
  en más de 10 %** y 4 más están en el tope; sólo 5 quedan por debajo del 90 %. Es evidencia directa,
  no derivada de la métrica de Google.
- **Correlación entre gasto semanal y leads serios: r = +0,78** (9 semanas). En Costa Rica esa misma
  correlación es **−0,42**. Los dos mercados se comportan al revés: acá el dinero adicional compra
  leads serios.
- Es la única campaña de la cuenta con ratio > 1 (**1,42**).

**Por qué 20 y no otro número.** El presupuesto que capturaría *toda* la demanda hoy perdida sale de
`presupuesto × (IS + IS perdido por presupuesto) / IS`, mes a mes: **22,5** (jun) · **29,5** (jul) ·
**20,8** (ago) — o sea un rango de 21–30 con centro en ~24. Se eligió **20** y no 24 por dos razones:
la evidencia de que el gasto compra leads serios está medida entre 72 y 111 USD/semana, y 20/día
lleva a ~135 (apenas afuera) mientras 24/día lleva a ~162 (muy afuera); y los saltos grandes de
presupuesto pueden reiniciar el aprendizaje de Smart Bidding — +33 % es un paso normal, +60 % no.

> **Trampa de lectura que costó una corrección en la conversación**: el presupuesto diario de Google
> **no es un tope por día**, es un promedio; el tope real es mensual (`diario × 30,4`). Como estas
> campañas corren sólo L–V de 8 a 17, Google reparte ese tope entre ~21,7 días hábiles, así que **el
> gasto por día activo es ~1,4× el nominal**. Con 15/día configurados la campaña venía gastando
> **20,08 por día activo**, que es exactamente su presupuesto mensual — no un exceso. La tabla de
> equivalencias:
>
> | configuración | tope mensual | gasto esperado/mes | por día hábil |
> |---:|---:|---:|---:|
> | 15 (antes) | 456 | ~405 | ~19–20 |
> | **20 (ahora)** | **608** | **~541** | **~25** |
> | 24 | 730 | ~649 | ~30 |

### Sobre la regla de "no tocar nada por dos semanas"

Este documento pedía no tocar pujas mientras se estabiliza la medición por canal. **El presupuesto no
es una puja**, pero sí cambia el volumen, así que la lectura de las próximas semanas mezcla dos
cosas: las acciones separadas (13 ago) y +33 % de presupuesto (13 ago). Fue una decisión consciente.
La consecuencia práctica es que **el efecto del presupuesto habrá que leerlo en leads serios por cada
100 clics, no en totales** — esa tasa es indiferente al volumen.

### "Software #2": las mismas tres preguntas, ninguna termina en cambio

**La premisa de partida era correcta**: Argentina tiene mucho más mercado que Costa Rica para esta
keyword. Keyword Planner sobre `empresa de desarrollo de software`: **210 búsquedas/mes en Argentina
contra 50 en Costa Rica** — cuatro veces. La decisión original de usar frase acá estaba bien fundada.

**La concordancia se queda en frase**, por un motivo distinto al de "Búsqueda #2":

| mes | cuota de impresiones | perdido por presupuesto | perdido por **ranking** | CPC |
|---|---:|---:|---:|---:|
| junio | 69,8 % | 21,5 % | **8,7 %** | 3,84 |
| julio | 49,6 % | 45,9 % | **4,5 %** | 6,23 |
| agosto | 55,3 % | 25,9 % | **18,8 %** | 4,15 |

La pérdida por ranking es de un dígito o casi: **la campaña gana casi todas las subastas en las que
participa**. Lo que la frena es el presupuesto, y ampliar la concordancia agranda el universo de
subastas sin agrandar el dinero. Además el ruido con frase **ya es mínimo — 7,5 % del gasto**
(5 términos en 10 semanas, todos marcas: `flexxus cordoba`, `codemized`, `epidata argentina`,
`eleks argentina`, `luxoft argentina`, 26,95 USD). En "Software" de Costa Rica la amplia lo llevó al
18–35 %. Y el cambio costaría el **QS 5**, que se resetearía igual que pasó allá.

**La geografía se queda en Argentina (país)**, y acá el cuadro es *distinto* al de "Búsqueda #2":

| bloque | % del gasto | clics | CPC | ratio |
|---|---:|---:|---:|---:|
| AMBA (CABA + Prov. Buenos Aires) | 55,7 % | 83 | 5,51 | 0,51 |
| Resto del país | 19,7 % | 36 | 4,49 | 0,41 |
| Santa Fe | 10,5 % | 21 | 4,11 | 0,21 |
| **Córdoba** | 7,4 % | 17 | 3,59 | **0,95** |
| Mendoza | 6,7 % | 13 | 4,25 | 0,47 |

AMBA sí es el mejor de los bloques grandes, pero con **0,51 contra un promedio de 0,49**: dos
centésimas a cambio de resignar el 44 % del volumen. Y el bloque que mejor rinde es **Córdoba**, que
quedaría fuera del recorte. Dentro de AMBA se invierte respecto de "Búsqueda #2": **Provincia 0,61
contra CABA 0,41**. Con 13–21 clics por bloque, ninguna de estas diferencias es sólida.

**El presupuesto se queda en 15**, y esta es la única de las tres donde el veredicto está reñido.
Se le aplicó la misma prueba que a "Búsqueda #2" y sale igual en todo menos en lo decisivo:

- **También toca el techo**: 31 de 39 días activos superan el diario en más de 10 %; gasta 21,05 por
  día activo.
- **Presupuesto implícito**: 17,7 (jun) · 23,5 (jul) · 19,4 (ago) → centro en ~20, contra ~24 de
  "Búsqueda #2".
- **Pero la correlación entre gasto semanal y leads serios es r = +0,33** (n = 9), contra **+0,78**
  de "Búsqueda #2". Con nueve semanas haría falta ~0,67 para que signifique algo: **no hay evidencia
  de que el dinero adicional compre leads serios acá**, que es justo el argumento que sostuvo la
  subida de la otra campaña.

Un detalle que desinfla el número de julio: el mes que más presupuesto pedía (23,5/día implícito) fue
el de **peor CPC (6,23)**. Pedía más plata porque el clic estaba caro, no porque hubiera más demanda.

Y el CPC está por encima de lo que pide el mercado: el Keyword Planner sugiere **0,91–3,72** para
aparecer en el tope con esa keyword en Argentina, contra **4,15–6,23** reales. Con la pérdida por
ranking en un dígito, no es que se compren posiciones caras: cada posición cuesta de más. Eso viene
del QS 5 con `landing page = BELOW_AVERAGE` — la misma dimensión floja de las cuatro campañas.

**Tampoco se baja**, aunque el ratio sea 0,75. Dónde está parada, en la ventana comparable:

| campaña | costo | ratio | leads serios | USD/lead serio |
|---|---:|---:|---:|---:|
| Búsqueda #2 | 273,37 | **1,42** | 4,5 | **60,75** |
| **Software #2** | 285,24 | 0,75 | 3,0 | 95,88 |
| Búsqueda (CR) | 196,96 | 0,59 | 0,0 | — |
| Software (CR) | 312,98 | 0,42 | 2,0 | 156,49 |

Es la **segunda mejor de las cuatro**, mejor que ambas de Costa Rica. Y conviene dejar escrito algo
que vale para toda la cuenta: **el ratio no es rentabilidad**. Los values son números que elegimos
nosotros, no ingresos; un ratio de 0,75 no significa perder plata. Lo comparable entre campañas es el
USD por lead serio.

### El Performance Planner de "Software #2" no cuadra, y por qué

Se contrastó la previsión que muestra la interfaz para el 17–21 ago —*"invierta USD 65 y obtenga un
valor de conversión estimado de 152, valor por inversión de 2,34"*— contra los datos reales. **Las
dos cifras están infladas**, y conviene saberlo antes de tomar decisiones con esa pantalla:

- **El gasto está 38 % por debajo del real.** 65 USD en 5 días hábiles son 13/día; la campaña viene
  gastando **20,96 por día hábil** (13 días medidos), o sea ~105 en cinco. El Planner proyecta sobre
  el presupuesto nominal sin modelar el sobregasto que el propio Google aplica para compensar los
  fines de semana no activos.
- **El ratio 2,34 no lo respalda ningún período**: 1,04 (últimos 7 días) · 1,01 (14 días) · 1,13
  (agosto) · 0,34 (julio) · 0,27 (junio). La brecha se explica casi exactamente por los dos
  optimismos combinados: **~25 % más conversiones × ~38 % menos gasto ≈ 2×**.

**Lo que sí sirve de esa pantalla es la forma de la curva**: rendimientos decrecientes con el punto
actual todavía en zona de retorno positivo (de ~80 a ~160 USD el valor sube +58 %; de 160 a 320, sólo
+21 %). Eso coincide con lo medido acá — 31 de 39 días tocando el techo, campaña no saturada.

**La trampa de fondo**: la curva optimiza *valor de conversión*, que es la métrica que ya sabemos
inflada. En los últimos 14 días el desglose por acción es **Contacto Argentina 9 conversiones (valor
184) contra Scroll Argentina 23 conversiones (valor 23)**: casi tres de cada cuatro "conversiones"
son scrolls. La curva no promete más clientes, promete más puntos de un puntaje propio.

Detalle operativo para quien vuelva a esa pantalla: el campo **"Porcentaje de conversiones promedio:
83,33 %"** es editable, y 83,33 es exactamente 5/6 — sospechosamente redondo para ser un dato medido.
Si ese parámetro está mal, toda la previsión lo está.

### Cómo se corrigió la tabla de leads serios

El método viejo repartía mal las celdas *(día, hora)* con más de una conversión. Se rehízo con cotas
exactas: con `w` WhatsApps de valor `wa` y `s` serios en el rango `[lo, hi]`,
`s ≥ (v − wa·c)/(hi − wa)` y `s ≤ (v − wa·c)/(lo − wa)`. Para Argentina post-×2: `wa = 10`,
`lo = 21`, `hi = 60`.

Sólo afecta al período posterior al ×2 del 24 jul; las ventanas anteriores verifican sin cambios.
Cuando las cuatro acciones separadas acumulen datos, esta inferencia deja de hacer falta: el canal
vendrá dado.

## Pendientes

- [ ] **~3 sep 2026** — Leer el efecto del presupuesto de 20/día en **"Búsqueda #2"**, medido en
      **leads serios por 100 clics** (no en totales, que suben por el volumen). Si escala, evaluar
      24; si el ratio se cae, el techo útil estaba por debajo de 20. Por encima de 30 no hay base.
- [ ] **~3 sep 2026** — Revisar **"Software #2"** recién entonces, con las acciones separadas dando
      canal real en vez de inferencia por value unitario. El caso para subirla mejora solo **si el
      CPC baja hacia la puja que sugiere el Planner (0,91–3,72 contra 4,15–6,23 actuales)**; si sigue
      en 4+ con QS 5, la palanca es la página de destino y no el presupuesto. No mover las dos
      campañas argentinas a la vez: sería imposible atribuir el efecto de cualquiera.
- [ ] **3 sep 2026 — o después, nunca antes** ~~(27 ago)~~ — Recalibrar los values con datos propios
      por canal. Hoy la escala (WhatsApp 10 contra formulario 30–60) es un supuesto sin evidencia; el
      CRM de LinkDesign sugiere que la brecha real es **mayor**.
      > **Se movió del 27 de agosto al 3 de septiembre el 13 ago 2026, a propósito.** Recalibrar a
      > mitad de la ventana de medición habría dejado el análisis del 3 de septiembre con **dos
      > escalas de valor mezcladas** y el aprendizaje de Smart Bidding reiniciado por la mitad — el
      > mismo error que volvió irresoluble lo del 23 de julio, cuando el recorte de presupuesto y el
      > ×2 de values cayeron el mismo día. La ventana 13 ago – 3 sep queda con **una sola escala**.
      > Si el 3 de septiembre se decide recalibrar, ese cambio abre su propia ventana de medición.
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
