// ─────────────────────────────────────────────────────────────────────────────
// Contenido de las páginas de industria (Nolo).
// Fuente única de verdad: transcrito VERBATIM de industrias_contenido.md
// (voseo argentino, tildes). No editar el copy "a ojo"; está aprobado.
//
// FASE 1: solo español. El inglés (y la versión "tú" de LinkDesign) se hará después
// → INDUSTRIES_CONTENT solo trae `es`; getIndustryDetail cae a `es` si piden otro idioma.
// Las rutas /en/industrias NO se registran (ver app.routes.ts), así que `en` nunca se pide.
//
// La sección de los landings usa la card (INDUSTRY_CARDS, derivada de acá → sin duplicar copy);
// la página /industrias/:slug usa el detalle completo (industry-detail-page.ts), resuelto por slug.
// ─────────────────────────────────────────────────────────────────────────────

export type IndustrySlug =
  | 'industria-y-produccion'
  | 'distribucion-y-logistica'
  | 'salud-y-bienestar'
  | 'servicios-profesionales'
  | 'servicios-tecnicos'
  | 'fitness-y-wellness'
  | 'educacion-y-formacion';

/** Icono Lucide representativo de la industria (hero + card). Resuelto por @switch en el template. */
export type IndustryIcon =
  | 'factory'
  | 'truck'
  | 'health'
  | 'briefcase'
  | 'wrench'
  | 'dumbbell'
  | 'education';

/** Tipo de pieza "que podríamos construir" → define el icono Lucide de cada card del bloque 5. */
export type BuildKind =
  | 'internal'
  | 'portal'
  | 'mobile'
  | 'billing'
  | 'web'
  | 'scheduling'
  | 'records'
  | 'crm';

export type BuildExample = {
  kind: BuildKind;
  /** Texto verbatim del ejemplo (1 frase). */
  text: string;
};

/** Las secciones de una industria, en un idioma. */
export type IndustryDetail = {
  slug: IndustrySlug;
  icon: IndustryIcon;
  /** Nombre corto (card, breadcrumb, contexto CRM). */
  name: string;
  /** Copy de la card (1 frase). */
  cardCopy: string;
  /** Subsectores ("Cubre:") → chips. */
  covers: string[];
  /** H1 de la página de detalle. */
  pageTitle: string;
  /** Subtítulo del hero. */
  subtitle: string;
  /** 02 — Lo que hacemos (3 párrafos). */
  whatWeDo: [string, string, string];
  /** 03 — Cómo se ve esto en el sector (2 párrafos + disclaimer honesto). */
  inTheSector: { paragraphs: [string, string]; disclaimer: string };
  /** 04 — Lo que vos ponés / lo que ponemos nosotros. */
  roles: { yours: string; ours: string };
  /** 05 — Algunas cosas que podríamos construir (intro + 5 ejemplos + cierre). */
  couldBuild: { intro: string; items: BuildExample[]; closing: string };
  /** 06 — Conversemos (CTA). */
  talk: { title: string; text: string };
};

/** Card liviana para la sección de los landings (derivada del detalle). */
export type IndustryCard = {
  slug: IndustrySlug;
  icon: IndustryIcon;
  name: string;
  copy: string;
  covers: string[];
};

