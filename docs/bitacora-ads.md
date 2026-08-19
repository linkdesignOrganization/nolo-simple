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
| 14 ago 2026 | Revisión rehecha de esas dos preguntas con datos frescos: **ambas conclusiones se sostienen**, pero la geográfica estaba medida con la métrica equivocada (ver la corrección de método abajo). De ahí salió el diagnóstico del **CPC caro** y **siete correcciones ejecutadas por API**: en "Software #2" dos títulos, seis extensiones y dos negativas; después, textos destacados y fragmento de web fuera de **las dos** campañas de software (con reemplazo propio en ambas) y los dos títulos con "CR" de "Búsqueda #2". Todas son correcciones de errores heredados del fork, no experimentos: por eso no esperaron a que cerrara la ventana de medición. Además se verificó, y **descartó**, cambiar las keywords: en amplia y en frase el volumen nominal de la keyword no dice nada, y la actual ya cubre las familias genéricas. |

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

> **⚠️ Corregido el 18 ago 2026 — el motivo de este párrafo es falso, y tuvo consecuencias.** La
> categoría DEFAULT era la elección correcta, pero **no porque las campañas argentinas usen los
> objetivos de la cuenta**: usan el objetivo personalizado «Contacto Argentina» (`6458009700`), donde
> lo que puja lo decide **la lista de acciones**, no la categoría. Como estas cuatro nuevas no se
> agregaron a esa lista, **estuvieron tres días hábiles registrando sin pujar**. Ver la entrada del
> 18 de agosto al final de este documento.

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
- ~~**Las campañas argentinas NO tienen objetivo propio a nivel campaña.** `campaign_conversion_goal`
  existe sólo para "Búsqueda" y "Software" (CONTACT/WEBSITE, las de Costa Rica); "Búsqueda #2" y
  "Software #2" usan los objetivos de la **cuenta**, que hacen pujar tanto DEFAULT/WEBSITE como
  CONTACT/WEBSITE.~~ **Falso. Corregido el 18 ago 2026** — ver abajo.

~~O sea: son las campañas de **Costa Rica** las que están aisladas, no las argentinas. En la práctica
el riesgo es acotado —una conversión se atribuye al clic que la originó, y nadie llega por un anuncio
argentino para convertir en `linkdesign.cr`— pero la configuración no es la que este pendiente
describía, y ahora hay ocho acciones más en juego. Queda abierto, con el estado real documentado.~~

> **⚠️ Esta conclusión es exactamente al revés, y se verificó el 18 ago 2026.** Las campañas
> argentinas **sí** tienen configuración propia: usan el objetivo personalizado «Contacto Argentina»
> (`6458009700`), tal como se había planeado en junio. **Son las más aisladas de las cuatro**, porque
> ese objetivo sólo contiene acciones argentinas.
>
> El error fue de método: se consultó `campaign_conversion_goal`, que para esas dos campañas devuelve
> **ninguna categoría biddable** — y eso se leyó como «hereda las de la cuenta» cuando es justo la
> **firma de que hay un objetivo personalizado**. La tabla que había que mirar es
> `conversion_goal_campaign_config`, y hay que mirarla **primero**.
>
> El pendiente no estaba incumplido: estaba cumplido desde junio. Lo que faltaba era **mantenerlo**,
> y eso es lo que falló el 13 de agosto.

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

## 14 ago 2026 — El clic está caro, y por qué: siete correcciones ejecutadas

Se rehízo con datos frescos la revisión del día anterior. **Las dos respuestas del 13 ago se
sostienen** —la keyword sigue en frase, la segmentación sigue en Argentina (país)— pero una de las
dos estaba medida con la métrica equivocada, y de corregirla salió el diagnóstico que importa.

### Corrección de método: para decisiones geográficas, contar contactos y no mirar el ratio

El 13 ago la pregunta geográfica se resolvió con el ratio valor/costo, que daba AMBA 0,51 contra un
promedio de 0,49 — "dos centésimas". Ese número está **diluido**: los scrolls son 91 de las 109
conversiones y valen 1 punto cada uno, así que dominan el ratio y aplastan la señal de los contactos.
Contando contactos reales (1 jun – 13 ago, 843,07 USD, 176 clics, 18 contactos, 5 serios):

| zona | gasto | clics | CPC | contactos | serios | USD/contacto |
|---|---:|---:|---:|---:|---:|---:|
| **AMBA** | 460,33 | 84 | 5,48 | 12 | 3 | **38,36** |
| Resto del país | 382,74 | 92 | 4,16 | 6 | 2 | 63,79 |

AMBA sale **40 % más barato por contacto**, no "dos centésimas mejor". **La conclusión no cambia** y
el recorte sigue sin convenir, pero por tres razones que el ratio no mostraba:

1. **Los contactos porteños son de peor calidad**: 3 de 12 serios (25 %) contra 2 de 6 (33 %) afuera.
   En leads serios por clic la brecha es 3,6 % contra 2,2 %.
2. **Nada de eso resiste la prueba**: contactos por clic p = 0,09; leads serios por clic **p = 0,58**.
   Con cinco leads serios en total, mover uno cambia el ranking.
3. **La cuenta completa del recorte**: el mismo dinero a CPC porteño compra 154 clics en vez de 176 →
   ≈ 22 contactos y ≈ 5,5 serios contra 18 y 5. Media décima de lead serio en dos meses y medio, y
   asumiendo que la tasa aguanta al comprar las subastas de AMBA que hoy se pierden, que son las más
   caras.

Detalle que confirma que es ruido: en "Software #2" la **Provincia** rinde mejor que **CABA**
(31,61 contra 47,82 USD por contacto); en "Búsqueda #2" es exactamente al revés. Dos campañas del
mismo mercado contradiciéndose sobre la misma zona.

### Dos datos que refuerzan lo de la concordancia, y una corrección al 13 ago

**Qué universo abriría realmente la amplia.** El Keyword Planner, partiendo de
`empresa de desarrollo de software` en Argentina, devuelve 101 ideas que suman **9.140 búsquedas al
mes** contra las 210 de la keyword actual. Suena enorme hasta que se mira de qué está hecho:
**7.200 de esas 9.140 —el 79 %— son `desarrollador de software`, `desarrolladores de software` y
`desarrollo de soft`**, que es gente buscando qué es un programador o buscando trabajo de programador.

