import type { SystemSlug } from './systems-content';

import type { FaqItem } from '../components/faq-accordion.component';
import type { ProjectStage } from '../components/project-stages.component';
import type { Lang } from '../services/language.service';

/**
 * Contenido de la landing «Desarrollo de software a medida en Argentina»
 * (/desarrollo-de-software-argentina) en ES (`SOFTWARE_AR`) y EN (`SOFTWARE_AR_EN`). Los
 * componentes leen por `getSoftwareArContent(lang)` y `getSoftwareArLabels(lang)`.
 *
 * Gemelo de `software-cr-content.ts` (repo LinkDesign-simple): misma forma de
 * datos, mismas claves, mismos largos de lista y las mismas cifras, con el copy reescrito para
 * Argentina y en voseo (no es una traducción ni una copia: dos dominios con el mismo texto
 * compiten entre sí). Nolõ es un estudio argentino con sede en Buenos Aires (decisión de Robert,
 * 9 sep 2026): este archivo no nombra a ningún otro estudio ni a ningún otro país, y tampoco
 * publica el año de inicio ni la cantidad de proyectos, que son cifras del sitio gemelo. Valores
 * provisionales que faltan confirmar (marcados PROVISIONAL en cada campo, en los dos idiomas, para
 * que la confirmación toque ambos): plazo de la propuesta, garantía, costo mensual de
 * infraestructura, integraciones ya hechas, zonas de trabajo y discovery en sitio.
 *
 * Los rangos de inversión son los mismos que publica el sitio gemelo, calculados sobre las 58
 * propuestas con monto del CRM (mar a sep 2026). El EN copia los mismos dígitos y solo cambia el
 * formato («1.500 a 4.000*» en ES, «1,500 to 4,000*» en EN).
 */

export type SoftwareArPriceRow = {
  type: string;
  range: string;
  timeline: string;
  /** Página de tipo de sistema (/software/:slug) que muestra esta fila en su sección de costo. */
  system?: SystemSlug;
};

export type SoftwareArIntegration = {
  icon: 'receipt' | 'credit-card' | 'message-circle' | 'calculator' | 'calendar-days' | 'key-round';
  text: string;
};

/** Enlace dentro de un párrafo, para cuando un texto tiene que apuntar a otra página. */
export type SoftwareArLink = { text: string; href: string };

/** Un párrafo es un texto plano o una lista de trozos con enlaces intercalados. */
export type SoftwareArParagraph = string | ReadonlyArray<string | SoftwareArLink>;

export type SoftwareArIncluded = {
  title: string;
  body: string;
};