export const INDUSTRIES_CONTENT: Record<IndustrySlug, { es: IndustryDetail; en?: IndustryDetail }> = {
  // ───────────────────────────────────────────────────────────────────────────
  'industria-y-produccion': {
    es: {
      slug: 'industria-y-produccion',
      icon: 'factory',
      name: 'Industria y producción',
      cardCopy:
        'Sistemas que ordenan empresas que producen, transforman o procesan, donde el día a día depende de planificación, costos y despacho a tiempo.',
      covers: ['metalúrgicas', 'manufactureras', 'textiles', 'alimenticias', 'frigoríficos', 'agroindustria'],
      pageTitle: 'Soluciones a medida para industria y producción',
      subtitle:
        'Software, sitios web y herramientas digitales para metalúrgicas, manufactureras, textiles, alimenticias, frigoríficos y agroindustria. Sin enlatados ni plantillas.',
      whatWeDo: [
        'Convertimos la operación que ya está pasando en tu empresa en un sistema digital que la ordene. Tomamos todo lo que hoy vive en planillas, papeles, pizarras de planta y memoria del equipo, y lo transformamos en algo que tu producción pueda registrar, seguir, controlar y consultar desde un solo lugar.',
        'Esto no cambia cómo producís. Cambia cómo se ve y se administra la información que tu operación genera todos los días: desde la cotización hasta el despacho, pasando por la planificación, el costo, la calidad y la comunicación con clientes. Para que el dato trabaje a tu favor, en vez de obligar al equipo a perseguirlo.',
        'Da igual si tenés un taller chico con un par de máquinas, una planta mediana con varios turnos o una empresa con sedes en distintas zonas. Lo que diseñamos se adapta al tamaño y al nivel de complejidad de tu operación. No te vendemos sistemas industriales gigantes con módulos que nunca vas a usar. Te construimos exactamente la solución que tu producción necesita ahora, con margen para crecer cuando crezcas.'
      ],
      inTheSector: {
        paragraphs: [
          'Cuando hablamos con gente que dirige una metalúrgica, una textil, una alimenticia o un frigorífico escuchamos cosas que se repiten. Planillas que crecieron hasta volverse imposibles de mantener. Cotizaciones que después no coinciden con los costos reales y nadie sabe bien por qué. Información de OTs y lotes que vive en la cabeza de quien las armó. Comunicación con clientes B2B distribuida entre mails, mensajes y llamadas sin un solo lugar donde quede registro.',
          'No son problemas exclusivos de un rubro pero, juntos, forman un cuadro que cualquier empresa que produce termina enfrentando.'
        ],
        disclaimer:
          'Y acá te lo aclaramos directo: no somos industriales. No tenemos planta propia, no operamos tus máquinas, no entendemos los matices técnicos de tu producción específica ni vamos a pretender hacerlo. Eso es lo tuyo y lo respetamos. Lo que sí hacemos es escuchar cómo funciona tu operación en concreto y traducirla en software que la haga más simple de gestionar.'
      },
      roles: {
        yours:
          'El conocimiento de cómo se produce en tu empresa. Qué hacés, con qué materias primas, en qué equipos, para qué clientes. Las particularidades de tu rubro, tus tiempos y tus márgenes. Las decisiones operativas y de prioridad que solo vos podés tomar.',
        ours:
          'La metodología para escuchar y entender tu operación en profundidad. La arquitectura técnica del sistema. El desarrollo del software, del sitio web, del portal de clientes o de lo que la solución necesite incluir. El acompañamiento durante la implementación y el soporte después.'
      },
      couldBuild: {
        intro:
          'Estos son ejemplos de piezas que han surgido en proyectos del sector y que pueden formar parte de tu solución, juntas o por separado según lo que necesites.',
        items: [
          {
            kind: 'internal',
            text: 'Un sistema interno que registre OTs, lotes o pedidos desde la cotización hasta el despacho, con tiempos por etapa y visibilidad real del estado de cada trabajo.'
          },
          {
            kind: 'billing',
            text: 'Un módulo de cotización y costos que tome valores actualizados de materia prima, mano de obra y uso de equipos, calcule costo estimado y deje trazabilidad de cómo se armó cada presupuesto.'
          },
          {
            kind: 'portal',
            text: 'Un portal para clientes B2B donde puedan consultar el estado de sus pedidos, descargar comprobantes, solicitar cotizaciones nuevas y dejar consultas sin pasar por mail.'
          },
          {
            kind: 'web',
            text: 'Un sitio web que comunique con seriedad a qué se dedica tu empresa, qué tipo de producción realiza y cómo contactarte, con formularios de cotización que entren directo al sistema interno.'
          },
          {
            kind: 'mobile',
            text: 'Una app o pantalla en planta para que el responsable de producción marque avances, registre incidentes o consulte stock sin tener que volver a la oficina.'
          }
        ],
        closing:
          'Todas estas piezas pueden formar parte de una misma solución integral. No separamos software por un lado y sitio web por el otro. Diseñamos la solución completa, en bloques que se complementan según lo que tu empresa necesita.'
      },
      talk: {
        title: 'Conversemos sobre tu producción',
        text: 'Si te interesa explorar qué solución a medida tendría sentido para tu operación, conversemos. La primera charla es para entender cómo producís hoy, qué te ayuda a estar ordenado y qué te complica. No vendemos paquetes cerrados.'
      }
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  'distribucion-y-logistica': {
    es: {
      slug: 'distribucion-y-logistica',
      icon: 'truck',
      name: 'Distribución, logística y comercio B2B',
      cardCopy:
        'Sistemas que ordenan empresas que mueven productos, gestionan stock y venden a otras empresas, donde el día a día depende de pedidos, despachos y cobros que no pueden fallar.',
      covers: [
        'distribuidoras mayoristas',
        'importadoras',
        'operadores logísticos',
        'transporte de cargas',
        'representaciones comerciales',
        'venta B2B'
      ],
      pageTitle: 'Soluciones a medida para distribución, logística y comercio B2B',
      subtitle:
        'Software, sitios web y herramientas digitales para distribuidoras, importadoras, operadores logísticos, transporte de cargas y empresas de venta mayorista. Sin enlatados ni plantillas.',
      whatWeDo: [
        'Convertimos la operación que ya está pasando en tu empresa en un sistema digital que la ordene. Tomamos todo lo que hoy vive en planillas, mails, mensajes de WhatsApp con vendedores y cuadernos en el depósito, y lo transformamos en algo que tu negocio pueda registrar, seguir, controlar y consultar desde un solo lugar.',
        'Esto no cambia cómo vendés ni cómo movés mercadería. Cambia cómo se ve y se administra todo lo que pasa entre el pedido y el cobro: stock, despacho, ruteros, facturación, cuentas corrientes y comunicación con cartera de clientes. Para que la información trabaje a tu favor en lugar de demandarte el tiempo del equipo para perseguirla.',
        'Da igual si tenés un depósito solo con un par de empleados, varias sucursales con vendedores propios o una operación logística con flota y rutas armadas. Lo que diseñamos se adapta al tamaño y a la complejidad de tu operación. No te vendemos sistemas ERP gigantes con módulos que nunca vas a usar. Te construimos exactamente la solución que tu empresa necesita ahora, con margen para crecer cuando crezcas.'
      ],
      inTheSector: {
        paragraphs: [
          'Cuando hablamos con gente que dirige una distribuidora, una importadora o un operador logístico escuchamos cosas que se repiten. Pedidos que entran por WhatsApp, por teléfono y por mail sin un lugar único donde estén centralizados. Stock que no coincide con lo que dice el sistema porque las cargas se hacen a mano y siempre tarde. Cuentas corrientes que se llevan en Excel paralelo al sistema oficial. Vendedores en ruta que tardan en pasar los pedidos. Facturación que se demora y termina demorando los cobros.',
          'No son problemas exclusivos del sector pero, juntos, son la combinación típica de cualquier empresa que mueve mercadería y vende a otras empresas.'
        ],
        disclaimer:
          'Y acá te lo aclaramos directo: no somos distribuidores ni operadores logísticos. No tenemos depósito propio, no manejamos rutas ni importaciones, no entendemos las complejidades específicas de tu cadena. Eso es lo tuyo y lo respetamos. Lo que sí hacemos es escuchar cómo funciona tu operación en concreto y traducirla en software que la haga más simple de gestionar.'
      },
      roles: {
        yours:
          'El conocimiento de cómo se mueve la mercadería en tu empresa. Qué vendés o transportás, para qué clientes, en qué tiempos, desde qué depósitos o puertos. Los acuerdos comerciales, los márgenes y los plazos de pago con cada cliente. Las decisiones operativas y de prioridad que solo vos podés tomar.',
        ours:
          'La metodología para escuchar y entender tu operación en profundidad. La arquitectura técnica del sistema. El desarrollo del software, del sitio web, del portal de clientes o de lo que la solución necesite incluir. El acompañamiento durante la implementación y el soporte después.'
      },
      couldBuild: {
        intro:
          'Estos son ejemplos de piezas que han surgido en proyectos del sector y que pueden formar parte de tu solución, juntas o por separado según lo que necesites.',
        items: [
          {
            kind: 'internal',
            text: 'Un sistema interno que centralice pedidos, controle stock por depósito en tiempo real y administre el flujo desde la carga del pedido hasta el despacho final.'
          },
          {
            kind: 'portal',
            text: 'Un portal para clientes B2B donde puedan ver el catálogo con su lista de precios particular, cargar pedidos directamente, consultar su cuenta corriente y descargar comprobantes.'
          },
          {
            kind: 'mobile',
            text: 'Una app o solución móvil para vendedores en ruta o representantes que les permita cargar pedidos en el momento, ver stock actualizado y consultar la cuenta corriente del cliente desde el celular.'
          },
          {
            kind: 'billing',
            text: 'Un módulo de gestión de cuentas corrientes y cobros que cruce facturación con pagos, marque vencimientos, alerte sobre saldos críticos y deje reportes claros por cliente.'
          },
          {
            kind: 'web',
            text: 'Un sitio web institucional que comunique con seriedad a qué se dedica tu empresa, qué productos o servicios distribuye y cómo contactarte, con formularios que entren directo al sistema interno.'
          }
        ],
        closing:
          'Todas estas piezas pueden formar parte de una misma solución integral. No separamos software por un lado y sitio web por el otro. Diseñamos la solución completa, en bloques que se complementan según lo que tu empresa necesita.'
      },
      talk: {
        title: 'Conversemos sobre tu operación',
        text: 'Si te interesa explorar qué solución a medida tendría sentido para tu empresa, conversemos. La primera charla es para entender cómo opera tu negocio hoy, qué te ayuda a estar ordenado y qué te complica. No vendemos paquetes cerrados.'
      }
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  'salud-y-bienestar': {
    es: {
      slug: 'salud-y-bienestar',
      icon: 'health',
      name: 'Salud y bienestar',
      cardCopy:
        'Sistemas que ordenan centros y consultorios donde la operación gira alrededor del paciente, la agenda, los profesionales y la calidad del seguimiento.',
      covers: [
        'clínicas médicas',
        'consultorios odontológicos',
        'kinesiología',
        'estética médica',
        'veterinarias'
      ],
      pageTitle: 'Soluciones a medida para salud y bienestar',
      subtitle:
        'Software, sitios web y herramientas digitales para clínicas médicas, consultorios odontológicos, centros de kinesiología, estética médica y veterinarias. Sin enlatados ni plantillas.',
      whatWeDo: [
        'Convertimos la operación que ya está pasando en tu centro o consultorio en un sistema digital que la ordene. Tomamos los turnos que se anotan en cuadernos o en planillas, las historias que viven en Word o en papel, las planillas de coberturas, los mensajes con pacientes y todo lo demás que tu equipo gestiona a mano, y lo transformamos en algo que el día a día pueda registrar, seguir, controlar y consultar desde un solo lugar.',
        'Esto no cambia cómo atendés. Cambia cómo se ve y se administra todo lo que pasa antes y después de la consulta o de la atención, para que la información de tu centro trabaje a favor del equipo en lugar de complicarlo.',
        'Da igual si sos un consultorio individual, una clínica con varios profesionales o un centro con varias sedes. Lo que diseñamos se adapta al tamaño y al modo de trabajo de tu operación. No te vendemos sistemas hospitalarios con cien módulos que nunca vas a usar. Te construimos exactamente la solución que tu centro necesita ahora, con margen para crecer cuando crezcas.'
      ],
      inTheSector: {
        paragraphs: [
          'Cuando hablamos con gente que dirige una clínica médica, un consultorio odontológico, un centro de kinesiología, una clínica de estética médica o una veterinaria escuchamos cosas que se repiten. Software de turnos que se quedó viejo o está atado a una sola cobertura. Historia clínica que vive en distintos formatos según el profesional que la lleva. Facturación armada a mano cruzando coberturas, prepagas y particulares. Recordatorios de turno que se mandan uno por uno por WhatsApp. Información del paciente o del cliente dispersa entre el sistema, el cuaderno y la memoria del personal administrativo.',
          'No son problemas exclusivos del sector pero, juntos, forman un cuadro que cualquier centro con cierto movimiento termina enfrentando.'
        ],
        disclaimer:
          'Y acá te lo aclaramos directo: no somos médicos, ni odontólogos, ni kinesiólogos, ni veterinarios. No hacemos diagnósticos, no entendemos los protocolos específicos de tu disciplina ni vamos a pretender opinar sobre cómo atendés. Eso es lo tuyo y lo respetamos. Lo que sí hacemos es escuchar cómo funciona tu centro en concreto y traducir esa operación en software que la haga más simple de gestionar.'
      },
      roles: {
        yours:
          'El conocimiento de cómo se atiende en tu centro. Quiénes son tus profesionales, qué especialidades o servicios brindás, qué tipo de pacientes o clientes recibís, qué coberturas aceptás, cómo se organiza la agenda y qué hace al día a día más complicado de lo necesario. Las decisiones clínicas y operativas que solo vos podés tomar.',
        ours:
          'La metodología para escuchar y entender esa operación con detalle. La arquitectura técnica del sistema. El desarrollo del software, del sitio web, del portal de pacientes o de lo que la solución necesite incluir. El acompañamiento durante la implementación y el soporte después.'
      },
      couldBuild: {
        intro:
          'Estos son ejemplos de piezas que han surgido en proyectos del sector y que pueden formar parte de tu solución, juntas o por separado según lo que necesites.',
        items: [
          {
            kind: 'scheduling',
            text: 'Un sistema de agenda integrada que centraliza turnos de todos los profesionales, controla disponibilidad real, gestiona sobreturnos y permite que el paciente o cliente confirme o cancele desde su celular.'
          },
          {
            kind: 'billing',
            text: 'Un módulo de facturación que cruza atención con cobertura, calcula honorarios por profesional y deja reportes claros de ingresos por especialidad, por obra social, por prepaga o particular.'
          },
          {
            kind: 'records',
            text: 'Un sistema de historia clínica electrónica adaptado al flujo de tu disciplina, con campos personalizados, plantillas reutilizables y acceso controlado por profesional.'
          },
          {
            kind: 'web',
            text: 'Un sitio web institucional que comunique con claridad qué especialidades o servicios atendés, qué coberturas aceptás y cómo se sacan turnos, con formularios que entren directo a la agenda.'
          },
          {
            kind: 'portal',
            text: 'Un portal para pacientes o clientes donde puedan ver sus turnos, descargar recetas, indicaciones o informes, confirmar consultas y dejar feedback de la atención recibida.'
          }
        ],
        closing:
          'Todas estas piezas pueden formar parte de una misma solución integral. No separamos software por un lado y sitio web por el otro. Diseñamos la solución completa, en bloques que se complementan según lo que tu centro necesita.'
      },
      talk: {
        title: 'Conversemos sobre tu centro o consultorio',
        text: 'Si te interesa explorar qué solución a medida tendría sentido para tu operación, conversemos. La primera charla es para entender cómo se atiende en tu centro hoy, qué te ayuda a estar ordenado y qué te complica. No vendemos paquetes cerrados.'
      }
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  'servicios-profesionales': {
    es: {
      slug: 'servicios-profesionales',
      icon: 'briefcase',
      name: 'Servicios profesionales',
      cardCopy:
        'Sistemas que ordenan estudios y empresas donde el activo principal son las personas y las horas, y donde la calidad del trabajo depende de qué tan claro está cada proyecto.',
      covers: ['estudios jurídicos', 'contables', 'consultoras', 'empresas de TI', 'arquitectura', 'ingeniería'],
      pageTitle: 'Soluciones a medida para servicios profesionales',
      subtitle:
        'Software, sitios web y herramientas digitales para estudios jurídicos, contables, consultoras, empresas de TI, arquitectura e ingeniería. Sin enlatados ni plantillas.',
      whatWeDo: [
        'Convertimos la operación que ya está pasando en tu estudio o empresa en un sistema digital que la ordene. Tomamos las horas que se registran a mano o no se registran del todo, los proyectos que viven en carpetas de drive, los mails con clientes que se acumulan sin trazabilidad y la facturación que se arma cada fin de mes con esfuerzo, y lo transformamos en algo que tu equipo pueda registrar, seguir, controlar y consultar desde un solo lugar.',
        'Esto no cambia cómo trabajás con tus clientes. Cambia cómo se ve y se administra todo lo que pasa alrededor: el registro de tiempos, el avance de proyectos, la comunicación con clientes, los cobros y la rentabilidad real de cada trabajo. Para que el conocimiento que hoy depende de algunas personas clave quede sostenido por el sistema.',
        'Da igual si sos un estudio chico de dos o tres profesionales, una firma mediana con varios socios y equipo, o una empresa con clientes en distintas industrias. Lo que diseñamos se adapta al tamaño y al modo de trabajo de tu organización. No te vendemos sistemas corporativos con módulos que nunca vas a usar. Te construimos exactamente la solución que tu estudio o empresa necesita ahora, con margen para crecer cuando crezcas.'
      ],
      inTheSector: {
        paragraphs: [
          'Cuando hablamos con gente que dirige un estudio jurídico, una consultora contable, una empresa de desarrollo de TI o un estudio de arquitectura escuchamos cosas que se repiten. Horas que se pierden porque no se registran a tiempo o quedan en planillas que después nadie consolida. Facturación que se arma a mano al final del mes con un esfuerzo desproporcionado. Información de proyectos que vive en mails, drives y mensajes sueltos sin un lugar central. Conocimiento de cómo se hacen las cosas que depende de la memoria de algunas personas clave del equipo.',
          'No son problemas exclusivos del sector pero, juntos, son la combinación típica de cualquier organización donde el activo principal son las personas y el tiempo que dedican.'
        ],
        disclaimer:
          'Y acá te lo aclaramos directo: no somos abogados, ni contadores, ni consultores. No conocemos los detalles técnicos de tu profesión ni vamos a opinar sobre cómo hacés tu trabajo. Eso es lo tuyo y lo respetamos. Lo que sí hacemos es escuchar cómo funciona tu estudio o empresa en concreto y traducir esa operación en software que la haga más simple de gestionar.'
      },
      roles: {
        yours:
          'El conocimiento de cómo trabaja tu estudio o empresa. Qué tipo de clientes manejás, qué tipo de proyectos o casos llevás adelante, cómo cobrás (por horas, por hito, por proyecto o por retainer), qué hace a tu equipo distinto en el mercado. Las decisiones operativas y comerciales que solo vos podés tomar.',
        ours:
          'La metodología para escuchar y entender tu operación en profundidad. La arquitectura técnica del sistema. El desarrollo del software, del sitio web, del portal de clientes o de lo que la solución necesite incluir. El acompañamiento durante la implementación y el soporte después.'
      },
      couldBuild: {
        intro:
          'Estos son ejemplos de piezas que han surgido en proyectos del sector y que pueden formar parte de tu solución, juntas o por separado según lo que necesites.',
        items: [
          {
            kind: 'records',
            text: 'Un sistema de registro de horas por persona, proyecto y cliente, que permita ver en tiempo real cuánto se invirtió en cada trabajo y comparar contra lo cotizado o presupuestado.'
          },
          {
            kind: 'billing',
            text: 'Un módulo de facturación flexible que cobre por horas, por hitos, por proyecto o por retainer, calcule automáticamente lo facturable y deje trazabilidad clara de qué se cobró y qué falta.'
          },
          {
            kind: 'portal',
            text: 'Un portal para clientes donde puedan ver el avance del proyecto o caso, descargar entregables, dejar comentarios y consultar el estado de su cuenta sin tener que mandar un mail.'
          },
          {
            kind: 'crm',
            text: 'Un CRM adaptado al ciclo de venta de tu sector, con seguimiento de propuestas, conversaciones con prospectos y conversión de oportunidades a proyectos activos.'
          },
          {
            kind: 'web',
            text: 'Un sitio web institucional que comunique con seriedad qué hace tu estudio o empresa, en qué áreas trabaja y cómo contactarte, con formularios que entren directo al CRM o al sistema interno.'
          }
        ],
        closing:
          'Todas estas piezas pueden formar parte de una misma solución integral. No separamos software por un lado y sitio web por el otro. Diseñamos la solución completa, en bloques que se complementan según lo que tu organización necesita.'
      },
      talk: {
        title: 'Conversemos sobre tu estudio o empresa',
        text: 'Si te interesa explorar qué solución a medida tendría sentido para tu operación, conversemos. La primera charla es para entender cómo trabaja hoy tu estudio o empresa, qué te ayuda a estar ordenado y qué te complica. No vendemos paquetes cerrados.'
      }
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  'servicios-tecnicos': {
    es: {
      slug: 'servicios-tecnicos',
      icon: 'wrench',
      name: 'Servicios técnicos B2B',
      cardCopy:
        'Sistemas que ordenan empresas que prestan servicios técnicos a otras empresas, donde el día a día depende de coordinar técnicos, contratos y respuesta a tiempo.',
      covers: [
        'HVAC',
        'mantenimiento industrial',
        'instalaciones eléctricas',
        'electromecánica',
        'redes',
        'limpieza profesional'
      ],
      pageTitle: 'Soluciones a medida para servicios técnicos B2B',
      subtitle:
        'Software, sitios web y herramientas digitales para empresas de HVAC, mantenimiento industrial, instalaciones eléctricas, electromecánica, redes y limpieza profesional. Sin enlatados ni plantillas.',
      whatWeDo: [
        'Convertimos la operación que ya está pasando en tu empresa en un sistema digital que la ordene. Tomamos las órdenes de servicio que se anotan en papel, los reportes de visita que vuelven en cuadernos o en mensajes de WhatsApp del técnico, los contratos que viven en carpetas físicas, los cobros que se demoran porque la facturación se arma a mano, y lo transformamos en algo que tu negocio pueda registrar, seguir, controlar y consultar desde un solo lugar.',
        'Esto no cambia cómo prestás el servicio. Cambia cómo se ve y se administra todo lo que pasa alrededor: la planificación de visitas, la coordinación con técnicos, el control de contratos, la facturación recurrente y la comunicación con tus clientes. Para que el dato trabaje a tu favor en lugar de demandarte el tiempo del equipo administrativo para perseguirlo.',
        'Da igual si tenés un par de técnicos haciendo visitas, un equipo mediano con varios contratos vigentes o una empresa con servicio en distintas zonas. Lo que diseñamos se adapta al tamaño y al modo de trabajo de tu operación. No te vendemos sistemas de gestión gigantes con módulos que nunca vas a usar. Te construimos exactamente la solución que tu empresa necesita ahora, con margen para crecer cuando crezcas.'
      ],
      inTheSector: {
        paragraphs: [
          'Cuando hablamos con gente que dirige una empresa de HVAC, de mantenimiento industrial, de instalaciones eléctricas o de servicios de redes escuchamos cosas que se repiten. Órdenes de servicio que se arman a mano y se pierden entre papeles. Técnicos en ruta que tardan en pasar los reportes de visita y el cobro se demora. Contratos con vencimientos que nadie controla hasta que el cliente reclama. Stock de repuestos que no coincide con la realidad del depósito. Facturación recurrente que se arma cliente por cliente con esfuerzo desproporcionado.',
          'No son problemas exclusivos del sector pero, juntos, son la combinación típica de cualquier empresa que presta servicios técnicos a otras empresas.'
        ],
        disclaimer:
          'Y acá te lo aclaramos directo: no somos técnicos en HVAC, ni en electricidad industrial, ni en redes. No instalamos equipos, no hacemos mantenimiento en sitio ni vamos a opinar sobre cómo se hace el trabajo técnico. Eso es lo tuyo y lo respetamos. Lo que sí hacemos es escuchar cómo funciona tu empresa en concreto y traducir esa operación en software que la haga más simple de gestionar.'
      },
      roles: {
        yours:
          'El conocimiento de cómo opera tu empresa. Qué servicios prestás, a qué tipo de clientes, con qué técnicos, en qué zonas, qué contratos manejás y qué SLA tenés que cumplir. Las decisiones operativas y comerciales que solo vos podés tomar.',
        ours:
          'La metodología para escuchar y entender tu operación en profundidad. La arquitectura técnica del sistema. El desarrollo del software, del sitio web, del portal de clientes o de lo que la solución necesite incluir. El acompañamiento durante la implementación y el soporte después.'
      },
      couldBuild: {
        intro:
          'Estos son ejemplos de piezas que han surgido en proyectos del sector y que pueden formar parte de tu solución, juntas o por separado según lo que necesites.',
        items: [
          {
            kind: 'internal',
            text: 'Un sistema interno que registre órdenes de servicio desde la solicitud del cliente hasta el cierre, con asignación de técnicos, planificación de visitas y trazabilidad del estado de cada trabajo.'
          },
          {
            kind: 'mobile',
            text: 'Una app o solución móvil para técnicos en ruta que les permita ver sus visitas del día, cargar reportes en sitio, adjuntar fotos del trabajo y firmar conformidad del cliente sin pasar por la oficina.'
          },
          {
            kind: 'billing',
            text: 'Un módulo de gestión de contratos con vencimientos, SLA, renovaciones automáticas y facturación recurrente que se dispara según lo acordado con cada cliente.'
          },
          {
            kind: 'portal',
            text: 'Un portal para clientes B2B donde puedan solicitar servicios, consultar el estado de sus órdenes, descargar reportes de visita firmados y ver el histórico de mantenimientos realizados.'
          },
          {
            kind: 'web',
            text: 'Un sitio web institucional que comunique con seriedad qué servicios técnicos brinda tu empresa, en qué sectores trabaja y cómo contactarte, con formularios de solicitud que entren directo al sistema interno.'
          }
        ],
        closing:
          'Todas estas piezas pueden formar parte de una misma solución integral. No separamos software por un lado y sitio web por el otro. Diseñamos la solución completa, en bloques que se complementan según lo que tu empresa necesita.'
      },
      talk: {
        title: 'Conversemos sobre tu operación',
        text: 'Si te interesa explorar qué solución a medida tendría sentido para tu empresa, conversemos. La primera charla es para entender cómo opera tu negocio hoy, qué te ayuda a estar ordenado y qué te complica. No vendemos paquetes cerrados.'
      }
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  'fitness-y-wellness': {
    es: {
      slug: 'fitness-y-wellness',
      icon: 'dumbbell',
      name: 'Fitness, wellness y deportes',
      cardCopy:
        'Sistemas que ordenan centros donde la operación gira alrededor de socios, suscripciones recurrentes, agenda de clases y experiencia del cliente.',
      covers: ['gimnasios', 'centros wellness', 'yoga', 'pilates', 'crossfit', 'boxeo', 'estética'],
      pageTitle: 'Soluciones a medida para fitness, wellness y deportes',
      subtitle:
        'Software, sitios web y herramientas digitales para gimnasios, centros wellness, estudios de yoga, pilates, crossfit, boxeo y centros de estética. Sin enlatados ni plantillas.',
      whatWeDo: [
        'Convertimos la operación que ya está pasando en tu centro en un sistema digital que la ordene. Tomamos las reservas que entran por WhatsApp, por mail y por presencial, los planes de socios que se cobran a mano cada mes, la asistencia que se anota en cuadernos, la comunicación con clientes que vive en mensajes sueltos, y lo transformamos en algo que tu negocio pueda registrar, seguir, controlar y consultar desde un solo lugar.',
        'Esto no cambia cómo entrenás, atendés o brindás el servicio. Cambia cómo se ve y se administra todo lo que pasa alrededor: la gestión de socios, los cobros recurrentes, la asistencia, la agenda de clases, los profesionales y la comunicación con tu cartera. Para que la información trabaje a favor del equipo en lugar de complicarle el día.',
        'Da igual si tenés un estudio chico con una sola sala, un gimnasio mediano con varios entrenadores, una cadena con varias sedes o un centro de estética con cabinas independientes. Lo que diseñamos se adapta al tamaño y al modo de trabajo de tu operación. No te vendemos sistemas con cientos de funcionalidades que nunca vas a usar. Te construimos exactamente la solución que tu centro necesita ahora, con margen para crecer cuando crezcas.'
      ],
      inTheSector: {
        paragraphs: [
          'Cuando hablamos con gente que dirige un gimnasio, un estudio de yoga, un centro wellness o un local de estética escuchamos cosas que se repiten. Reservas que entran por tres o cuatro canales distintos sin centralización. Cobros mensuales que se hacen a mano cliente por cliente. Socios que dejan de venir sin que nadie se entere a tiempo. Asistencia que se anota en planilla y nunca se cruza con el cobro. Comunicación con la cartera que depende de quien tenga el WhatsApp del centro abierto ese día.',
          'No son problemas exclusivos del sector pero, juntos, son la combinación típica de cualquier centro que vive de suscripciones recurrentes y experiencia del cliente.'
        ],
        disclaimer:
          'Y acá te lo aclaramos directo: no somos entrenadores, ni profesores de yoga, ni esteticistas. No diseñamos rutinas, no damos clases ni vamos a opinar sobre cómo entrenás o cómo atendés. Eso es lo tuyo y lo respetamos. Lo que sí hacemos es escuchar cómo funciona tu centro en concreto y traducir esa operación en software que la haga más simple de gestionar.'
      },
      roles: {
        yours:
          'El conocimiento de cómo opera tu centro. Qué tipo de socios o clientes tenés, qué planes ofrecés, qué clases o servicios brindás, cómo se organiza la agenda y qué hace que tu lugar sea distinto a los demás. Las decisiones operativas y comerciales que solo vos podés tomar.',
        ours:
          'La metodología para escuchar y entender tu operación en profundidad. La arquitectura técnica del sistema. El desarrollo del software, del sitio web, del portal de socios o de lo que la solución necesite incluir. El acompañamiento durante la implementación y el soporte después.'
      },
      couldBuild: {
        intro:
          'Estos son ejemplos de piezas que han surgido en proyectos del sector y que pueden formar parte de tu solución, juntas o por separado según lo que necesites.',
        items: [
          {
            kind: 'internal',
            text: 'Un sistema de gestión de socios con fichas individuales, planes activos, historial de asistencia y de pagos, alertas de bajas y vistas claras del estado de la cartera.'
          },
          {
            kind: 'billing',
            text: 'Un módulo de cobros recurrentes que automatice las renovaciones de membresía, integre pasarelas de pago y deje reportes claros de ingresos por plan, por sede y por mes.'
          },
          {
            kind: 'scheduling',
            text: 'Una agenda de reservas integrada que centralice turnos y clases de todos los profesionales, controle cupos en tiempo real y permita que el socio reserve, confirme o cancele desde su celular.'
          },
          {
            kind: 'portal',
            text: 'Un portal o app para socios donde puedan ver sus reservas, gestionar su plan, dejar feedback, consultar pagos y comunicarse con el centro sin pasar por WhatsApp.'
          },
          {
            kind: 'web',
            text: 'Un sitio web institucional que comunique con claridad qué clases o servicios ofrecés, qué planes tenés disponibles, dónde están tus sedes y cómo sumarse, con formularios de inscripción que entren directo al sistema interno.'
          }
        ],
        closing:
          'Todas estas piezas pueden formar parte de una misma solución integral. No separamos software por un lado y sitio web por el otro. Diseñamos la solución completa, en bloques que se complementan según lo que tu centro necesita.'
      },
      talk: {
        title: 'Conversemos sobre tu centro',
        text: 'Si te interesa explorar qué solución a medida tendría sentido para tu operación, conversemos. La primera charla es para entender cómo funciona tu centro hoy, qué te ayuda a estar ordenado y qué te complica. No vendemos paquetes cerrados.'
      }
    }
  },

  // ───────────────────────────────────────────────────────────────────────────
  'educacion-y-formacion': {
    es: {
      slug: 'educacion-y-formacion',
      icon: 'education',
      name: 'Educación y formación',
      cardCopy:
        'Sistemas que ordenan instituciones donde la operación gira alrededor de cohortes, profesores, asistencia y experiencia del alumno.',
      covers: [
        'institutos privados',
        'academias de idiomas',
        'escuelas técnicas',
        'capacitación profesional',
        'formación corporativa'
      ],
      pageTitle: 'Soluciones a medida para educación y formación',
      subtitle:
        'Software, sitios web y herramientas digitales para institutos privados, academias de idiomas, escuelas técnicas, centros de capacitación profesional y formación corporativa. Sin enlatados ni plantillas.',
      whatWeDo: [
        'Convertimos la operación que ya está pasando en tu institución en un sistema digital que la ordene. Tomamos las inscripciones que entran por web, por mail y por WhatsApp, los pagos de cuotas que se cobran alumno por alumno, la asistencia que se anota en cuadernos, los reportes de profesores que vuelven en planillas sueltas, la comunicación con alumnos y familias que vive en mensajes dispersos, y lo transformamos en algo que tu institución pueda registrar, seguir, controlar y consultar desde un solo lugar.',
        'Esto no cambia cómo enseñás. Cambia cómo se ve y se administra todo lo que pasa alrededor: la gestión de cohortes, los cobros recurrentes, la asistencia de alumnos, la coordinación con profesores y la comunicación con tu comunidad. Para que el equipo administrativo trabaje con información clara en lugar de perseguir datos sueltos.',
        'Da igual si sos una academia chica con un par de cursos activos, un instituto mediano con varias cohortes en simultáneo, una escuela técnica con muchas materias o un proveedor de formación corporativa que dicta capacitaciones a empresas. Lo que diseñamos se adapta al tamaño y al modo de trabajo de tu institución. No te vendemos sistemas educativos gigantes con módulos que nunca vas a usar. Te construimos exactamente la solución que tu institución necesita ahora, con margen para crecer cuando crezcas.'
      ],
      inTheSector: {
        paragraphs: [
          'Cuando hablamos con gente que dirige un instituto privado, una academia de idiomas, una escuela técnica o un centro de capacitación escuchamos cosas que se repiten. Inscripciones que entran por distintos canales sin centralización. Pagos de cuotas que se gestionan a mano alumno por alumno. Asistencia que se anota en planilla y nunca se cruza con el estado de cuenta. Comunicación con alumnos y familias que depende de quien atienda el teléfono o el WhatsApp. Profesores que entregan notas y reportes en formatos distintos.',
          'No son problemas exclusivos del sector pero, juntos, son la combinación típica de cualquier institución que vive de cohortes, cuotas recurrentes y comunidad activa.'
        ],
        disclaimer:
          'Y acá te lo aclaramos directo: no somos docentes, ni pedagogos, ni especialistas en formación. No diseñamos planes de estudio, no damos clases ni vamos a opinar sobre cómo enseñás. Eso es lo tuyo y lo respetamos. Lo que sí hacemos es escuchar cómo funciona tu institución en concreto y traducir esa operación en software que la haga más simple de gestionar.'
      },
      roles: {
        yours:
          'El conocimiento de cómo opera tu institución. Qué cursos o programas ofrecés, cómo se organizan las cohortes, qué profesores tenés, cómo cobrás (cuotas, matrículas, paquetes), qué tipo de alumnos recibís y qué hace que tu propuesta sea distinta. Las decisiones académicas y operativas que solo vos podés tomar.',
        ours:
          'La metodología para escuchar y entender esa operación en profundidad. La arquitectura técnica del sistema. El desarrollo del software, del sitio web, del portal de alumnos o de lo que la solución necesite incluir. El acompañamiento durante la implementación y el soporte después.'
      },
      couldBuild: {
        intro:
          'Estos son ejemplos de piezas que han surgido en proyectos del sector y que pueden formar parte de tu solución, juntas o por separado según lo que necesites.',
        items: [
          {
            kind: 'internal',
            text: 'Un sistema de gestión de alumnos con fichas individuales, cohortes activas, historial académico, asistencia, pagos y comunicación, todo accesible desde un solo lugar.'
          },
          {
            kind: 'billing',
            text: 'Un módulo de cobros recurrentes para cuotas y matrículas que automatice vencimientos, integre pasarelas de pago y deje reportes claros de ingresos por curso, por cohorte y por mes.'
          },
          {
            kind: 'portal',
            text: 'Un portal para alumnos donde puedan consultar su asistencia, ver sus notas o avances, acceder a material de estudio, comunicarse con la institución y gestionar sus pagos sin tener que pasar por administración.'
          },
          {
            kind: 'records',
            text: 'Un sistema interno de gestión académica para profesores que les permita cargar notas, registrar asistencia, hacer reportes de cohorte y comunicarse con sus alumnos desde la misma plataforma.'
          },
          {
            kind: 'web',
            text: 'Un sitio web institucional que comunique con claridad qué cursos o programas dicta tu institución, qué profesores tiene, cómo son los planes y cómo inscribirse, con formularios que entren directo al sistema de gestión.'
          }
        ],
        closing:
          'Todas estas piezas pueden formar parte de una misma solución integral. No separamos software por un lado y sitio web por el otro. Diseñamos la solución completa, en bloques que se complementan según lo que tu institución necesita.'
      },
      talk: {
        title: 'Conversemos sobre tu institución',
        text: 'Si te interesa explorar qué solución a medida tendría sentido para tu operación, conversemos. La primera charla es para entender cómo funciona tu institución hoy, qué te ayuda a estar ordenada y qué te complica. No vendemos paquetes cerrados.'
      }
    }
  }
};

/** Resuelve el detalle de una industria por slug + idioma. null si el slug no existe.
 *  Fase 1: solo hay `es`; si piden otro idioma cae a `es` (no debería pasar: /en no se registra). */
export function getIndustryDetail(slug: string | null, lang: 'es' | 'en'): IndustryDetail | null {
  if (!slug) return null;
  const entry = INDUSTRIES_CONTENT[slug as IndustrySlug];
  if (!entry) return null;
  return entry[lang] ?? entry.es;
}

/** Lista ordenada de slugs (para prerender / sitemap / la sección). */
export const INDUSTRY_SLUGS: IndustrySlug[] = Object.keys(INDUSTRIES_CONTENT) as IndustrySlug[];

/** Cards para la sección de los landings, derivadas del detalle (sin duplicar copy). */
export function INDUSTRY_CARDS(lang: 'es' | 'en'): IndustryCard[] {
  return INDUSTRY_SLUGS.map((slug) => {
    const d = getIndustryDetail(slug, lang)!;
    return { slug: d.slug, icon: d.icon, name: d.name, copy: d.cardCopy, covers: d.covers };
  });
}
