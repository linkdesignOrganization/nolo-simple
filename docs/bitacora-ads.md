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
| 17 ago 2026 | Verificado que las cuatro acciones nuevas **registran** (labels del bundle de producción contra los del servidor, byte a byte; dos ya con conversiones moduladas). |
| 18 ago 2026 | **Las cuatro acciones nuevas no pujaban**: faltaban en el objetivo personalizado `6458009700`. Agregadas por API; tres días hábiles con el 63 % del valor argentino invisible para Smart Bidding. |
| 7 sep 2026 | **Revisión del 4 de septiembre.** "Búsqueda #2" con 20/día sostuvo la tasa de leads serios (3,2 → 4,2 por 100 clics, 61 → 53 USD por serio); la nota de página no se movió; "Software #2" abarató el clic porque la puja se retrajo (cero serios, QS 5 → 4). Estadísticas de subasta leídas en la interfaz. **Ejecutado por API**: anuncio de "Software #2" (cinco títulos, dos descripciones, ruta visible), sitelink a voseo, dos negativas; y **presupuesto de "Búsqueda #2" 20 → 24 USD/día**. Values, scroll y pujas sin cambios. Fechas en Calendar: 8 sep, lunes 14/21/28 sep y 5 oct. |

**Advertencia para cualquier comparación**: el historial anterior al 19 jul **no es comparable** en
comportamiento de puja (era otro régimen de optimización). De ese período solo sirven las métricas de
mercado: CPCs, volumen, términos de búsqueda, Quality Score.

## Estado actual (30 jul 2026)

Campañas activas, ambas con Maximizar valor de conversión:

| Campaña | Presupuesto |
|---|---|
| Búsqueda #2 | ~~USD 15,00/día~~ → ~~USD 20,00/día desde el 13 ago 2026~~ → **USD 24,00/día desde el 7 sep 2026** (entradas del 13 ago y del 7 sep) |
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

## 7 sep 2026 — La revisión del 4 de septiembre (Argentina): el presupuesto compró leads serios, la nota no se movió, y "Software #2" abarató el clic por la razón equivocada

Datos del **14 ago – 4 sep** (16 días hábiles, tres semanas exactas desde el copy) y, como ventana
limpia, **19 ago – 4 sep** (13 días hábiles: desde que las cuatro acciones nuevas pujan). El lunes
7 sep queda fuera. Costa Rica se revisó el mismo día en su propia bitácora
(`docs/bitacora-ads-values-troas.md` de `LinkDesign-simple`, entrada del 7 sep); de allá se tomó
sólo la fila de la nota de página, como control.

Fuentes: Ads por API, el CRM leído directo de Cosmos (colecciones `webleads`, `leads` y
`sitesessions`) y Search Console de `nolo.ar`, que ya acumula un mes.

### Verificaciones previas, todas limpias

- **Nada más cambió desde el 13 ago.** `change_event` de la cuenta, excluidas las negativas diarias
  de grupo: presupuesto de "Búsqueda #2" (13 ago 21:54), títulos de las dos campañas y extensiones
  y dos negativas de campaña de "Software #2" (14 ago). Después del 14 ago, sólo negativas.
  El objetivo `6458009700` conserva las seis acciones argentinas. *El cambio del objetivo del 18 ago
  no aparece en `change_event`: ese recurso no queda registrado ahí.*
- **Las cuatro acciones pujan**: `conversions` = `all_conversions` en cada una, 19 ago – 4 sep.
- **Rezago cero**: por fecha de clic y por fecha de conversión coinciden acción por acción.
- **Sin período de aprendizaje**: las dos campañas están `LIMITED / BUDGET_CONSTRAINED`, sin
  `LEARNING` entre los motivos.

> **Trampa de método, para la próxima.** `change_event` obliga a un `LIMIT` y con 300 filas se
> agotó el 17 ago: las ~17 negativas diarias por campaña inundan el registro. Hay que filtrar
> `change_event.change_resource_type != 'AD_GROUP_CRITERION'` para ver el resto. Y admite 30 días
> exactos: el 7 sep ya rechazó el 8 ago. Además `campaign.start_date` no existe en v24.

### 1. "Búsqueda #2": el presupuesto de 20 compró leads serios

La pregunta era **leads serios por cada 100 clics** (correo, reunión o formulario; no WhatsApp),
porque el volumen sube solo con el dinero y la tasa no. Las ventanas anteriores al 13 ago salen de
la acción agrupada con las cotas exactas del 13 ago; desde el 19 ago el canal viene dado.

| ventana | háb. | clics | costo | CPC | CTR | IS | perd. presup. | perd. rank | WhatsApp | correo | reunión | form. | **serios** | **serios/100** | **USD/serio** | scroll | valor | ratio |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1–22 jul | 16 | 119 | 273,28 | 2,30 | 6,0 % | 44,3 % | 42,5 % | 13,2 % | ~3 | | | | 3 | 2,5 | 91 | 80 | 150,5 | 0,55 |
| 24 jul – 12 ago (**PRE**, 15/día) | 14 | 142 | 273,37 | 1,93 | 7,3 % | 40,1 % | 37,3 % | 22,6 % | ~11,5 | | | | 4–5 | 3,2 | 61 | 84 | 386,9 | 1,42 |
| 13–18 ago (transición, sin puja) | 4 | 45 | 111,94 | 2,49 | 7,2 % | 53,4 % | 14,1 % | 32,4 % | 0 | 0 | 0 | 0 | 0 | 0,0 | — | 24 | 24,0 | 0,21 |
| **19 ago – 4 sep (POST limpio, 20/día)** | 13 | 165 | 374,13 | 2,27 | 7,0 % | 44,3 % | **29,3 %** | 26,4 % | 15 | 2 | **5** | 0 | **7** | **4,2** | **53** | 77 | 537,9 | **1,44** |
| 14 ago – 4 sep (POST total) | 16 | 200 | 470,58 | 2,35 | 7,2 % | 45,7 % | 28,1 % | 26,2 % | 15 | 2 | 5 | 0 | 7 | 3,5 | 67 | 97 | 557,9 | 1,19 |

**La tasa no se cayó: 3,2 → 4,2 serios por 100 clics** (3,5 contando la transición). Con siete
leads serios el intervalo es ancho (1,7–8,7) y la prueba exacta da p ≈ 0,55–0,78: **no prueba que
subió, prueba que no se cayó**, que era la condición del pendiente. Todo lo demás acompaña:

