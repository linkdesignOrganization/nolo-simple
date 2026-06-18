import { Routes } from '@angular/router';

import type { LandingData } from './pages/landing-page';
import { INDUSTRY_CARDS } from './pages/industries-content';

import { langGuard } from './services/lang.guard';

// Páginas en lazy (loadComponent) → cada una es su propio chunk, fuera del bundle inicial.
// El SSG las prerenderiza igual; el cliente solo descarga el chunk de la ruta que visita.

const contactInfo = {
  email: 'hola@nolo.ar',
  whatsappLink: 'https://wa.me/5491133337180',
  // Reunión en cal.com por idioma: ES (reunion-con-nolo) / EN (meeting-with-nolo), para que el
  // user siga su experiencia en el mismo idioma. La conversión de Google no cambia.
  calendarLink: 'https://cal.com/nolo.ar/reunion-con-equipo-nolo',
  calendarLinkEn: 'https://cal.com/nolo.ar/meeting-with-nolo-team'
};

// ────────────────────────────────────────────────────────────────────────────
// HOME
// ────────────────────────────────────────────────────────────────────────────

const homePageEs: LandingData = {
  isHome: true,
  eyebrow: 'Nolõ / 001',
  title: 'Dos brazos. Un mismo criterio para construir software y webs a medida.',
  description:
    'Nolõ separa su oferta en dos entradas claras. Un brazo para software a medida y otro para webs a medida, dentro de una interfaz viva, precisa y con mucho peso tipográfico.',
  homeArms: [
    {
      eyebrow: '/software',
      title: 'Software a la medida',
      body:
        'Construimos software a medida, herramientas internas, integraciones y flujos pensados para equipos, negocio y crecimiento.',
      cta: 'Entrar a Software',
      route: '/software',
      type: 'software'
    },
    {
      eyebrow: '/web',
      title: 'Website a la medida',
      body:
        'Diseñamos webs a medida con identidad propia, performance, SEO y una experiencia visual clara desde el primer scroll.',
      cta: 'Entrar a Web',
      route: '/web',
      type: 'web'
    }
  ],
  stats: [
    { value: '02', label: 'brazos principales' },
    { value: '01', label: 'home de entrada' },
    { value: 'Vivo', label: 'layout con movimiento' }
  ]
};

const homePageEn: LandingData = {
  isHome: true,
  eyebrow: 'Nolõ / 001',
  title: 'Two sides. One standard for building custom software and websites.',
  description:
    'Nolõ splits into two clear entry points: one for custom software, one for custom websites — inside a living, precise, type-heavy interface.',
  homeArms: [
    {
      eyebrow: '/software',
      title: 'Custom software',
      body:
        'We build custom software: internal tools, integrations and flows made for teams, business and growth.',
      cta: 'Go to Software',
      route: '/software',
      type: 'software'
    },
    {
      eyebrow: '/web',
      title: 'Custom websites',
      body:
        'We design custom websites with their own identity — performance, SEO and a clear visual experience from the first scroll.',
      cta: 'Go to Web',
      route: '/web',
      type: 'web'
    }
  ],
  stats: [
    { value: '02', label: 'sides' },
    { value: '01', label: 'one home' },
    { value: 'Live', label: 'layout in motion' }
  ]
};

// ────────────────────────────────────────────────────────────────────────────
// SOFTWARE
// ────────────────────────────────────────────────────────────────────────────

// Sección "Industrias": misma data en /software y /web (por idioma). Copy de conexión (revisable);
// las cards salen de INDUSTRY_CARDS (derivadas del contenido verbatim por-industria).
const industriasSection = {
  heading: 'Lo construimos para tu industria',
  intro:
    'Cada sector opera distinto. Entrá al tuyo y mirá qué software y qué sitio web tendrían sentido para tu operación.',
  items: INDUSTRY_CARDS('es')
};

const industriasSectionEn = {
  heading: 'We build it for your industry',
  intro:
    'Every sector runs differently. Step into yours and see what software and what website would make sense for your operation.',
  items: INDUSTRY_CARDS('en')
};