El precio lo delata: para esos términos el mercado paga **0,42 – 1,37 USD** por clic, contra
**0,91 – 3,72** por la keyword actual. Cuando media industria paga un tercio por un término, es
porque no le vende a nadie. La amplia multiplicaría el volumen por diez comprando sobre todo eso.

**El tamaño del mercado argentino, completo** (búsquedas/mes, Keyword Planner, español). Confirma con
más margen la premisa que motivó elegir frase:

| palabra | Argentina | Costa Rica |
|---|---:|---:|
| empresas de software | 720 | 50 |
| **empresa de desarrollo de software** — la de la campaña | **210** | **50** |
| software a medida | 140 | 10 |
| desarrollo de software a medida | 70 | 10 |

> **Corrección al 13 ago: el ruido de la frase no es 7,5 %, es 13,9 %.** Aquella entrada contó
> 5 términos de marca por 26,95 USD. Barriendo 1 jun – 13 ago con criterio más amplio aparecen
> **12 marcas de competidor con clic pagado** —Flexxus, Codemized, Cobaires, Bitor, Abasto, Epidata,
> Software del Plata, Patagonian, Vinta, ASF, Eleks, Luxoft— por **51,42 USD**, que es el **13,9 %**
> del gasto rastreable. Produjeron 7 scrolls y **cero contactos**.
>
> **No cambia la decisión**, por dos motivos: la mayoría ya estaba bloqueada (ver punto 3) y en
> "Software" de Costa Rica la amplia lleva ese ruido al 18–35 %. Pero deja escrito que **la frase de
> hoy ya se estira sola**: Google la interpreta con manga ancha y trae `software a medida`,
> `empresa de programación`, `desarrolladores de app en argentina` y nombres de competidores. El
> gasto rastreable, además, es sólo **371 de los 843 USD** — Google oculta el resto por privacidad,
> así que ese 13,9 % es un piso, no el valor real.

### De dónde sale el CPC de 4,79: el gasto está concentrado en los clics caros

Reparto del gasto rastreable de "Software #2" por precio del clic (1 jun – 13 ago, 75 clics
visibles):

| precio del clic | clics | % del gasto | CPC | ratio |
|---|---:|---:|---:|---:|
| 0 – 3 USD | 13 (17 %) | 7,6 % | 2,17 | **1,27** |
| 3 – 5 USD | 39 (52 %) | 39,5 % | 3,76 | 0,95 |
| 5 – 8 USD | 13 (17 %) | 22,0 % | 6,29 | 0,71 |
| **8 USD o más** | **10 (13 %)** | **30,8 %** | **11,45** | **0,32** |

Diez clics se llevan casi un tercio del gasto y son los que peor rinden; los baratos rinden cuatro
veces mejor. Sin esos diez el CPC medio caería de 4,95 a **3,95**. No todos son excluibles —
`empresas de sistemas en argentina` a 18,14 o `empresa de programacion` a 14,94 son términos
legítimos, y con Maximizar valor la puja la decide Google—, pero marca dónde está el dinero.

**Y el móvil está flojo, al revés que en Costa Rica.** 1 jun – 13 ago: escritorio **CTR 5,71 %**
(2.538 impresiones, 145 clics, CPC 4,85) contra móvil **CTR 3,32 %** (933 impresiones, sólo 31 clics,
CPC 4,51). En "Software" (CR) el móvil rinde igual que el escritorio y con el clic más barato, así
que **no es la plantilla compartida**: es algo de esta campaña. Con Smart Bidding no se puede ajustar
puja por dispositivo (los ajustes se ignoran salvo el −100 %), así que queda anotado sin acción,
para mirarlo cuando los títulos nuevos hayan rodado.

### El diagnóstico real: la página nunca dice lo que la gente busca

Software #2 paga **4,79 USD** por clic (4,09–6,23 según el mes) cuando el Keyword Planner pide
**0,91–3,72** para el tope de página. Con la pérdida por ranking en un dígito, no se están comprando
posiciones caras: **cada posición cuesta de más**, y eso es Quality Score. El QS es 5 y se descompone
en anuncio ABOVE_AVERAGE, CTR esperado AVERAGE y **página de destino BELOW_AVERAGE** — la misma
dimensión floja en las cuatro campañas de la cuenta.

Se descargó `nolo.ar/software` y se contaron apariciones en el texto real (1.501 palabras):

| frase | apariciones |
|---|---:|
| «empresa de desarrollo de software» *(la keyword)* | **0** |
| «desarrollo de software» | **0** |
| «empresa de software» | **0** |
| «software a medida» | 2 |

El `h1` dice *«Software construido alrededor de tu operación.»* y el `title`, *«Software a medida para
empresas | Nolo»*. **El patrón es total**: `nolo.ar/web` tampoco contiene «desarrollo de sitios web»
(0 apariciones), que es la keyword de "Búsqueda #2". No es *keyword stuffing* lo que falta: es que el
texto habla en el idioma del estudio y no en el del cliente.

> **Esto no es un problema argentino, es de la arquitectura compartida.** Las dos páginas de
> `linkdesign.cr` dan exactamente el mismo resultado, y las cuatro campañas de la cuenta tienen
> `landing page = BELOW_AVERAGE`. El caso de Costa Rica, con sus propios números y su tabla de QS
> comparada, está en `docs/bitacora-ads-values-troas.md` del repo `LinkDesign-simple`, entrada del
> 14 ago 2026. Si se decide reescribir el copy, hay que decidir también si se replica allá.