export const SOFTWARE_AR = {
  hero: {
    eyebrow: 'Software a medida',
    title: 'Desarrollo de software a medida en Argentina',
    lead: 'Somos Nolõ y construimos software a medida para empresas que ya no pueden sostener su operación con planillas, WhatsApp y parches. No adaptamos tu empresa a un sistema. Copiamos cómo trabaja tu operación de verdad y la convertimos en software. Construimos para industria, logística, salud, servicios profesionales y comercio.',
    // Las dos primeras cifras salen del propio sitio: 6 demos navegables y 7 tipos de sistema con
    // página propia en /software.
    // PROVISIONAL: confirmar con Robert el plazo de 8 a 13 semanas (sale del proceso descrito, no de
    // proyectos medidos).
    stats: [
      { value: '06', label: 'demos que podés recorrer hoy' },
      { value: '07', label: 'tipos de sistema que construimos' },
      { value: '8 a 13', label: 'semanas desde la primera reunión hasta el sistema andando' }
    ],
    ctaPrimary: 'Agendá una reunión de 30 minutos',
    ctaSecondary: 'Escribinos por WhatsApp',
    // PROVISIONAL: plazo de la propuesta.
    promise:
      'Después de la primera reunión te mandamos una propuesta escrita en 5 días hábiles. Sin costo y sin compromiso.',
    updated: 'Actualizado: septiembre 2026'
  },

  forWhom: {
    intro:
      'Trabajamos con empresas que tienen una operación real y un problema concreto. Si te reconocés en alguna de estas situaciones, hablemos.',
    fits: [
      'Tu operación vive en planillas que entiende una sola persona. El día que esa persona falta, todo se frena.',
      'Los pedidos, los turnos o las cotizaciones entran por WhatsApp y alguien los pasa a mano a otro lado, todos los días.',
      'Compraste un sistema enlatado y tu equipo trabaja con planillas paralelas, porque el sistema no calza con cómo venden o despachan.',
      'Tenés dos o más sucursales, depósitos o equipos, y nadie ve el inventario ni el estado real de las cosas al mismo tiempo.',
      'Tu contabilidad o tu ERP funcionan bien para facturar, pero no cubren la parte operativa: producción, mantenimiento, rutas, comisiones, cobranzas.',
      'Necesitás que tu cliente resuelva algo solo, sacar un turno, pagar, comprar una entrada o consultar en qué anda su pedido.'
    ],
    notFor:
      'Si lo que buscás es una app genérica para vender en las tiendas de aplicaciones, o un producto para el mercado masivo, no somos la mejor opción. Te lo vamos a decir en la primera llamada.'
  },

  how: {
    statement: [
      'La mayoría del software le pide a la empresa que cambie. Que cargue los datos como el sistema quiere, que siga los pasos que el sistema define, que resigne las excepciones que la hacen funcionar.',
      'Nosotros hacemos lo contrario. Primero entendemos cómo trabaja tu operación de verdad, quién hace qué, en qué orden, con qué reglas y con qué excepciones. Recién después escribimos el código alrededor de eso.'
    ],
    examplesTitle: 'Tres ejemplos de lo que significa en la práctica',
    examples: [
      {
        if: 'Si tu depósito despacha por lotes y tus vendedores cobran comisión cuando el cliente paga, no cuando firma,',
        then: 'el sistema despacha por lotes y calcula la comisión cuando entra el pago. No al revés.'
      },
      {
        if: 'Si tus clientes mayoristas tienen listas de precio distintas y condiciones de pago negociadas una por una,',
        then: 'esas condiciones viven adentro del sistema y no en la memoria de tu gerente comercial.'
      },
      {
        if: 'Si tu clínica agenda por profesional, por sala y por equipamiento,',
        then: 'la disponibilidad se calcula con las tres cosas, porque así funciona tu clínica.'
      }
    ],
    closing: [
      'Esto tiene un costo. Hay que dedicar tiempo a entender la operación antes de construir, y por eso el discovery es la primera etapa del proyecto y también la más importante.',
      'Y tiene un beneficio que se nota el primer día. Tu equipo adopta el sistema sin resistencia, porque el sistema habla su idioma.'
    ]
  },

  systems: {
    intro:
      'Cada tipo de sistema tiene un demo completo que podés navegar con datos de prueba. Los sistemas de nuestros clientes están bajo confidencialidad y no se muestran, así que estos los construimos nosotros para que veas cómo se siente un software hecho alrededor de una operación. Son ejemplos y no el resultado que vas a recibir, porque cada desarrollo parte de tu operación y termina distinto. Acá va solo software; los sitios y las tiendas en línea son del brazo web.',
    integrationsTitle: 'Se conecta con lo que ya usás en Argentina',
    integrationsIntro:
      'Un sistema a medida no reemplaza todo lo que ya tenés, se conecta con eso. Estas son las integraciones que más nos piden y que ya resolvimos en proyectos reales.',
    // PROVISIONAL: confirmar cuáles están hechas antes de publicar.
    integrations: [
      {
        icon: 'receipt',
        text: 'Facturación electrónica de ARCA, ex AFIP. El sistema emite y recibe comprobantes sin salir de la operación.'
      },
      {
        icon: 'credit-card',
        text: 'Mercado Pago y transferencias bancarias para cobrar en línea.'
      },
      {
        icon: 'message-circle',
        text: 'WhatsApp Business: pedidos, confirmaciones y atención con bot e inteligencia artificial, adentro del mismo sistema.'
      },
      {
        icon: 'calculator',
        text: 'Tu contabilidad o tu ERP actual, para que la operación y la facturación dejen de vivir en mundos separados.'
      },
      {
        icon: 'calendar-days',
        text: 'Correo, calendario y usuarios de Microsoft 365 o Google Workspace, para que tu equipo entre con la cuenta que ya tiene.'
      },
      {
        icon: 'key-round',
        text: 'Cuentas de clientes con su propio inicio de sesión, para tiendas y portales donde el cliente se atiende solo.'
      }
    ] as SoftwareArIntegration[]
  },

  pricing: {
    lead: 'Un sistema a medida con nosotros va de USD 1.500 a 15.000, según el alcance. La mayoría de lo que cotizamos en los últimos doce meses cae entre USD 3.000 y 9.000. Estos son los rangos por tipo de sistema, calculados sobre nuestras propuestas de 2026.',
    columns: ['Tipo de sistema', 'Inversión (USD)*', 'Plazo típico*'],
    rows: [
      { type: 'Herramienta interna para un solo flujo (liquidaciones, comisiones, control de visitas)', range: '1.500 a 4.000*', timeline: '4 a 6 semanas*' },
      { type: 'CRM a la medida', system: 'crm-a-medida', range: '2.600 a 8.000*', timeline: '6 a 10 semanas*' },
      { type: 'E-commerce con lógica propia', system: 'ecommerce-logica-propia', range: '1.600 a 3.500*', timeline: '6 a 10 semanas*' },
      { type: 'Reservas, agenda o gestión clínica', system: 'reservas-y-agenda', range: '4.000 a 9.000*', timeline: '8 a 12 semanas*' },
      { type: 'Ticketing con marca propia', system: 'ticketing-marca-propia', range: '2.800 a 6.000*', timeline: '8 a 12 semanas*' },
      { type: 'ERP de operación e inventario', system: 'erp-operacion-inventario', range: '4.500 a 8.000*', timeline: '10 a 14 semanas*' },
      { type: 'Automatización con IA aplicada', system: 'automatizacion-ia', range: '2.000 a 5.000*', timeline: '4 a 10 semanas*' },
      { type: 'Plataforma completa o multisede', range: '9.000 a 15.000 o más*', timeline: '3 a 5 meses*' }
    ] as SoftwareArPriceRow[],
    // Una sola redacción de la nota del asterisco en todo el sitio: acá, en `costDisclaimer` de las
    // fichas y en `costNote` de la página de sistema (Cierre 1, hallazgos C-1 y C-2 de C2).
    note:
      '* Rangos y plazos de referencia. Cada proyecto se cotiza según su alcance. Nunca tenemos un precio listo, porque nunca son soluciones estandarizadas.',
    factorsTitle: 'Qué mueve el precio dentro de cada rango',
    factors: [
      'Cuántos flujos y cuántos roles distintos usan el sistema. Un módulo con dos roles no cuesta lo mismo que cinco módulos con jefatura, depósito, ventas y cliente.',
      'Integraciones. Cada servicio externo con el que hay que hablar (facturación, pagos, WhatsApp, tu ERP) suma trabajo y pruebas.',
      'Migración de datos. Traer años de planillas o de un sistema viejo, limpiarlos y validarlos.',
      'Uso en campo. Si los técnicos o los vendedores lo usan desde el celular, sin señal y con fotos.',
      'Inteligencia artificial. Lectura de documentos, audio o clasificación automática.'
    ],
    paymentTitle: 'Cómo se paga',
    payment:
      'El precio queda cerrado por alcance antes de empezar. Si el alcance cambia en el camino, lo cotizamos aparte y decidís vos. Los esquemas que más usamos son anticipo y saldo contra entrega (30/70), pagos por hito según etapas, o una cuota mensual con soporte incluido cuando preferís no hacer una inversión inicial grande. El proyecto arranca con el anticipo del discovery.',
    afterTitle: 'Lo que se paga después',
    // PROVISIONAL: rango de infraestructura.
    after:
      'La infraestructura queda a tu nombre y se paga directo al proveedor, entre USD 20 y 80 al mes para la mayoría de los sistemas, algo más si usan inteligencia artificial de forma intensiva. El soporte con tiempos de respuesta acordados es opcional y se cotiza al cierre.'
  },

  process: {
    title: 'Plazos y proceso',
    intro:
      'De la primera conversación al software andando en tu operación. Cuatro etapas, con tiempos reales y un entregable concreto en cada una.',
    stages: [
      {
        order: '01',
        name: 'Primer contacto',
        duration: 'Hoy mismo',
        description:
          'Entendemos qué necesitás resolver y validamos si tiene sentido hacerlo a medida. Entregable: un primer alcance estimado y una fecha para sentarnos.'
      },
      {
        order: '02',
        name: 'Discovery',
        duration: '2 a 4 semanas',
        description:
          'Mapeamos el flujo real de tu operación con las personas que lo ejecutan, y definimos reglas, roles, excepciones, integraciones y arquitectura. Entregable: el mapa de tu operación, el alcance final y la propuesta cerrada en precio y plazo.'
      },
      {
        order: '03',
        name: 'Desarrollo',
        duration: '5 a 8 semanas',
        description:
          'Construimos el sistema por módulos. Cada dos semanas tu equipo prueba lo que ya funciona en un ambiente de prueba y nos corrige con datos reales. Entregable: módulos funcionando y validados por quienes los van a usar.'
      },
      {
        order: '04',
        name: 'Lanzamiento',
        duration: '1 semana',
        description:
          'Pasamos el sistema a producción, capacitamos al equipo por rol y acompañamos las primeras semanas de uso. Entregable: el software funcionando en tu operación, con el equipo trabajando adentro.'
      }
    ] as ProjectStage[],
    closing:
      'En total, entre 8 y 13 semanas desde la primera reunión. Los proyectos multisede o con muchas integraciones llevan de 3 a 5 meses, y eso lo sabés en el discovery, no a mitad de camino.'
  },

  included: {
    items: [
      {
        title: 'El código es tuyo.',
        body: 'Queda en un repositorio a nombre de tu empresa, con documentación. Si mañana querés seguir con otro equipo, podés.'
      },
      {
        title: 'La infraestructura es tuya.',
        body: 'Las cuentas de nube quedan a tu nombre y la factura mensual te llega a vos. Nosotros la administramos mientras quieras.'
      },
      {
        title: 'Capacitación y seguimiento.',
        body: 'Capacitamos a cada equipo en el sistema y acompañamos las primeras semanas de uso. Sin manuales, el sistema se aprende usándolo y con nosotros al lado.'
      },
      {
        // PROVISIONAL: plazo de garantía.
        title: 'Un año de garantía de funcionamiento.',
        body: 'Durante el primer año corregimos sin costo cualquier error de lo entregado. No incluye cambios, mejoras ni modificaciones sobre lo que se estableció en los alcances del proyecto.'
      },
      {
        title: 'Soporte después.',
        body: 'Planes con tiempos de respuesta acordados para consultas, errores y mejoras conforme cambia la operación. Se acuerda al cierre y no es obligatorio.'
      },
      {
        title: 'Lo que no incluye.',
        body: 'Licencias de servicios de terceros (pasarelas de pago, WhatsApp Business, herramientas de IA), equipos o dispositivos, y el trabajo de limpiar datos históricos, que cotizamos aparte cuando hace falta.'
      }
    ] as SoftwareArIncluded[]
  },

  choose: {
    intro:
      'Hay buenas empresas de software en Argentina y no todas sirven para lo mismo. Antes de contratar, a nosotros o a cualquiera, revisá estas siete cosas.',
    items: [
      { title: 'Pedí navegar algo que hayan construido, aunque sea una demostración.', body: 'Una presentación no te dice cómo se siente usar su software. Un demo sí, aunque no sea tu sistema.' },
      { title: 'Preguntá quién se va a sentar con tu equipo.', body: 'Si el que vende no es el que va a entender tu operación, el discovery se pierde en el camino.' },
      { title: 'Exigí precio y plazo cerrados antes de empezar.', body: '«Depende» es aceptable en la primera llamada, no en la propuesta.' },
      { title: 'Confirmá de quién es el código y dónde queda.', body: 'Si el código no es tuyo, no estás comprando un sistema. Lo estás alquilando.' },
      { title: 'Preguntá qué pasa el día después del lanzamiento.', body: 'Quién corrige errores, en cuánto tiempo y a qué costo.' },
      { title: 'Pedí una referencia real.', body: 'Un cliente al que puedas llamar para preguntarle cómo fue trabajar con ellos y qué pasa cuando algo falla.' },
      { title: 'Desconfiá si nunca te dicen que no.', body: 'Una empresa seria te va a decir cuándo un enlatado te sirve mejor y te sale más barato.' }
    ],
    honestTitle: 'No siempre conviene a medida.',
    honest:
      'Si tu proceso es estándar, tenés menos de cinco personas usando el sistema y no necesitás integrarlo con nada, un producto enlatado bien configurado puede ser la mejor decisión. Te lo decimos en la primera reunión.'
  },

  industries: {
    heading: 'Lo construimos para tu industria',
    intro:
      'Construimos sistemas para operaciones físicas y equipos que trabajan en campo, en planta o en mostrador. Entrá a tu industria y mirá qué software tendría sentido para tu operación.',
    zonesTitle: 'Dónde trabajamos',
    // PROVISIONAL: confirmar con Robert zonas y discovery en sitio.
    zones:
      'Trabajamos con empresas de Buenos Aires, tanto de CABA como del Gran Buenos Aires, y con las del resto del país en remoto. Cuando la operación lo requiere, el discovery se hace en sitio.'
  },

  about: {
    paragraphs: [
      'Nolõ es un estudio argentino de desarrollo de software a medida, con sede en Buenos Aires. Somos un solo equipo de diseño, desarrollo, control de calidad y arquitectura en cada proyecto, y el soporte posterior también es nuestro, sin intermediarios ni subcontratación.',
      'Para operar usamos nuestro propio software. El sistema con el que le damos seguimiento a cada propuesta, cada reunión y cada cliente lo construimos nosotros, con las mismas reglas que aplicamos a los tuyos.'
      // El tipo queda abierto a párrafos por trozos con enlace aunque hoy los dos sean texto plano.
    ] as SoftwareArParagraph[],
    contact:
      'Escribinos a hola@nolo.ar o al +54 9 11 3333-7180. Atendemos de lunes a viernes, de 9 a 18. Sábados y domingos, descansamos.'
  },

  faq: [
    {
      question: '¿Cuánto cuesta desarrollar un software a medida en Argentina?',
      answer:
        'Entre USD 1.500 y 15.000 según el alcance. La mayoría de nuestros proyectos está entre USD 3.000 y 9.000. Un CRM a la medida ronda los USD 2.600 a 8.000 y un ERP de operación e inventario los USD 4.500 a 8.000. Son referencias, nunca tenemos un precio listo porque nunca son soluciones estandarizadas. El precio queda cerrado por alcance antes de empezar, y arriba tenés la tabla completa por tipo de sistema.'
    },
    {
      question: '¿Cuánto tarda?',
      answer:
        'Entre 8 y 13 semanas desde la primera reunión para la mayoría de los sistemas. 2 a 4 semanas de discovery, 5 a 8 de desarrollo y 1 de lanzamiento. Los proyectos multisede o con muchas integraciones llevan de 3 a 5 meses.'
    },
    {
      question: '¿Cómo empezamos?',
      answer:
        'Con una reunión de 30 minutos, sin costo, donde nos contás cómo funciona hoy tu operación. Si tiene sentido, te mandamos una propuesta escrita en 5 días hábiles. El proyecto arranca con el anticipo del discovery.'
    },
    {
      question: '¿El código es mío?',
      answer:
        'Sí. Queda en un repositorio a nombre de tu empresa, con documentación, y la infraestructura también queda a tu nombre. Podés seguir con otro equipo cuando quieras.'
    },
    {
      question: '¿Se integra con lo que ya usamos?',
      answer:
        'Sí. Nos conectamos con tu contabilidad o tu ERP, con facturación electrónica, pasarelas de pago, WhatsApp y las cuentas de Microsoft o Google que tu equipo ya usa. En el discovery definimos qué se integra y cómo.'
    },
    {
      question: '¿Qué pasa con mis planillas y mis datos actuales?',
      answer:
        'Los migramos. Antes de lanzar pasamos tus datos históricos al sistema, los limpiamos y los validamos con vos. Si hay años de información desordenada, lo cotizamos aparte y te decimos cuánto vale la pena rescatar.'
    },
    // PROVISIONAL: confirmar con Robert zonas y discovery en sitio (misma decisión que `zones`).
    {
      question: '¿Trabajan con empresas fuera de Buenos Aires?',
      answer:
        'Sí. Con las empresas del resto del país trabajamos en remoto, con el mismo proceso y los mismos tiempos, y el discovery se hace en sitio cuando la operación lo requiere. La ubicación no cambia el alcance ni el precio.'
    },
    {
      question: '¿Qué pasa después del lanzamiento?',
      answer:
        'Durante el primer año corregimos sin costo cualquier error de lo entregado. La garantía no incluye cambios, mejoras ni modificaciones sobre los alcances del proyecto, eso se cotiza aparte. Después podés contratar un plan de soporte con tiempos de respuesta acordados, o llamarnos solo cuando necesites una mejora.'
    },
    {
      question: '¿Cómo se paga?',
      answer:
        'Anticipo y saldo contra entrega (30/70), pagos por hito según etapas, o una cuota mensual con soporte incluido. Lo definimos en la primera conversación, según lo que le convenga a tu empresa.'
    },
    {
      question: '¿Con qué tecnologías construyen?',
      answer:
        'Principalmente Angular para las pantallas, Node para el servidor y Azure para la infraestructura y la base de datos. También usamos Python, React y otras herramientas cuando el proyecto lo pide. La decisión final se toma en el discovery.'
    },
    {
      question: '¿Y si un sistema enlatado me sirve?',
      answer:
        'Te lo decimos. Si tu proceso es estándar, tenés pocos usuarios y no necesitás integraciones, un producto enlatado bien configurado puede ser mejor y más barato. No tomamos proyectos que no tienen sentido a medida.'
    },
    {
      question: '¿Puedo probar algo antes de decidir?',
      answer:
        'Sí, como ejemplos. Los seis sistemas de demostración de arriba los construimos nosotros para que veas cómo se siente un software hecho alrededor de una operación: el nivel de detalle, la velocidad y cómo resolvemos flujos parecidos al tuyo. No son lo que vas a recibir, porque cada desarrollo es distinto y parte de tu operación y no de una plantilla.'
    }
  ] as FaqItem[]
};

