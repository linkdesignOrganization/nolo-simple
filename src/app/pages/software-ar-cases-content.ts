/**
 * Fichas de los sistemas de demostración (viewcases de software) para la landing
 * «Desarrollo de software a medida en Argentina»: /desarrollo-de-software-argentina/:slug.
 *
 * Cada ficha cuenta el demo como si fuera un caso: cómo se trabajaba antes, qué cambia con el
 * sistema, qué se copió de la operación, qué hay adentro del demo, cuánto sale un sistema así y el
 * acceso al demo navegable. Los sistemas de clientes reales no se muestran por confidencialidad;
 * para eso existen estos demos, y son ejemplos, no el resultado que el cliente va a recibir.
 *
 * Contenido verificado entrando a cada demo el 2026-09-07 (menús, tableros, entidades y acciones).
 * Regla: nada que no se vea en el demo. Solo software: nada de e-commerce ni sitios web.
 * Rangos calculados sobre las 58 propuestas con monto del CRM (mar a sep 2026), con asterisco
 * porque son referencias y ningún proyecto es estandarizado. Son los mismos rangos y plazos que
 * publica el sitio gemelo (`software-cr-cases-content.ts`, repo LinkDesign-simple; decisión de
 * Robert, 9 sep 2026): se copian tal cual.
 *
 * Idiomas: el ES es la fuente (SOFTWARE_AR_CASES). El EN es una capa (SOFTWARE_AR_CASES_EN) con solo
 * los campos de texto, que getSoftwareArCases('en') superpone ficha por ficha; slug, system, poster,
 * video y link se toman siempre del ES. Los componentes hablan con los getters por idioma.
 */

import type { Lang } from '../services/language.service';
import type { SystemSlug } from './systems-content';

/** Los seis demos, en el orden del hub. */
export type SoftwareArCaseSlug =
  | 'pulso'
  | 'cumbre'
  | 'estudio-dental-mendieta'
  | 'tornos-del-sur'
  | 'punto-cero'
  | 'vertice-seguridad-industrial';

export type SoftwareArCase = {
  slug: SoftwareArCaseSlug;
  /** Página de tipo de sistema (/software/:slug) donde este demo se muestra como ejemplo. */
  system?: SystemSlug;
  /** Nombre del demo (Pulso, Cumbre…). */
  name: string;
  /** Tipo de solución, corto (ERP, RRHH, …): la etiqueta destacada de la tarjeta del hub. */
  kind: string;
  /** Categoría del sistema: es lo que se lista en el hub. */
  category: string;
  /** Para quién es, en una línea. */
  forWhom: string;
  /** Resumen de una frase para la tarjeta del hub y el hero de la ficha. */
  summary: string;
  poster: string;
  video: string;
  link: string;
  before: string;
  after: string;
  copied: string[];
  /** Qué vas a encontrar al navegar el demo. */
  inside: string[];
  range: string;
  timeline: string;
};

/**
 * La `category` de cada ficha es exactamente la de su tarjeta en el bloque `viewcases` ES de
 * app.routes.ts, así tarjeta y ficha dicen lo mismo. Ojo con Cumbre: en Nolõ la tarjeta dice
 * «Sistema de gestión de RRHH» y no «… de recursos humanos» como en el sitio gemelo; manda la
 * tarjeta,
 * que ya está publicada.
 */