- **USD por lead serio 61 → 53**, y el ratio se sostiene en **1,44**, único > 1 de la cuenta.
- **Sigue tocando el techo**: 28,78 USD por día activo, exactamente el equivalente L–V de 20/día
  (28); **12 de 13 días** superan el nominal en más de 10 %. La pérdida por presupuesto bajó de
  37,3 % a 29,3 % pero sigue siendo el freno principal.
- **El CPC subió 18 %** (1,93 → 2,27) y la cuota de impresiones en la parte superior pasó de 24,0 %
  a 29,7 %: con más dinero compra subastas que antes perdía. Es lo esperable y no un problema.
- **WhatsApp por 100 clics estable** (8,1 → 9,1). Los serios cambiaron de composición: en el PRE
  eran inferidos; ahora son **5 clics de «Agendar reunión» y 2 de «copiar correo»**, formulario 0.

**La correlación gasto ↔ serios ya no sirve como argumento.** Pasó de +0,71 (hasta el 12 ago) a
+0,31 con 12 semanas, porque las semanas de más gasto (10 y 17 ago) cayeron en la transición sin
puja. Se lee en tasa por clic, como se había anticipado el 13 ago.

**Cierra el pendiente del 17–18 ago** («45 clics sin contacto»): era la puja, no la etiqueta. Desde
el 19 ago la campaña produjo **22 contactos en 13 días hábiles**.

**Veredicto: entra en la rama «si escala, evaluar 24».** Recomendación de los datos: **subir a
24 USD/día** (+20 %, un paso normal para Smart Bidding). Tope mensual 730, gasto esperado ~649
(~30 por día hábil). Con la tasa actual y CPC ~2,4, son ~45 clics más al mes, o sea **~2 leads
serios más al mes a ~55 USD**. El presupuesto implícito para capturar todo lo que hoy se pierde es
`20 × (44,3 + 29,3) / 44,3 ≈ 33`: 24 es el paso, no el destino, y por encima de 30 sigue sin haber
base. Condición: **no tocar "Software #2" a la vez.** Decisión de Robert; no se ejecutó.

#### Adenda del mismo día: las estadísticas de subasta de "Búsqueda #2" confirman que acá la puja subió

Mismas dos ventanas que en "Software #2", leídas en la interfaz (no salen por API). Nuestra fila:

| nosotros | PRE 24 jul – 12 ago | POST 19 ago – 4 sep |
|---|---:|---:|
| cuota de impresiones | 39,3 % | **44,3 %** |
| parte superior de la página | 59,4 % | **67,1 %** |
| primera posición | 16,6 % | **20,7 %** |

Las tres subieron a la vez. Eso sólo pasa cuando se ofrece más: coincide con el CPC +18 % y con el
valor por clic 2,72 → 3,26 de la segunda adenda de §2. Es la imagen invertida de "Software #2",
donde presencia igual y primera posición ocho puntos abajo. La cuota de la API (40,1 → 44,3 %)
coincide con la de la interfaz.

Los rivales, con «arriba nuestro» = cuántas veces se muestran por encima cuando coincidimos:

| dominio | cuota PRE → POST | arriba nuestro PRE → POST | 1ª posición PRE → POST |
|---|---:|---:|---:|
| **rednodo.com** | 23,8 → **31,0 %** | 76,9 → 72,4 % | 50,9 → 45,4 % |
| romero.ar | 12,3 → 16,0 % | 22,4 → 22,8 % | 5,8 → 6,8 % |
| hostinger.com | 11,4 → 14,6 % | 50,5 → 53,2 % | 13,5 → 12,9 % |
| manadigital.com.ar | 13,7 → 13,2 % | 18,2 → 26,2 % | 9,9 → 10,1 % |
| lader.com.ar | <10 → 11,8 % | 64,4 → **48,0 %** | 38,0 → 23,2 % |
| google.com | <10 → <10 % | 88,6 → 75,2 % | 56,3 → 54,2 % |
| base44.com | 10,2 → <10 % | 37,5 → 38,5 % | 6,8 → 10,4 % |

Tres lecturas:

1. **El mercado también se llenó acá** (rednodo +7 puntos, romero +4, hostinger +3, entra
   nicobilinkis con 10 %), pero **nosotros subimos más que ellos**. Contra el líder, rednodo, pasamos
   de estar debajo el 77 % de las veces al 72 %, y contra lader del 64 % al 48 %. En "Software #2"
   la misma columna empeoró con casi todos. La diferencia entre las dos campañas no es el mercado:
   es lo que el algoritmo vio que valía cada clic.
2. **Rednodo es el rival que importa**: 31 % de cuota, arriba nuestro 7 de cada 10 veces que
   coincidimos, 45 % de primeras posiciones. Nuestras primeras posiciones (20,7 %) salen sobre todo
   de las subastas donde rednodo no está. Con QS 6 y CPC 2,27 es un lugar razonable; pelearle la
   primera posición sería pagar su precio.
3. **Los constructores de sitios están en la subasta**: hostinger, squarespace, base44, google.com y
   antes wix. Es la intención «hacerlo yo mismo» dentro de la familia «páginas web», y explica los
   clics carísimos aislados de §6 («creadores de sitios web» 24,36 por un clic): ahí pujan las
   plataformas. Anotado, sin negativa: «creadores de páginas web» también trajo un WhatsApp.

**No cambia nada de lo decidido**: refuerza la recomendación de 20 → 24, porque la pérdida por
presupuesto (29 %) sigue siendo el freno y el algoritmo demostró que con más dinero compra
posición, no sólo volumen.

### 2. "Software #2": el clic bajó a 3,39, pero porque la puja se retrajo, no porque la página mejorara