> **Medición de velocidad — corregida el mismo día.** Primero se anotó que `/software` pesaba
> «360 KB y no parece ser el problema». **Estaba mal**: ese script sólo seguía `<script src>` y
> `<link rel=stylesheet>`, así que no contaba los medios. Contando lo que el HTML referencia,
> `nolo.ar/software` arrastra **16,8 MB en 9 vídeos** (pulso 2,83 · tornos 2,58 · dental 2,08…) y
> `nolo.ar/web` **42,4 MB en 20 vídeos**. Los 360 KB son sólo el esqueleto.
>
> El diagnóstico del 13 ago (artefacto «Por qué Google baja la nota») ya lo había medido bien y con
> carga real de navegador: **27,3 MB en `linkdesign.cr/web`**, de los cuales 18,5 MB son vídeos del
> portafolio que se precargan siempre por `preloadVideos()` en `portfolio-table.component.ts`.
> Referenciado no es lo mismo que descargado —un `<video>` sin precarga no baja hasta que hace
> falta—, así que las cifras de acá son un techo y las de aquel diagnóstico, el consumo real. **La
> conclusión correcta es la de aquel documento: el peso sí es un problema, aunque no la causa raíz**
> (la nota ya estaba baja cuando la página era liviana).

### Ejecutado por API el 14 ago 2026

Decisión de Robert: son errores heredados del fork, no experimentos, así que **no se esperan las tres
semanas de la ventana de medición**. Pagar por un error conocido es peor que ensuciar la lectura.
Los tres cambios con `validate_only` previo y verificación posterior contra el servidor.

**1 · Dos títulos del RSA** (anuncio `813097373240`). La frase exacta **no cabe**: «empresa de
desarrollo de software» tiene 33 caracteres y el límite de un título es 30. Se cubre con dos títulos
contiguos que sí entran y que no existían:

| se quitó | por qué | se agregó |
|---|---|---|
| «Sistemas de Alta Demanda» | 623 imp, 16 clics, **CTR 2,57 %** (campaña: 5,05 %) | «Desarrollo de Software» (22 car.) |
| «Software Escalable y Robusto» | 32 imp, **0 clics** — Google casi no lo servía | «Empresa de Software a Medida» (28 car.) |

El anuncio tenía los 15 títulos ocupados, así que era reemplazo y no agregado; se eligió por CTR
propio porque el `performance_label` de Google viene `NOT_APPLICABLE` en todos (sin datos
suficientes). El precedente que sostiene el cambio: "Búsqueda #2" tiene **QS 7 y CTR esperado
ABOVE_AVERAGE**, y su segundo título es literalmente su keyword, «Desarrollo de sitios web».

**2 · Seis extensiones propias de software.** Se pensaba copiarlas de "Software" (Costa Rica), pero
**esa campaña tiene exactamente los mismos assets** —mismos IDs, `183496529445` y siguientes—: los
cinco textos destacados hablan de sitios web en las **cuatro** campañas de la cuenta. Se crearon
nuevos, con el vocabulario de la landing:

- Textos destacados: `Software a medida` · `CRM, ERP e inventario` · `Integraciones y APIs` ·
  `Sistemas internos` · `Código propio`
- Fragmento estructurado: **Tipos**: CRM, ERP, Inventario, E-commerce, Ticketing, Reservas

Los sitelinks **no se tocaron**: ya son propios de software y correctos en ambos mercados.

**3 · Dos negativas.** Se verificó la sospecha de Robert y era correcta: hay **3.837 negativas**
aplicando a "Software #2" (156 de campaña + 3.681 de grupo; **ninguna lista compartida**), y **10 de
los 12 competidores ya estaban bloqueados** — los clics observados son anteriores a esas negativas.
Faltaban dos, agregadas en **FRASE** y no en amplia: `abasto software` y `software del plata`. La
convención existente es amplia de una palabra, pero `-abasto` suelto habría bloqueado «mercado de
abasto» y usos legítimos. Total recuperado: 7,28 USD, no los ~51 que sugería el primer cálculo.

### Segunda tanda del 14 ago: limpieza de extensiones y de "Búsqueda #2"

**4 · Los textos destacados de web salieron de "Software #2".** Los cinco
(`Expertos en servicios web`, `Sitios web inigualables`, `Últimas tecnologías web`,
`Presencia digital`, `Desarrollo sin plantillas`) estaban en las **cuatro** campañas de la cuenta. Se
quitó la asociación acá; **siguen intactos en "Búsqueda #2"**, que es donde corresponden. Quitar la
asociación no borra el asset.

> **La misma limpieza se hizo en "Software" (Costa Rica) el mismo día**, porque el error era idéntico
> allá. Eso —y el criterio de darle los de software para no dejarla sin ninguno— está registrado en
> `docs/bitacora-ads-values-troas.md` del repo `LinkDesign-simple`, entrada del 14 ago 2026.

**5 · Los dos títulos con "CR" de "Búsqueda #2"** (anuncio `813096165257`), reemplazados por el
espejo mínimo — se corrige el país sin cambiar el mensaje:

| decía | dice |
|---|---|
| «Diseño Web Corporativo CR» | «Diseño Web Corporativo» |
| «Hecho en CR: 100% Código» | «Hecho en Argentina» |

El «100 % Código» no se pierde: ya estaba en otro título de la misma lista.

**6 · El fragmento estructurado, misma operación que los textos destacados.** «Servicios: Desarrollo
de sitios web, Actualización digital, Asesoría tecnológica, Desarrollo sin plantillas» salió de
"Software #2" (y de "Software" en Costa Rica, ver su bitácora).

**7 · Un segundo fragmento**, con encabezado «Servicios» —espejo del que se le quitó, pero con
contenido propio— porque Google admite dos encabezados y muestra hasta dos. Se creó una sola vez y se
comparte con la campaña de Costa Rica: son sustantivos genéricos, sin país ni voseo.

Estado final de las cuatro campañas de la cuenta, verificado contra el servidor:

| campaña | textos destacados | fragmentos |
|---|---|---|
| Búsqueda · **Búsqueda #2** | los 5 de web | **Servicios**: Desarrollo de sitios web, Actualización digital, Asesoría tecnológica, Desarrollo sin plantillas |
| Software · **Software #2** | Software a medida · CRM, ERP e inventario · Integraciones y APIs · Sistemas internos · Código propio | **Servicios**: Desarrollo a medida, Aplicaciones internas, Automatización con IA, Integración de sistemas, Software de gestión, Desarrollo backend · **Tipos**: CRM, ERP, Inventario, E-commerce, Ticketing, Reservas |