export const SOFTWARE_AR_CASES: SoftwareArCase[] = [
  {
    slug: 'pulso',
    system: 'dashboards-y-reporting',
    kind: 'Gestión y cobranzas',
    name: 'Pulso',
    category: 'Sistema de gestión para gimnasios y wellness',
    forWhom:
      'Para gimnasios, estudios y cadenas de wellness que manejan socios, planes, clases y más de una sede.',
    summary:
      'Toda una cadena de gimnasios en un tablero, con socios, planes, cobranzas, asistencia y clases, más una capa de IA que marca quién está por darse de baja.',
    poster: '/media/software/pulso.jpg',
    video: '/media/software/pulso.mp4',
    link: 'https://jolly-stone-0869f530f.7.azurestaticapps.net',
    before:
      'Membresías que se vencen y nadie avisa, cupos de clase anotados en una pizarra, pagos que hay que ir a reclamar por WhatsApp y cuatro sedes que nunca se miran juntas.',
    after:
      'De cada socio se ve el plan, el pago y el riesgo de que se vaya. Cada clase muestra su cupo real, los vencidos salen el mismo día y la cadena entera se lee en una sola pantalla.',
    copied: [
      'Los planes con sus beneficios y sus precios, del mensual al anual, más corporativo, familiar y day pass.',
      'Las cobranzas por sede, con vencidos, pendientes y rechazados.',
      'Las clases por entrenador, sede y horario, con su cupo real.',
      'La asistencia, con check-in en tiempo real.',
      'Los envíos segmentados por plan, antigüedad o pago vencido.'
    ],
    inside: [
      'El «Panel de operación», con socios activos, ingresos del mes, vencidos de hoy, retención, altas y ocupación.',
      '«Socios en zona roja», que son los que la IA marca con riesgo de cancelar.',
      'La ficha de cada socio, con sus datos, su plan, sus pagos, su asistencia, sus clases y su análisis.',
      'El calendario de clases con el cupo y el cartel de «Completa».',
      '«Reportes con IA», con predicción de bajas y recomendaciones de precios.',
      'El selector de sede, para mirar toda la cadena o una sola.'
    ],
    range: 'USD 4.000 a 7.500*',
    timeline: '8 a 12 semanas*'
  },
  {
    slug: 'cumbre',
    system: 'automatizacion-ia',
    kind: 'RRHH',
    name: 'Cumbre',
    category: 'Sistema de gestión de RRHH',
    forWhom:
      'Para empresas de más de 20 empleados con un área de personal que todavía administra a mano.',
    summary:
      'El legajo completo, el organigrama, las vacaciones y licencias, la búsqueda por vacante y las evaluaciones, con alertas de riesgo de renuncia.',
    poster: '/media/software/cumbre.jpg',
    video: '/media/software/cumbre.mp4',
    link: 'https://orange-forest-0713c560f.7.azurestaticapps.net',
    before:
      'Vacaciones, permisos y licencias en correos y planillas, legajos desparramados en carpetas y una búsqueda de personal que se sigue de memoria.',
    after:
      'Cada empleado pide y consulta sus ausencias desde su cuenta, la jefatura aprueba o rechaza en un clic, cada vacante avanza por etapas y todo el legajo vive en un solo lugar.',
    copied: [
      'Los niveles de aprobación de ausencias, con el saldo de cada persona.',
      'El legajo con contrato, sueldo, jornada y próxima revisión salarial.',
      'La búsqueda por vacante, en cinco etapas.',
      'Las evaluaciones por período, con puntaje y evaluador.'
    ],
    inside: [
      'El tablero con los empleados activos, las posiciones abiertas y las ausencias del mes.',
      '«Alertas críticas», con riesgo de renuncia, evaluación próxima y aniversarios.',
      'El legajo de cada empleado, con datos, contrato, desempeño, ausencias, capacitaciones y documentos.',
      'El organigrama, área por área.',
      'El calendario de vacaciones y licencias, con los pedidos pendientes.',
      '«Reportes con IA», con riesgo de renuncia y análisis salarial.'
    ],
    range: 'USD 3.000 a 6.000*',
    timeline: '6 a 10 semanas*'
  },
  {
    slug: 'estudio-dental-mendieta',
    system: 'reservas-y-agenda',
    kind: 'Turnos e historia clínica',
    name: 'Estudio Dental Mendieta',
    category: 'Software de gestión clínica',
    forWhom: 'Para clínicas y consultorios que dan turnos por profesional y cobran por tratamiento.',
    summary:
      'La agenda de turnos por profesional, la ficha del paciente con odontograma, los tratamientos por etapas y todo el circuito de presupuestos, cobros y obras sociales.',
    poster: '/media/software/dental.jpg',
    video: '/media/software/dental.mp4',
    link: 'https://happy-coast-044ea7e0f.7.azurestaticapps.net/agenda',
    before:
      'Turnos en papel o en una app genérica que no entiende de tratamientos por etapas, ni de obras sociales, ni de cuánto debe cada paciente.',
    after:
      'Los turnos se ven por profesional, en mes, semana o día. Cada paciente tiene su odontograma y su historial, cada tratamiento avanza por etapas y el dinero se rastrea desde el presupuesto hasta el pago.',
    copied: [
      'Tratamientos de varios turnos, con avance por etapa.',
      'Presupuestos por tratamiento, armados sobre un catálogo con precio y duración.',
      'La historia clínica y el odontograma, pieza por pieza.',
      'Cobros en efectivo, con tarjeta o por Mercado Pago, y la deuda de cada obra social.'
    ],
    inside: [
      'La agenda de turnos en vista mensual, semanal y diaria, por profesional.',
      'La ficha del paciente, con odontograma, historial, tratamientos, documentos y pagos.',
      'Los 35 tratamientos en curso, cada uno con su etapa y su próxima fecha.',
      'Los presupuestos, las facturas y los convenios con obras sociales.',
      'Los reportes de pacientes, tratamientos, finanzas y productividad.'
    ],
    range: 'USD 4.000 a 7.500*',
    timeline: '8 a 12 semanas*'
  },
  {
    slug: 'tornos-del-sur',
    system: 'erp-operacion-inventario',
    kind: 'ERP',
    name: 'Tornos del Sur',
    category: 'ERP industrial',
    forWhom: 'Para talleres y plantas que fabrican por orden de trabajo.',
    summary:
      'De punta a punta la orden de trabajo de un taller metalúrgico, con sus materiales, sus horas máquina y el costo real contra el estimado, además de planificación por máquina, inventario y mermas.',
    poster: '/media/software/tornos.jpg',
    video: '/media/software/tornos.mp4',
    link: 'https://app-tornosops.azurewebsites.net/dashboard',
    before:
      'Órdenes de trabajo anotadas en un cuaderno, materia prima que se termina a mitad de una pieza, máquinas que se superponen en el calendario y costos que recién se saben a fin de mes.',
    after:
      'Cada orden registra el consumo real de material y las horas por máquina y por operario. El inventario avisa antes de caer bajo el mínimo, el calendario detecta las superposiciones y el costo por pieza se ve mientras la pieza se fabrica.',
    copied: [
      'La orden de trabajo con todos sus estados, de Cotizada a Cobrada.',
      'Los materiales y los tiempos de cada etapa, estimados contra reales.',
      'El calendario de máquinas, con las superposiciones marcadas.',
      'El stock de materia prima, con mínimo por ubicación.',
      'Las mermas por causa, con su costo y su operario.'
    ],
    inside: [
      'El tablero con las órdenes activas, las que hay que entregar, las atrasadas y la facturación del mes.',
      'El detalle de una orden, con piezas, materiales, tiempos, costos y desvío.',
      'La planificación por máquina, en vista de día, semana y mes.',
      'El inventario de 23 materiales, con el estado de los que están bajo mínimo.',
      'Las máquinas, los operarios, los clientes y los proveedores.',
      'Los reportes de producción, margen y eficiencia por máquina.'
    ],
    range: 'USD 4.500 a 8.000*',
    timeline: '10 a 14 semanas*'
  },
  {
    slug: 'punto-cero',
    kind: 'Mantenimiento',
    name: 'Punto Cero',
    category: 'Sistema de mantenimiento por suscripción',
    forWhom:
      'Para empresas de servicio técnico que venden mantenimiento por suscripción y tienen técnicos en la calle.',
    summary:
      'Un sistema con tres caras, la de gerencia, la del cliente y la del técnico, para vender y operar mantenimiento por suscripción.',
    poster: '/media/software/puntocero.jpg',
    video: '/media/software/puntocero.mp4',
    link: 'https://victorious-desert-032f8750f.1.azurestaticapps.net/acceso',
    before:
      'Contratos de mantenimiento con visitas que se pasan de largo, técnicos sin ruta armada, clientes que no saben cuándo les toca y reportes que nadie aprueba.',
    after:
      'Las visitas se programan solas según el plan contratado, gerencia asigna al técnico y le aprueba los reportes, el cliente sigue sus equipos y sus visitas desde su propia cuenta, y el técnico cierra cada visita desde el celular con checklist, mediciones, evidencia y firma.',
    copied: [
      'Los planes por suscripción, con sus visitas y sus equipos incluidos.',
      'El catálogo de servicios, con SLA, duración y precio.',
      'La asignación del operador según score y disponibilidad.',
      'El cierre de la visita con checklist, mediciones, evidencia y firma.',
      'Los clientes en riesgo según cómo vienen con los pagos.'
    ],
    inside: [
      'Tres perfiles para entrar, el de gerente, el de cliente y el de operador.',
      'El resumen de gerencia, con visitas sin asignar, operadores disponibles, ingresos del mes y reportes por aprobar.',
      'La agenda con las visitas programadas y la asignación de operador.',
      'La vista del cliente, con sus sedes, sus equipos críticos y sus próximas visitas.',
      'La app del operador, con la ruta del día, los mensajes con gerencia y el historial.',
      'Las ganancias por plan y por mes.'
    ],
    range: 'USD 4.000 a 7.500*',
    timeline: '8 a 12 semanas*'
  },
  {
    slug: 'vertice-seguridad-industrial',
    system: 'crm-a-medida',
    kind: 'ERP',
    name: 'Vértice Seguridad Industrial',
    category: 'ERP comercial y de inventario',
    forWhom: 'Para distribuidoras con precios por cliente, varios depósitos y despacho propio.',
    summary:
      'Del cliente a la nota de crédito. La cotización con su margen, el pedido, el despacho y la devolución, con stock reservado y disponible en seis ubicaciones.',
    poster: '/media/software/vertice.jpg',
    video: '/media/software/vertice.mp4',
    link: 'https://icy-meadow-07f007e0f.6.azurestaticapps.net/dashboard/home',
    before:
      'Precios por cliente que viven en la cabeza del vendedor, cotizaciones que tardan días, un stock en el que nadie confía y despachos que se pierden entre depósitos.',
    after:
      'La cotización sale con la lista de precios de ese cliente y con su margen, el pedido reserva stock en la ubicación que corresponde, el despacho y la devolución quedan registrados, y cada movimiento deja rastro en la auditoría.',
    copied: [
      'Las listas de precio por tipo de cliente y condición de pago.',
      'El margen a la vista en cada cotización.',
      'El stock reservado y el disponible por ubicación, con su mínimo.',
      'Las transferencias entre depósitos y locales.',
      'Las devoluciones con nota de crédito.'
    ],
    inside: [
      'El tablero ejecutivo con OTIF, atrasados, quiebres de stock, rotación, ventas y conversión.',
      'El CRM con la lista de precios, la condición de pago y el vendedor de cada cliente.',
      'Las cotizaciones y los pedidos con sus estados.',
      'El inventario en seis ubicaciones, con transferencias y reposición por familia de producto.',
      'Los despachos y las devoluciones.',
      'La auditoría global, por usuario y por cargo.'
    ],
    range: 'USD 4.500 a 8.000*',
    timeline: '10 a 14 semanas*'
  }
];