| ventana | háb. | clics | costo | CPC | CTR | IS | perd. presup. | perd. rank | WhatsApp | correo | reunión | form. | serios | serios/100 | USD/serio | scroll | valor | ratio |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 1–22 jul | 16 | 38 | 274,94 | 7,24 | 4,6 % | 54,4 % | 40,9 % | 4,7 % | ~3 | | | | 4 | 10,5 | 69 | 21 | 121,0 | 0,44 |
| 24 jul – 12 ago (**PRE**) | 14 | 66 | 285,24 | 4,32 | 5,4 % | 52,7 % | 33,8 % | 13,5 % | ~6 | | | | 3 | 4,5 | 95 | 29 | 213,0 | 0,75 |
| 13–18 ago (transición) | 4 | 21 | 87,18 | 4,15 | 6,5 % | 55,0 % | 27,8 % | 17,1 % | 2 | 1 | 0 | 0 | 1 | 4,8 | 87 | 9 | 65,0 | 0,75 |
| **19 ago – 4 sep (POST limpio)** | 13 | 74 | 250,68 | **3,39** | 5,8 % | 55,1 % | **19,2 %** | **25,7 %** | 6 | 0 | 0 | 0 | **0** | **0,0** | — | 33 | 81,0 | 0,32 |
| 14 ago – 4 sep (POST total) | 16 | 89 | 315,82 | 3,55 | 5,8 % | 55,5 % | 19,2 % | 25,3 % | 8 | 1 | 0 | 0 | 1 | 1,1 | 316 | 40 | 144,0 | 0,46 |

El criterio decía: «el caso para subirla mejora sólo si el CPC baja hacia 0,91–3,72; si sigue en 4+
con QS 5, la palanca es la página». **El número se cumple**: CPC 4,32 → 3,39, y por semanas
5,69 · 4,69 · 3,39 · 4,82 · 3,89 · 3,52 · **3,05**; la última entra en el rango del Planner.
**El mecanismo no.** El clic no se abarató por calidad, porque el QS **bajó de 5 a 4** (ver §3).
Se abarató porque **Smart Bidding pujó menos**:

- pérdida por **ranking 13,5 % → 25,7 %** y pérdida por presupuesto 33,8 % → 19,2 %: la campaña
  pasó de perder por dinero a perder por puja;
- primera posición 19,7 % → 16,1 %;
- gastó **19,28 por día activo contra 21 de equivalente**: por primera vez **no toca el techo**.

El algoritmo ve menos valor que antes (6 WhatsApp de 8 contactos y 33 scrolls; **cero serios en la
ventana limpia**, contra 3 en el PRE, p ≈ 0,10) y responde comprando clics más baratos en
posiciones más bajas. El CPC bajó por la razón equivocada: **es la campaña apagándose sola, no
mejorando.**

Lo que sí hicieron los títulos y extensiones del 14 ago: CTR 5,4 % → 5,8 %, leve. Los dos títulos
nuevos son los más servidos y rinden a nivel de campaña o mejor: «Desarrollo de Software» 876
impresiones, CTR 6,4 %; «Empresa de Software a Medida» 600, 7,0 %. El flojo entre los muy servidos
es **«Empresa Argentina de Software»** (623 impresiones, **3,4 %**). El móvil sigue flojo: CTR 4,2 %
contra 6,5 % en escritorio, CPC 3,86 contra 3,47 (al revés que en Costa Rica).

**Veredicto: no subir el presupuesto, ni bajarlo, ni tocar la campaña.** Es la rama «la palanca es
la página». Lo que hay que vigilar el 5 oct es la primera posición y los serios: si el abs-top sigue
cayendo y los serios siguen en cero, la campaña se está retirando de las subastas que valen.

#### Adenda del mismo día: no es falta de mercado, es la primera posición

Robert preguntó por qué "Software #2" gasta menos. Se midió el tamaño del mercado por semana como
`impresiones / cuota de impresiones` (subastas en las que podíamos aparecer) y se leyó
«Estadísticas de subastas» en la interfaz, porque **esas métricas no salen por API** con el token
Basic (`authorization_error=26`).

**El mercado creció.** Subastas disponibles por semana: 500 · 758 (jul) → 875 · 957 · 715 · 1.008 ·
803 (ago–sep). La semana del 31 ago aparecimos en el **67,5 %** de ellas, la cuota más alta desde
junio, y perdimos sólo el 1,6 % por presupuesto. Lo que cambió es la columna de al lado: la pérdida
**por ranking** pasó de 0–6 % en julio a **23–31 %** desde agosto. La campaña dejó de estar frenada
por dinero y pasó a estar frenada por su propia oferta.

**Estadísticas de subastas, 24 jul – 12 ago contra 19 ago – 4 sep** (interfaz, campaña
"Software #2"):

| nosotros | PRE | POST |
|---|---:|---:|
| cuota de impresiones | 52,2 % | 54,1 % |
| parte superior de la página | 72,0 % | 70,2 % |
| **primera posición** | **36,3 %** | **28,2 %** |

Presencia igual, parte superior igual, **primera posición ocho puntos abajo**. Y los rivales, con
«arriba nuestro» = cuántas veces se muestran por encima cuando coincidimos en la subasta:

| dominio | cuota PRE → POST | arriba nuestro PRE → POST | 1ª posición PRE → POST |
|---|---:|---:|---:|
| intway.com.ar | 14,3 → **22,9 %** | 47,5 → **63,1 %** | 24,1 → 30,8 % |
| exceser.com.ar | <10 → **18,2 %** | 16,7 → **49,5 %** | 3,9 → **23,5 %** |
| genit.com.ar | 20,8 → 16,9 % | 35,5 → 55,0 % | 15,1 → 21,1 % |
| propositiva.com.ar | 15,4 → 16,8 % | 10,7 → 21,0 % | 2,3 → 9,9 % |
| neuralsoft.com | 13,9 → 15,7 % | 43,3 → 49,0 % | 35,6 → 32,0 % |
| 3pbiconsulting.com.ar | nuevo → 12,3 % | — → 33,8 % | — → 22,2 % |
| medve.com.ar | 16,7 → 10,1 % | 16,2 → 33,0 % | 8,0 → 16,4 % |
| ingenia.la | <10 → <10 % | 34,1 → 61,1 % | 12,3 → 31,3 % |