const softwarePageEs: LandingData = {
  eyebrow: '',
  title: 'Software construido alrededor de tu operación.',
  description:
    'No adaptás tu empresa al software. Construimos el software alrededor de cómo ya funciona tu operación.',
  ctaPrimary: 'Agendar reunión',
  ctaPrimaryLink: contactInfo.calendarLink,
  ctaSecondary: 'Mandar mensaje',
  ctaSecondaryLink: '#hablemos',
  featureTabs: [
    {
      lead: 'Ordená',
      body:
        'la operación que ya tenés sin cambiar cómo trabaja el equipo. Visibilidad, control de costos y alertas reales.',
      videoSrc: '/media/software/ordena.mp4'
    },
    {
      lead: 'Centralizá',
      body:
        'las fichas, los flujos y los datos en un solo sistema. Información clara para vos y tu equipo.',
      videoSrc: '/media/software/centraliza.mp4'
    },
    {
      lead: 'Automatizá',
      body:
        'las tareas que se repiten y las decisiones basadas en datos. IA con criterio operativo, no decoración tecnológica.',
      videoSrc: '/media/software/automatiza.mp4'
    }
  ],
  systems: {
    heading: 'Sistemas que construimos a la medida',
    intro:
      'Cada categoría representa una capacidad real, con sistemas en producción. No vendemos un producto empaquetado.',
    items: [
      {
        title: 'CRM a la medida',
        slug: 'crm-a-medida',
        body:
          'Unificamos WhatsApp, llamadas y correo en un mismo flujo de venta. La cotización se arma con IA según los criterios del negocio, no con plantillas genéricas. El equipo comercial ve en qué etapa está cada lead sin saltar entre herramientas.',
        chips: ['Multicanal', 'Cotización con IA', 'Pipeline visible', 'Historial unificado']
      },
      {
        title: 'ERP de operación e inventario',
        slug: 'erp-operacion-inventario',
        body:
          'Stock por depósito o sucursal, ventas con registro de despacho y trazabilidad completa de cada movimiento. Todo queda en el mismo sistema, con datos vivos en lugar de planillas paralelas. Pensado para que el control no dependa de pasar información de una herramienta a otra.',
        chips: ['Stock multi depósito', 'Despacho', 'Trazabilidad', 'Movimientos en tiempo real']
      },
      {
        title: 'E-commerce con lógica propia',
        slug: 'ecommerce-logica-propia',
        body:
          'Tiendas con reglas comerciales construidas según el modelo del negocio. Tipos de cliente, listas de precio, condiciones de pago y descuentos viven dentro del sistema, no como excepciones manuales. Si la operación cambia, el código cambia con ella.',
        chips: ['Reglas comerciales', 'Tipos de cliente', 'Listas de precio', 'Condiciones de pago']
      },
      {
        title: 'Ticketing con marca propia',
        slug: 'ticketing-marca-propia',
        body:
          'Plataformas de venta de entradas para artistas, productoras y espacios que quieren operar con su propia marca. El público compra desde el sitio oficial, recibe su ticket con QR y accede al evento dentro del mismo flujo. Pagos, ventas, asistentes y control de ingreso quedan centralizados, sin depender de una ticketera externa.',
        chips: ['Marca propia', 'Venta de entradas', 'Tickets con QR', 'Control de acceso']
      },
      {
        title: 'Plataformas de reservas y agenda',
        slug: 'reservas-y-agenda',
        body:
          'Sistemas de reservas con agenda, disponibilidad, recordatorios automáticos y pago en línea integrados a la operación. Cada cita entra al flujo del negocio, actualiza la capacidad disponible y queda vinculada con el cliente. La información no queda atrapada en una herramienta separada que después haya que conciliar.',
        chips: ['Agenda', 'Disponibilidad', 'Recordatorios automáticos', 'Pago en línea']
      },
      // Oculto en /software por ahora (2026-06-15) — NO borrar; descomentar para reactivar.
      /*
      {
        title: 'Dashboards y reporting',
        slug: 'dashboards-y-reporting',
        body:
          'Tableros con métricas en tiempo real y reportes descargables, alimentados directamente desde los sistemas en producción. No son extractos manuales ni archivos cargados aparte. Si el dato existe en la operación, está en el tablero.',
        chips: ['Tiempo real', 'Reportes descargables', 'KPIs configurables', 'Datos en vivo']
      },
      */
      {
        title: 'Automatización con IA aplicada',
        slug: 'automatizacion-ia',
        body:
          'Flujos que leen documentos, completan formularios, clasifican datos y conectan tareas manuales que antes se hacían a mano. La IA opera en segundo plano sin cambiar la forma de trabajar del equipo, y sin reemplazar la relación con el cliente.',
        chips: ['IA aplicada', 'Lectura de documentos', 'Clasificación de datos', 'Procesos automáticos']
      }
    ]
  },
  principles: {
    heading: '/principios de trabajo',
    cards: [
      {
        icon: 'circle-check',
        title: 'Lo que sí hacemos',
        body:
          'Construimos software interno para recuperar control operativo. Aplicaciones a medida con datos centralizados, integraciones sin romper la operación existente y trazabilidad clara.'
      },
      {
        icon: 'route',
        title: 'Cómo trabajamos',
        body:
          'Primero definimos el sistema, después escribimos código. Aterrizamos el flujo real de la operación, las reglas, las integraciones y los puntos de control.'
      },
      {
        icon: 'circle-off',
        title: 'Lo que no hacemos',
        body:
          'No tomamos proyectos sin definición clara ni responsables internos. No vendemos productos enlatados ni apps genéricas. No competimos por precio sacrificando criterio técnico.'
      }
    ]
  },
  showcase: {
    title:
      'Todo lo que un sistema moderno necesita. Porque los enlatados siempre funcionan a medias.',
    features: [
      { icon: 'globe-check', label: 'Online' },
      { icon: 'monitor-smartphone', label: 'Responsive' },
      { icon: 'layout-template', label: 'A medida' },
      { icon: 'cloud-sync', label: 'Tiempo real' },
      { icon: 'users', label: 'Multi usuario' },
      { icon: 'shield-check', label: 'Seguro' },
      { icon: 'blocks', label: 'Escalable' },
      { icon: 'cloud-check', label: 'Cloud' },
      { icon: 'git-compare-arrows', label: 'API' },
      { icon: 'workflow', label: 'Integraciones' },
      { icon: 'building-2', label: 'Multi sede' },
      { icon: 'user-round-key', label: 'Roles' },
      { icon: 'search-check', label: 'Trazable' }
    ]
  },
  process: {
    title: 'Así trabajamos un proyecto.',
    intro:
      'De la primera conversación al sistema funcionando. Cuatro etapas con tiempos reales, sin promesas vacías.',
    stages: [
      {
        order: '01',
        name: 'Primer contacto',
        duration: 'Hoy mismo',
        description:
          'Entendemos qué necesitás resolver, validamos viabilidad y armamos un primer alcance estimado.'
      },
      {
        order: '02',
        name: 'Discovery',
        duration: '2 a 4 semanas',
        description:
          'Mapeamos el flujo real de tu operación, definimos reglas, actores, alcance final y arquitectura del sistema.'
      },
      {
        order: '03',
        name: 'Desarrollo',
        duration: '5 a 8 semanas',
        description:
          'Construimos el sistema por módulos con pruebas continuas y validaciones reales de tu equipo.'
      },
      {
        order: '04',
        name: 'Lanzamiento',
        duration: '1 semana',
        description:
          'Implementamos en producción, acompañamos la adopción y dejamos el sistema funcionando en operación.'
      }
    ]
  },
  viewcases: {
    title: 'Probá un sistema hecho a medida.',
    intro:
      'Cada demo es una versión funcional de un sistema a medida, pensada para que recorrás la operación completa de una industria distinta. Vas a sentir lo simple y rápido que puede ser un software diseñado específicamente para cómo trabajás.',
    items: [
      { label: 'Cumbre', category: 'Sistema de gestión de RRHH', videoSrc: '/media/software/cumbre.mp4', poster: '/media/software/cumbre.jpg', link: 'https://orange-forest-0713c560f.7.azurestaticapps.net' },
      { label: 'Estudio Dental Mendieta', category: 'Software de gestión clínica', videoSrc: '/media/software/dental.mp4', poster: '/media/software/dental.jpg', link: 'https://happy-coast-044ea7e0f.7.azurestaticapps.net/agenda' },
      { label: 'Tornos del Sur', category: 'ERP industrial', videoSrc: '/media/software/tornos.mp4', poster: '/media/software/tornos.jpg', link: 'https://app-tornosops.azurewebsites.net/dashboard' },
      { label: 'Punto Cero', category: 'Sistema de mantenimiento por suscripción', videoSrc: '/media/software/puntocero.mp4', poster: '/media/software/puntocero.jpg', link: 'https://victorious-desert-032f8750f.1.azurestaticapps.net/' },
      { label: 'Vértice Seguridad Industrial', category: 'ERP comercial y de inventario', videoSrc: '/media/software/vertice.mp4', poster: '/media/software/vertice.jpg', link: 'https://icy-meadow-07f007e0f.6.azurestaticapps.net/dashboard/home' }
    ]
  },
  faq: {
    heading: '/preguntas frecuentes',
    items: [
      {
        question: '¿Cómo aseguran que el software pueda escalar a futuro?',
        answer:
          'Definimos arquitectura, reglas y estructura desde el inicio. El sistema se construye por módulos, permitiendo crecer, ajustar o integrar nuevas funcionalidades sin tener que rehacer todo.'
      },
      {
        question: '¿Qué medidas de seguridad implementan?',
        answer:
          'Definimos roles, permisos, validaciones y controles según la operación real. Aplicamos buenas prácticas de seguridad desde la arquitectura, no como un agregado al final.'
      },
      {
        question: '¿Cómo es el soporte después de entregar el sistema?',
        answer:
          'Ofrecemos planes de soporte con SLA definido. Cubre consultas, corrección de errores, ajustes operativos y nuevas funcionalidades según evoluciona la operación. El alcance y modelo se acuerdan al cierre del proyecto. El software interno no se entrega y se abandona: se acompaña en el tiempo.'
      },
      {
        question: '¿Cómo es el esquema de pago del proyecto?',
        answer:
          'El esquema se define en la primera conversación según el proyecto y lo que mejor encaje a ambas partes. Los modelos más usados son pago 30/70 con anticipo y entrega, pagos por hitos según etapas, pagos mensuales con SLA, o suscripción mensual cuando el cliente prefiere modelo SaaS. Nos adaptamos al esquema, no al revés.'
      },
      {
        question: '¿Cómo arranca el proyecto?',
        answer:
          'Al aceptar la propuesta económica se abona un porcentaje inicial que arranca la Etapa 1 de discovery. El resto se distribuye según el esquema de pago acordado para todo el proyecto. Esto asegura que ambas partes están comprometidas desde el inicio.'
      },
      {
        question: '¿Con qué tecnologías construyen?',
        answer:
          'Trabajamos principalmente con Angular para frontend, Node para backend y Azure para infraestructura, base de datos y servicios. También usamos Python, React y otras tecnologías según conveniencia técnica del proyecto. La pila final se define en el discovery, eligiendo lo que mejor encaja con la operación del cliente y la integración con sistemas existentes.'
      },
      {
        question: '¿Cómo se aseguran de que el software sea fácil de usar?',
        answer:
          'Diseñamos el sistema según los flujos reales de los usuarios. Validamos prototipos y funcionalidad antes de desarrollar para evitar sistemas complejos o poco usables.'
      },
      {
        question: '¿Cómo verifican que el software funcione correctamente?',
        answer:
          'Probamos el sistema por etapas y en escenarios reales de la operación. Detectamos errores antes de que impacten al negocio.'
      },
      {
        question: '¿Cómo manejan los plazos y la entrega del proyecto?',
        answer:
          'Trabajamos con alcance definido y entregas por etapas. Eso permite avanzar con visibilidad, controlar tiempos y ajustar prioridades sin perder control del proyecto.'
      }
    ]
  },
  contact: { ...contactInfo, location: 'CABA, Argentina' },
  stats: [],
  theme: 'software',
  industries: industriasSection
};