export const SOFTWARE_AR_CASE_SLUGS = SOFTWARE_AR_CASES.map((c) => c.slug);

/** Campos traducibles; slug, system, poster, video y link se toman siempre del ES. */
export type SoftwareArCaseText = Omit<
  SoftwareArCase,
  'slug' | 'system' | 'poster' | 'video' | 'link'
>;

/**
 * Versión en inglés de cada ficha. Mismos hechos y cifras que el ES, mismos largos de lista. Los
 * rótulos citados con «…» son textos literales de los demos (en español) y se conservan tal cual,
 * con la descripción en inglés delante, para que el lector los encuentre al entrar al demo. La
 * `category` es exactamente la del bloque `viewcases` EN de app.routes.ts, así tarjeta y ficha dicen
 * lo mismo. `range` y `timeline` van en formato inglés con los mismos dígitos.
 */
export const SOFTWARE_AR_CASES_EN: Record<SoftwareArCaseSlug, SoftwareArCaseText> = {
  pulso: {
    name: 'Pulso',
    kind: 'Memberships & billing',
    category: 'Gym & wellness management system',
    forWhom:
      'For gyms, studios and wellness chains that run memberships, plans, classes and more than one location.',
    summary:
      'A whole gym chain on one dashboard, with members, plans, billing, attendance and classes, plus an AI layer that flags who is about to leave.',
    before:
      'Memberships that lapse with no warning, class capacity written on a whiteboard, payments chased down over WhatsApp and four locations nobody ever looks at together.',
    after:
      'For any member you can see the plan, the payment and the churn risk. Every class shows its real capacity, overdue payments surface the same day and the whole chain reads off a single screen.',
    copied: [
      'The plans with their benefits and their prices, from monthly to annual, plus corporate, family and day pass.',
      'Billing by location, with overdue, pending and declined payments.',
      'Classes by trainer, location and time slot, with their real capacity.',
      'Attendance, with real-time check-in.',
      'Messaging segmented by plan, length of membership or overdue payment.'
    ],
    inside: [
      'The operations dashboard («Panel de operación»), with active members, revenue for the month, payments overdue today, retention, sign-ups and occupancy.',
      'Members in the red zone («Socios en zona roja»), the ones the AI flags as likely to cancel.',
      "Each member's file, with their details, their plan, their payments, their attendance, their classes and their analysis.",
      'The class calendar with capacity and the full-class tag («Completa»).',
      'AI reports («Reportes con IA»), with churn prediction and pricing recommendations.',
      'The location selector, to look at the whole chain or just one site.'
    ],
    range: 'USD 4,000 to 7,500*',
    timeline: '8 to 12 weeks*'
  },
  cumbre: {
    name: 'Cumbre',
    kind: 'HR',
    category: 'HR management system',
    forWhom: 'For companies with more than 20 employees whose HR team still works by hand.',
    summary:
      'The full employee file, the org chart, vacation and leave, hiring by vacancy and performance reviews, with resignation risk alerts.',
    before:
      'Vacation, time off and medical leave living in emails and spreadsheets, employee files scattered across folders and a hiring process tracked from memory.',
    after:
      'Every employee requests and checks their own absences from their account, managers approve or reject in one click, each vacancy moves through its stages and the whole employee file sits in one place.',
    copied: [
      "Approval levels for absences, with each person's remaining balance.",
      'The employee file with contract, salary, working hours and next salary review.',
      'Hiring by vacancy, across five stages.',
      'Performance reviews by period, with score and reviewer.'
    ],
    inside: [
      'The dashboard with active employees, open positions and absences for the month.',
      'Critical alerts («Alertas críticas»), with resignation risk, upcoming reviews and work anniversaries.',
      "Each employee's file, with personal details, contract, performance, absences, training and documents.",
      'The org chart, department by department.',
      'The vacation and leave calendar, with the requests still pending.',
      'AI reports («Reportes con IA»), with resignation risk and salary analysis.'
    ],
    range: 'USD 3,000 to 6,000*',
    timeline: '6 to 10 weeks*'
  },
  'estudio-dental-mendieta': {
    name: 'Estudio Dental Mendieta',
    kind: 'Appointments & records',
    category: 'Clinic management software',
    forWhom: 'For clinics and practices that book by practitioner and charge by treatment.',
    summary:
      'Appointments by practitioner, a patient file with a dental chart, treatments in stages and the whole cycle of estimates, payments and insurance plans.',
    before:
      'Appointments on paper, or in a generic app that understands nothing about treatments in stages, insurance plans or how much each patient still owes.',
    after:
      'Appointments are visible by practitioner, in month, week or day view. Every patient has a dental chart and a history, every treatment moves through its stages and the money is tracked from the estimate to the payment.',
    copied: [
      'Treatments that span several appointments, with progress by stage.',
      'Estimates per treatment, built on a catalog with price and duration.',
      'The clinical record and the dental chart, tooth by tooth.',
      'Payments in cash, by card or through Mercado Pago, and the outstanding balance of each insurance plan.'
    ],
    inside: [
      'The appointment book in month, week and day view, by practitioner.',
      'The patient file, with dental chart, history, treatments, documents and payments.',
      'The 35 treatments in progress, each with its stage and its next appointment.',
      'The estimates, the invoices and the insurance plan agreements.',
      'Reports on patients, treatments, finances and productivity.'
    ],
    range: 'USD 4,000 to 7,500*',
    timeline: '8 to 12 weeks*'
  },
  'tornos-del-sur': {
    name: 'Tornos del Sur',
    kind: 'ERP',
    category: 'Industrial ERP',
    forWhom: 'For workshops and plants that manufacture by work order.',
    summary:
      "A metalworking shop's work order end to end, with its materials, its machine hours and actual cost against the estimate, plus planning by machine, inventory and scrap.",
    before:
      'Work orders written in a notebook, raw material that runs out halfway through a part, machines that clash on the calendar and costs that only turn up at the end of the month.',
    after:
      'Every order records its real material consumption and its hours by machine and by operator. Inventory warns before stock falls below minimum, the calendar catches the clashes and the cost per part is visible while the part is being made.',
    copied: [
      'The work order with all its statuses, from Quoted to Paid.',
      'Materials and times for each stage, estimated against actual.',
      'The machine calendar, with overlaps flagged.',
      'Raw material stock, with a minimum per location.',
      'Scrap by cause, with its cost and its operator.'
    ],
    inside: [
      'The dashboard with active orders, orders due out, late orders and billing for the month.',
      "An order's detail, with parts, materials, times, costs and variance.",
      'Planning by machine, in day, week and month view.',
      'The inventory of 23 materials, with the status of everything below minimum.',
      'The machines, the operators, the customers and the suppliers.',
      'Reports on production, margin and efficiency by machine.'
    ],
    range: 'USD 4,500 to 8,000*',
    timeline: '10 to 14 weeks*'
  },
  'punto-cero': {
    name: 'Punto Cero',
    kind: 'Maintenance',
    category: 'Subscription-based maintenance system',
    forWhom:
      'For technical service companies that sell maintenance by subscription and keep technicians on the road.',
    summary:
      'One system with three sides, one for management, one for the client and one for the technician, for selling and running maintenance by subscription.',
    before:
      'Maintenance contracts with visits that slip by, technicians without a route, clients with no idea when their next visit is due and reports nobody approves.',
    after:
      'Visits schedule themselves from the contracted plan, management assigns the technician and approves their reports, the client follows their equipment and their visits from their own account, and the technician closes each visit from a phone with checklist, measurements, evidence and signature.',
    copied: [
      'Subscription plans, with their visits and their equipment included.',
      'The service catalog, with SLA, duration and price.',
      'Operator assignment based on score and availability.',
      'Visit close-out with checklist, measurements, evidence and signature.',
      'Clients at risk based on how their payments are going.'
    ],
    inside: [
      'Three profiles to log in with, one for management, one for the client and one for the operator.',
      'The management summary, with unassigned visits, available operators, revenue for the month and reports waiting for approval.',
      'The schedule with planned visits and operator assignment.',
      'The client view, with their sites, their critical equipment and their upcoming visits.',
      "The operator app, with the day's route, the messages with management and the history.",
      'Earnings by plan and by month.'
    ],
    range: 'USD 4,000 to 7,500*',
    timeline: '8 to 12 weeks*'
  },
  'vertice-seguridad-industrial': {
    name: 'Vértice Seguridad Industrial',
    kind: 'ERP',
    category: 'Commercial & inventory ERP',
    forWhom: 'For distributors with per-customer pricing, several warehouses and their own dispatch.',
    summary:
      'From the customer to the credit note. The quote with its margin, the order, the dispatch and the return, with reserved and available stock across six locations.',
    before:
      "Customer prices that live in the sales rep's head, quotes that take days, stock nobody trusts and dispatches that get lost between warehouses.",
    after:
      "The quote leaves with that customer's own price list and its margin, the order reserves stock in the location it belongs to, dispatch and return are both recorded, and every movement leaves its trace in the audit trail.",
    copied: [
      'Price lists by type of customer and payment terms.',
      'The margin in plain view on every quote.',
      'Reserved and available stock by location, with its minimum.',
      'Transfers between warehouses and stores.',
      'Returns with a credit note.'
    ],
    inside: [
      'The executive dashboard with OTIF, late orders, stockouts, turnover, sales and conversion.',
      "The CRM with each customer's price list, payment terms and sales rep.",
      'Quotes and orders with their statuses.',
      'The inventory across six locations, with transfers and replenishment by product family.',
      'The dispatches and the returns.',
      'The global audit trail, by user and by role.'
    ],
    range: 'USD 4,500 to 8,000*',
    timeline: '10 to 14 weeks*'
  }
};

