import { FaqItem } from '../components/faq-accordion.component';

// ─────────────────────────────────────────────────────────────────────────────
// Contenido de las páginas de detalle de cada sistema de software (Sowe).
// Fuente única de verdad: transcrito VERBATIM de contenido-sistemas-software.md
// (voseo argentino, tildes). No editar el copy "a ojo"; está aprobado.
//
// Cada sistema tiene la MISMA estructura de 9 secciones. La página
// (system-detail-page.ts) resuelve el sistema por slug + idioma global.
// ─────────────────────────────────────────────────────────────────────────────

/** Un bullet de la sección "Qué hace": una frase de acción + (opcional) beneficio. */
export type SystemDoFeature = {
  action: string;
  benefit: string;
};

/** Las 9 secciones de un sistema, en un idioma. */
export type SystemDetail = {
  slug: SystemSlug;
  /** Título de la página / nombre del sistema. */
  name: string;
  /** 01 — Qué es (1 párrafo). */
  whatItIs: string;
  /** 02 — Qué problema resuelve (2 párrafos). */
  problem: [string, string];
  /** 03 — Cuándo tiene sentido (2 "tiene sentido cuando…" + 1 "si… todavía no"). */
  whenItFits: { fits: [string, string]; notYet: string };
  /** 04 — Qué hace (5 bullets acción + beneficio). */
  doFeatures: SystemDoFeature[];
  /** 05 — Con qué se conecta (2 párrafos). */
  connects: [string, string];
  /** 06 — Qué no es (2 párrafos). */
  notWhat: [string, string];
  /** 07 — Cómo lo construimos (3 párrafos). */
  howWeBuild: [string, string, string];
  /** 08 — Verlo funcionando (3 párrafos; el último cierra con el CTA "escribinos"). */
  seeItWork: [string, string, string];
  /** 09 — Preguntas frecuentes (3 Q&A). */
  faq: [FaqItem, FaqItem, FaqItem];
};

export type SystemSlug =
  | 'crm-a-medida'
  | 'erp-operacion-inventario'
  | 'ecommerce-logica-propia'
  | 'ticketing-marca-propia'
  | 'reservas-y-agenda'
  | 'dashboards-y-reporting'
  | 'automatizacion-ia';

// "Verlo funcionando" es idéntico en los 7 sistemas → constante compartida.
const SEE_IT_WORK_ES: [string, string, string] = [
  'No mostramos sistemas de clientes. Cada desarrollo está bajo acuerdo de confidencialidad.',
  'Lo que sí hacemos es conversar sobre tu operación y mostrarte, en una versión navegable, cómo funciona un sistema hecho a medida.',
  'Si querés verlo, escribinos.'
];

const SEE_IT_WORK_EN: [string, string, string] = [
  "We don't show client systems. Every build is under a confidentiality agreement.",
  'What we do is talk through your operation and show you, in a navigable version, how a custom-built system works.',
  'If you want to see one, get in touch.'
];