/**
 * Forma del contenido del hub. Sin el `as const` del objeto, `typeof` ensancha los textos a
 * `string` pero conserva la unión de `icon` y el `system?: SystemSlug` de los `as X[]` internos.
 */
export type SoftwareArContent = typeof SOFTWARE_AR;

/**
 * Versión en inglés del hub. Misma forma, mismas claves, mismos largos de lista y mismo orden que
 * `SOFTWARE_AR`; los campos invariantes (`system`, `icon`, `order`, `href`, dígitos de rangos,
 * plazos y stats) se copian tal cual. Inglés escrito con propósito, no traducción literal del
 * español.
 */
export const SOFTWARE_AR_EN: SoftwareArContent = {
  hero: {
    eyebrow: 'Custom software',
    title: 'Custom software development in Argentina',
    lead: 'We are Nolõ, and we build custom software for companies that can no longer hold their operation together with spreadsheets, WhatsApp and workarounds. We do not bend a company to fit a system. We copy how the operation actually works and turn that into software. We build for industry, logistics, healthcare, professional services and retail.',
    // Las dos primeras cifras salen del propio sitio: 6 demos navegables y 7 tipos de sistema con
    // página propia en /software.
    // PROVISIONAL: confirmar con Robert el plazo de 8 a 13 semanas (sale del proceso descrito, no de
    // proyectos medidos).
    stats: [
      { value: '06', label: 'demos you can browse today' },
      { value: '07', label: 'types of system we build' },
      { value: '8 to 13', label: 'weeks from the first meeting to a working system' }
    ],
    ctaPrimary: 'Book a 30-minute meeting',
    ctaSecondary: 'Message us on WhatsApp',
    // PROVISIONAL: plazo de la propuesta.
    promise:
      'After that first meeting we send you a written proposal within 5 business days. Free of charge, with no commitment.',
    updated: 'Updated: September 2026'
  },

  forWhom: {
    intro:
      "We work with companies that have a real operation and a specific problem to solve. If one of these situations sounds like yours, let's talk.",
    fits: [
      'Your operation lives in spreadsheets only one person understands. The day that person is out, everything stops.',
      'Orders, appointments or quotes arrive over WhatsApp, and someone retypes them somewhere else, every single day.',
      'You bought an off-the-shelf system, and your team keeps parallel spreadsheets on the side, because the system does not match how they sell or dispatch.',
      'You run two or more branches, warehouses or crews, and nobody sees the inventory or the real state of things at the same time.',
      'Your accounting software or your ERP handles invoicing well, but leaves the operational side out: production, maintenance, routes, commissions, collections.',
      'You need customers to handle something on their own, book a slot, pay, buy a ticket or check where their order stands.'
    ],
    notFor:
      'If what you are after is a generic app to sell in the app stores, or a product for the mass market, we are not your best option. We will say so on the first call.'
  },

  how: {
    statement: [
      'Most software asks the company to change. To enter data the way the system wants it, to follow the steps the system defines, to give up the exceptions that keep the business running.',
      'We do the opposite. First we learn how your operation actually runs, who does what, in what order, under which rules and with which exceptions. Only then do we write the code around it.'
    ],
    examplesTitle: 'Three examples of what that means in practice',
    examples: [
      {
        if: 'If your warehouse dispatches in batches and your sales reps earn their commission when the customer pays, not when they sign,',
        then: 'the system dispatches in batches and books the commission when the payment lands. Not the other way around.'
      },
      {
        if: 'If your wholesale customers have different price lists and payment terms negotiated one by one,',
        then: "those terms live inside the system, not in your sales manager's head."
      },
      {
        if: 'If your clinic schedules by practitioner, by room and by equipment,',
        then: 'availability is worked out from all three at once, because that is how your clinic runs.'
      }
    ],
    closing: [
      'That has a cost. Understanding the operation before building anything takes time, which is why discovery is the first stage of the project and also the most important one.',
      'And it has a payoff you notice on day one. Your team adopts the system without pushback, because it speaks their language.'
    ]
  },

  systems: {
    intro:
      "Every type of system has a full demo you can browse with sample data. Our clients' systems are under confidentiality and are not shown, so we built these ourselves to let you feel what software shaped around an operation is like. They are examples, not the build you will receive, since every project starts from your own operation and ends up different. This page covers software only. Websites and online stores belong to the web side of the studio.",
    integrationsTitle: 'It connects with what you already use in Argentina',
    integrationsIntro:
      'A custom system does not replace what you already have, it plugs into it. These are the integrations we get asked for most often and have already solved in real projects.',
    // PROVISIONAL: confirmar cuáles están hechas antes de publicar.
    integrations: [
      {
        icon: 'receipt',
        text: "Electronic invoicing with ARCA, Argentina's tax authority, formerly AFIP. The system issues and receives invoices without leaving the operation."
      },
      {
        icon: 'credit-card',
        text: 'Mercado Pago and bank transfers, so you can take payments online.'
      },
      {
        icon: 'message-circle',
        text: 'WhatsApp Business: orders, confirmations and customer service with a bot and artificial intelligence, inside the same system.'
      },
      {
        icon: 'calculator',
        text: 'Your current accounting software or ERP, so the operation and the invoicing stop living in separate worlds.'
      },
      {
        icon: 'calendar-days',
        text: 'Mail, calendar and user accounts from Microsoft 365 or Google Workspace, so your team signs in with the account it already has.'
      },
      {
        icon: 'key-round',
        text: 'Customer accounts with their own login, for stores and portals where the customer serves themselves.'
      }
    ]
  },

  pricing: {
    lead: 'A custom system with us runs from USD 1,500 to 15,000, depending on scope. Most of what we quoted over the last twelve months lands between USD 3,000 and 9,000. These are the ranges by system type, worked out from our 2026 proposals.',
    columns: ['System type', 'Investment (USD)*', 'Typical timeline*'],
    rows: [
      { type: 'Internal tool for a single flow (settlements, commissions, visit tracking)', range: '1,500 to 4,000*', timeline: '4 to 6 weeks*' },
      { type: 'Custom CRM', system: 'crm-a-medida', range: '2,600 to 8,000*', timeline: '6 to 10 weeks*' },
      { type: 'E-commerce with its own logic', system: 'ecommerce-logica-propia', range: '1,600 to 3,500*', timeline: '6 to 10 weeks*' },
      { type: 'Booking, scheduling or clinic management', system: 'reservas-y-agenda', range: '4,000 to 9,000*', timeline: '8 to 12 weeks*' },
      { type: 'Own-brand ticketing', system: 'ticketing-marca-propia', range: '2,800 to 6,000*', timeline: '8 to 12 weeks*' },
      { type: 'Operations & inventory ERP', system: 'erp-operacion-inventario', range: '4,500 to 8,000*', timeline: '10 to 14 weeks*' },
      { type: 'Applied AI automation', system: 'automatizacion-ia', range: '2,000 to 5,000*', timeline: '4 to 10 weeks*' },
      { type: 'Full platform or multi-site system', range: '9,000 to 15,000 or more*', timeline: '3 to 5 months*' }
    ],
    // Misma nota, una sola redacción en inglés: acá, en `costDisclaimer` de las fichas y en
    // `costNote` de la página de sistema.
    note:
      '* Reference ranges and timelines. Every project is quoted by its scope. We never have a ready-made price, because these are never standardized solutions.',
    factorsTitle: 'What moves the price inside each range',
    factors: [
      'How many flows and how many different roles the system serves. One module with two roles is not the same job as five modules for management, warehouse, sales and customers.',
      'Integrations. Every external service it has to talk to (invoicing, payments, WhatsApp, your ERP) adds build time and testing.',
      'Data migration. Pulling in years of spreadsheets or an old system, then cleaning and validating all of it.',
      'Field use. Whether technicians or sales reps work from a phone, with no signal, taking photos.',
      'Artificial intelligence. Reading documents or audio, or classifying records automatically.'
    ],
    paymentTitle: 'How you pay',
    payment:
      'The price is closed by scope before we start. If the scope shifts along the way, we quote the change separately and you decide. The schemes we use most are a deposit with the balance on delivery (30/70), milestone payments by stage, or a monthly fee with support included when a large upfront investment does not suit you. The project starts with the discovery deposit.',
    afterTitle: 'What you pay afterward',
    // PROVISIONAL: rango de infraestructura.
    after:
      'The infrastructure is in your name and paid straight to the provider, between USD 20 and 80 a month for most builds, a bit more when they lean heavily on artificial intelligence. Support with agreed response times is optional and gets quoted at closing.'
  },

  process: {
    title: 'Timelines and process',
    intro:
      'From the first conversation to software running inside your operation. Four stages, with real timelines and one concrete deliverable at the end of each.',
    stages: [
      {
        order: '01',
        name: 'First contact',
        duration: 'Today',
        description:
          'We work out what you need to solve and whether building it custom makes sense at all. Deliverable: a first estimated scope and a date to sit down together.'
      },
      {
        order: '02',
        name: 'Discovery',
        duration: '2 to 4 weeks',
        description:
          'We map the real flow of your operation with the people who run it, and settle rules, roles, exceptions, integrations and architecture. Deliverable: the map of your operation, the final scope and a proposal closed on price and timeline.'
      },
      {
        order: '03',
        name: 'Development',
        duration: '5 to 8 weeks',
        description:
          'We build the system module by module. Every two weeks your team tries what already works in a test environment and corrects us with real data. Deliverable: working modules, signed off by the people who will use them.'
      },
      {
        order: '04',
        name: 'Launch',
        duration: '1 week',
        description:
          'We move the system into production, train the team role by role and stay close through the first weeks of use. Deliverable: the software running in your operation, with the team working inside it.'
      }
    ],
    closing:
      'All in, between 8 and 13 weeks from the first meeting. Multi-site projects, or ones with many integrations, take 3 to 5 months, and you know that at discovery rather than halfway through.'
  },

  included: {
    items: [
      {
        title: 'The code is yours.',
        body: 'It lives in a repository under your company name, documented. If you want to carry on with another team tomorrow, you can.'
      },
      {
        title: 'The infrastructure is yours.',
        body: 'The cloud accounts are in your name and the monthly bill goes to you. We administer it for as long as you want us to.'
      },
      {
        title: 'Training and follow-up.',
        body: 'We train every team on the system and stay close through the first weeks of use. No manuals. You learn it by using it, with us beside you.'
      },
      {
        // PROVISIONAL: plazo de garantía.
        title: 'A one-year warranty on what we deliver.',
        body: 'For the first year we fix any error in what was delivered, at no cost. It does not cover changes, improvements or modifications to what the project scope set out.'
      },
      {
        title: 'Support afterward.',
        body: 'Plans with agreed response times for questions, errors and improvements as the operation changes. Agreed at closing, and never mandatory.'
      },
      {
        title: 'What it does not include.',
        body: 'Third-party licenses (payment gateways, WhatsApp Business, AI tools), hardware or devices, and the work of cleaning up historical records, which we quote separately when it is needed.'
      }
    ]
  },

  choose: {
    intro:
      'There are good software companies in Argentina, and not all of them are good at the same thing. Before you hire anyone, us included, check these seven things.',
    items: [
      { title: 'Ask to browse something they built, even a demo.', body: 'A slide deck will not tell you how their software feels to use. A demo will, even when it is not your system.' },
      { title: 'Ask who will sit down with your team.', body: 'When the person selling is not the person who will understand the operation, discovery leaks away.' },
      { title: 'Insist on a closed price and timeline before anything starts.', body: '"It depends" belongs on the first call, not in the proposal.' },
      { title: 'Confirm who owns the code and where it lives.', body: 'If the code is not yours, you are not buying a system. You are renting one.' },
      { title: 'Ask what happens the day after launch.', body: 'Who fixes errors, how fast, and at what cost.' },
      { title: 'Ask for a real reference.', body: 'A client you can call to ask what working with them was like, and what happens when something breaks.' },
      { title: 'Be wary of a company that never says no.', body: 'A serious one will tell you when an off-the-shelf product fits you better and costs you less.' }
    ],
    honestTitle: 'Custom is not always the right call.',
    honest:
      'If your process is standard, fewer than five people will use it and nothing needs integrating, a well-configured off-the-shelf product may be the better decision. We will say so in the first meeting.'
  },

  industries: {
    heading: 'We build it for your industry',
    intro:
      'We build systems for physical operations and for teams working in the field, on the plant floor or at the counter. Open your industry and see what software would make sense for the way you operate.',
    zonesTitle: 'Where we work',
    // PROVISIONAL: confirmar con Robert zonas y discovery en sitio.
    zones:
      'We work with companies in Buenos Aires, both the city itself and the greater metro area, and remotely with those in the rest of the country. When the operation calls for it, discovery happens on site.'
  },

  about: {
    paragraphs: [
      'Nolõ is an Argentine custom software development studio, based in Buenos Aires. We are a single team covering design, development, quality assurance and architecture on every project, and the support afterwards is ours too, with no intermediaries and no subcontracting.',
      'We run on our own software. The system we use to track every proposal, every meeting and every client was built by us, under the same rules we apply to yours.'
    ],
    contact:
      'Write to us at hola@nolo.ar or +54 9 11 3333-7180. We are available Monday to Friday, 9am to 6pm. Saturdays and Sundays, we rest.'
  },

  faq: [
    {
      question: 'How much does custom software development cost in Argentina?',
      answer:
        'Between USD 1,500 and 15,000, depending on scope. Most of our projects land between USD 3,000 and 9,000. A custom CRM runs around USD 2,600 to 8,000, and an operations and inventory ERP around USD 4,500 to 8,000. Treat those as references: we never have a ready-made price, because these are never standardized solutions. The price is closed by scope before we start, and the full table by system type is above.'
    },
    {
      question: 'How long does it take?',
      answer:
        'Between 8 and 13 weeks from the first meeting for most builds. 2 to 4 weeks of discovery, 5 to 8 of development and 1 for launch. Multi-site projects, or ones with many integrations, take 3 to 5 months.'
    },
    {
      question: 'How do we start?',
      answer:
        'With a free 30-minute meeting where you walk us through how the operation works today. If it makes sense, a written proposal follows within 5 business days. The project starts with the discovery deposit.'
    },
    {
      question: 'Is the code mine?',
      answer:
        'Yes. It lives in a repository under your company name, documented, and the infrastructure is in your name as well. You can carry on with another team whenever you want.'
    },
    {
      question: 'Does it integrate with what we already use?',
      answer:
        'Yes. We connect to your accounting software or your ERP, to electronic invoicing, payment gateways, WhatsApp and the Microsoft or Google accounts your team already signs in with. Discovery settles what gets integrated and how.'
    },
    {
      question: 'What happens to our spreadsheets and our current data?',
      answer:
        'We migrate them. Before launch we move your historical data into the system, clean it and validate it with you. When there are years of messy records, we quote that separately and tell you how much is worth rescuing.'
    },
    // PROVISIONAL: confirmar con Robert zonas y discovery en sitio (misma decisión que `zones`).
    {
      question: 'Do you work with companies outside Buenos Aires?',
      answer:
        'Yes. With those in the rest of the country we work remotely, with the same process and the same timelines, and discovery happens on site when the operation calls for it. Location changes neither the scope nor the price.'
    },
    {
      question: 'What happens after launch?',
      answer:
        'For the first year we fix any error in what was delivered, at no cost. The warranty does not cover changes, improvements or modifications to the project scope, which are quoted separately. After that you can take a support plan with agreed response times, or call us only when you need an improvement.'
    },
    {
      question: 'How do I pay?',
      answer:
        'A deposit with the balance on delivery (30/70), milestone payments by stage, or a monthly fee with support included. We settle it in the first conversation, based on what suits your company best.'
    },
    {
      question: 'What technologies do you build with?',
      answer:
        'Mainly Angular for the screens, Node for the server and Azure for the infrastructure and the database. Python, React and other tools come in when a project calls for them. The final call is made during discovery.'
    },
    {
      question: 'What if an off-the-shelf system works for me?',
      answer:
        'We will tell you. If your process is standard, the user count is low and nothing needs integrating, a well-configured off-the-shelf product may be better and cheaper. We do not take on projects that make no sense as custom builds.'
    },
    {
      question: 'Can I try something before deciding?',
      answer:
        'Yes, as examples. We built the six demo systems above ourselves so you can feel what software shaped around an operation is like: the level of detail, the speed, and how we solve flows close to yours. They are not what you will receive, since every build is different and starts from your operation rather than from a template.'
    }
  ]
};