const softwarePageEn: LandingData = {
  eyebrow: '',
  title: 'Software built around your operation.',
  description:
    "You don't adapt your company to the software. We build the software around how your operation already works.",
  ctaPrimary: 'Book a meeting',
  ctaPrimaryLink: contactInfo.calendarLinkEn,
  ctaSecondary: 'Send a message',
  ctaSecondaryLink: '#hablemos',
  featureTabs: [
    {
      lead: 'Organize',
      body:
        'the operation you already have without changing how your team works. Visibility, cost control and real alerts.',
      videoSrc: '/media/software/ordena.mp4'
    },
    {
      lead: 'Centralize',
      body:
        'records, flows and data in one system. Clear information for you and your team.',
      videoSrc: '/media/software/centraliza.mp4'
    },
    {
      lead: 'Automate',
      body:
        'repetitive tasks and data-driven decisions. AI with operational judgment, not tech decoration.',
      videoSrc: '/media/software/automatiza.mp4'
    }
  ],
  systems: {
    heading: 'Systems we build from scratch',
    intro:
      "Each category represents a real capability, with systems in production. We don't sell a packaged product.",
    items: [
      {
        title: 'Custom CRM',
        slug: 'crm-a-medida',
        body:
          "We unify WhatsApp, calls and email into a single sales flow. Quotes are built with AI based on the business's criteria, not generic templates. The sales team sees what stage each lead is in without jumping between tools.",
        chips: ['Multichannel', 'AI quoting', 'Visible pipeline', 'Unified history']
      },
      {
        title: 'Operations & inventory ERP',
        slug: 'erp-operacion-inventario',
        body:
          "Stock by warehouse or branch, sales with dispatch records and full traceability of every movement. Everything stays in one system, with live data instead of parallel spreadsheets. Designed so control doesn't depend on moving information from one tool to another.",
        chips: ['Multi-warehouse stock', 'Dispatch', 'Traceability', 'Real-time movements']
      },
      {
        title: 'E-commerce with its own logic',
        slug: 'ecommerce-logica-propia',
        body:
          'Stores with commercial rules built around the business model. Customer types, price lists, payment terms and discounts live inside the system, not as manual exceptions. If the operation changes, the code changes with it.',
        chips: ['Commercial rules', 'Customer types', 'Price lists', 'Payment terms']
      },
      {
        title: 'Own-brand ticketing',
        slug: 'ticketing-marca-propia',
        body:
          'Ticket-sales platforms for artists, producers and venues that want to operate under their own brand. The audience buys from the official site, gets a QR ticket and enters the event within the same flow. Payments, sales, attendees and access control stay centralized, without depending on an external ticketing service.',
        chips: ['Own brand', 'Ticket sales', 'QR tickets', 'Access control']
      },
      {
        title: 'Booking & scheduling platforms',
        slug: 'reservas-y-agenda',
        body:
          "Booking systems with scheduling, availability, automatic reminders and online payment integrated into the operation. Each appointment enters the business flow, updates available capacity and stays linked to the client. The information doesn't get stuck in a separate tool you have to reconcile afterward.",
        chips: ['Scheduling', 'Availability', 'Automatic reminders', 'Online payment']
      },
      // Oculto en /software por ahora (2026-06-15) — NO borrar; descomentar para reactivar.
      /*
      {
        title: 'Dashboards & reporting',
        slug: 'dashboards-y-reporting',
        body:
          "Dashboards with real-time metrics and downloadable reports, fed directly from the systems in production. No manual extracts or files loaded on the side. If the data exists in the operation, it's on the dashboard.",
        chips: ['Real-time', 'Downloadable reports', 'Configurable KPIs', 'Live data']
      },
      */
      {
        title: 'Applied AI automation',
        slug: 'automatizacion-ia',
        body:
          'Flows that read documents, fill out forms, classify data and connect tasks that used to be done by hand. AI runs in the background without changing how the team works — and without replacing the client relationship.',
        chips: ['Applied AI', 'Document reading', 'Data classification', 'Automated processes']
      }
    ]
  },
  principles: {
    heading: '/working principles',
    cards: [
      {
        icon: 'circle-check',
        title: 'What we do',
        body:
          "We build internal software to put you back in control of the operation. Custom apps with centralized data, integrations that don't break what's already running, and clear traceability."
      },
      {
        icon: 'route',
        title: 'How we work',
        body:
          'First we define the system, then we write code. We map out the real operational flow, the rules, the integrations and the control points.'
      },
      {
        icon: 'circle-off',
        title: "What we don't do",
        body:
          "We don't take projects without a clear definition or internal owners. We don't sell off-the-shelf products or generic apps. We don't compete on price at the expense of technical judgment."
      }
    ]
  },
  showcase: {
    title:
      'Everything a modern system needs. Because off-the-shelf tools always work halfway.',
    features: [
      { icon: 'globe-check', label: 'Online' },
      { icon: 'monitor-smartphone', label: 'Responsive' },
      { icon: 'layout-template', label: 'Custom' },
      { icon: 'cloud-sync', label: 'Real-time' },
      { icon: 'users', label: 'Multi-user' },
      { icon: 'shield-check', label: 'Secure' },
      { icon: 'blocks', label: 'Scalable' },
      { icon: 'cloud-check', label: 'Cloud' },
      { icon: 'git-compare-arrows', label: 'API' },
      { icon: 'workflow', label: 'Integrations' },
      { icon: 'building-2', label: 'Multi-site' },
      { icon: 'user-round-key', label: 'Roles' },
      { icon: 'search-check', label: 'Traceable' }
    ]
  },
  process: {
    title: 'How we run a project.',
    intro:
      'From the first conversation to a working system. Four stages with real timelines, no empty promises.',
    stages: [
      {
        order: '01',
        name: 'First contact',
        duration: 'Today',
        description:
          'We understand what you need to solve, validate feasibility and put together a first estimated scope.'
      },
      {
        order: '02',
        name: 'Discovery',
        duration: '2 to 4 weeks',
        description:
          "We map your operation's real flow and define rules, actors, final scope and system architecture."
      },
      {
        order: '03',
        name: 'Development',
        duration: '5 to 8 weeks',
        description:
          'We build the system module by module with continuous testing and real validation from your team.'
      },
      {
        order: '04',
        name: 'Launch',
        duration: '1 week',
        description:
          'We deploy to production, support adoption and leave the system running in your operation.'
      }
    ]
  },
  viewcases: {
    title: 'Try a custom-built system.',
    intro:
      "Each demo is a working version of a custom system, built for you to walk through the full operation of a different industry. You'll feel how simple and fast software designed specifically for the way you work can be.",
    items: [
      { label: 'Cumbre', category: 'HR management system', videoSrc: '/media/software/cumbre.mp4', poster: '/media/software/cumbre.jpg', link: 'https://orange-forest-0713c560f.7.azurestaticapps.net' },
      { label: 'Estudio Dental Mendieta', category: 'Clinic management software', videoSrc: '/media/software/dental.mp4', poster: '/media/software/dental.jpg', link: 'https://happy-coast-044ea7e0f.7.azurestaticapps.net/agenda' },
      { label: 'Tornos del Sur', category: 'Industrial ERP', videoSrc: '/media/software/tornos.mp4', poster: '/media/software/tornos.jpg', link: 'https://app-tornosops.azurewebsites.net/dashboard' },
      { label: 'Punto Cero', category: 'Subscription-based maintenance system', videoSrc: '/media/software/puntocero.mp4', poster: '/media/software/puntocero.jpg', link: 'https://victorious-desert-032f8750f.1.azurestaticapps.net/' },
      { label: 'Vértice Seguridad Industrial', category: 'Commercial & inventory ERP', videoSrc: '/media/software/vertice.mp4', poster: '/media/software/vertice.jpg', link: 'https://icy-meadow-07f007e0f.6.azurestaticapps.net/dashboard/home' }
    ]
  },
  faq: {
    heading: '/frequently asked questions',
    items: [
      {
        question: 'How do you ensure the software can scale in the future?',
        answer:
          'We define architecture, rules and structure from the start. The system is built in modules, so it can grow, adjust or integrate new features without redoing everything.'
      },
      {
        question: 'What security measures do you implement?',
        answer:
          'We define roles, permissions, validations and controls based on the real operation. We apply security best practices from the architecture, not as an add-on at the end.'
      },
      {
        question: 'What is support like after the system is delivered?',
        answer:
          "We offer support plans with a defined SLA. It covers questions, bug fixes, operational tweaks and new features as the operation evolves. The scope and model are agreed when the project closes. Internal software isn't delivered and abandoned — it's supported over time."
      },
      {
        question: "How does the project's payment work?",
        answer:
          'The scheme is defined in the first conversation based on the project and what works best for both sides. The most common models are 30/70 with a deposit and delivery, milestone-based payments per stage, monthly payments with an SLA, or a monthly subscription when the client prefers a SaaS model. We adapt to the scheme, not the other way around.'
      },
      {
        question: 'How does the project start?',
        answer:
          'When you accept the quote, an initial percentage is paid to kick off Stage 1, discovery. The rest is spread out according to the payment scheme agreed for the whole project. This ensures both sides are committed from the start.'
      },
      {
        question: 'What technologies do you build with?',
        answer:
          "We work mainly with Angular for the frontend, Node for the backend and Azure for infrastructure, database and services. We also use Python, React and other technologies depending on the technical fit of the project. The final stack is defined during discovery, choosing what best fits the client's operation and the integration with existing systems."
      },
      {
        question: 'How do you make sure the software is easy to use?',
        answer:
          "We design the system around users' real flows. We validate prototypes and functionality before building to avoid complex or hard-to-use systems."
      },
      {
        question: 'How do you verify the software works correctly?',
        answer:
          'We test the system in stages and in real operational scenarios. We catch bugs before they impact the business.'
      },
      {
        question: 'How do you handle timelines and delivery?',
        answer:
          'We work with a defined scope and staged deliveries. That lets us move with visibility, hold timelines and shift priorities without losing control of the project.'
      }
    ]
  },
  contact: { ...contactInfo, location: 'Buenos Aires, Argentina' },
  stats: [],
  theme: 'software',
  industries: industriasSectionEn
};