Dos escalaron (**exceser** e **intway**), entró uno fuerte (**3pbi**) y aparecen ocho dominios
nuevos en la lista (manadigital, seidor, axiomait, hitocean, axoft, oestedigitalsrl, crombie).
Pero «arriba nuestro» subió también para los que **no** crecieron (genit, propositiva, medve): eso
no es que ellos pujen más, es que **nosotros pujamos menos en relación a ellos**. Las dos cosas a
la vez: la primera posición se encareció justo cuando nuestro algoritmo tenía menos razones para
pagarla (valor visto por clic 3,2 → 1,1; QS 5 → 4). La consecuencia mecánica es la que se ve en el
gasto: seguimos en la página, más veces en segunda o tercera, que cuestan menos → CPC 4,32 → 3,39 →
menos gasto con más impresiones. La columna «ranking superior» (~50 % con todos, en los dos
períodos) no dice nada: cuenta sobre todo las veces que nosotros aparecemos y ellos no.

*Dato lateral: entre los rivales hay fabricantes de ERP (neuralsoft, axoft) y consultoras grandes
(seidor, 3pbi), no sólo estudios; y en el PRE pujaba `cursor.com`, el editor de código, por estos
términos en Argentina.*

**Qué cambia en la decisión: nada hoy, y una palanca anotada.** El presupuesto sigue sin ser el
freno. La única forma de volver a la primera posición cueste lo que cueste es una estrategia de
cuota de impresiones objetivo, que con QS 4 pagaría 5–6 USD por clic: **no se recomienda**. La
palanca barata es recuperar la relevancia del anuncio (Promedio desde el 14 ago) cambiando los
títulos flojos, «Empresa Argentina de Software» (623 impresiones, CTR 3,4 %), «Código 100% Propio»
(2,4 %) y «Desarrollo Backend Complejo» (3,5 %), por títulos que lleven la keyword; abarata la
primera posición para nosotros sin tocar la puja. Decisión de Robert; para el 5 oct o antes.
Indicador semanal a seguir hasta entonces: **pérdida por ranking y primera posición** de
"Software #2".

#### Segunda adenda: ¿tuvo que ver que «ahora el WhatsApp vale menos»?

Pregunta de Robert. **En sentido literal, no**: un WhatsApp vale hoy lo mismo que en julio, base 10
modulada por sesión a 8 o 9. Valores unitarios observados en celdas de una sola conversión:
"Búsqueda #2" PRE `8,00 ×9 · 9,00 ×2`, POST `8,00 ×11 · 9,00 ×2`; "Software #2" PRE
`8,00 ×5 · 9,00 ×1`, POST `8,00 ×6`. Y el código no tocó los values desde el ×2 del 24 jul
(`e860ca1`); el 13 ago (`a7a6b57`) sólo separó las acciones.

**En otro sentido, sí, y es el sentido que importa.** Hasta el 13 ago todos los contactos entraban
por una sola acción y la puja aprendía «un contacto de esta campaña vale ~20» (18,9 en "Búsqueda #2",
20,5 en "Software #2"): un WhatsApp de 8 y una reunión de 54 se promediaban. Desde la separación un
WhatsApp es un WhatsApp de 8. Donde siguieron llegando serios, el valor medio por contacto subió;
donde sólo llegaron WhatsApp, se desplomó. Es exactamente el efecto que se buscaba con la
separación, y las cuatro campañas se movieron según su valor por clic:

| campaña | valor / clic PRE → POST | valor / contacto PRE → POST | 1ª posición PRE → POST | CPC PRE → POST |
|---|---:|---:|---:|---:|
| Búsqueda #2 (AR) | 2,72 → **3,26** | 18,9 → 21,0 | 10,7 → **11,5 %** | 1,93 → 2,27 |
| Búsqueda (CR) | 1,61 → **1,68** | 8,3 → 16,2 | 17,7 → **21,5 %** | 2,74 → 2,45 |
| Software #2 (AR) | 3,23 → **1,09** | 20,5 → **8,0** | 19,7 → **16,1 %** | 4,32 → 3,39 |
| Software (CR) | 1,71 → **0,96** | 33,7 → 8,8 | 17,8 → **13,2 %** | 4,12 → 3,74 |

Donde el valor por clic subió, la puja subió y ganó primera posición; donde cayó, se retiró. **Las
dos de software cayeron en los dos países**: no es un accidente argentino, es lo que pasa cuando una
campaña de software sólo trae WhatsApp y scrolls (que en "Software #2" son ya el 41 % del valor que
ve la puja, contra 14 % en "Búsqueda #2").

**Lo que deja en claro.** La separación funciona como se diseñó, pero tiene un costo que no se había
anticipado del todo: cuando una campaña deja de traer serios, la puja deja de pelear posición, y
eso reduce la chance de que lleguen. **No se arregla subiendo el value del WhatsApp**: sería
mentirle al algoritmo, y en Argentina WhatsApp lleva 0 ganados de 6 resueltos. Las salidas son las
de la primera adenda (títulos y página) o aceptar que "Software #2" sea una campaña de segunda o
tercera posición mientras no traiga serios. El peso del scroll en su valor va a la revisión del
5 oct, como ya estaba.

### 3. La nota de página de destino: sin cambio, y el punto de QS perdido es de los anuncios

| campaña | keyword | QS 14 ago | QS 7 sep | anuncio | CTR esp. | **página** |
|---|---|---:|---:|---|---|---|
| **Búsqueda #2** | desarrollo de sitios web | 7 | **6** | Promedio (era Por encima) | Por encima | **Por debajo** |
| **Software #2** | empresa de desarrollo de software | 5 | **4** | Promedio (era Por encima) | Promedio | **Por debajo** |

`metrics.historical_landing_page_quality_score` por semana: **BELOW_AVERAGE todas las semanas desde
el 13 jul, en las dos**, sin excepción. "Búsqueda #2" juntó ~3.600 impresiones desde el 17 ago: no
es falta de masa. **El copy solo no movió la nota en tres semanas**, igual que en Costa Rica.

El punto perdido llegó por `creative_quality_score` (relevancia del anuncio), no por la página, y
coincide con el cambio de títulos del 14 ago: en "Búsqueda #2" cayó esa misma semana; en
"Software #2" Google tardó, con la semana del 24 ago mixta (5/6/7) y la del 31 ago ya en 4. **No se
revierte**: el CTR se sostuvo o mejoró, y los títulos que llevan la keyword son los de mejor CTR
(«Desarrollo de sitios web» 10,3 %). Anotado para releer el 5 oct.