Las cuatro quedan con extensiones de su propio tema, y ninguna quedó sin extensiones. Los sitelinks
**no se tocaron**: ya eran propios de software y correctos en los dos mercados.

**Cada valor del fragmento nuevo está respaldado por la página `/software`**, que es idéntica en los
dos sitios — el criterio fue no listar servicios que no se prestan:

| valor | de dónde sale |
|---|---|
| Desarrollo a medida | `title` de la página · `systems` «a la medida» |
| Aplicaciones internas | `principles` «software interno», «Aplicaciones a medida con datos centralizados» |
| Automatización con IA | `systems.items` «Automatización con IA aplicada» |
| Integración de sistemas | `principles` «integraciones sin romper la operación existente» |
| Software de gestión | `viewcases` «Sistema de gestión para gimnasios», «…de RRHH» |
| Desarrollo backend | título del anuncio «Desarrollo Backend Complejo» |

Se descartó «Dashboards y reporting», que **está comentado en `app.routes.ts`** desde el 15 jun 2026 y
por lo tanto no se muestra en la página. Ninguno de los seis repite un texto destacado ni un valor
del fragmento «Tipos», y todos son sustantivos: no hay tuteo/voseo que ajustar entre mercados.

### Falso positivo que conviene no volver a levantar: el nombre de negocio duplicado

Se reportó que "Búsqueda #2" tenía **dos** nombres de negocio activos, `LinkDesign AR` y `Nolõ`. **Es
falso, y el error fue de la consulta.** Hay **dos campañas llamadas "Búsqueda #2"**:

| id | estado | nombre de negocio |
|---|---|---|
| `22111386447` | **REMOVED** | `LinkDesign AR` |
| `23949699115` | ENABLED — la que corre | `Nolõ` |

La consulta filtraba por `campaign_asset.status` pero **no por `campaign.status`**, así que mezcló
una campaña eliminada con la activa. Regla para la próxima: **en `campaign_asset` hay que filtrar por
los dos estados**, el de la asociación y el de la campaña; si no, reaparecen restos de campañas
muertas. Las cuatro campañas activas tienen el nombre correcto: Link Design en las de Costa Rica,
Nolõ en las argentinas.

### Qué cubre de verdad cada keyword — y por qué NO se tocan

Salió de una propuesta equivocada que conviene dejar escrita para no repetirla. Mirando el Keyword
Planner se armó una tabla que decía que las campañas pujaban «por la palabra menos buscada de su
familia»: `desarrollo de sitios web` tiene **30 búsquedas/mes en Argentina** contra **6.600** de
`paginas web`. La conclusión aparente era cambiar las keywords.

**Robert la objetó y tenía razón.** Dos motivos, los dos confirmados con datos:

> **La regla, para no volver a caer**: el volumen del Keyword Planner mide búsquedas **exactas** de
> esa cadena. En amplia —y en frase, que Google interpreta con manga muy ancha— el texto de la
> keyword es apenas una semilla, no un límite. **Comparar volúmenes nominales de keywords que no
> corren en concordancia exacta no significa nada sobre el alcance real.**

**1 · La keyword actual ya abarca esas búsquedas.** Repartiendo todos los términos de 2026 por
familia (1 ene – 13 ago):

| Búsqueda #2 (AR) · frase `desarrollo de sitios web` | % impresiones | % gasto |
|---|---:|---:|
| diseño web | 53,7 % | **47,5 %** |
| páginas web | 23,4 % | 39,2 % |
| desarrollo web | 20,8 % | 23,0 % |
| sitios web | 2,7 % | 3,1 % |
| *la keyword literal* | *0,1 %* | *0,5 %* |
| fuera de toda familia | 9,4 % | **4,6 %** |

| Software #2 (AR) · frase `empresa de desarrollo de software` | % impresiones | % gasto |
|---|---:|---:|
| empresa(s) de software | 34,0 % | **50,3 %** |
| desarrollo de software | 17,8 % | 26,5 % |
| software a medida | 9,2 % | 14,8 % |
| apps / aplicaciones | 3,2 % | 8,3 % |
| ERP / CRM / sistemas | 2,8 % | 5,7 % |
| *la keyword literal* | *2,8 %* | *6,2 %* |
| fuera de toda familia | 45,1 % | 20,9 % |

**La keyword literal genera el 0,1 % de las impresiones de "Búsqueda #2".** Agregar `paginas web`
sería agregar algo que ya llega —y que ya se lleva el 39,2 % del gasto—, compitiendo contra sí misma
en la subasta.

**2 · Y las genéricas sí traerían basura.** El gasto que cae fuera de cualquier familia relevante,
comparando las cuatro campañas de la cuenta:

| campaña | concordancia | gasto fuera de familia |
|---|---|---:|
| **Búsqueda #2 (AR)** | **frase** | **4,6 %** |
| Búsqueda (CR) | amplia | 20,0 % |
| **Software #2 (AR)** | **frase** | 20,9 % |
| Software (CR) | amplia | 39,6 % |

> **Evidencia nueva a favor de la frase, y es fuerte.** En `/web` la frase filtra **cuatro veces
> mejor** que la amplia (4,6 % contra 20,0 % de ruido) **capturando exactamente las mismas
> familias**. Refuerza por una vía independiente lo decidido el 13 ago para "Búsqueda #2" y el 14
> para "Software #2".

**Lo que sí cambia: el insumo para reescribir el copy.** La lista de frases no debe salir del
Keyword Planner —volumen teórico de mercado— sino de **lo que la gente escribió y por lo que ya se
pagó**. Con ese orden el argumento se vuelve mucho más filoso:

- **`/web` argentino**: diseño web (47,5 %) › páginas web (39,2 %) › desarrollo web (23,0 %) ›
  **sitios web (3,1 %)** — y «sitios web» es justamente el único vocabulario que la página usa.
- **`/software` argentino**: empresas de software (50,3 %) › desarrollo de software (26,5 %) ›
  software a medida (14,8 %).

Y los dos mercados piden copy distinto: en Argentina **«diseño web» le gana a «páginas web»**, en
Costa Rica es al revés, y allá aparece una familia que acá casi no existe —«empresa tecnológica / de
informática / de TI», 18,1 % de su gasto—. Detalle del lado costarricense en la bitácora de
`LinkDesign-simple`.