// ────────────────────────────────────────────────────────────────────────────
// WEB
// ────────────────────────────────────────────────────────────────────────────

const webPageEs: LandingData = {
  eyebrow: '',
  title: 'Sitios web hechos en serio.',
  description: '',
  stats: [],
  theme: 'website',
  webHero: {
    title: 'Sitios web hechos en serio.',
    lead: 'Sin plantillas, sin atajos, sin constructores genéricos. Cada sitio se construye a medida de verdad.',
    actions: [
      { label: 'Agendar reunión', link: contactInfo.calendarLink },
      { label: 'Mandar mensaje', link: '#hablemos' }
    ],
    slides: [],
    marquee: {
      label: 'Lo que no hacemos:',
      items: ['No WordPress', 'No TiendaNube', 'No Wix', 'No Squarespace', 'No Magento', 'No Shopify']
    }
  },
  capabilities: {
    heading: 'Lo que hay detrás de cada sitio.',
    cards: [
      {
        index: '01',
        title: 'Construido con tecnología seria.',
        body: 'Desarrollamos con el mismo stack que usamos en sistemas empresariales en producción: Angular para frontend, Node para backend, Azure para infraestructura. La pila final se ajusta a la integración que tu empresa necesita.',
        payload: {
          kind: 'logos',
          logos: [
            { src: '/logostools/angular.svg', label: 'Frontend' },
            { src: '/logostools/nj.svg', label: 'Backend' },
            { src: '/logostools/ts.svg', label: 'Lenguaje' },
            { src: '/logostools/azure.webp', label: 'Infraestructura' }
          ]
        }
      },
      {
        index: '02',
        title: 'Rápidos en cualquier pantalla.',
        body: 'Cada sitio se diseña primero para móvil y se construye con métricas de carga verificables. No solo se ve bien en distintos dispositivos, anda igual de rápido en cada uno.',
        payload: {
          kind: 'rows',
          rows: [
            { icon: 'smartphone', label: 'Móvil primero' },
            { icon: 'code', label: 'Código propio' },
            { icon: 'gauge', label: 'Performance medida' }
          ]
        }
      },
      {
        index: '03',
        title: 'Cada diseño, desde cero.',
        body: 'Cada sitio parte de tu operación, no de una plantilla reciclada. Marca, jerarquía, ritmo y estructura se diseñan para tu empresa, no se eligen de un catálogo de temas. Si la marca o el negocio cambian con el tiempo, el sitio acompaña sin necesidad de rehacerlo entero.',
        payload: {
          kind: 'rows',
          rows: [
            { icon: 'fingerprint', label: 'Marca' },
            { icon: 'hierarchy', label: 'Jerarquía' },
            { icon: 'rhythm', label: 'Ritmo' },
            { icon: 'structure', label: 'Estructura' }
          ]
        }
      }
    ]
  },
  devTypes: {
    blocks: [
      {
        icon: 'monitor-stop',
        tab: 'Landing page',
        title: 'Landing page',
        description:
          'Una sola página construida para convertir, ideal para campañas puntuales, lanzamientos, eventos, productos específicos o profesionales que necesitan un punto de contacto digital directo. Toda la atención del visitante en un único mensaje y una sola acción.',
        highlights: [
          'Foco en una sola acción del visitante',
          'Carga liviana y rápida en móvil',
          'Formulario integrado a tu CRM o correo',
          'Configuración lista para campañas de Ads'
        ],
        cases: [
          'Empresas que necesitan capturar leads de una campaña antes de tener un sitio completo',
          'Profesionales independientes que quieren un punto de contacto digital sin mantener un sitio extenso'
        ]
      },
      {
        icon: 'monitor-dot',
        tab: 'Sitio corporativo',
        title: 'Sitio corporativo',
        description:
          'Sitio con varias secciones pensado para empresas consolidadas que necesitan mostrar la operación completa: servicios, casos, equipo, novedades y canales de contacto. Estructura clara para representar la empresa con seriedad y darle al lead toda la información que necesita antes de tomar contacto.',
        highlights: [
          'Gestión de contenido propio para que tu equipo actualice sin depender del desarrollador',
          'Sección de novedades o blog integrada',
          'Conexión con redes sociales y herramientas de marketing',
          'Métricas integradas para entender qué funciona y qué no'
        ],
        cases: [
          'Empresas industriales o de servicios que necesitan mostrar capacidad operativa, cartera y casos',
          'Empresas en expansión que necesitan un sitio profesional para apuntar a nuevos mercados'
        ]
      },
      {
        icon: 'shopping-cart',
        tab: 'E-commerce',
        title: 'E-commerce',
        description:
          'Tienda en línea desarrollada a medida, con catálogo, carrito, pagos integrados y panel propio para gestionar productos, stock y ventas. Construida para escalar con el negocio y adaptarse a las reglas comerciales reales, sin las limitaciones de una plataforma enlatada.',
        highlights: [
          'Gestión propia de productos, precios y stock',
          'Pagos integrados con las pasarelas que usás (Mercado Pago, transferencia, tarjeta)',
          'Panel de administración para el equipo de ventas',
          'Conexión con sistemas de logística, facturación y envíos'
        ],
        cases: [
          'Empresas con catálogo amplio o reglas comerciales complejas que no encajan en una plantilla',
          'Negocios que operan con un e-commerce limitado y necesitan migrar a algo propio que pueda crecer'
        ]
      },
      {
        icon: 'monitor-cog',
        tab: 'Apps y sistemas internos',
        title: 'Apps y sistemas internos',
        description:
          'Aplicaciones web y móviles desarrolladas para ordenar la operación interna de tu empresa. Conectamos procesos, equipos y datos en un sistema propio que evoluciona con el negocio, sin depender de planillas, herramientas dispersas o software enlatado que no encaja.',
        highlights: [
          'Diseñado según el flujo real de trabajo de tu equipo',
          'Roles y permisos según la operación',
          'Integración con sistemas existentes de contabilidad, facturación o gestión',
          'Acceso desde computadora y móvil'
        ],
        cases: [
          'Empresas que coordinan operaciones complejas con planillas o herramientas dispersas',
          'Empresas con sistemas viejos que necesitan modernizar parte de la operación'
        ]
      }
    ]
  },
  portfolio: {
    rows: [
      { client: 'Imperio', industry: 'Alimentos', projectType: 'E-commerce + gestión interna', link: 'https://arrozimperio.net/', videoSrc: '/media/portfolio/imperio.mp4', logo: '/media/portfolio/logos/imperio.svg', poster: '/media/portfolio/imperio.jpg' },
      // Ocultos por ahora (2026-06-16) — aún no en prod; NO borrar, descomentar al salir.
      // { client: 'Facio & Cañas', industry: 'Legal', projectType: 'Corporativo + IA', link: 'https://fayca.com/', videoSrc: '/media/portfolio/faciosycanas.mp4', logo: '/media/portfolio/logos/faciosycanas.svg', poster: '/media/portfolio/faciosycanas.jpg' },
      // { client: 'HESA', industry: 'Veterinaria', projectType: 'Corporativo + catálogo', link: 'https://hesa.co.cr/', videoSrc: '/media/portfolio/hesa.mp4', logo: '/media/portfolio/logos/hesa.svg', poster: '/media/portfolio/hesa.jpg' },
      { client: 'Uga Comediante', industry: 'Entretenimiento', projectType: 'Creativo + transacciones', link: 'https://ugacomediante.com/', videoSrc: '/media/portfolio/uga.mp4', logo: '/media/portfolio/logos/uga.svg', poster: '/media/portfolio/uga.jpg' },
      { client: 'AAEC', industry: 'Legal', projectType: 'Corporativo', link: 'https://aaec.org/', videoSrc: '/media/portfolio/aaec.mp4', logo: '/media/portfolio/logos/aaec.png', poster: '/media/portfolio/aaec.jpg' },
      { client: 'Xceed', industry: 'Turismo', projectType: 'Corporativo', link: 'https://xceedsportsandtravel.com/', videoSrc: '/media/portfolio/xceed.mp4', logo: '/media/portfolio/logos/xceed.svg', poster: '/media/portfolio/xceed.jpg' },
      { client: 'WeDrive CR', industry: 'Turismo', projectType: 'Corporativo + transacciones', link: 'https://wedrivecr.com/', videoSrc: '/media/portfolio/wedrivecr.mp4', logo: '/media/portfolio/logos/wedrivecr.svg', poster: '/media/portfolio/wedrivecr.jpg' },
      { client: 'CEWTEC', industry: 'Tecnología', projectType: 'Corporativo', link: 'https://www.cewtec.com/', videoSrc: '/media/portfolio/cewtec.mp4', logo: '/media/portfolio/logos/cewtec.svg', poster: '/media/portfolio/cewtec.jpg' },
      { client: 'Altura Raíz', industry: 'Arquitectura', projectType: 'Landing', link: 'https://wonderful-smoke-00f5c7f0f.6.azurestaticapps.net/', videoSrc: '/media/portfolio/alturaraiz.mp4', logo: '/media/portfolio/logos/alturaraiz.svg', poster: '/media/portfolio/alturaraiz.jpg' },
      { client: 'CEFSA', industry: 'Finanzas', projectType: 'Corporativo', link: 'https://cefsa.cr/', videoSrc: '/media/portfolio/cefsa.mp4', logo: '/media/portfolio/logos/cefsa.svg', poster: '/media/portfolio/cefsa.jpg' },
      { client: 'AMAG', industry: 'Moda', projectType: 'E-commerce', link: 'https://amagnr.com/home/inicio', videoSrc: '/media/portfolio/amag.mp4', logo: '/media/portfolio/logos/amag.png', poster: '/media/portfolio/amag.jpg' },
      { client: 'Nano', industry: 'Bienestar', projectType: 'E-commerce', link: 'https://nano.cr/', videoSrc: '/media/portfolio/nano.mp4', logo: '/media/portfolio/logos/nano.png', poster: '/media/portfolio/nano.jpg' },
      { client: 'Haus', industry: 'Bienes Raíces', projectType: 'Corporativo', link: 'https://haus-297eca.webflow.io/', videoSrc: '/media/portfolio/haus.mp4', logo: '/media/portfolio/logos/haus.svg', poster: '/media/portfolio/haus.jpg' },
      { client: 'Espacio CR', industry: 'Arquitectura', projectType: 'Landing', link: 'https://espaciocr-com.webflow.io/', videoSrc: '/media/portfolio/espaciocr.mp4', logo: '/media/portfolio/logos/espaciocr.svg', poster: '/media/portfolio/espaciocr.jpg' },
      { client: 'Promaca', industry: 'Alimentos', projectType: 'Corporativo', link: 'https://www.promacaltda.com/', videoSrc: '/media/portfolio/promaca.mp4', logo: '/media/portfolio/logos/promaca.svg', poster: '/media/portfolio/promaca.jpg' },
      { client: 'Evoke', industry: 'Audiovisual', projectType: 'Corporativo', link: 'https://evoke-812574.webflow.io/', videoSrc: '/media/portfolio/evoke.mp4', logo: '/media/portfolio/logos/evoke.svg', poster: '/media/portfolio/evoke.jpg' },
      { client: 'Psicoyng', industry: 'Salud', projectType: 'Corporativo', link: 'https://psicoyng.com/', videoSrc: '/media/portfolio/psicoyng.mp4', logo: '/media/portfolio/logos/psicoyng.png', poster: '/media/portfolio/psicoyng.jpg' },
      { client: 'Xcelerate', industry: 'Gimnasio', projectType: 'Landing', link: 'https://xcelerate-93e9f9.webflow.io/', videoSrc: '/media/portfolio/xcelerate.mp4', logo: '/media/portfolio/logos/xcelerate.svg', poster: '/media/portfolio/xcelerate.jpg' },
      { client: 'TUPSA', industry: 'Transporte', projectType: 'Corporativo + gestión interna', link: 'https://tupsa.com/', videoSrc: '/media/portfolio/tupsa.mp4', logo: '/media/portfolio/logos/tupsa.png', poster: '/media/portfolio/tupsa.jpg' },
      { client: 'Onigiri', industry: 'Restaurante', projectType: 'Landing', link: 'https://ambitious-river-0c4fcd50f.1.azurestaticapps.net/', videoSrc: '/media/portfolio/onigiri.mp4', logo: '/media/portfolio/logos/onigiri.svg', poster: '/media/portfolio/onigiri.jpg' },
      { client: 'Gramas', industry: 'Agroindustria', projectType: 'Landing', link: 'https://yellow-water-0de5f8f0f.2.azurestaticapps.net', videoSrc: '/media/portfolio/gramas.mp4', logo: '/media/portfolio/logos/gramas.svg', poster: '/media/portfolio/gramas.jpg' },
      { client: 'CIMED', industry: 'Legal', projectType: 'Corporativo', link: 'https://witty-rock-0c57b0910.1.azurestaticapps.net', videoSrc: '/media/portfolio/cimed.mp4', logo: '/media/portfolio/logos/cimed.svg', poster: '/media/portfolio/cimed.jpg' },
      { client: 'GoNow', industry: 'Automotriz', projectType: 'Landing', link: 'https://gentle-grass-0d8c1fd0f.1.azurestaticapps.net/', videoSrc: '/media/portfolio/gonow.mp4', logo: '/media/portfolio/logos/gonow.png', poster: '/media/portfolio/gonow.jpg' },
      { client: 'Zacate Tierra Fértil', industry: 'Agroindustria', projectType: 'Corporativo', link: 'https://zacatetierrafertil.com/', videoSrc: '/media/portfolio/zacatetierrafertil.mp4', logo: '/media/portfolio/logos/zacatetierrafertil.svg', poster: '/media/portfolio/zacatetierrafertil.jpg' }
    ]
  },
  webProcess: {
    title: 'Así trabajamos un proyecto.',
    intro:
      'De la primera conversación al sitio publicado. Cuatro etapas con tiempos reales, sin promesas vacías.',
    stages: [
      {
        order: '01',
        name: 'Primer contacto',
        duration: 'Hoy mismo',
        description:
          'Entendemos qué necesita comunicar tu empresa, a quién apunta y qué tipo de sitio le sirve. Salimos con un primer alcance estimado y plazos tentativos.'
      },
      {
        order: '02',
        name: 'Discovery',
        duration: '1 a 3 semanas',
        description:
          'Mapeamos la audiencia, definimos arquitectura del sitio, dirección de diseño y estructura del contenido. Cerramos el alcance final y los criterios técnicos antes de tocar código.'
      },
      {
        order: '03',
        name: 'Desarrollo',
        duration: '3 a 8 semanas',
        description:
          'Diseñamos, programamos y revisamos el sitio por etapas. Validás cada avance antes de seguir, sin sorpresas al final ni entregas de último momento.'
      },
      {
        order: '04',
        name: 'Lanzamiento',
        duration: '1 semana',
        description:
          'Configuramos dominio, hosting y métricas, publicamos el sitio y dejamos todo listo para empezar a captar tráfico y aparecer en buscadores.'
      }
    ]
  },
  faq: {
    heading: '/preguntas frecuentes',
    items: [
      {
        question: '¿Cuánto tiempo tarda un sitio web?',
        answer:
          'El plazo depende del alcance. Una landing puede estar lista en 3 a 4 semanas. Un sitio corporativo entre 6 y 10 semanas. Un e-commerce o sistema con integraciones entre 3 y 5 meses. El plazo exacto se define en la primera conversación y se respeta durante el proyecto. Avisamos antes si algo lo afecta, no después.'
      },
      {
        question: '¿Cómo es el esquema de pago?',
        answer:
          'El esquema se define en la primera conversación según el alcance del proyecto y lo que mejor encaje a ambas partes. Los modelos más usados son pago 30/70 con anticipo y entrega, o pagos por hitos según etapas. Nos adaptamos al esquema, no al revés.'
      },
      {
        question: '¿Quién hace los textos y las imágenes del sitio?',
        answer:
          'Cuando el cliente tiene contenido propio, lo usamos. Cuando no, podemos producir los textos a partir de entrevistas con tu equipo y conseguir o generar las imágenes según el tono del sitio. El contenido es parte del proyecto y se define al inicio, no se deja para último momento.'
      },
      {
        question: '¿Cómo funciona el soporte después de entregar el sitio?',
        answer:
          'Cada sitio se entrega con un año de garantía funcional. Durante ese período corregimos sin costo cualquier error que aparezca. Como el sitio se desarrolla, se prueba y se valida antes de salir, no necesita mantenimiento constante para seguir funcionando. Si más adelante necesitás un cambio o una nueva funcionalidad, cotizamos ese trabajo puntual. No tenemos cobros recurrentes por servicios que un sitio a medida no necesita.'
      },
      {
        question: '¿Puedo actualizar el contenido yo mismo?',
        answer:
          'Sí. Los sitios incluyen un panel propio para que tu equipo actualice textos, imágenes, productos, novedades y lo que corresponda según el tipo de sitio. El panel se diseña para ser claro, sin necesidad de conocimientos técnicos. Para cambios estructurales o de diseño, nos encargamos nosotros.'
      },
      {
        question: '¿Qué pasa con el dominio y el hosting?',
        answer:
          'El dominio es siempre del cliente, registrado a su nombre. Si ya tenés uno, lo seguimos usando. Si no, te ayudamos a registrarlo. Para el hosting hay dos opciones: lo alojamos nosotros en Azure con un costo mensual, o configuramos un hosting a nombre del cliente que paga directo al proveedor. En cualquier caso, ni el dominio ni el sitio quedan atados a nosotros.'
      },
      {
        question: '¿Cómo aseguran que el sitio aparezca bien en Google?',
        answer:
          'Aplicamos buenas prácticas de SEO técnico desde la arquitectura del sitio: velocidad de carga, estructura HTML semántica, metadatos, sitemap y datos estructurados. Esa base deja al sitio en condiciones óptimas para ser indexado. La estrategia de contenido y el posicionamiento por palabras clave son un servicio aparte que coordinamos con especialistas cuando el cliente lo necesita.'
      },
      {
        question: '¿Pueden integrar el sitio con sistemas que ya usamos?',
        answer:
          'Sí. Conectamos el sitio con CRM, ERP, plataformas de email marketing, herramientas de analytics y otros sistemas según la integración que necesites. Cuando el sitio se construye a medida, corre sobre código propio (sin plugins de plataformas cerradas), así las integraciones quedan estables a largo plazo.'
      }
    ]
  },
  contact: { ...contactInfo, location: 'CABA, Argentina' },
  industries: industriasSection
};