**Search Console de `nolo.ar`, primer mes (7 ago – 6 sep)**: **71 impresiones y 3 clics** en total,
40 impresiones desde Argentina; la única consulta visible es la marca («nolo», 28). `/web` 9
impresiones, `/software` 4. Google rastreó `/web` el 5 sep y `/software` el 4 sep, así que tiene el
copy nuevo. Dos conclusiones: **no hay orgánico que canibalizar, cada clic pagado es
incremental**; y la reclasificación que Costa Rica vio en `/web` (de 0 a 30–100 impresiones
semanales por «diseño web costa rica») **acá no aparece**: el dominio es más nuevo y no tiene
autoridad para rankear ni en página 5. Se relee en octubre.

### 4. El CRM: WhatsApp no cierra, la cita cerró, y los formularios argentinos no están en el pipeline

Leads argentinos del pipeline creados desde junio (13):

| canal | total | ganados | perdidos | abiertos |
|---|---:|---:|---:|---:|
| WhatsApp | 11 | **0** | 6 | 5 |
| Email | 1 | 0 | 1 | 0 |
| Otro (cita del calendario) | 1 | **1** | 0 | 0 |

En la ventana 14 ago – 4 sep entraron cuatro: Alfredo H. Olmedo SA (WhatsApp, 19 ago, en
seguimiento), Iluminación en Obra SRL (WhatsApp, 26 ago, propuesta enviada), **Energy Check (cita,
27 ago, ganado el 1 sep)** y Autopartes (WhatsApp, 1 sep, propuesta enviada).

Cruce con Ads, misma ventana:

- **21 clics de WhatsApp → 3 leads en el pipeline (14 %)**, igual que Costa Rica (3 de 11).
- **5 clics de «Agendar reunión» → 1 cita en el CRM.** El clic del 26 ago a las 11 (hora AR) y el
  lead de Energy Check del 27 ago a las 16:20 coinciden; Ads y CRM no se enlazan, así que es
  coincidencia fuerte, no prueba. Los otros cuatro clics no dejaron cita.
- 3 clics de «copiar correo» → 0 leads por email.

**El único cliente ganado del período llegó por la cita, el canal con el value más alto (60).** Y la
nota del CRM dice que no es un buen lead (idea sin probar, poco presupuesto): ganado no es lo mismo
que rentable. Con eso no hay número propio que calcular.

**Los cinco formularios de `nolo.ar` no están en el pipeline.** Cadsyst (26 jun), Estudio Jurídico
Said (1 jul), un estudiante (7 jul), un packaging farmacéutico sin empresa (22 jul) y Mini market
Maxi (12 ago) siguen como `webleads` sin `convertedToLeadId` y sin un lead con ese nombre. **Pregunta
abierta para Robert: ¿se atendieron fuera del CRM?** Importa porque el formulario es el techo de la
escala (30–60) y hoy no hay forma de saber si cierra. Ninguno nuevo desde el 12 ago (el «Contacto
Formulario Argentina» en cero es correcto: sin oportunidad, label verificado el 17 ago).

**Sesiones del sitio** (`sitesessions`, `site = AR`, con `entryGclid`): 68 · 75 · 75 · 72 por semana
del 10 al 31 ago, 0,8–1,0 min activos por sesión. Consistente con los 86–93 clics semanales de Ads
y **sin cambio de comportamiento tras el copy**, como en Costa Rica.

**Decisión sobre el pendiente 4 (recalibrar values): no se recalibra.** La evidencia argentina
(cita 1 de 1, WhatsApp 0 de 6 resueltos) va en la dirección de la escala actual, y con un cierre no
hay número que sostenga otra. Misma decisión que Costa Rica; la ventana sigue con una sola escala.

### 5. "Scroll Argentina (2)": sigue pujando, por paridad y porque en "Búsqueda #2" pesa poco

Ventana limpia: en "Búsqueda #2" el scroll es **77 de 99 conversiones (78 %) pero sólo el 14 % del
valor** (76,9 de 537,9); en "Software #2", 33 de 39 (85 %) y **41 % del valor** (33 de 81). Con
Maximizar valor lo que orienta la puja es el valor, no el conteo: en "Búsqueda #2" es ruido menor;
en "Software #2" pesa porque no hay contactos serios que lo diluyan. Sacarlo del objetivo reinicia
el aprendizaje otra vez, y Costa Rica decidió hoy dejarlo. **Queda.** Regla para el 5 oct: si en
"Software #2" el scroll sigue por encima del 40 % del valor, se evalúa sacarlo **de las dos**
campañas argentinas a la vez, nunca de una.

### 6. Hallazgos laterales, sin acción

- **Términos de "Búsqueda #2"** (67,8 % del gasto visible): los serios vinieron de «armado de
  pagina web» (valor 57), «creacion de paginas web» (55) y «agencias de desarrollo web» (41).
  Clics carísimos aislados: «creadores de sitios web» **24,36 por un clic**, «diseñadores de
  paginas web» 25,40 por tres. Smart Bidding paga mucho por términos que predice valiosos; anotado.
- **Términos de "Software #2"** (48,3 % visible): contactos en «software a medida» (29), «empresa
  de software argentina» y «software a medida argentina». Marcas de competidor nuevas con clic:
  **«ltm software»** (3,13) y «adelia software» (0). Candidatas a negativa en frase.
- **Dispositivo, ventana POST**: "Búsqueda #2" escritorio CPC 2,28 / móvil 2,59; "Software #2"
  3,47 / 3,86. Al revés que en Costa Rica, donde el móvil es más barato en las dos.
- **Títulos de "Búsqueda #2"**: «Hecho en Argentina» es el más servido (1.459 impresiones, CTR
  7,7 %); «Sin WordPress Ni Plantillas» es el flojo entre los grandes (748, 4,4 %).

### 7. Decisiones pendientes de Robert (7 sep 2026)

Lo que los datos recomiendan, a falta de su decisión. **Nada se ejecutó en la cuenta** en ese momento.
**Actualización de la tarde:** Robert pidió salir del círculo de "Software #2"; lo ejecutado está en la
entrada siguiente (anuncio, sitelink y negativas; nada de puja ni presupuesto).

1. **"Búsqueda #2": subir de 20 a 24 USD/día.** Único cambio con base (§1). Abre su propia ventana.
2. **"Software #2": sin cambios** (§2). Vigilar abs-top y serios el 5 oct.
3. **Values, scroll y tROAS: sin cambios** (§4, §5). tROAS sigue sin señal que lo alimente: siete
   serios en tres semanas.