**Cuota de impresiones de las argentinas** (1 jun – 13 ago, ponderada por impresiones), que confirma
dónde está el cuello de botella:

| campaña | cuota | perdida por presupuesto | perdida por ranking |
|---|---:|---:|---:|
| Búsqueda #2 | 45,3 % | **37,4 %** | 17,3 % |
| Software #2 | 58,5 % | 32,3 % | **9,2 %** |

Las dos están limitadas por presupuesto, no por ranking ni por falta de keywords.

## 14 ago 2026 (cierre del día) — El copy de `/web`: mismo diagnóstico que LinkDesign, tres palabras distintas

El pendiente del copy preguntaba si se replicaba en `linkdesign.cr`, «que tiene el mismo problema
pero **otro orden de familias**». Se midieron los dos sitios el mismo día, con el mismo método.
**Respuesta: un solo documento sirve para los dos.**

### `nolo.ar/web` y `linkdesign.cr/web` son literalmente el mismo texto

Contado sobre el texto visible que devuelven hoy en producción — 1.650 palabras acá, 1.661 allá:

| | nolo.ar/web | linkdesign.cr/web |
|---|---:|---:|
| `h1` | «Sitios web hechos en serio.» | «Sitios web hechos en serio.» |
| los cinco `h2` | idénticos | idénticos |
| «páginas web» | **0** | **0** |
| «diseño web» / «desarrollo web» | **0** y **0** (sólo los verbos, 1 vez cada uno) | **0** y **0** |
| «sitios web» | 4 | 4 |
| «empresa(s)» | 20 | 20 |
| «agencia» | 0 | 0 |

Sólo difieren el `title` —«Desarrollo web a medida | Nolo», sin país— y la `description`.

### El gasto argentino por familia

"Búsqueda #2", todos los términos del 1 ene 2025 al 13 ago 2026: **1.160,75 USD y 552 clics**,
familias excluyentes.

| familia | % gasto | % clics |
|---|---:|---:|
| páginas web | 36,3 % | 30,6 % |
| **diseño web** | 33,4 % | **37,1 %** |
| desarrollo web | 20,9 % | 20,7 % |
| fuera de toda familia | 5,9 % | 6,9 % |
| landing page | 2,4 % | 2,7 % |
| **sitios web** — *lo único que el `h1` dice* | **1,0 %** | 1,6 % |

> **Ojo con el orden, y no es una contradicción con el apartado anterior.** Allá quedó anotado
> «diseño web › páginas web › desarrollo web»; acá sale páginas web primero. Son **dos formas de
> contar**, las dos correctas. La de aquel apartado es **solapada** —«diseño de páginas web» cuenta
> en las dos familias— y sobre 2026 devuelve diseño 47,5 % › páginas 39,2 % › desarrollo 23,0 %, con
> «sitios web» en 3,1 %: **reproduce exactamente lo que dice arriba**. La de esta tabla es
> **excluyente**, cada término en una sola familia, y suma 100 %.
>
> Para escribir copy conviene la solapada («¿qué palabras tiene que contener la página?»); para
> priorizar el titular, la excluyente («¿cómo se reparte el dinero?»). **La conclusión argentina no
> cambia con ninguna de las dos: «diseño» es imprescindible acá** — entre 33 % y 47 % según cómo se
> cuente, contra 13–23 % en Costa Rica.

### Lo que Nolõ tiene que decir distinto

| | Costa Rica | Argentina |
|---|---:|---:|
| nombrar el país | 42,7 % | **9,3 %** — casi nadie escribe «Argentina» |
| «diseño» | 13,4 % | **33,4 %** |
| «empresa» | 7,4 % | 2,2 % |
| «agencia» | 2,6 % | **7,0 %** |
| precio / cotización | 2,3 % | **6,6 %** |

**Tres decisiones, tres palabras:** acá el titular **no lleva el país**, la palabra con la que buscan
al proveedor es **«agencia»** —justo al revés que en Costa Rica, donde es «empresa»— y **«diseño» va
adelante**, no en segunda línea. Todo lo demás del plan es común: los seis lugares donde entra cada
palabra son los mismos porque el texto es el mismo.

Dato lateral sin acción: en Argentina buscan **precio y cotización tres veces más** que en Costa
Rica. No cambia el copy por ahora, pero es candidato a probar.

> **La ventana argentina es más chica.** "Búsqueda #2" acumula **75 días con impresiones contra 414**
> de "Búsqueda". Las tres diferencias se verificaron también sobre los **últimos doce meses** de las
> dos, que es la única ventana en que ambas corrieron a la vez, y se sostienen: geo 11,9 % contra
> 39,7 %, agencia 6,4 % contra 2,4 %, empresa 1,1 % contra 9,1 %.

**Dónde vive el detalle**: artefacto «Por qué Google baja la nota» —actualizado el 14 ago con la
tabla de familias, los seis lugares y un bloque propio de Nolõ— y la entrada gemela en
`docs/bitacora-ads-values-troas.md` del repo `LinkDesign-simple`.

## 14 ago 2026 (noche) — El copy argentino y los videos, EN PRODUCCIÓN

Publicado en `main` (merge `af7eb8a`), workflow de Azure en verde, verificado sobre `nolo.ar/web` y
`nolo.ar/software`. El detalle del método y de los números de Costa Rica está en la entrada gemela de
`docs/bitacora-ads-values-troas.md` del repo `LinkDesign-simple`; acá va lo que es propio de acá.

### Lo que Nolõ dice distinto, y por qué