/** Rótulos de la ficha. */
export const SOFTWARE_AR_CASE_LABELS = {
  eyebrowPrefix: 'Sistema de demostración',
  before: 'Cómo era la operación',
  after: 'Con el sistema',
  copied: 'Lo que copiamos de la operación',
  inside: 'Qué vas a encontrar en el demo',
  cost: 'Cuánto cuesta un sistema así en Argentina',
  rangeLabel: 'Inversión',
  timelineLabel: 'Plazo',
  costNote:
    'El precio se cierra por alcance antes de arrancar. Anticipo y saldo contra entrega, pagos por hito o una cuota mensual con soporte incluido.',
  costDisclaimer:
    '* Rangos y plazos de referencia. Cada proyecto se cotiza según su alcance. Nunca tenemos un precio listo, porque nunca son soluciones estandarizadas.',
  costLink: 'Ver todos los rangos por tipo de sistema',
  /** Enlace a la página del tipo de sistema (/software/:slug); `{system}` es el nombre del sistema. */
  systemExample: 'Este demo es un ejemplo de {system}',
  confidentialityTitle: 'Por qué un demo y no un cliente',
  confidentiality:
    'Los sistemas que construimos para nuestros clientes no se muestran, porque son su operación y su información. Por eso armamos estos sistemas de demostración. Podés navegar uno entero, con datos de prueba, y sentir cómo es un software hecho alrededor de una operación. Es un ejemplo, no el resultado. Lo que construyamos para vos va a ser distinto, porque arranca de tu operación.',
  tryCta: 'Navegar el demo',
  /** Nombre accesible del marco del video, que abre el demo; `{name}` es el nombre del demo. */
  videoLabel: 'Navegar el demo de {name}',
  meetCta: 'Agendá una reunión de 30 minutos',
  others: 'Otros sistemas que podés probar',
  backToHub: 'Volver a desarrollo de software a medida'
} as const;