4. **Confirmar qué pasó con los cinco formularios argentinos** (§4).
5. Opcional y barato: negativas en frase para «ltm software» y «adelia software» en "Software #2".
6. **Próxima revisión: ~5 oct 2026, junto con Costa Rica.**


## 7 sep 2026 (tarde) — Ejecutado: salir del círculo de "Software #2" por el anuncio, no por la puja

Decisión de Robert tras las dos adendas: «hacé lo que veas necesario para salir de este círculo
vicioso». El círculo: la puja ve poco valor por clic (sólo WhatsApp de 8 y scrolls de 1) → ofrece
menos → pierde la primera posición → menos chance de un lead serio → menos valor. Todo lo de abajo se
hizo por API con `validate_only` previo y relectura del servidor después.

### Palancas evaluadas y descartadas

| palanca | por qué no |
|---|---|
| Presupuesto | No es el freno: 19,28 por día activo contra 21 de equivalente, pérdida por presupuesto 1,6 % la última semana. |
| Estrategia de puja (cuota de impresiones objetivo, o manual) | Fuerza posición pagando lo que sea, con QS 4 serían 5–6 USD por clic, y tira a la basura el aprendizaje de valor. |
| Sacar el scroll del objetivo | Dejaría a la puja de "Software #2" con 6 conversiones en tres semanas: sin datos para aprender. Y reinicia el aprendizaje. Va al 5 oct, como estaba. |
| Subir el value del WhatsApp | Sería mentirle al algoritmo: WhatsApp lleva 0 ganados de 6 resueltos en Argentina. |
| Keyword, concordancia, geografía | Descartadas con datos el 13 y 14 ago; el mercado creció, no faltan subastas. |
| CTA del sitio | Verificado en `app.routes.ts`: `/software` ya tiene **«Agendar reunión»** como botón principal del hero (`ctaPrimary` → cal.com) y «Mandar mensaje» como secundario. El sitio no empuja a WhatsApp; las cero reuniones son del visitante, no de la página. |

### Lo que sí: el anuncio `813097373240`, donde estaban los errores heredados

Tres cosas del anuncio que no se habían visto: la relevancia del anuncio bajó a **Promedio** desde el
14 ago; **ninguna descripción llevaba la keyword**; y dos descripciones y un título hablaban de
**usted** («Cotice hoy», «su flujo de trabajo», «Automatice sus Procesos»), la voz de Costa Rica
heredada del fork, cuando Nolõ habla de vos. Además la URL visible no tenía ruta.

**Cinco títulos reemplazados** (impresiones y CTR desde el 14 ago):

| se quitó | por qué | se agregó |
|---|---|---|
| «Soluciones de Software B2B» | 19 impresiones, **0 %** | «Software a Medida en Argentina» |
| «Software Corporativo Seguro» | 36 impresiones, **0 %** | «Cotizá tu Software a Medida» |
| «Código 100% Propio» | 82 impresiones, 2,4 % | «Desarrollo de Software Propio» |
| «Automatice sus Procesos» | usted | «Automatizá tus Procesos» |
| «Empresa Argentina de Software» | 623 impresiones, **3,4 %** | «Empresa de Software Argentina», el orden en que la gente busca |

Los diez restantes quedan iguales, incluidos los dos del 14 ago, que son los más servidos y rinden a
nivel de campaña o mejor. «Desarrollo Backend Complejo» (172 impresiones, 3,5 %) queda anotado como
próximo candidato; no se quitó para no cambiar más de un tercio del anuncio de una vez.

**Dos descripciones reemplazadas** (las de usted; las otras dos quedan):

| antes | después |
|---|---|
| «No somos agencia, somos ingenieros. Expertos en APIs y sistemas complejos. Cotice hoy.» | «Empresa de desarrollo de software a medida en Argentina. Cotizá tu sistema hoy.» |
| «¿Sistemas lentos? Creamos software adaptado a su flujo de trabajo real. 100% Propio.» | «¿Sistemas lentos? Creamos software adaptado a tu operación real. Código 100% propio.» |

La primera lleva la keyword literal, «empresa de desarrollo de software», que en un título no cabe
(33 caracteres) y en una descripción sí. «No somos agencia» sigue en el título 7.

**Ruta visible**: `nolo.ar/software/a-medida` (`path1`/`path2`, antes vacíos).

**Sitelink** `372920546926`: «Hable con un Ingeniero» → **«Hablá con un Ingeniero»**. Los sitelinks
argentinos son assets propios, no compartidos con Costa Rica, así que el cambio no la toca. Los
demás sitelinks quedan.

**Negativas de campaña en frase**: «ltm software» y «adelia software», dos marcas de competidor con
clic en la ventana.

**Verificación**: títulos y descripciones releídos del servidor, idénticos a lo enviado; ruta y
negativas confirmadas; el sitelink relee «Hablá con un Ingeniero» sólo en "Software #2". El anuncio
quedó en `REVIEW_IN_PROGRESS` y fuerza `PENDING`, que es lo normal tras editar: **confirmar el 8 sep
que está aprobado**.

### Lo que no se tocó, a propósito

- **"Búsqueda #2"**: nada. Su anuncio tutea («Moderniza tu web», «Olvídate») y su sitelink sigue en
  usted; se corrige después de su ventana, no ahora. Su presupuesto 20 → 24 lo aprobó Robert
  y se aplicó esa misma tarde: ver el cierre de esta entrada.
- Puja, presupuesto, keyword y objetivo de conversión de "Software #2".

### Cómo saber si funcionó

Ventana nueva desde el **8 sep** (primer día hábil con el anuncio aprobado). Lo que tiene que
moverse, en este orden, porque es lo que el cambio toca directamente:

1. `creative_quality_score` de Promedio a **Por encima del promedio** (semanal, `historical_*`).
2. Pérdida por **ranking** de "Software #2" bajando desde 25–31 %, y primera posición subiendo desde
   16 %. Si eso pasa con el CPC estable, el anuncio abarató la posición.
3. Recién después, serios por 100 clics. Si la posición vuelve y los serios siguen en cero, la
   posición no era la causa y la palanca que queda es la página.

Impresiones y CTR de cada título nuevo en `ad_group_ad_asset_view`. Se lee el **5 oct** con el
resto, o antes si la pérdida por ranking sigue subiendo.