const webPageEn: LandingData = {
  eyebrow: '',
  title: 'Real websites. Real code.',
  description: '',
  stats: [],
  theme: 'website',
  webHero: {
    title: 'Real websites. Real code.',
    lead: 'No templates. No shortcuts. No generic builders. Every site is built from code.',
    actions: [
      { label: 'Book a meeting', link: contactInfo.calendarLinkEn },
      { label: 'Send a message', link: '#hablemos' }
    ],
    slides: [],
    marquee: {
      label: "What we don't do:",
      items: ['No WordPress', 'No TiendaNube', 'No Wix', 'No Squarespace', 'No Magento', 'No Shopify']
    }
  },
  capabilities: {
    heading: "What's behind every site.",
    cards: [
      {
        index: '01',
        title: 'Built on a serious stack.',
        body: 'We build on the same stack we use for enterprise systems in production: Angular on the front end, Node on the back end, Azure for infrastructure. The final stack flexes to fit the integrations your company needs.',
        payload: {
          kind: 'logos',
          logos: [
            { src: '/logostools/angular.svg', label: 'Frontend' },
            { src: '/logostools/nj.svg', label: 'Backend' },
            { src: '/logostools/ts.svg', label: 'Language' },
            { src: '/logostools/azure.webp', label: 'Infrastructure' }
          ]
        }
      },
      {
        index: '02',
        title: 'Fast on any screen.',
        body: "Every site is designed mobile-first and built against real load metrics. It doesn't just look good across devices, it runs just as fast on every one.",
        payload: {
          kind: 'rows',
          rows: [
            { icon: 'smartphone', label: 'Mobile first' },
            { icon: 'code', label: 'Own code' },
            { icon: 'gauge', label: 'Measured performance' }
          ]
        }
      },
      {
        index: '03',
        title: 'Every design, from scratch.',
        body: 'Every site starts from how you operate, not a recycled template. Brand, hierarchy, rhythm and structure are designed for your company, not picked from a theme catalog. When the brand or the business changes, the site keeps up, no full rebuild required.',
        payload: {
          kind: 'rows',
          rows: [
            { icon: 'fingerprint', label: 'Brand' },
            { icon: 'hierarchy', label: 'Hierarchy' },
            { icon: 'rhythm', label: 'Rhythm' },
            { icon: 'structure', label: 'Structure' }
          ]
        }
      }
    ]
  },
  devTypes: {
    blocks: [
      {
        icon: 'monitor-stop',
        tab: 'Landing page',
        title: 'Landing page',
        description:
          "A single page built to convert, made for one-off campaigns, launches, events, specific products, or professionals who need a direct line online. Every bit of the visitor's attention on one message and one action.",
        highlights: [
          'Focused on a single visitor action',
          'Lightweight and fast on mobile',
          'Form integrated with your CRM or email',
          'Ready to run ad campaigns'
        ],
        cases: [
          'Companies that need to capture campaign leads before having a full site',
          'Independent professionals who want a digital touchpoint without maintaining a large site'
        ]
      },
      {
        icon: 'monitor-dot',
        tab: 'Corporate site',
        title: 'Corporate site',
        description:
          'A multi-section site for established companies that need to show the whole operation: services, work, team, news and ways to get in touch. A clear structure that represents the company seriously and gives prospects everything they need before they reach out.',
        highlights: [
          'Built-in content management, so your team can make updates without going through a developer',
          'Integrated news or blog section',
          'Connection with social media and marketing tools',
          "Built-in metrics to understand what works and what doesn't"
        ],
        cases: [
          'Industrial or service companies that need to show operational capacity, portfolio and cases',
          'Growing companies that need a professional site to target new markets'
        ]
      },
      {
        icon: 'shopping-cart',
        tab: 'E-commerce',
        title: 'E-commerce',
        description:
          'A custom-built online store with catalog, cart, integrated payments and its own dashboard to manage products, stock and sales. Built to scale with the business and bend to your real commercial rules, without the limits of an off-the-shelf platform.',
        highlights: [
          'Manage your own products, prices and stock',
          'Payments integrated with the gateways you use (Mercado Pago, bank transfer, card)',
          'Admin panel for the sales team',
          'Connection with logistics, billing and shipping systems'
        ],
        cases: [
          "Companies with a large catalog or complex commercial rules that don't fit a template",
          'Businesses running on a limited e-commerce that need to migrate to something of their own that can grow'
        ]
      },
      {
        icon: 'monitor-cog',
        tab: 'Apps & internal systems',
        title: 'Apps & internal systems',
        description:
          "Web and mobile apps that organize how your company works internally. We connect processes, teams and data into a system that's yours and grows with the business, instead of leaning on spreadsheets, scattered tools or off-the-shelf software that doesn't fit.",
        highlights: [
          "Designed around your team's real workflow",
          'Roles and permissions based on the operation',
          'Integration with existing accounting, billing or management systems',
          'Access from desktop and mobile'
        ],
        cases: [
          'Companies coordinating complex operations with spreadsheets or scattered tools',
          'Companies with old systems that need to modernize part of the operation'
        ]
      }
    ]
  },
  portfolio: {
    rows: [
      { client: 'Imperio', industry: 'Food', projectType: 'E-commerce + internal management', link: 'https://arrozimperio.net/', videoSrc: '/media/portfolio/imperio.mp4', logo: '/media/portfolio/logos/imperio.svg', poster: '/media/portfolio/imperio.jpg' },
      // Ocultos por ahora (2026-06-16) — aún no en prod; NO borrar, descomentar al salir.
      // { client: 'Facio & Cañas', industry: 'Legal', projectType: 'Corporate + AI', link: 'https://fayca.com/', videoSrc: '/media/portfolio/faciosycanas.mp4', logo: '/media/portfolio/logos/faciosycanas.svg', poster: '/media/portfolio/faciosycanas.jpg' },
      // { client: 'HESA', industry: 'Veterinary', projectType: 'Corporate + catalog', link: 'https://hesa.co.cr/', videoSrc: '/media/portfolio/hesa.mp4', logo: '/media/portfolio/logos/hesa.svg', poster: '/media/portfolio/hesa.jpg' },
      { client: 'Uga Comediante', industry: 'Entertainment', projectType: 'Creative + transactions', link: 'https://ugacomediante.com/', videoSrc: '/media/portfolio/uga.mp4', logo: '/media/portfolio/logos/uga.svg', poster: '/media/portfolio/uga.jpg' },
      { client: 'AAEC', industry: 'Legal', projectType: 'Corporate', link: 'https://aaec.org/', videoSrc: '/media/portfolio/aaec.mp4', logo: '/media/portfolio/logos/aaec.png', poster: '/media/portfolio/aaec.jpg' },
      { client: 'Xceed', industry: 'Tourism', projectType: 'Corporate', link: 'https://xceedsportsandtravel.com/', videoSrc: '/media/portfolio/xceed.mp4', logo: '/media/portfolio/logos/xceed.svg', poster: '/media/portfolio/xceed.jpg' },
      { client: 'WeDrive CR', industry: 'Tourism', projectType: 'Corporate + transactions', link: 'https://wedrivecr.com/', videoSrc: '/media/portfolio/wedrivecr.mp4', logo: '/media/portfolio/logos/wedrivecr.svg', poster: '/media/portfolio/wedrivecr.jpg' },
      { client: 'CEWTEC', industry: 'Technology', projectType: 'Corporate', link: 'https://www.cewtec.com/', videoSrc: '/media/portfolio/cewtec.mp4', logo: '/media/portfolio/logos/cewtec.svg', poster: '/media/portfolio/cewtec.jpg' },
      { client: 'Altura Raíz', industry: 'Architecture', projectType: 'Landing', link: 'https://wonderful-smoke-00f5c7f0f.6.azurestaticapps.net/', videoSrc: '/media/portfolio/alturaraiz.mp4', logo: '/media/portfolio/logos/alturaraiz.svg', poster: '/media/portfolio/alturaraiz.jpg' },
      { client: 'CEFSA', industry: 'Finance', projectType: 'Corporate', link: 'https://cefsa.cr/', videoSrc: '/media/portfolio/cefsa.mp4', logo: '/media/portfolio/logos/cefsa.svg', poster: '/media/portfolio/cefsa.jpg' },
      { client: 'AMAG', industry: 'Fashion', projectType: 'E-commerce', link: 'https://amagnr.com/home/inicio', videoSrc: '/media/portfolio/amag.mp4', logo: '/media/portfolio/logos/amag.png', poster: '/media/portfolio/amag.jpg' },
      { client: 'Nano', industry: 'Wellness', projectType: 'E-commerce', link: 'https://nano.cr/', videoSrc: '/media/portfolio/nano.mp4', logo: '/media/portfolio/logos/nano.png', poster: '/media/portfolio/nano.jpg' },
      { client: 'Haus', industry: 'Real Estate', projectType: 'Corporate', link: 'https://haus-297eca.webflow.io/', videoSrc: '/media/portfolio/haus.mp4', logo: '/media/portfolio/logos/haus.svg', poster: '/media/portfolio/haus.jpg' },
      { client: 'Espacio CR', industry: 'Architecture', projectType: 'Landing', link: 'https://espaciocr-com.webflow.io/', videoSrc: '/media/portfolio/espaciocr.mp4', logo: '/media/portfolio/logos/espaciocr.svg', poster: '/media/portfolio/espaciocr.jpg' },
      { client: 'Promaca', industry: 'Food', projectType: 'Corporate', link: 'https://www.promacaltda.com/', videoSrc: '/media/portfolio/promaca.mp4', logo: '/media/portfolio/logos/promaca.svg', poster: '/media/portfolio/promaca.jpg' },
      { client: 'Evoke', industry: 'Audiovisual', projectType: 'Corporate', link: 'https://evoke-812574.webflow.io/', videoSrc: '/media/portfolio/evoke.mp4', logo: '/media/portfolio/logos/evoke.svg', poster: '/media/portfolio/evoke.jpg' },
      { client: 'Psicoyng', industry: 'Healthcare', projectType: 'Corporate', link: 'https://psicoyng.com/', videoSrc: '/media/portfolio/psicoyng.mp4', logo: '/media/portfolio/logos/psicoyng.png', poster: '/media/portfolio/psicoyng.jpg' },
      { client: 'Xcelerate', industry: 'Fitness', projectType: 'Landing', link: 'https://xcelerate-93e9f9.webflow.io/', videoSrc: '/media/portfolio/xcelerate.mp4', logo: '/media/portfolio/logos/xcelerate.svg', poster: '/media/portfolio/xcelerate.jpg' },
      { client: 'TUPSA', industry: 'Transport', projectType: 'Corporate + internal management', link: 'https://tupsa.com/', videoSrc: '/media/portfolio/tupsa.mp4', logo: '/media/portfolio/logos/tupsa.png', poster: '/media/portfolio/tupsa.jpg' },
      { client: 'Onigiri', industry: 'Restaurant', projectType: 'Landing', link: 'https://ambitious-river-0c4fcd50f.1.azurestaticapps.net/', videoSrc: '/media/portfolio/onigiri.mp4', logo: '/media/portfolio/logos/onigiri.svg', poster: '/media/portfolio/onigiri.jpg' },
      { client: 'Gramas', industry: 'Agribusiness', projectType: 'Landing', link: 'https://yellow-water-0de5f8f0f.2.azurestaticapps.net', videoSrc: '/media/portfolio/gramas.mp4', logo: '/media/portfolio/logos/gramas.svg', poster: '/media/portfolio/gramas.jpg' },
      { client: 'CIMED', industry: 'Legal', projectType: 'Corporate', link: 'https://witty-rock-0c57b0910.1.azurestaticapps.net', videoSrc: '/media/portfolio/cimed.mp4', logo: '/media/portfolio/logos/cimed.svg', poster: '/media/portfolio/cimed.jpg' },
      { client: 'GoNow', industry: 'Automotive', projectType: 'Landing', link: 'https://gentle-grass-0d8c1fd0f.1.azurestaticapps.net/', videoSrc: '/media/portfolio/gonow.mp4', logo: '/media/portfolio/logos/gonow.png', poster: '/media/portfolio/gonow.jpg' },
      { client: 'Zacate Tierra Fértil', industry: 'Agribusiness', projectType: 'Corporate', link: 'https://zacatetierrafertil.com/', videoSrc: '/media/portfolio/zacatetierrafertil.mp4', logo: '/media/portfolio/logos/zacatetierrafertil.svg', poster: '/media/portfolio/zacatetierrafertil.jpg' }
    ]
  },
  webProcess: {
    title: 'How we run a project.',
    intro:
      'From first conversation to live site. Four stages, real timelines, no empty promises.',
    stages: [
      {
        order: '01',
        name: 'First contact',
        duration: 'Today',
        description:
          "We figure out what your company needs to say, who it's for, and what kind of site fits. You walk away with a first rough scope and ballpark timelines."
      },
      {
        order: '02',
        name: 'Discovery',
        duration: '1 to 3 weeks',
        description:
          'We map the audience and lock in the site architecture, design direction and content structure. We settle the final scope and technical criteria before touching code.'
      },
      {
        order: '03',
        name: 'Development',
        duration: '3 to 8 weeks',
        description:
          'We design, build and review the site in stages. You sign off on each step before we move on, so there are no surprises at the end and no last-minute deliveries.'
      },
      {
        order: '04',
        name: 'Launch',
        duration: '1 week',
        description:
          'We set up the domain, hosting and analytics, publish the site, and hand it over ready to start pulling in traffic and showing up in search.'
      }
    ]
  },
  faq: {
    heading: '/frequently asked questions',
    items: [
      {
        question: 'How long does a website take?',
        answer:
          "It depends on the scope. A landing page can be ready in 3 to 4 weeks. A corporate site in 6 to 10 weeks. An e-commerce build or a system with integrations in 3 to 5 months. We set the exact timeline in the first conversation and hold to it for the whole project. If anything's going to affect it, you hear about it before, not after."
      },
      {
        question: 'How does payment work?',
        answer:
          'We set the terms in the first conversation, based on the project scope and what works for both sides. The two most common setups are 30/70, a deposit up front and the balance on delivery, or milestone payments per stage. We adapt to the terms, not the other way around.'
      },
      {
        question: 'Who writes the copy and creates the images?',
        answer:
          "If you have your own content, we use it. If you don't, we can write the copy from interviews with your team and source or generate images to match the site's tone. Content is part of the project, defined up front, not left for the last minute."
      },
      {
        question: 'How does support work after the site is delivered?',
        answer:
          "Every site ships with a one-year functional warranty. During that year, we fix any bug that shows up at no charge. Because the site is built, tested and validated before launch, it doesn't need constant maintenance to keep running. If you need a change or a new feature later, we quote that specific work. We don't charge recurring fees for upkeep a custom site doesn't need."
      },
      {
        question: 'Can I update the content myself?',
        answer:
          "Yes. Every site comes with its own dashboard so your team can update text, images, products, news, whatever fits the site. It's built to be clear, with no technical knowledge required. For structural or design changes, we handle it."
      },
      {
        question: 'What about the domain and hosting?',
        answer:
          "The domain is always yours, registered in your name. If you already have one, we keep it. If not, we help you register it. For hosting you've got two options: we host on Azure for a monthly fee, or we set it up in your name and you pay the provider directly. Either way, neither the domain nor the site is locked to us."
      },
      {
        question: 'How do you make sure the site shows up well on Google?',
        answer:
          "We bake technical SEO into the site from the architecture up: load speed, semantic HTML, metadata, sitemap and structured data. That foundation leaves the site in the best shape to get indexed. Content strategy and keyword ranking are a separate service we coordinate with specialists when you need it."
      },
      {
        question: 'Can you integrate the site with systems we already use?',
        answer:
          "Yes. We connect the site to your CRM, ERP, email marketing platforms, analytics tools and other systems, depending on what you need. When a site is custom-built, it runs on our own code (no plugins from closed platforms), so integrations stay stable for the long haul."
      }
    ]
  },
  contact: { ...contactInfo, location: 'Buenos Aires, Argentina' },
  industries: industriasSectionEn
};