| decisión | el dato que la sostiene |
|---|---|
| la bajada de `/web` dice **«Una agencia de diseño web…»** | «agencia» vale **7,0 %** del gasto argentino y «empresa» 2,2 % — al revés que en Costa Rica. Y **cuatro de los siete rivales medidos la llevan en el `h1`** |
| el titular de `/web` **no nombra el país** | sólo el **9,3 %** de las búsquedas argentinas dice «Argentina», contra 42,7 % de «Costa Rica» allá |
| el de `/software` **sí lo nombra** | ahí el geo pesa **46,2 %**: el mismo país, distinto peso según la página |
| **«diseño web» va adelante** de «desarrollo» | se lleva el **37,1 % de los clics**, la proporción más alta de todas las familias del mercado argentino |
| `/software` sube **«software a medida»** | vale **14,8 %** del gasto acá y **0,0 %** en Costa Rica |
| **no** se tocó la FAQ de tecnologías | «empresa de tecnología / informática» es 19,1 % del gasto costarricense y **0,0 %** del argentino |

Resultado medido sobre el HTML de producción:

| | antes | ahora |
|---|---:|---:|
| `/web` — peso temático | 0,48 % | **2,39 %** |
| `/web` — «páginas web» · «diseño web» | 4 · 2 | **16 · 13** |
| `/software` — peso temático | 2,52 % | **3,03 %** |
| `/software` — «desarrollo de software» · «Argentina» | 3 · 2 | **7 · 6** |

El mercado argentino, para no volver a medirlo: `/web` mediana **4,26 %** con rango 1,94–9,40 %;
`/software` mediana **2,54 %** con rango 2,29–3,36 %. Es **más denso y más disperso** que el
costarricense — grupowebargentina repite «páginas web» 56 veces en 926 palabras y rankea. Se apuntó
al piso del rango, no a la mediana.

Voseo respetado en todo lo tocado («Probá un software a medida», «No adaptás tu empresa al software»).

### Videos

Mismo cambio que el gemelo: precarga por proximidad en vez del prefetch de todos los clips.
`nolo.ar/web` pasa de bajar el portafolio entero al cargar a **9,32 MB en 4G móvil**, y los tres
clips que quedan son los del encabezado. El detalle de las mediciones está en la bitácora de
LinkDesign.

### Dónde quedó lo que se descartó

**«Agencia» quedó en 2 menciones y no en las ~7 de la mediana argentina.** Llegar ahí obliga a
autodefinirse como agencia en casi cada sección, y eso sí sería repetitivo. **El geo quedó en 6 y no
en las ~12 que usan los rivales**, porque para la nota de Ads manda lo que se busca y no lo que hace
el vecino. Las dos son decisiones, no olvidos: si alguna vez se quiere ir a los números del mercado,
está medido cuánto falta.

## 14 ago 2026 (cierre) — Botones táctiles a 44 px, sin tocar el diseño

Espejo del cambio del gemelo, mismos selectores: de los 27 elementos tocables por debajo de 44 px se
corrigieron **sólo los ocho que no se ven crecer** —los que no tienen fondo ni borde propio y tienen
hueco libre alrededor— con `padding` más `margin` negativo del mismo valor bajo
`@media (pointer: coarse)`. El área táctil crece, el elemento ocupa el mismo lugar y no hay fondo que
delate el padding.

`.brand` · `.ind-card__title-link` ×5 · `.cf-copy` · `.cf-legal__link`. En producción los tocables
chicos bajaron de 27 a **20**.

Quedaron fuera los chips del formulario, el selector ES/EN, los campos, el botón de envío y las
pestañas: todos tienen fondo y crecerían a la vista. Tampoco se tocó la separación entre chips,
aunque bastaría con el `gap`.

> **La regla:** no hay autorización para cambiar el aspecto visual. Un arreglo de accesibilidad o de
> SEO que altere el diseño se propone y se espera; no se aplica.

La verificación píxel a píxel y el análisis de los videos están en la entrada gemela de
`docs/bitacora-ads-values-troas.md` del repo `LinkDesign-simple`.

## 17 ago 2026 — Las cuatro acciones nuevas miden bien

Cierra el pendiente de 24–48 h del 13 de agosto: verificar que las acciones separadas por canal
registran, porque **un label mal copiado falla en silencio** —la acción queda en cero para siempre y
el informe se ve normal—.

### La ventana real es de dos días hábiles, no de cuatro

El deploy fue el **13 ago a las 19:34** (`a7a6b57`) y las campañas argentinas corren **L-V 6-15**.
Todo el tráfico pagado del 13 ocurrió con el código viejo y el fin de semana están apagadas: quedan
**viernes 14 y lunes 17**.

### Los labels de producción contra los del servidor: coinciden los cinco

Es la verificación que cierra el asunto, porque es determinista y **no depende de que haya volumen**.
Se bajó el bundle de producción `nolo.ar/main-NMV7BHXH.js` y se cruzó contra el
`conversion_action.tag_snippets` que devuelve la API:

- **Los 5 labels nuevos coinciden byte a byte.**
- **El viejo `-7YECOqL7b8c…` (Contacto Argentina) ya no aparece**: cero coincidencias en el bundle.
  Dejó de acumular como se planeó, y sigue ENABLED conservando su histórico.

**El método es reutilizable para cualquier cambio de etiquetas**: no hay que esperar a que alguien
convierta para saber si el label está bien. Responde la pregunta el mismo día.

### Dos ya registraron, y con el value correcto

| acción | primera conversión | campaña | value | comprobación |
|---|---|---|---:|---|
| Contacto Correo Argentina | 17 ago | Software #2 | 40,00 | 50 × 0,80 ✔ |
| Contacto WhatsApp Argentina | 14 ago | Software #2 | 8,00 | 10 × 0,80 ✔ |

Que lleguen **modulados** prueba algo que el pendiente no pedía: no sólo viaja el label, también el
`value` del evento. Si el value no llegara, se vería el `default_value` de 1,0 con que se crearon.

### Las que quedaron en cero: no hubo oportunidad, y está medido

Con la tasa base de contactos por clic del período anterior (24 jul – 12 ago) aplicada a los clics
reales del 14 y el 17:

| campaña | clics 14+17 | contactos esperados | observados |
|---|---:|---:|---:|
| Búsqueda #2 | 26 | **2,93** | **0** |
| Software #2 | 11 | 1,50 | 2 |

**El punto con tensión es "Búsqueda #2"**: 26 clics —la campaña de más tráfico— y ningún contacto,
cuando se esperaban casi tres (P ≈ 5 %). No se puede concluir nada con dos días, y su `Scroll
Argentina (2)` registró 17 veces en la misma ventana, así que las etiquetas de esa campaña llegan
bien. Quedó anotado para el 4 de septiembre.