### Cierre del día: presupuesto de "Búsqueda #2" de 20 a 24 USD/día

Robert lo aprobó después de ver las estadísticas de subasta de la campaña (adenda de §1). Ejecutado
por API sobre `campaignBudgets/15658499227`: se leyó primero del servidor (20,00, exclusivo,
una sola campaña, entrega estándar), `validate_only`, aplicado y releído en **24,00**. "Software #2"
sigue en 15,00. Equivalencias: tope mensual 730, gasto esperado ~649 al mes, ~30 por día hábil.

**Sobre la regla de no mover las dos campañas argentinas a la vez.** Hoy se tocaron las dos, pero con
palancas distintas y lecturas distintas: en "Búsqueda #2" el presupuesto, que se lee en serios por
100 clics; en "Software #2" el anuncio, que se lee en relevancia, pérdida por ranking y primera
posición. La regla existía para no confundir el efecto de una misma palanca en dos lugares; acá cada
campaña sigue teniendo una sola causa que leer. Las dos ventanas arrancan el **8 sep**.

## Pendientes

- [x] ~~**El copy de `/software` y de `/web`** para que las páginas usen el lenguaje de la búsqueda.~~
      **Hecho y publicado el 14 ago 2026** (merge `af7eb8a`); ver la entrada de esa noche. Era lo
      único que tocaba la nota BELOW_AVERAGE de las cuatro campañas a la vez.
- [x] ~~**~4 sep 2026 — Leer la nota de página de destino**~~ **Leída el 7 sep 2026: no se movió**
      (ver la entrada del 7 sep, §3). Era lo único que ese cambio toca y por
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
- [x] **4 sep 2026 — la nota de página de destino.** **Hecho el 7 sep 2026: BELOW_AVERAGE todas las
      semanas en las dos campañas; el punto de QS perdido es de los anuncios, no de la página**
      (entrada del 7 sep, §3). Era la revisión nueva y la razón por la que la
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
- [x] **~4 sep 2026** — **Hecho el 7 sep 2026: 3,2 → 4,2 serios por 100 clics, USD/serio 61 → 53,
      sigue tocando el techo; entra en la rama «evaluar 24»** (entrada del 7 sep, §1). Leer el efecto
      del presupuesto de 20/día en **"Búsqueda #2"**, medido en **leads serios por 100 clics** (no en totales, que suben por el volumen). Si escala, evaluar
      24; si el ratio se cae, el techo útil estaba por debajo de 20. Por encima de 30 no hay base.
- [x] **~4 sep 2026** — **Hecho el 7 sep 2026: el CPC bajó a 3,39 pero por retracción de la puja
      (QS 5 → 4, perdida por ranking 13,5 → 25,7 %), cero serios en la ventana limpia; sin
      cambios** (entrada del 7 sep, §2). Revisar **"Software #2"** recién entonces, con las acciones separadas dando
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
- [x] **4 sep 2026 — o después, nunca antes** ~~(27 ago → 3 sep)~~ — **Decidido el 7 sep 2026: no
      se recalibra** (entrada del 7 sep, §4; misma decisión en Costa Rica). Recalibrar los values con datos
      propios por canal. Hoy la escala (WhatsApp 10 contra formulario 30–60) es un supuesto sin
      evidencia; el CRM de LinkDesign sugiere que la brecha real es **mayor**.
      > **Se movió del 27 de agosto al 3 de septiembre el 13 ago 2026, y del 3 al 4 el 14 ago.**
      > Recalibrar a mitad de la ventana de medición habría dejado el análisis con **dos escalas de
      > valor mezcladas** y el aprendizaje de Smart Bidding reiniciado por la mitad — el mismo error
      > que volvió irresoluble lo del 23 de julio, cuando el recorte de presupuesto y el ×2 de values
      > cayeron el mismo día. La ventana 13 ago – 4 sep queda con **una sola escala**. Si ese día se
      > decide recalibrar, el cambio abre su propia ventana de medición.
- [x] ~~**24–48 h** — Verificar que las cuatro acciones nuevas registran conversiones.~~ **Hecho:
      registran (17 ago) y pujan (18 ago; reverificado el 7 sep).** Si una queda en
      cero mientras las otras se mueven, el label quedó mal copiado: es el modo de fallo silencioso
      de este cambio.
- [x] ~~**No tocar pujas por al menos dos semanas.**~~ **Cumplido: ventana cerrada el 4 sep sin tocar pujas.** Separar las acciones reinicia el aprendizaje de
      Smart Bidding; encimar un tROAS haría imposible atribuir el efecto de nada.
- [x] **~Sept 2026** — **Hecha el 7 sep 2026: 71 impresiones y 3 clics en el primer mes, sólo la
      marca; no hay orgánico que canibalizar. Releer en octubre** (entrada del 7 sep, §3).
      Primera lectura con sentido de Search Console de Nolõ, cuando haya varias
      semanas acumuladas. Repetir el análisis de canibalización que se hizo para LinkDesign.
- [x] ~~Aislamiento de la optimización argentina: ver arriba el estado real verificado el 13 ago.
      Decidir si se le asigna a "Búsqueda #2" y "Software #2" un `campaign_conversion_goal` propio
      con las acciones de Nolõ~~ — **ya estaba cumplido desde junio**, y el 13 de agosto se leyó al
      revés. Las dos campañas usan el objetivo personalizado «Contacto Argentina» (`6458009700`),
      que desde el **18 ago 2026** contiene las seis acciones argentinas. Ver esa entrada.
- [x] **Decidido el 7 sep 2026: sigue pujando** (entrada del 7 sep, §5; regla para el 5 oct:
      si en "Software #2" pasa del 40 % del valor, se evalúa sacarlo de las dos). ~~Sigue abierto:
      si "Scroll Argentina (2)" debe seguir pujando.~~ Ahora compite, dentro del
      mismo objetivo, contra contactos de value 8 a 54 — que es exactamente el escenario para el que
      se hizo la escala de values. Va al **4 de septiembre**, no antes.
- [x] ~~**Decisión de Robert (7 sep 2026): "Búsqueda #2" de 20 a 24 USD/día.**~~ **Aprobado y
      aplicado el 7 sep 2026** (`campaignBudgets/15658499227`, validado y releído; "Software #2"
      sigue en 15). Ventana nueva desde el 8 sep; se lee el 5 oct en serios por 100 clics.