export type SoftwareArCaseLabels = Record<keyof typeof SOFTWARE_AR_CASE_LABELS, string>;

/**
 * Rótulos de la ficha en inglés. costNote y costDisclaimer repiten los de la sección de costo de la
 * página de sistema (mismo texto en ES). La última frase de confidentiality es la única afirmación
 * que el EN agrega sobre el ES: los demos están en español.
 */
export const SOFTWARE_AR_CASE_LABELS_EN: SoftwareArCaseLabels = {
  eyebrowPrefix: 'Demo system',
  before: 'Before the system',
  after: 'With the system',
  copied: 'What we copied from the operation',
  inside: 'What you will find in the demo',
  cost: 'What a system like this costs in Argentina',
  rangeLabel: 'Investment',
  timelineLabel: 'Timeline',
  costNote:
    'The price is closed by scope before we start. Deposit and balance on delivery, milestone payments or a monthly fee with support included.',
  costDisclaimer:
    '* Reference ranges and timelines. Every project is quoted by its scope. We never have a ready-made price, because these are never standardized solutions.',
  costLink: 'See all ranges by system type',
  systemExample: 'This demo is an example of {system}',
  confidentialityTitle: 'Why a demo and not a client',
  confidentiality:
    "We do not show the systems we build for our clients, because each one is that company's operation and its information. That is why we built these demo systems. You can browse one end to end and feel what software built around an operation is like. It is an example, not the result. What we build for you will be different, because it starts from your operation. The demos are in Spanish, with sample data.",
  tryCta: 'Browse the demo',
  videoLabel: 'Browse the {name} demo',
  meetCta: 'Book a 30-minute meeting',
  others: 'Other systems you can try',
  backToHub: 'Back to custom software development'
};