> **Lo que esta verificación no vio.** Que una acción registre no significa que puje, y justo eso
> falló acá: las cuatro estaban fuera del objetivo de puja. Se descubrió al día siguiente — ver la
> entrada del 18 de agosto. La trampa de método está en la bitácora de LinkDesign, porque aplica a
> cualquier cuenta.

`Contacto Reunión Argentina` y `Contacto Formulario Argentina` siguieron sin una sola conversión, que
son justamente las de mayor value. Su label está verificado contra el servidor; falta oportunidad.

> Esas dos son las que marcan **«Configuración incorrecta»** en la interfaz. No están rotas: ese
> estado significa literalmente `Conversion has never received data` y se limpia solo con el primer
> evento. Puede tardar meses sin que signifique nada, porque dependen de que alguien las use.

## 18 ago 2026 — El aislamiento sí existía, y por eso las cuatro nuevas no pujaban

Apareció revisando otra cosa en Costa Rica —unas acciones que marcaban «Configuración incorrecta» en
la interfaz, que resultaron ser inofensivas— y terminó corrigiendo lo que este documento dio por
verificado el 13 de agosto.

**Las campañas argentinas llevaban tres días hábiles pujando sólo por el scroll.** «Búsqueda #2» y
«Software #2» usan el objetivo personalizado «Contacto Argentina» (`6458009700`) — el que se planeó
en junio justamente para que los datos de Costa Rica no contaminaran la optimización argentina. Ese
objetivo contenía **dos acciones**: `Scroll Argentina (2)` y la vieja `Contacto Argentina`. Las
cuatro nuevas del 13 de agosto nunca se agregaron, y la vieja dejó de dispararse ese mismo día — su
última conversión es del **12 de agosto**.

Días afectados: viernes 14, lunes 17 y martes 18 (el deploy fue el 13 a las 19:34 y las campañas
corren L-V 6-15 hora argentina).

**La prueba no depende de leer la interfaz**: `metrics.all_conversions` es todo lo que entra;
`metrics.conversions` es lo que alimenta Smart Bidding. Si una acción tiene la primera en positivo y
la segunda en cero, está fuera de la puja.

| campaña | acción | recibidas | cuentan para pujar |
|---|---|---:|---:|
| Software #2 | Contacto Correo Argentina | 1 (USD 40) | **0** |
| Software #2 | Contacto WhatsApp Argentina | 2 (USD 16) | **0** |
| Software #2 | Scroll Argentina (2) | 9 | 9 |
| Búsqueda #2 | Scroll Argentina (2) | 24 | 24 |

**En plata**, del 13 al 18 de agosto: las dos campañas argentinas gastaron **USD 199,12** y generaron
**USD 89 de valor**, pero el algoritmo vio **USD 33**. El **63 % del valor argentino era invisible**
para la puja. Argentina gastó más que Costa Rica (145,41) mientras le escondía dos tercios de su
resultado.

Le da además otra lectura al pendiente del 4 de septiembre sobre «Búsqueda #2»: lleva **45 clics sin
un solo contacto** desde el 13. No es que la etiqueta falle — la campaña dejó de tener por qué
buscarlos.

### Lo aplicado

Se agregaron las cuatro acciones nuevas al objetivo `6458009700`, que queda con seis: `Scroll
Argentina (2)`, `Contacto Argentina` (vieja) y `Contacto WhatsApp/Correo/Reunión/Formulario
Argentina`. Por API, validado con `validate_only` antes de escribir y releído del servidor después.
Se dejaron las dos que ya estaban: la vieja no molesta y conserva el histórico; el scroll se mantiene
por paridad con Costa Rica, donde también está dentro del objetivo de puja.

**Las campañas argentinas vuelven a período de aprendizaje** con una señal distinta. Los primeros
días no se leen: la comparación honesta arranca la semana del 24 de agosto.

> **La regla que queda, y es permanente:** toda acción de conversión nueva para Argentina hay que
> **agregarla al objetivo `6458009700` a mano**. Crear la acción y verificar su label prueba que
> *mide*, no que *puja*. Son dos cosas distintas y se verifican en tablas distintas.

La verificación equivocada que originó todo esto quedó marcada en su lugar: la tabla de la Vía 3 del
17 de agosto en `docs/bitacora-ads-values-troas.md` de `LinkDesign-simple`, donde también está la
trampa de método, que aplica a cualquier cuenta. **El caso argentino se documenta acá y sólo acá.**

## Pendientes

- [x] ~~**El copy de `/software` y de `/web`** para que las páginas usen el lenguaje de la búsqueda.~~
      **Hecho y publicado el 14 ago 2026** (merge `af7eb8a`); ver la entrada de esa noche. Era lo
      único que tocaba la nota BELOW_AVERAGE de las cuatro campañas a la vez.
- [ ] **~4 sep 2026 — Leer la nota de página de destino**, que es lo único que ese cambio toca y por
      lo tanto se puede leer limpia. El efecto en *leads* no: ahí se superponen las conversiones
      separadas del 13 ago, las extensiones del 14 y el copy.
- [x] ~~**Recodificar los clips del portafolio.**~~ **Descartado el 14 ago con medición**: están a
      309–362 kbps en 720×384 (700–960 KB), o sea al límite; bajar más se ve. El «1 a 2,9 MB» que yo
      había anotado era de los clips del **encabezado**, no del portafolio. Detalle y correcciones en
      la bitácora de `LinkDesign-simple`.
- [ ] **Opcional, sin hacer: subir el `rootMargin` de la precarga de 1,5 a ~3,5 pantallas.** Con
      clips de 700–960 KB son 3,5–4,8 s en 3G, así que alcanzaría para que lleguen a tiempo también
      ahí. Es una línea. No afecta a quien no baja: el portafolio está a ocho pantallas del inicio.