- [ ] **Pregunta a Robert (7 sep 2026; lo trae el 8 sep): los cinco formularios argentinos** (Cadsyst, Estudio Jurídico
      Said, Mini market Maxi y dos sin empresa) no están en el pipeline del CRM. ¿Se atendieron fuera?
      Sin eso no se puede medir si el formulario, el techo de la escala de values, cierra.
- [x] ~~**Opcional**: negativas en frase para «ltm software» y «adelia software» en "Software #2".~~
      **Aplicadas el 7 sep 2026** (ver la entrada «Ejecutado»).
- [ ] **5 oct 2026, 9:00 CR — revisión conjunta con Costa Rica** (en Calendar con correo un día antes;
      además vistazos semanales a "Software #2" los lunes 14, 21 y 28 sep, también en Calendar). Qué mirar: la nota de página (siete semanas
      de copy); "Búsqueda #2" en serios por 100 clics con el presupuesto que haya quedado;
      "Software #2" en relevancia del anuncio (Promedio → Por encima), pérdida por ranking y primera
      posición, y recién después serios por 100 clics (ver «Cómo saber si funcionó» en la entrada de
      la tarde del 7 sep); el scroll de "Software #2" contra el 40 % del valor; y Search Console de
      `nolo.ar` con dos meses.
- [x] ~~**Decisión de Robert (7 sep, tarde): títulos flojos de "Software #2"**~~ **Ejecutado el 7 sep**
      (tarde): cinco títulos, dos descripciones, ruta visible, sitelink y dos negativas. Ver la entrada
      «Ejecutado». «Desarrollo Backend Complejo» quedó como próximo candidato.
- [ ] **8 sep 2026 — confirmar que el anuncio `813097373240` de "Software #2" está aprobado**
      (recordatorio en Calendar, 9:00 CR, con correo)
      (`ad_group_ad.policy_summary.approval_status`); quedó en revisión tras la edición.
- [ ] **Después del 5 oct — voz del anuncio de "Búsqueda #2"**: descripciones en tuteo («Moderniza tu
      web», «Olvídate») y sitelink «Hable con un Ingeniero» en usted. No se tocó para no ensuciar su
      ventana.
- [x] ~~**13 ago 2026** — Revisión conjunta con LinkDesign; primer análisis de "Búsqueda #2".~~ Hecho.
- [x] ~~**13 ago 2026** — Separar las acciones de conversión por canal.~~ Hecho, ver arriba.

## Nota operativa

La zona horaria de la cuenta es **Costa Rica (UTC-6)** y Argentina va +3h: al cargar horarios de
campaña hay que restar 3 horas. Los sitelinks admiten como máxima granularidad el grupo de anuncios,
no el anuncio.

### 10 sep 2026 · el hub y las fichas de demo reportan agendar y WhatsApp

Desde el deploy `9ceb2c9` existen `/desarrollo-de-software-argentina` y sus seis fichas (ES y EN), espejo
del hub de Costa Rica. Sus tres botones de contacto («Agendá una reunión» y «Escribinos por WhatsApp»
del hero del hub, y «Agendá una reunión de 30 minutos» en la sección de precio de cada ficha) reportan
las mismas conversiones que el resto del sitio, con los labels argentinos: reunión
`GPuTCMeXquEcEIe3n7s-` (value base 60, modulado) y WhatsApp `zxm7CMGXquEcEIe3n7s-` (base 10). El
formulario del pie sigue reportando `ZAj_CMqXquEcEIe3n7s-` con value por scoring, y el lead llega al
CRM como `landing: software` con el contexto de la ficha. Nada se tocó en Google Ads.

**Para leer después:** si suben las conversiones de reunión y WhatsApp sin que suban las de formulario,
mirar primero cuánto viene de estas páginas antes de leerlo como cambio de comportamiento. Verificado
en producción el 10 sep con un espía sobre `gtag` (sin enviar nada): values 42 y 7 en sesión fría.
Bitácora del proyecto: `~/dev/WebSite/PLAN-FICHAS-NOLO.md`.

### 10 sep 2026 · horario y datos legales en el pie (transparencia para la nota de página de destino)

Misma acción que en Link Design (plan `docs/plan-nota-pagina-destino.md` de ese repo), con los datos
que dio Robert: razón social **NOLO CAAR** y **CUIT 30-71951427-4**. Desde hoy el pie de todas las
páginas muestra, debajo de la ubicación: «L-V, 9 a 18», «NOLO CAAR» y «CUIT 30-71951427-4» (en inglés
«Mon-Fri, 9am-6pm» y las mismas dos líneas legales). La ficha de marca que lee Google lleva
`legalName` y `taxID`. Fuente única en `src/app/company-info.ts`; `/contacto` usa el horario largo de
la misma constante. Apunta a la nota de página de destino, que se lee el 5 oct 2026 junto con la de
Costa Rica; los videos móviles (acción 3) quedan pendientes en los dos sitios.

### 10 sep 2026 · videos livianos para celular en /web y /software

Espejo de la acción 3 de Link Design (plan `docs/plan-nota-pagina-destino.md` de ese repo). El
navegador elige el archivo por tamaño de pantalla con `<source media="(max-width: 760px)">`, así que
decide antes de descargar; en escritorio no cambia nada, y el encuadre y la proporción del video son
los mismos (720×384 contra 1280×682, ambos 1,875).

- **`/web`, carrusel:** usa la pieza de 720 px que el CRM ya genera por proyecto para la tabla del
  portafolio (mismo contenido que el render de hero). Los tres primeros pasan de 6,4 MB a 1,6 MB.
- **`/software`:** no existía versión chica; se generaron los nueve clips con la receta del CRM
  (`scale=720:-2`, 30 fps, CRF 28, faststart, sin audio) y viven versionados en
  `public/media/software/<nombre>-mobile.mp4`. Pestañas de 4,5 MB a 1,5 MB y viewcases de 12,3 MB a
  3,9 MB.

Verificado con Chrome real: a 390 px pide los clips de 720 y a 1280 los originales, en carrusel,
pestañas y viewcases. Tres pruebas nuevas fijan la regla (mutación comprobada). Apunta a la nota de
página de destino, que se lee el 5 oct 2026 junto con la de Costa Rica.