/** Rótulos de las secciones (títulos de la página). */
export const SOFTWARE_AR_LABELS = {
  forWhom: 'Esta página es para vos si',
  how: 'Cómo trabajamos: copiamos tu operación, no al revés',
  systems: 'Qué construimos: sistemas que podés probar',
  pricing: 'Cuánto cuesta desarrollar software a medida en Argentina',
  included: 'Qué incluye y de quién es',
  choose: 'Cómo elegir una empresa de desarrollo de software en Argentina',
  about: 'Quiénes somos',
  faq: 'Preguntas frecuentes',
  fitsTag: 'Te reconocés',
  notForTag: 'No somos la opción',
  systemLink: 'Ver el sistema',
  exampleIf: 'Si',
  exampleThen: 'entonces'
} as const;

export type SoftwareArLabels = Record<keyof typeof SOFTWARE_AR_LABELS, string>;

/** Rótulos de las secciones en inglés: cortos y en sentence case, como `SECTION_LABELS.en`. */
export const SOFTWARE_AR_LABELS_EN: SoftwareArLabels = {
  forWhom: 'This page is for you if',
  how: 'How we work: we copy your operation, not the other way around',
  systems: 'What we build: systems you can try',
  pricing: 'What custom software development costs in Argentina',
  included: 'What is included and who owns it',
  choose: 'How to choose a software development company in Argentina',
  about: 'Who we are',
  faq: 'Frequently asked questions',
  fitsTag: 'Sounds like you',
  notForTag: 'Not the right fit',
  systemLink: 'See the system',
  exampleIf: 'If',
  exampleThen: 'then'
};

/** Contenido del hub en el idioma pedido: 'en' da `SOFTWARE_AR_EN`, cualquier otro el ES. */
export function getSoftwareArContent(lang: Lang): SoftwareArContent {
  return lang === 'en' ? SOFTWARE_AR_EN : SOFTWARE_AR;
}

/** Rótulos de sección en el idioma pedido. */
export function getSoftwareArLabels(lang: Lang): SoftwareArLabels {
  return lang === 'en' ? SOFTWARE_AR_LABELS_EN : SOFTWARE_AR_LABELS;
}

/**
 * Fila de precios del hub para una página de tipo de sistema, en el idioma pedido; null si no
 * tiene fila propia.
 */
export function getSoftwareArPriceForSystem(system: string | null, lang: Lang): SoftwareArPriceRow | null {
  return getSoftwareArContent(lang).pricing.rows.find((r) => r.system === system) ?? null;
}