- [ ] **Decisión de Robert: variante móvil de los clips del encabezado.** Son los únicos que se bajan
      siempre (6,4 MB) y no tienen versión chica; pasarían a ~2,3 MB. No están mal comprimidos —por
      bits/píxel valen lo mismo que los del portafolio—, pesan porque tienen 2,8× más píxeles. En
      móvil se pintan a 1068 px de ancho y el archivo trae 1280. Se propuso decidirlo mirando una
      comparación lado a lado, no por cálculo.
- [ ] **4 sep 2026 — la nota de página de destino.** Es la revisión nueva y la razón por la que la
      cita se movió del 3 al 4: son tres semanas exactas desde que el copy salió a producción, que es
      lo que esa nota necesita para recalcularse. **Línea base del 14 ago, contra la que hay que
      comparar:**

      | campaña | keyword | QS | página |
      |---|---|---:|---|
      | Búsqueda (CR) | desarrollo de sitios web | 5 | BELOW_AVERAGE |
      | Software (CR) | empresa de desarrollo de software | 3 | BELOW_AVERAGE |
      | **Búsqueda #2 (AR)** | desarrollo de sitios web | **7** | BELOW_AVERAGE |
      | **Software #2 (AR)** | empresa de desarrollo de software | **5** | BELOW_AVERAGE |

      > Sale de `ad_group_criterion.quality_info.post_click_quality_score`, se consulta **cualquier
      > día** y el histórico admite `segments.week`. Filtrar por `negative = FALSE` **y** mirar el
      > estado del grupo de anuncios: hay keywords `ENABLED` en grupos `REMOVED` que ensucian.
      >
      > **Que una sola campaña pase a «promedio» no prueba nada**: la nota es relativa y con una
      > keyword por campaña es muestra de tamaño uno. La señal es que varias se muevan igual o que
      > una se sostenga varias semanas. Las argentinas son las que más rápido juntan masa
      > (Búsqueda #2 2.934 impresiones/mes, Software #2 1.602).
- [ ] **~4 sep 2026** — Leer el efecto del presupuesto de 20/día en **"Búsqueda #2"**, medido en
      **leads serios por 100 clics** (no en totales, que suben por el volumen). Si escala, evaluar
      24; si el ratio se cae, el techo útil estaba por debajo de 20. Por encima de 30 no hay base.
- [ ] **~4 sep 2026** — Revisar **"Software #2"** recién entonces, con las acciones separadas dando
      canal real en vez de inferencia por value unitario. El caso para subirla mejora solo **si el
      CPC baja hacia la puja que sugiere el Planner (0,91–3,72 contra 4,15–6,23 actuales)**; si sigue
      en 4+ con QS 5, la palanca es la página de destino y no el presupuesto. No mover las dos
      campañas argentinas a la vez: sería imposible atribuir el efecto de cualquiera.
      > **La ventana ya no es limpia, y fue deliberado.** El 14 ago se le sumaron dos títulos nuevos
      > y seis extensiones. Así que el 3 de septiembre "Software #2" mezcla tres cosas: acciones
      > separadas (13 ago), títulos y extensiones (14 ago), y lo que pase con el QS. **El CPC y el
      > CTR sí son legibles** —responden al cambio del 14 ago casi de inmediato— y son justamente lo
      > que ese cambio buscaba mover. Lo que queda contaminado es leer el *volumen* de leads serios
      > como efecto de una sola causa. "Búsqueda #2" sigue con su ventana limpia.
- [ ] **4 sep 2026 — o después, nunca antes** ~~(27 ago → 3 sep)~~ — Recalibrar los values con datos
      propios por canal. Hoy la escala (WhatsApp 10 contra formulario 30–60) es un supuesto sin
      evidencia; el CRM de LinkDesign sugiere que la brecha real es **mayor**.
      > **Se movió del 27 de agosto al 3 de septiembre el 13 ago 2026, y del 3 al 4 el 14 ago.**
      > Recalibrar a mitad de la ventana de medición habría dejado el análisis con **dos escalas de
      > valor mezcladas** y el aprendizaje de Smart Bidding reiniciado por la mitad — el mismo error
      > que volvió irresoluble lo del 23 de julio, cuando el recorte de presupuesto y el ×2 de values
      > cayeron el mismo día. La ventana 13 ago – 4 sep queda con **una sola escala**. Si ese día se
      > decide recalibrar, el cambio abre su propia ventana de medición.
- [ ] **24–48 h** — Verificar que las cuatro acciones nuevas registran conversiones. Si una queda en
      cero mientras las otras se mueven, el label quedó mal copiado: es el modo de fallo silencioso
      de este cambio.
- [ ] **No tocar pujas por al menos dos semanas.** Separar las acciones reinicia el aprendizaje de
      Smart Bidding; encimar un tROAS haría imposible atribuir el efecto de nada.
- [ ] **~Sept 2026** — Primera lectura con sentido de Search Console de Nolõ, cuando haya varias
      semanas acumuladas. Repetir el análisis de canibalización que se hizo para LinkDesign.
- [x] ~~Aislamiento de la optimización argentina: ver arriba el estado real verificado el 13 ago.
      Decidir si se le asigna a "Búsqueda #2" y "Software #2" un `campaign_conversion_goal` propio
      con las acciones de Nolõ~~ — **ya estaba cumplido desde junio**, y el 13 de agosto se leyó al
      revés. Las dos campañas usan el objetivo personalizado «Contacto Argentina» (`6458009700`),
      que desde el **18 ago 2026** contiene las seis acciones argentinas. Ver esa entrada.
- [ ] **Sigue abierto: si "Scroll Argentina (2)" debe seguir pujando.** Ahora compite, dentro del
      mismo objetivo, contra contactos de value 8 a 54 — que es exactamente el escenario para el que
      se hizo la escala de values. Va al **4 de septiembre**, no antes.
- [x] ~~**13 ago 2026** — Revisión conjunta con LinkDesign; primer análisis de "Búsqueda #2".~~ Hecho.
- [x] ~~**13 ago 2026** — Separar las acciones de conversión por canal.~~ Hecho, ver arriba.

## Nota operativa

La zona horaria de la cuenta es **Costa Rica (UTC-6)** y Argentina va +3h: al cargar horarios de
campaña hay que restar 3 horas. Los sitelinks admiten como máxima granularidad el grupo de anuncios,
no el anuncio.