/** Las fichas en inglés, ya superpuestas al ES (slug, system, poster, video y link vienen del ES). */
const CASES_EN: SoftwareArCase[] = SOFTWARE_AR_CASES.map((c) => ({
  ...c,
  ...SOFTWARE_AR_CASES_EN[c.slug]
}));

/** Las seis fichas en el idioma pedido, en el orden del hub (el del ES). */
export function getSoftwareArCases(lang: Lang): SoftwareArCase[] {
  return lang === 'en' ? CASES_EN : SOFTWARE_AR_CASES;
}

export function getSoftwareArCase(slug: string | null, lang: Lang): SoftwareArCase | null {
  if (!slug) return null;
  return getSoftwareArCases(lang).find((c) => c.slug === slug) ?? null;
}

/** Demo que ejemplifica una página de tipo de sistema; null si ese sistema no tiene demo. */
export function getSoftwareArCaseForSystem(
  system: string | null,
  lang: Lang
): SoftwareArCase | null {
  return getSoftwareArCases(lang).find((c) => c.system === system) ?? null;
}

export function getSoftwareArCaseLabels(lang: Lang): SoftwareArCaseLabels {
  return lang === 'en' ? SOFTWARE_AR_CASE_LABELS_EN : SOFTWARE_AR_CASE_LABELS;
}