// ────────────────────────────────────────────────────────────────────────────
// ROUTES — cada landing lleva su par { es, en }; LandingPageComponent resuelve por idioma.
// ────────────────────────────────────────────────────────────────────────────

// Rutas de contenido (idénticas en ambos idiomas). Se registran dos veces: en la raíz (ES) y
// bajo /en (EN). El idioma lo fija langGuard desde data.lang. Factory → arrays nuevos por árbol.
function contentRoutes(includeIndustrias = false): Routes {
  return [
    {
      path: '',
      loadComponent: () => import('./pages/landing-page').then((m) => m.LandingPageComponent),
      data: { es: homePageEs, en: homePageEn }
    },
    {
      path: 'software',
      loadComponent: () => import('./pages/landing-page').then((m) => m.LandingPageComponent),
      data: { es: softwarePageEs, en: softwarePageEn }
    },
    {
      // Detalle de cada sistema de software. El contenido lo resuelve el componente
      // por el :slug (ver systems-content.ts). Página terminal (header simplificado).
      path: 'software/:slug',
      loadComponent: () =>
        import('./pages/system-detail-page').then((m) => m.SystemDetailPageComponent)
    },
    {
      path: 'web',
      loadComponent: () => import('./pages/landing-page').then((m) => m.LandingPageComponent),
      data: { es: webPageEs, en: webPageEn }
    },
    {
      path: 'contacto',
      loadComponent: () => import('./pages/contact-page').then((m) => m.ContactPageComponent)
    },
    {
      path: 'politicas-de-privacidad',
      loadComponent: () => import('./pages/privacy-page').then((m) => m.PrivacyPageComponent)
    },
    // Industrias (bilingüe: en ambos árboles es/en). Antes del 404.
    ...(includeIndustrias
      ? [
          {
            path: 'industrias',
            loadComponent: () =>
              import('./pages/industries-page').then((m) => m.IndustriesPageComponent)
          },
          {
            path: 'industrias/:slug',
            loadComponent: () =>
              import('./pages/industry-detail-page').then((m) => m.IndustryDetailPageComponent)
          }
        ]
      : []),
    {
      path: '404',
      loadComponent: () => import('./pages/not-found-page').then((m) => m.NotFoundPageComponent)
    },
    // Catch-all relativo: dentro de /en → /en/404; en la raíz → /404.
    {
      path: '**',
      redirectTo: '404'
    }
  ];
}

// Dos árboles de idioma. 'en' primero para que /en/... matchee el subtree inglés. El parent
// componentless con path '' no agrega segmento → las URLs ES quedan idénticas (sin migración).
export const routes: Routes = [
  // Industrias bilingüe (es/en) en ambos árboles: el toggle del header cambia el idioma del contenido.
  { path: 'en', canActivate: [langGuard], data: { lang: 'en' }, children: contentRoutes(true) },
  { path: '', canActivate: [langGuard], data: { lang: 'es' }, children: contentRoutes(true) }
];