export const SYSTEMS_CONTENT: Record<SystemSlug, { es: SystemDetail; en: SystemDetail }> = {
  // ───────────────────────────────────────────────────────────────────────────
  'crm-a-medida': {
    es: {
      slug: 'crm-a-medida',
      name: 'CRM a la medida',
      whatItIs:
        'Un CRM a la medida es un sistema de gestión comercial construido sobre el proceso de venta real de tu empresa. No es una plantilla que se configura. Se diseña a partir de cómo vende tu equipo: tus etapas, tus criterios y tus canales.',
      problem: [
        'El equipo comercial trabaja con la información dispersa. Los mensajes están en WhatsApp, los correos en otra parte, las llamadas sin registrar y el seguimiento en una planilla que cada uno completa a su manera.',
        'Esa dispersión hace que se pierdan oportunidades y que nadie sepa con certeza en qué etapa está cada venta. El CRM concentra todo el proceso en un solo lugar, con un historial por cliente.'
      ],
      whenItFits: {
        fits: [
          'Tiene sentido cuando tu equipo atiende consultas por varios canales y pierde el hilo entre uno y otro.',
          'También cuando la venta no se cierra en un solo paso, sino que es un proceso con etapas, donde importa saber qué se habló, cuándo y qué sigue.'
        ],
        notYet:
          'Si vendés con un formulario simple y sin seguimiento posterior, probablemente todavía no lo necesites.'
      },
      doFeatures: [
        {
          action: 'Centraliza WhatsApp, correo y llamadas en un historial único por cliente.',
          benefit: 'Cualquiera del equipo retoma una conversación sin pedir contexto.'
        },
        {
          action: 'Ordena cada oportunidad por etapa de venta.',
          benefit: 'Sabés en qué punto está cada negocio sin tener que preguntar.'
        },
        {
          action: 'Asigna responsables y recordatorios automáticos.',
          benefit: 'Ningún lead queda sin respuesta por un olvido.'
        },
        {
          action: 'Arma cotizaciones según los criterios comerciales que definís, no con plantillas fijas.',
          benefit: ''
        },
        {
          action: 'Registra por qué se gana o se pierde cada venta.',
          benefit: 'Las decisiones se toman con datos, no con percepción.'
        }
      ],
      connects: [
        'Se conecta con los canales por donde ya entran tus consultas: WhatsApp, correo y los formularios del sitio.',
        'Si usás otros sistemas internos, la integración se evalúa caso por caso. Lo que es estándar entra en el desarrollo. Conectar un sistema externo se define y se cotiza como módulo aparte.'
      ],
      notWhat: [
        'No es una herramienta de marketing masivo ni un enviador de campañas. Es un sistema operativo de venta: ordena el proceso, no automatiza publicidad.',
        'Tampoco reemplaza a tu equipo comercial. Le saca de encima la carga administrativa para que se concentre en vender.'
      ],
      howWeBuild: [
        'Primero definimos el sistema, después escribimos código. Mapeamos tu proceso de venta real, las etapas, los responsables y los criterios, antes de programar nada.',
        'Se construye por módulos. Podés empezar por el núcleo y sumar el resto después, sin rehacer lo anterior.',
        'La tecnología puntual se decide en la etapa de discovery, según lo que tu operación necesita. No partimos de una herramienta fija a la que después haya que amoldarse.'
      ],
      seeItWork: SEE_IT_WORK_ES,
      faq: [
        {
          question: '¿Pueden migrar la información de nuestro CRM actual?',
          answer:
            'Sí. Si hoy usás otra herramienta o una planilla, revisamos cómo están estructurados esos datos y los migramos al sistema nuevo. El alcance de la migración se define en el discovery, porque depende de qué tan ordenados estén hoy.'
        },
        {
          question: '¿Cuánto tarda en estar funcionando?',
          answer:
            'Depende del alcance, que se cierra en el discovery. Como trabajamos por módulos y entregas por etapas, empezás a usar el núcleo del sistema antes de que esté completo el total.'
        },
        {
          question: '¿Qué pasa si nuestro proceso de venta cambia con el tiempo?',
          answer:
            'Como corre sobre código propio, el sistema se ajusta cuando cambia tu operación. Los cambios sobre lo ya entregado se cotizan como trabajo puntual.'
        }
      ]
    },
    en: {
      slug: 'crm-a-medida',
      name: 'Custom CRM',
      whatItIs:
        "A custom CRM is a sales management system built on your company's real sales process. It is not a template you configure. It is designed around how your team actually sells: your stages, your criteria and your channels.",
      problem: [
        'Your sales team works with information scattered everywhere. Messages live in WhatsApp, emails somewhere else, calls go unlogged, and follow-up sits in a spreadsheet that everyone fills in their own way.',
        'That scatter means lost opportunities and no one knowing for sure what stage each deal is in. The CRM brings the whole process into one place, with a single history per client.'
      ],
      whenItFits: {
        fits: [
          'It makes sense when your team handles inquiries across several channels and loses track between them.',
          'It also makes sense when a sale does not close in a single step, but runs as a process with stages, where it matters to know what was said, when, and what comes next.'
        ],
        notYet: 'If you sell through a simple form with no follow-up, you probably do not need it yet.'
      },
      doFeatures: [
        {
          action: 'Centralizes WhatsApp, email and calls into a single history per client.',
          benefit: 'Anyone on the team can pick up a conversation without asking for context.'
        },
        {
          action: 'Sorts every opportunity by sales stage.',
          benefit: 'You know where each deal stands without having to ask.'
        },
        {
          action: 'Assigns owners and automatic reminders.',
          benefit: 'No lead goes unanswered because someone forgot.'
        },
        {
          action: 'Builds quotes following the commercial criteria you define, not fixed templates.',
          benefit: ''
        },
        {
          action: 'Records why each sale is won or lost.',
          benefit: 'Decisions get made on data, not on gut feeling.'
        }
      ],
      connects: [
        'It connects with the channels your inquiries already come through: WhatsApp, email and the forms on your site.',
        'If you use other internal systems, the integration is assessed case by case. What is standard is part of the build. Connecting an external system is defined and quoted as a separate module.'
      ],
      notWhat: [
        'It is not a mass marketing tool or a campaign sender. It is an operational sales system: it organizes the process, it does not automate advertising.',
        'It also does not replace your sales team. It takes the administrative load off them so they can focus on selling.'
      ],
      howWeBuild: [
        'First we define the system, then we write code. We map your real sales process, the stages, the owners and the criteria, before programming anything.',
        'It is built in modules. You can start with the core and add the rest later, without redoing what came before.',
        'The specific technology is decided during discovery, based on what your operation needs. We do not start from a fixed tool you then have to adapt to.'
      ],
      seeItWork: SEE_IT_WORK_EN,
      faq: [
        {
          question: 'Can you migrate the data from our current CRM?',
          answer:
            'Yes. If you use another tool or a spreadsheet today, we review how that data is structured and migrate it to the new system. The scope of the migration is defined during discovery, because it depends on how organized that data is now.'
        },
        {
          question: 'How long until it is up and running?',
          answer:
            'It depends on the scope, which is set during discovery. Since we work in modules and deliver in stages, you start using the core of the system before the whole thing is finished.'
        },
        {
          question: 'What if our sales process changes over time?',
          answer:
            'Because it runs on its own code, the system adjusts when your operation changes. Changes to what is already delivered are quoted as specific work.'
        }
      ]
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  'erp-operacion-inventario': {
    es: {
      slug: 'erp-operacion-inventario',
      name: 'ERP de operación e inventario',
      whatItIs:
        'Un ERP de operación e inventario es un sistema que controla el stock y los movimientos de mercadería de tu empresa en un solo lugar. Se construye sobre cómo opera tu negocio: tus depósitos, tus sucursales y la forma real en que entra y sale el producto.',
      problem: [
        'El stock se controla con planillas que se actualizan tarde y no siempre coinciden con lo que hay en el depósito. Cuando hay varias sucursales, cada una lleva su propio registro y nadie ve el total.',
        'Esa falta de control genera quiebres de stock, mercadería inmovilizada y decisiones tomadas sobre datos viejos. El ERP mantiene el inventario vivo: cada movimiento queda registrado en el momento en que ocurre.'
      ],
      whenItFits: {
        fits: [
          'Tiene sentido cuando manejás stock en más de un depósito o sucursal y necesitás ver el total sin sumar planillas a mano.',
          'También cuando la mercadería se mueve entre puntos y perdés el rastro de qué hay, dónde y desde cuándo.'
        ],
        notYet: 'Si tenés un solo punto y bajo volumen, una planilla todavía puede alcanzarte.'
      },
      doFeatures: [
        {
          action: 'Controla el stock por depósito y por sucursal.',
          benefit: 'Ves el total y el detalle de cada punto sin consolidar nada a mano.'
        },
        {
          action: 'Registra cada entrada, salida y transferencia entre depósitos.',
          benefit: 'El inventario refleja lo que pasó, no lo que alguien recuerda haber cargado.'
        },
        {
          action: 'Deja trazabilidad de cada movimiento: qué se movió, cuándo, quién y hacia dónde.',
          benefit: 'Cuando algo no cuadra, hay con qué reconstruirlo.'
        },
        {
          action: 'Gestiona la recepción de mercadería y la preparación de despachos.',
          benefit: 'Lo que entra y lo que sale pasa por el mismo sistema.'
        },
        {
          action: 'Avisa cuando un producto llega al mínimo definido.',
          benefit: 'La reposición se planifica antes del quiebre, no después.'
        }
      ],
      connects: [
        'Se conecta con los puntos donde ya se genera movimiento: tu operación de ventas, tus depósitos y los equipos que cargan o despachan mercadería.',
        'Si usás otros sistemas internos, la integración se evalúa caso por caso. Lo que es estándar entra en el desarrollo. Conectar un sistema externo se define y se cotiza como módulo aparte.'
      ],
      notWhat: [
        'No es una app de inventario genérica que se configura y a la que después hay que amoldar la operación. Se construye al revés: primero tu operación, después el sistema.',
        'Tampoco es un sistema de contabilidad. Se ocupa del movimiento físico de la mercadería y su trazabilidad, no de los libros.'
      ],
      howWeBuild: [
        'Primero definimos el sistema, después escribimos código. Mapeamos cómo se mueve hoy tu mercadería, los depósitos, los responsables y los controles, antes de programar nada.',
        'Se construye por módulos. Podés empezar por el control de stock y sumar despacho, transferencias o reportes después, sin rehacer lo anterior.',
        'La tecnología puntual se decide en la etapa de discovery, según lo que tu operación necesita. No partimos de una herramienta fija a la que después haya que amoldarse.'
      ],
      seeItWork: SEE_IT_WORK_ES,
      faq: [
        {
          question: '¿Pueden migrar nuestro inventario actual al sistema?',
          answer:
            'Sí. Si hoy llevás el stock en planillas o en otra herramienta, revisamos cómo están estructurados esos datos y los cargamos al sistema nuevo. El alcance de la migración se define en el discovery, porque depende de qué tan ordenados estén hoy.'
        },
        {
          question: '¿Funciona con varios depósitos o sucursales?',
          answer:
            'Sí. El sistema maneja varios puntos a la vez, con su stock propio y la visión consolidada del total. La estructura exacta de depósitos y permisos se define según tu operación.'
        },
        {
          question: '¿Qué pasa si sumamos una sucursal o cambiamos la forma de operar?',
          answer:
            'Como corre sobre código propio, el sistema se ajusta cuando cambia tu operación. Sumar un punto nuevo o un flujo distinto se cotiza como trabajo puntual sobre lo ya entregado.'
        }
      ]
    },
    en: {
      slug: 'erp-operacion-inventario',
      name: 'Operations & inventory ERP',
      whatItIs:
        "An ERP for operations and inventory is a system that controls your company's stock and stock movements in one place. It is built on how your business runs: your warehouses, your branches and the real way product comes in and goes out.",
      problem: [
        "Stock gets tracked in spreadsheets that update late and don't always match what is actually in the warehouse. When there are several branches, each keeps its own record and no one sees the total.",
        'That lack of control leads to stockouts, tied-up inventory and decisions made on old data. The ERP keeps inventory live: every movement is logged the moment it happens.'
      ],
      whenItFits: {
        fits: [
          'It makes sense when you handle stock across more than one warehouse or branch and need to see the total without adding up spreadsheets by hand.',
          'It also makes sense when product moves between locations and you lose track of what is where, and since when.'
        ],
        notYet: 'If you have a single location and low volume, a spreadsheet can still do the job.'
      },
      doFeatures: [
        {
          action: 'Controls stock by warehouse and by branch.',
          benefit: 'You see the total and the detail of each location without consolidating anything by hand.'
        },
        {
          action: 'Logs every entry, exit and transfer between warehouses.',
          benefit: 'Inventory reflects what happened, not what someone remembers entering.'
        },
        {
          action: 'Keeps traceability of every movement: what moved, when, who, and where to.',
          benefit: "When something doesn't add up, there is a way to reconstruct it."
        },
        {
          action: 'Manages goods receiving and dispatch preparation.',
          benefit: 'What comes in and what goes out runs through the same system.'
        },
        {
          action: 'Alerts when a product hits its defined minimum.',
          benefit: 'Restocking gets planned before the shortage, not after.'
        }
      ],
      connects: [
        'It connects with the points where movement already happens: your sales operation, your warehouses and the teams that load or dispatch goods.',
        'If you use other internal systems, the integration is assessed case by case. What is standard is part of the build. Connecting an external system is defined and quoted as a separate module.'
      ],
      notWhat: [
        'It is not a generic inventory app you configure and then bend your operation around. It is built the other way: your operation first, the system second.',
        'It is also not an accounting system. It handles the physical movement of goods and its traceability, not the books.'
      ],
      howWeBuild: [
        'First we define the system, then we write code. We map how your goods move today, the warehouses, the owners and the controls, before programming anything.',
        'It is built in modules. You can start with stock control and add dispatch, transfers or reports later, without redoing what came before.',
        'The specific technology is decided during discovery, based on what your operation needs. We do not start from a fixed tool you then have to adapt to.'
      ],
      seeItWork: SEE_IT_WORK_EN,
      faq: [
        {
          question: 'Can you migrate our current inventory into the system?',
          answer:
            'Yes. If you keep stock in spreadsheets or another tool today, we review how that data is structured and load it into the new system. The scope of the migration is defined during discovery, because it depends on how organized that data is now.'
        },
        {
          question: 'Does it work with several warehouses or branches?',
          answer:
            'Yes. The system handles several locations at once, each with its own stock and a consolidated view of the total. The exact structure of warehouses and permissions is defined around your operation.'
        },
        {
          question: 'What if we add a branch or change how we operate?',
          answer:
            'Because it runs on its own code, the system adjusts when your operation changes. Adding a new location or a different flow is quoted as specific work on top of what is already delivered.'
        }
      ]
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  'ecommerce-logica-propia': {
    es: {
      slug: 'ecommerce-logica-propia',
      name: 'E-commerce con lógica propia',
      whatItIs:
        'Un e-commerce con lógica propia es una tienda en línea construida sobre las reglas comerciales reales de tu negocio. No es una plantilla que se configura. Los tipos de cliente, las listas de precio y las condiciones de venta viven dentro del sistema, no como parches manuales.',
      problem: [
        'Las plataformas de tienda armadas resuelven el caso simple: un producto, un precio, un cliente igual a otro. Cuando tu operación tiene reglas, como precios por tipo de cliente, descuentos por volumen o condiciones según el canal, esas reglas no entran y terminan resolviéndose a mano.',
        'Resolver a mano lo que debería ser automático genera errores, demoras y ventas que dependen de que una persona se acuerde de aplicar la regla. El e-commerce a medida pone esas reglas dentro del sistema.'
      ],
      whenItFits: {
        fits: [
          'Tiene sentido cuando tu forma de vender no entra en una tienda estándar: manejás distintos tipos de cliente, listas de precio o condiciones que cambian según quién compra.',
          'También cuando ya tenés una tienda en una plataforma cerrada y chocaste con su límite, donde lo que necesitás no se puede hacer sin forzar la herramienta.'
        ],
        notYet:
          'Si vendés pocos productos con un precio único para todos, una plataforma estándar probablemente te alcance.'
      },
      doFeatures: [
        {
          action: 'Aplica precios y listas según el tipo de cliente.',
          benefit: 'Cada quien ve lo que le corresponde, sin ajustes manuales en cada pedido.'
        },
        {
          action: 'Maneja descuentos y condiciones comerciales como reglas del sistema.',
          benefit: 'Se aplican solas cuando se cumplen, no dependen de que alguien las recuerde.'
        },
        {
          action: 'Conecta el catálogo con tu stock real.',
          benefit: 'Lo que no hay no se vende. Lo que se vende descuenta del inventario.'
        },
        {
          action: 'Integra los medios de pago que ya usás.',
          benefit: 'El cliente paga como espera pagar, sin pasos de más.'
        },
        {
          action: 'Da un panel propio para gestionar productos, precios y pedidos.',
          benefit: 'Tu equipo opera la tienda sin depender del desarrollador.'
        }
      ],
      connects: [
        'Se conecta con tu inventario para mantener el stock sincronizado, y con los medios de pago que ya usás para cobrar.',
        'Si usás otros sistemas internos, la integración se evalúa caso por caso. Lo que es estándar entra en el desarrollo. Conectar un sistema externo se define y se cotiza como módulo aparte.'
      ],
      notWhat: [
        'No es una tienda armada sobre una plataforma cerrada que se alquila y se adapta. Corre sobre código propio, sin plugins de terceros que después limitan lo que se puede cambiar.',
        'Tampoco es solo una vidriera de productos. Es la lógica comercial de tu negocio funcionando en línea.'
      ],
      howWeBuild: [
        'Primero definimos el sistema, después escribimos código. Mapeamos tus reglas comerciales reales, los tipos de cliente, las condiciones y los descuentos, antes de programar nada.',
        'Se construye por módulos. Podés empezar por el catálogo y el carrito, y sumar reglas, integraciones o panel después, sin rehacer lo anterior.',
        'La tecnología puntual se decide en la etapa de discovery, según lo que tu operación necesita. No partimos de una plataforma fija a la que después haya que amoldarse.'
      ],
      seeItWork: SEE_IT_WORK_ES,
      faq: [
        {
          question: '¿Pueden migrar nuestra tienda actual a un sistema a medida?',
          answer:
            'Sí. Revisamos tu catálogo, tus clientes y tus pedidos actuales, y los migramos al sistema nuevo. El alcance de la migración se define en el discovery, porque depende de en qué plataforma estás hoy y de cómo están esos datos.'
        },
        {
          question: '¿El sistema se conecta con nuestro inventario?',
          answer:
            'Sí. El catálogo se sincroniza con el stock real, así no se vende lo que no hay. Si el inventario vive en otro sistema, esa integración se define según cómo esté armado.'
        },
        {
          question: '¿Podemos sumar reglas comerciales nuevas más adelante?',
          answer:
            'Sí. Como corre sobre código propio, se pueden agregar reglas, listas o condiciones cuando el negocio cambia. Cada agregado sobre lo ya entregado se cotiza como trabajo puntual.'
        }
      ]
    },
    en: {
      slug: 'ecommerce-logica-propia',
      name: 'E-commerce with its own logic',
      whatItIs:
        "An e-commerce with its own logic is an online store built on your business's real commercial rules. It is not a template you configure. Customer types, price lists and sales conditions live inside the system, not as manual patches.",
      problem: [
        "Off-the-shelf store platforms solve the simple case: one product, one price, every customer the same. When your operation has rules, like prices by customer type, volume discounts or conditions that change by channel, those rules don't fit and end up handled by hand.",
        'Handling by hand what should be automatic creates errors, delays and sales that depend on someone remembering to apply the rule. Custom e-commerce puts those rules inside the system.'
      ],
      whenItFits: {
        fits: [
          "It makes sense when the way you sell doesn't fit a standard store: you handle different customer types, price lists or conditions that change depending on who is buying.",
          'It also makes sense when you already have a store on a closed platform and hit its limit, where what you need can\'t be done without forcing the tool.'
        ],
        notYet: 'If you sell a few products at a single price for everyone, a standard platform will probably do.'
      },
      doFeatures: [
        {
          action: 'Applies prices and lists by customer type.',
          benefit: 'Each one sees what applies to them, with no manual adjustments per order.'
        },
        {
          action: 'Handles discounts and commercial conditions as system rules.',
          benefit: "They apply on their own when met, they don't depend on anyone remembering."
        },
        {
          action: 'Connects the catalog to your real stock.',
          benefit: "What's out of stock isn't sold. What sells is deducted from inventory."
        },
        {
          action: 'Integrates the payment methods you already use.',
          benefit: 'The customer pays the way they expect to, with no extra steps.'
        },
        {
          action: 'Gives you your own panel to manage products, prices and orders.',
          benefit: 'Your team runs the store without depending on the developer.'
        }
      ],
      connects: [
        'It connects with your inventory to keep stock in sync, and with the payment methods you already use to collect payment.',
        'If you use other internal systems, the integration is assessed case by case. What is standard is part of the build. Connecting an external system is defined and quoted as a separate module.'
      ],
      notWhat: [
        'It is not a store built on a closed platform that you rent and adapt. It runs on its own code, with no third-party plugins that later limit what you can change.',
        "It is also not just a product showcase. It is your business's commercial logic running online."
      ],
      howWeBuild: [
        'First we define the system, then we write code. We map your real commercial rules, the customer types, the conditions and the discounts, before programming anything.',
        'It is built in modules. You can start with the catalog and cart, and add rules, integrations or a panel later, without redoing what came before.',
        'The specific technology is decided during discovery, based on what your operation needs. We do not start from a fixed platform you then have to adapt to.'
      ],
      seeItWork: SEE_IT_WORK_EN,
      faq: [
        {
          question: 'Can you migrate our current store to a custom system?',
          answer:
            'Yes. We review your current catalog, customers and orders, and migrate them to the new system. The scope of the migration is defined during discovery, because it depends on which platform you are on today and how that data looks.'
        },
        {
          question: 'Does the system connect with our inventory?',
          answer:
            "Yes. The catalog syncs with real stock, so you don't sell what you don't have. If inventory lives in another system, that integration is defined around how it is set up."
        },
        {
          question: 'Can we add new commercial rules later on?',
          answer:
            'Yes. Because it runs on its own code, rules, lists or conditions can be added as the business changes. Each addition on top of what is already delivered is quoted as specific work.'
        }
      ]
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  'ticketing-marca-propia': {
    es: {
      slug: 'ticketing-marca-propia',
      name: 'Ticketing con marca propia',
      whatItIs:
        'Un sistema de ticketing con marca propia es una plataforma de venta de entradas que opera bajo tu marca, no bajo la de una ticketera externa. El público compra desde tu sitio oficial, recibe su entrada con código QR y entra al evento dentro del mismo flujo.\n\nEl sistema tiene dos partes: un panel donde configurás y gestionás las entradas, y una aplicación propia con la que tu equipo lee los QR en el acceso. Las dos se entregan como parte del desarrollo.',
      problem: [
        'Cuando vendés entradas a través de una ticketera externa, la venta pasa por su marca y su plataforma. Los datos de quién compró quedan del lado de un tercero, y por cada entrada vendida la ticketera se lleva una comisión.',
        'Con marca propia, la venta ocurre en tu sitio. Tenés los datos de tu público, el control del evento no depende de una plataforma ajena y te ahorrás la comisión que la ticketera cobra en cada venta.'
      ],
      whenItFits: {
        fits: [
          'Tiene sentido para artistas, productoras y espacios que organizan eventos seguido y quieren dejar de depender de una ticketera externa.',
          'También cuando el volumen es alto: ahí la comisión por entrada y los datos del público dejan de ser un detalle y pasan a pesar.'
        ],
        notYet: 'Si organizás un evento aislado y puntual, una ticketera externa puede resolverte ese caso.'
      },
      doFeatures: [
        {
          action: 'Vende entradas desde tu sitio oficial, con tu marca.',
          benefit: 'El público compra sin salir a una plataforma de terceros.'
        },
        {
          action: 'Maneja tipos de entrada, cupos y precios por evento.',
          benefit: 'Definís las categorías según lo que vendés cada vez.'
        },
        {
          action: 'Emite cada entrada con código QR único, válido para un solo ingreso.',
          benefit: 'Reduce duplicados y reventa.'
        },
        {
          action: 'Lee los QR en la puerta con una aplicación propia que te entregamos.',
          benefit: 'Cada entrada se valida en el momento y queda registro de quién entró.'
        },
        {
          action: 'Reúne ventas, asistentes y accesos en un panel propio.',
          benefit: 'Ves cómo va cada evento sin cruzar planillas.'
        }
      ],
      connects: [
        'Se conecta con los medios de pago que ya usás, para que el cobro de las entradas ocurra en tu sitio y no en una ticketera externa.',
        'Si usás otros sistemas, como tu CRM o tus herramientas de difusión, la integración se evalúa caso por caso. Lo que es estándar entra en el desarrollo. Conectar un sistema externo se define y se cotiza como módulo aparte.'
      ],
      notWhat: [
        'No es una cuenta dentro de una ticketera donde publicás tu evento bajo la marca de otro. Es tu propia plataforma, con tus datos y tu público.',
        'Tampoco es un generador de PDF con un QR suelto. El QR está conectado a la aplicación de acceso, así la entrada se valida en la puerta y no solo se ve en la pantalla.'
      ],
      howWeBuild: [
        'Primero definimos el sistema, después escribimos código. Mapeamos cómo vendés, qué tipos de entrada manejás y cómo controlás el ingreso, antes de programar nada.',
        'Se construye por módulos. Podés empezar por la venta y el QR, y sumar la aplicación de acceso, reportes o integraciones después, sin rehacer lo anterior.',
        'La tecnología puntual se decide en la etapa de discovery, según lo que tu operación necesita. No partimos de una plataforma fija a la que después haya que amoldarse.'
      ],
      seeItWork: SEE_IT_WORK_ES,
      faq: [
        {
          question: '¿El sistema funciona el día del evento, con mucha gente entrando a la vez?',
          answer:
            'Sí. La aplicación de acceso valida cada QR en el momento del ingreso. El comportamiento con alta demanda se contempla en el discovery, según el tamaño y el tipo de evento.'
        },
        {
          question: '¿Nos quedamos con los datos de quienes compran?',
          answer:
            'Sí. Toda la información de ventas y asistentes es tuya y queda dentro de tu plataforma. Esa es la diferencia central frente a una ticketera externa.'
        },
        {
          question: '¿Sirve para varios eventos o solo para uno?',
          answer:
            'Sirve para varios. Cada evento tiene su configuración de entradas, cupos y accesos, y todos se gestionan desde el mismo panel.'
        }
      ]
    },
    en: {
      slug: 'ticketing-marca-propia',
      name: 'Own-brand ticketing',
      whatItIs:
        "A ticketing system with your own brand is a ticket-sales platform that runs under your brand, not under an external ticketing company's. The audience buys from your official site, gets their ticket with a QR code and enters the event within the same flow.\n\nThe system has two parts: a panel where you configure and manage tickets, and a dedicated app your team uses to scan the QR codes at the door. Both are delivered as part of the build.",
      problem: [
        "When you sell tickets through an external ticketing company, the sale goes through their brand and their platform. The data on who bought stays on a third party's side, and for every ticket sold the ticketing company takes a commission.",
        "With your own brand, the sale happens on your site. You hold your audience's data, control of the event doesn't depend on an outside platform, and you save the commission the ticketing company charges on each sale."
      ],
      whenItFits: {
        fits: [
          'It makes sense for artists, producers and venues that run events regularly and want to stop depending on an external ticketing company.',
          "It also makes sense when volume is high: that's where the per-ticket commission and the audience data stop being a detail and start to count."
        ],
        notYet: 'If you are running a single, one-off event, an external ticketing company can solve that case.'
      },
      doFeatures: [
        {
          action: 'Sells tickets from your official site, under your brand.',
          benefit: 'The audience buys without leaving for a third-party platform.'
        },
        {
          action: 'Handles ticket types, capacity and prices per event.',
          benefit: 'You define the categories around what you are selling each time.'
        },
        {
          action: 'Issues each ticket with a unique QR code, valid for a single entry.',
          benefit: 'It cuts down duplicates and resale.'
        },
        {
          action: 'Scans the QR codes at the door through a dedicated app we deliver.',
          benefit: 'Each ticket is validated on the spot and it logs who came in.'
        },
        {
          action: 'Brings sales, attendees and entries together in your own panel.',
          benefit: 'You see how each event is going without cross-checking spreadsheets.'
        }
      ],
      connects: [
        'It connects with the payment methods you already use, so ticket payment happens on your site and not on an external ticketing company.',
        'If you use other systems, like your CRM or your outreach tools, the integration is assessed case by case. What is standard is part of the build. Connecting an external system is defined and quoted as a separate module.'
      ],
      notWhat: [
        "It is not an account inside a ticketing company where you publish your event under someone else's brand. It is your own platform, with your data and your audience.",
        'It is also not a PDF generator with a loose QR. The QR is connected to the access app, so the ticket is validated at the door and not just shown on a screen.'
      ],
      howWeBuild: [
        'First we define the system, then we write code. We map how you sell, what ticket types you handle and how you control entry, before programming anything.',
        'It is built in modules. You can start with sales and the QR, and add the access app, reports or integrations later, without redoing what came before.',
        'The specific technology is decided during discovery, based on what your operation needs. We do not start from a fixed platform you then have to adapt to.'
      ],
      seeItWork: SEE_IT_WORK_EN,
      faq: [
        {
          question: 'Does the system hold up on event day, with a lot of people coming in at once?',
          answer:
            'Yes. The access app validates each QR at the moment of entry. Behavior under high demand is addressed during discovery, based on the size and type of event.'
        },
        {
          question: 'Do we keep the data of the people who buy?',
          answer:
            'Yes. All sales and attendee information is yours and stays inside your platform. That is the core difference compared to an external ticketing company.'
        },
        {
          question: 'Does it work for several events or just one?',
          answer:
            'It works for several. Each event has its own setup of tickets, capacity and access, and they are all managed from the same panel.'
        }
      ]
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  'reservas-y-agenda': {
    es: {
      slug: 'reservas-y-agenda',
      name: 'Plataformas de reservas y agenda',
      whatItIs:
        'Una plataforma de reservas y agenda es un sistema donde tus clientes reservan turnos en línea y cada reserva entra directo a la operación. Muestra la disponibilidad real, toma la reserva y la deja vinculada al cliente, sin pasos manuales en el medio.',
      problem: [
        'Los turnos se toman por WhatsApp, teléfono y una agenda que solo una persona maneja. Esa persona se vuelve el cuello de botella, y cuando no está, nadie sabe qué hay disponible.',
        'Esa forma de trabajar genera turnos pisados, ausencias sin aviso y horas que quedan vacías porque nadie las ofreció a tiempo. El sistema muestra la disponibilidad real y toma la reserva solo, sin depender de que alguien esté para responder.'
      ],
      whenItFits: {
        fits: [
          'Tiene sentido cuando tu negocio funciona por turnos o citas y el volumen ya no entra en una agenda manual.',
          'También cuando tenés varias personas, salas o recursos que reservar a la vez, y coordinar la disponibilidad entre todos se volvió difícil.'
        ],
        notYet: 'Si atendés pocos turnos y los manejás sin problema, todavía no hace falta.'
      },
      doFeatures: [
        {
          action: 'Muestra la disponibilidad real y deja que el cliente reserve solo.',
          benefit: 'Las reservas entran sin que nadie tenga que responder un mensaje.'
        },
        {
          action: 'Actualiza la capacidad en cada reserva.',
          benefit: 'Lo que ya se ocupó deja de ofrecerse, así no se pisan dos turnos.'
        },
        {
          action: 'Envía recordatorios automáticos antes de cada cita.',
          benefit: 'Bajan las ausencias sin que tu equipo tenga que avisar uno por uno.'
        },
        {
          action: 'Deja cada turno vinculado al cliente y a su historial.',
          benefit: 'Sabés quién viene, a qué y cuántas veces ya vino.'
        },
        {
          action: 'Permite cobrar la reserva o una seña en línea, si tu operación lo necesita.',
          benefit: 'Asegura el turno y reduce las ausencias.'
        }
      ],
      connects: [
        'Se conecta con tu calendario y con los medios de pago que ya usás, cuando la reserva incluye un cobro.',
        'Si usás otros sistemas internos, como tu CRM o tu sistema de gestión, la integración se evalúa caso por caso. Lo que es estándar entra en el desarrollo. Conectar un sistema externo se define y se cotiza como módulo aparte.'
      ],
      notWhat: [
        'No es un widget de reservas suelto, conectado por fuera y desconectado del resto. Cada reserva entra a tu operación, no queda en una herramienta aparte que después hay que conciliar.',
        'Tampoco es solo un calendario compartido. Controla disponibilidad, recordatorios y la relación con cada cliente, no solo anota la hora.'
      ],
      howWeBuild: [
        'Primero definimos el sistema, después escribimos código. Mapeamos cómo das turnos hoy, qué recursos se reservan y qué reglas tiene tu disponibilidad, antes de programar nada.',
        'Se construye por módulos. Podés empezar por la agenda y las reservas, y sumar recordatorios, pagos o integraciones después, sin rehacer lo anterior.',
        'La tecnología puntual se decide en la etapa de discovery, según lo que tu operación necesita. No partimos de una herramienta fija a la que después haya que amoldarse.'
      ],
      seeItWork: SEE_IT_WORK_ES,
      faq: [
        {
          question: '¿Maneja varias agendas o recursos al mismo tiempo?',
          answer:
            'Sí. El sistema coordina la disponibilidad de varias personas, salas o recursos a la vez. La estructura exacta se define según cómo trabaja tu operación.'
        },
        {
          question: '¿Los recordatorios se envían solos?',
          answer:
            'Sí. Se configuran una vez y salen automáticamente antes de cada turno. El canal y los tiempos de aviso se definen según lo que mejor funcione con tus clientes.'
        },
        {
          question: '¿Se puede cobrar al momento de reservar?',
          answer:
            'Sí, si tu operación lo necesita. La reserva puede pedir el pago o una seña en línea para confirmar el turno. Si no aplica a tu caso, la reserva funciona sin cobro.'
        }
      ]
    },
    en: {
      slug: 'reservas-y-agenda',
      name: 'Booking & scheduling platforms',
      whatItIs:
        'A booking and scheduling platform is a system where your clients book appointments online and each booking goes straight into your operation. It shows real availability, takes the booking and links it to the client, with no manual steps in between.',
      problem: [
        'Appointments get taken over WhatsApp, by phone, and in a calendar only one person manages. That person becomes the bottleneck, and when they are out, no one knows what is available.',
        'That way of working leads to double-booked slots, no-shows without notice, and hours left empty because no one offered them in time. The system shows real availability and takes the booking on its own, without depending on someone being there to answer.'
      ],
      whenItFits: {
        fits: [
          'It makes sense when your business runs on appointments and the volume no longer fits a manual calendar.',
          'It also makes sense when you have several people, rooms or resources to book at once, and coordinating availability across all of them has become hard.'
        ],
        notYet: "If you handle few appointments and manage them without trouble, you don't need it yet."
      },
      doFeatures: [
        {
          action: 'Shows real availability and lets the client book on their own.',
          benefit: 'Bookings come in without anyone having to answer a message.'
        },
        {
          action: 'Updates capacity with every booking.',
          benefit: "What's already taken stops being offered, so no two appointments overlap."
        },
        {
          action: 'Sends automatic reminders before each appointment.',
          benefit: 'No-shows drop without your team having to notify one by one.'
        },
        {
          action: 'Links each appointment to the client and their history.',
          benefit: 'You know who is coming, for what, and how many times they have come before.'
        },
        {
          action: 'Lets you collect payment or a deposit online, if your operation needs it.',
          benefit: 'It secures the slot and reduces no-shows.'
        }
      ],
      connects: [
        'It connects with your calendar and with the payment methods you already use, when the booking includes a payment.',
        'If you use other internal systems, like your CRM or your management system, the integration is assessed case by case. What is standard is part of the build. Connecting an external system is defined and quoted as a separate module.'
      ],
      notWhat: [
        "It is not a loose booking widget, hooked on from the outside and disconnected from the rest. Each booking goes into your operation, it doesn't sit in a separate tool you then have to reconcile.",
        "It is also not just a shared calendar. It controls availability, reminders and the relationship with each client, it doesn't only note the time."
      ],
      howWeBuild: [
        'First we define the system, then we write code. We map how you take appointments today, what resources get booked and what rules your availability has, before programming anything.',
        'It is built in modules. You can start with the calendar and bookings, and add reminders, payments or integrations later, without redoing what came before.',
        'The specific technology is decided during discovery, based on what your operation needs. We do not start from a fixed tool you then have to adapt to.'
      ],
      seeItWork: SEE_IT_WORK_EN,
      faq: [
        {
          question: 'Does it handle several calendars or resources at once?',
          answer:
            'Yes. The system coordinates the availability of several people, rooms or resources at once. The exact structure is defined around how your operation works.'
        },
        {
          question: 'Do the reminders go out on their own?',
          answer:
            'Yes. They are set up once and go out automatically before each appointment. The channel and timing of the notice are defined around what works best with your clients.'
        },
        {
          question: 'Can payment be collected at the time of booking?',
          answer:
            "Yes, if your operation needs it. The booking can request payment or a deposit online to confirm the slot. If it doesn't apply to your case, booking works without payment."
        }
      ]
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  'dashboards-y-reporting': {
    es: {
      slug: 'dashboards-y-reporting',
      name: 'Dashboards y reporting',
      whatItIs:
        'Un dashboard a medida es un tablero que muestra las métricas de tu operación en tiempo real, alimentado directo desde los sistemas donde se generan los datos. Lo que pasa en la operación se ve en el tablero, sin armar nada a mano.',
      problem: [
        'Los números se arman a fin de mes, en una planilla que alguien llena a mano juntando datos de distintos lados. Para cuando el reporte está listo, ya es tarde para usarlo.',
        'Además, cada área exporta su propia versión y los números no coinciden. Se discute de dónde sale cada dato en lugar de decidir con él. El tablero toma la información directo de la fuente, así todos miran el mismo número actualizado.'
      ],
      whenItFits: {
        fits: [
          'Tiene sentido cuando ya tenés sistemas o datos cargados, pero verlos juntos y al día cuesta trabajo.',
          'También cuando las decisiones dependen de reportes que llegan tarde, o que cada uno arma distinto y terminan sin coincidir.'
        ],
        notYet:
          'Si tu operación todavía no registra esos datos en ningún sistema, primero hay que capturarlos. El tablero muestra lo que existe, no inventa lo que no se está midiendo.'
      },
      doFeatures: [
        {
          action: 'Muestra las métricas clave en tiempo real.',
          benefit: 'Ves el estado de la operación ahora, no a fin de mes.'
        },
        {
          action: 'Toma los datos directo de los sistemas en producción.',
          benefit: 'No hay extractos manuales ni archivos cargados aparte.'
        },
        {
          action: 'Arma los indicadores que importan en tu operación.',
          benefit: 'Se definen con vos, no vienen de una lista genérica.'
        },
        {
          action: 'Genera reportes descargables cuando los necesitás.',
          benefit: 'Sirven para compartir o presentar sin rehacer el trabajo.'
        },
        {
          action: 'Da distintas vistas según el rol.',
          benefit: 'Cada quien ve lo que le sirve para su tarea, sin ruido de más.'
        }
      ],
      connects: [
        'Se conecta con los sistemas donde ya viven tus datos para leerlos en tiempo real.',
        'Cuando esos sistemas los desarrollamos nosotros, la conexión es directa. Cuando el dato vive en un sistema externo, la integración se evalúa caso por caso. Lo que es estándar entra en el desarrollo. Conectar una fuente externa se define y se cotiza como módulo aparte.'
      ],
      notWhat: [
        'No es un reporte que alguien arma a mano cada mes. Los datos entran solos desde la operación, en el momento en que ocurren.',
        'Tampoco es una captura de pantalla ni un PDF que queda viejo apenas se genera. El tablero está vivo: muestra el dato actual cada vez que lo abrís.'
      ],
      howWeBuild: [
        'Primero definimos qué decisiones tenés que tomar y qué métricas las respaldan, después construimos el tablero. Así muestra lo que sirve y no lo que sobra.',
        'Se construye por módulos. Podés empezar por los indicadores principales y sumar vistas, reportes o nuevas fuentes después, sin rehacer lo anterior.',
        'La tecnología puntual se decide en la etapa de discovery, según de dónde haya que leer los datos y cómo estén hoy.'
      ],
      seeItWork: SEE_IT_WORK_ES,
      faq: [
        {
          question: '¿Funciona sobre los sistemas que ya usamos?',
          answer:
            'Sí, si esos sistemas dejan acceder a sus datos. Cuando los sistemas son propios, la conexión es directa. Cuando son externos, depende de qué permitan, y eso se evalúa en el discovery.'
        },
        {
          question: '¿En tiempo real significa al instante?',
          answer:
            'Significa que el tablero muestra el dato actual, sin pasos manuales. La frecuencia exacta de actualización se define según la fuente y lo que tu operación necesita ver.'
        },
        {
          question: '¿Qué pasa si no estamos midiendo algo que queremos ver?',
          answer:
            'Ese dato primero hay que empezar a capturarlo en algún sistema. Si hace falta sumar esa captura, se define y se cotiza como trabajo aparte. El tablero muestra lo que existe.'
        }
      ]
    },
    en: {
      slug: 'dashboards-y-reporting',
      name: 'Dashboards & reporting',
      whatItIs:
        "A custom dashboard is a board that shows your operation's metrics in real time, fed straight from the systems where the data is generated. What happens in the operation shows on the board, without building anything by hand.",
      problem: [
        'The numbers get put together at month end, in a spreadsheet someone fills by hand pulling data from different places. By the time the report is ready, it is already too late to use it.',
        "On top of that, each area exports its own version and the numbers don't match. People argue about where each figure comes from instead of deciding with it. The board pulls the information straight from the source, so everyone looks at the same up-to-date number."
      ],
      whenItFits: {
        fits: [
          'It makes sense when you already have systems or data in place, but seeing it together and current takes real effort.',
          'It also makes sense when decisions depend on reports that arrive late, or that each person builds differently and end up not matching.'
        ],
        notYet:
          "If your operation doesn't record that data in any system yet, it has to be captured first. The board shows what exists, it doesn't invent what isn't being measured."
      },
      doFeatures: [
        {
          action: 'Shows the key metrics in real time.',
          benefit: 'You see the state of the operation now, not at month end.'
        },
        {
          action: 'Pulls the data straight from the systems in production.',
          benefit: 'There are no manual exports or files loaded separately.'
        },
        {
          action: 'Builds the indicators that matter to your operation.',
          benefit: "They are defined with you, they don't come from a generic list."
        },
        {
          action: 'Generates downloadable reports when you need them.',
          benefit: 'They work to share or present without redoing the work.'
        },
        {
          action: 'Offers different views by role.',
          benefit: 'Each person sees what helps their task, with no extra noise.'
        }
      ],
      connects: [
        'It connects with the systems where your data already lives to read it in real time.',
        'When those systems are ones we build, the connection is direct. When the data lives in an external system, the integration is assessed case by case. What is standard is part of the build. Connecting an external source is defined and quoted as a separate module.'
      ],
      notWhat: [
        'It is not a report someone builds by hand each month. The data comes in on its own from the operation, the moment it happens.',
        'It is also not a screenshot or a PDF that goes stale the moment it is generated. The board is live: it shows the current figure every time you open it.'
      ],
      howWeBuild: [
        'First we define what decisions you need to make and what metrics back them, then we build the board. That way it shows what helps and not what is in the way.',
        'It is built in modules. You can start with the main indicators and add views, reports or new sources later, without redoing what came before.',
        'The specific technology is decided during discovery, based on where the data has to be read from and how it looks today.'
      ],
      seeItWork: SEE_IT_WORK_EN,
      faq: [
        {
          question: 'Does it work on the systems we already use?',
          answer:
            'Yes, if those systems allow access to their data. When the systems are ours, the connection is direct. When they are external, it depends on what they allow, and that is assessed during discovery.'
        },
        {
          question: 'Does real time mean instant?',
          answer:
            'It means the board shows the current figure, with no manual steps. The exact refresh frequency is defined around the source and what your operation needs to see.'
        },
        {
          question: 'What if we are not measuring something we want to see?',
          answer:
            'That data first has to start being captured in some system. If that capture needs to be added, it is defined and quoted as separate work. The board shows what exists.'
        }
      ]
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  'automatizacion-ia': {
    es: {
      slug: 'automatizacion-ia',
      name: 'Automatización con IA aplicada',
      whatItIs:
        'La automatización con IA aplicada son flujos que resuelven tareas repetitivas dentro de tu operación: leer un documento, cargar esos datos, clasificarlos y pasarlos al paso siguiente. La IA hace ese trabajo en segundo plano, sin cambiar la forma en que trabaja tu equipo.',
      problem: [
        'Hay tareas que se repiten todos los días y consumen horas: leer un documento y copiar sus datos, completar el mismo formulario, ordenar lo que entra y mandarlo a quien corresponde.',
        'Ese trabajo manual es lento, cansa y se equivoca. La automatización se ocupa de esa parte repetitiva, para que tu equipo dedique el tiempo a lo que sí necesita criterio humano.'
      ],
      whenItFits: {
        fits: [
          'Tiene sentido cuando hay una tarea repetitiva, de volumen, que hoy alguien hace a mano siguiendo siempre los mismos pasos.',
          'Cuanto más clara y repetida es la tarea, mejor la resuelve la automatización. Si el paso depende del criterio de cada caso, ahí sigue decidiendo una persona.'
        ],
        notYet:
          'Si lo que querés automatizar cambia en cada caso y no tiene un patrón, probablemente todavía no sea para automatizar.'
      },
      doFeatures: [
        {
          action: 'Lee documentos y extrae los datos que importan.',
          benefit: 'Lo que antes se transcribía a mano entra solo al sistema.'
        },
        {
          action: 'Completa formularios y planillas repetitivas.',
          benefit: 'El mismo dato deja de cargarse una y otra vez.'
        },
        {
          action: 'Clasifica y ordena lo que entra.',
          benefit: 'Cada cosa va a donde corresponde, sin que alguien lo derive a mano.'
        },
        {
          action: 'Conecta tareas que hoy están sueltas.',
          benefit: 'Lo que terminaba en un paso arranca el siguiente sin intervención.'
        },
        {
          action: 'Trabaja en segundo plano y deja registro de lo que hizo.',
          benefit: 'Podés revisar qué procesó y corregir si algo no cuadra.'
        }
      ],
      connects: [
        'Se conecta con los sistemas y los canales por donde hoy entran esas tareas: tus documentos, tus formularios, tu correo o el sistema donde cargás los datos.',
        'Si la tarea cruza un sistema externo, la integración se evalúa caso por caso. Lo que es estándar entra en el desarrollo. Conectar un sistema externo se define y se cotiza como módulo aparte.'
      ],
      notWhat: [
        'No es un chatbot pegado al sitio ni una función puesta para mostrar que hay IA. Es automatización aplicada a una tarea concreta de tu operación.',
        'Tampoco reemplaza a tu equipo ni la relación con tus clientes. Se ocupa del trabajo repetitivo, no de las decisiones ni del trato que requieren una persona.'
      ],
      howWeBuild: [
        'Primero definimos qué tarea se automatiza y con qué reglas, después escribimos código. Una automatización sirve cuando la tarea está bien entendida, no antes.',
        'Se construye por módulos. Podés empezar por un solo flujo, medir si rinde, y sumar otros después, sin rehacer lo anterior.',
        'La tecnología puntual se decide en la etapa de discovery, según la tarea y los datos con los que trabaja. Elegimos la herramienta por lo que resuelve, no por estar de moda.'
      ],
      seeItWork: SEE_IT_WORK_ES,
      faq: [
        {
          question: '¿La IA toma decisiones por nosotros?',
          answer:
            'No, salvo que vos lo definas para casos muy claros. Por defecto se ocupa de la parte repetitiva y deja la decisión en manos de tu equipo. Dónde interviene y dónde no, se define al armar el flujo.'
        },
        {
          question: '¿Qué pasa si la IA se equivoca?',
          answer:
            'El flujo deja registro de lo que procesó y se diseña con puntos de control para revisar lo que importa. Cuando un caso no es claro, se marca para que lo vea una persona en lugar de resolverlo a ciegas.'
        },
        {
          question: '¿Podemos empezar con una sola tarea?',
          answer:
            'Sí. Lo recomendable es arrancar con un flujo concreto, medir si te ahorra tiempo de verdad, y recién ahí sumar otros. No hace falta automatizar todo de entrada.'
        }
      ]
    },
    en: {
      slug: 'automatizacion-ia',
      name: 'Applied AI automation',
      whatItIs:
        'Automation with applied AI is a set of flows that handle repetitive tasks inside your operation: reading a document, loading that data, classifying it and passing it to the next step. The AI does that work in the background, without changing the way your team works.',
      problem: [
        'There are tasks that repeat every day and eat up hours: reading a document and copying its data, filling in the same form, sorting what comes in and sending it to the right person.',
        'That manual work is slow, tiring and error-prone. Automation takes on the repetitive part, so your team spends its time on what actually needs human judgment.'
      ],
      whenItFits: {
        fits: [
          'It makes sense when there is a repetitive, high-volume task that someone does by hand today, always following the same steps.',
          'The clearer and more repeated the task, the better automation handles it. If the step depends on the judgment of each case, a person still decides there.'
        ],
        notYet:
          'If what you want to automate changes with every case and has no pattern, it is probably not for automation yet.'
      },
      doFeatures: [
        {
          action: 'Reads documents and extracts the data that matters.',
          benefit: 'What used to be transcribed by hand comes into the system on its own.'
        },
        {
          action: 'Fills in repetitive forms and spreadsheets.',
          benefit: 'The same data stops being entered over and over.'
        },
        {
          action: 'Classifies and sorts what comes in.',
          benefit: 'Each thing goes where it belongs, without someone routing it by hand.'
        },
        {
          action: 'Connects tasks that are loose today.',
          benefit: 'What ended one step kicks off the next without intervention.'
        },
        {
          action: 'Works in the background and keeps a record of what it did.',
          benefit: "You can review what it processed and correct it if something doesn't add up."
        }
      ],
      connects: [
        'It connects with the systems and channels where those tasks come in today: your documents, your forms, your email or the system where you load the data.',
        'If the task crosses an external system, the integration is assessed case by case. What is standard is part of the build. Connecting an external system is defined and quoted as a separate module.'
      ],
      notWhat: [
        'It is not a chatbot stuck on the site or a feature added to show there is AI. It is automation applied to a concrete task in your operation.',
        'It also does not replace your team or the relationship with your clients. It takes on the repetitive work, not the decisions or the personal contact that need a person.'
      ],
      howWeBuild: [
        'First we define what task gets automated and with what rules, then we write code. An automation works when the task is well understood, not before.',
        'It is built in modules. You can start with a single flow, measure whether it pays off, and add others later, without redoing what came before.',
        'The specific technology is decided during discovery, based on the task and the data it works with. We choose the tool for what it solves, not for being in fashion.'
      ],
      seeItWork: SEE_IT_WORK_EN,
      faq: [
        {
          question: 'Does the AI make decisions for us?',
          answer:
            "No, unless you define it for very clear cases. By default it handles the repetitive part and leaves the decision with your team. Where it steps in and where it doesn't is defined when the flow is built."
        },
        {
          question: 'What if the AI gets it wrong?',
          answer:
            "The flow keeps a record of what it processed and is designed with checkpoints to review what matters. When a case isn't clear, it is flagged for a person to look at instead of being resolved blindly."
        },
        {
          question: 'Can we start with a single task?',
          answer:
            'Yes. The sensible approach is to start with one concrete flow, measure whether it actually saves you time, and only then add more. There is no need to automate everything from the start.'
        }
      ]
    }
  }
};

/** Resuelve el contenido de un sistema por slug + idioma. null si el slug no existe. */
export function getSystemDetail(slug: string | null, lang: 'es' | 'en'): SystemDetail | null {
  if (!slug) return null;
  const entry = SYSTEMS_CONTENT[slug as SystemSlug];
  return entry ? entry[lang] : null;
}

/** Lista ordenada de slugs (para prerender / sitemap). */
export const SYSTEM_SLUGS: SystemSlug[] = Object.keys(SYSTEMS_CONTENT) as SystemSlug[];
