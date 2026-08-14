/**
 * VISTA DE REVISIÓN DE COPY — sólo para el branch `preview/copy-familias-seo`.
 *
 * Resalta en amarillo cada texto que cambió respecto de producción y muestra el
 * original al pasar el mouse. El botón de abajo a la izquierda apaga el resaltado
 * para ver el sitio tal como quedaría publicado.
 *
 * Vive fuera del bundle de Angular a propósito: no participa del build ni del SSR,
 * así que no puede romper la app. Para volver a producción se borra este archivo y
 * la línea que lo carga en `src/index.html`. Nada más.
 *
 * Ojo: la lista de acá NO es igual a la de LinkDesign. Argentina cambia tres cosas
 * —el titular no nombra el país, se usa «agencia» en vez de «empresa» y «diseño» va
 * adelante— porque el gasto de "Búsqueda #2" reparte distinto.
 */
(function () {
  'use strict';

  /** Cada entrada: `de` (producción) → `a` (este branch). `meta` = no es texto visible. */
  var CAMBIOS = [
    // ── /web · español ────────────────────────────────────────────────────────
    { pag: '/web', de: 'Sitios web hechos en serio.', a: 'Páginas web hechas en serio.' },
    {
      pag: '/web · «agencia» 7,0% acá contra 2,6% en CR',
      de: 'Sin plantillas, sin atajos, sin constructores genéricos. Cada sitio se construye a medida de verdad.',
      a: 'Sin plantillas, sin atajos, sin constructores genéricos. Una agencia de diseño web que trabaja a medida de verdad.'
    },
    { pag: '/web', de: 'Lo que hay detrás de cada sitio.', a: 'Lo que hay detrás de cada página web.' },
    { pag: '/web', de: 'Cada diseño, desde cero.', a: 'Cada diseño web, desde cero.' },
    { pag: '/web', de: 'Así trabajamos un proyecto.', a: 'Así trabajamos un proyecto de desarrollo web.' },
    { pag: '/web', de: '¿Cuánto tiempo tarda un sitio web?', a: '¿Cuánto tiempo tarda una página web?' },
    { pag: 'formulario', de: 'Sitio web', a: 'Página web' },

    // ── /software · español (acá el país SÍ pesa: 46,2% del gasto) ────────────
    { pag: '/software', de: 'Software construido alrededor de tu operación.', a: 'Desarrollo de software alrededor de tu operación.' },
    {
      pag: '/software',
      de: 'No adaptás tu empresa al software. Construimos el software alrededor de cómo ya funciona tu operación.',
      a: 'No adaptás tu empresa al software. Somos una empresa de desarrollo de software en Argentina y lo construimos alrededor de cómo ya funciona tu operación.'
    },
    { pag: '/software', de: 'Así trabajamos un proyecto.', a: 'Así trabajamos un proyecto de desarrollo de software.' },

    // ── home · español ────────────────────────────────────────────────────────
    {
      pag: 'home',
      de: 'Dos brazos. Un mismo criterio para construir software y webs a medida.',
      a: 'Dos brazos. Un mismo criterio para construir software y páginas web a medida.'
    },
    { pag: 'home', de: 'Website a la medida', a: 'Páginas web a la medida' },
    {
      pag: 'home',
      de: 'Diseñamos webs a medida con identidad propia, performance, SEO y una experiencia visual clara desde el primer scroll.',
      a: 'Diseñamos páginas web a medida con identidad propia, performance, SEO y una experiencia visual clara desde el primer scroll.'
    },

    // ── inglés ────────────────────────────────────────────────────────────────
    { pag: '/en/web', de: 'Real websites. Real code.', a: 'Real web design. Real code.' },
    {
      pag: '/en/web',
      de: 'No templates. No shortcuts. No generic builders. Every site is built from code.',
      a: 'No templates. No shortcuts. No generic builders. Custom web design and development, every site built from code.'
    },
    { pag: '/en/web', de: "What's behind every site.", a: "What's behind every website." },
    { pag: '/en/web', de: 'Every design, from scratch.', a: 'Every web design, from scratch.' },
    { pag: '/en/web', de: 'How we run a project.', a: 'How we run a web development project.' },
    { pag: '/en/software', de: 'Software built around your operation.', a: 'Custom software development around your operation.' },
    {
      pag: '/en/software',
      de: "You don't adapt your company to the software. We build the software around how your operation already works.",
      a: "You don't adapt your company to the software. We're a custom software development company in Argentina, and we build it around how your operation already works."
    },
    { pag: '/en/software', de: 'How we run a project.', a: 'How we run a software development project.' },

    // ── metadatos: no se ven en la página, se listan en el panel ──────────────
    { pag: '/web', meta: 'Título del navegador', de: 'Desarrollo web a medida | Nolo', a: 'Diseño y desarrollo de páginas web | Nolo' },
    { pag: '/web', meta: 'Descripción para buscadores', de: 'Sitios web a medida con identidad propia, performance y SEO: landing pages, sitios corporativos y e-commerce, sin plantillas genéricas.', a: 'Páginas web a medida con identidad propia, performance y SEO: landing pages, sitios corporativos y e-commerce, sin plantillas genéricas.' },
    { pag: '/software', meta: 'Título del navegador', de: 'Software a medida para empresas | Nolo', a: 'Desarrollo de software a medida en Argentina | Nolo' },
    { pag: '/software', meta: 'Descripción para buscadores', de: 'Sistemas internos construidos sobre tu operación real: CRM, ERP e inventario, e-commerce, ticketing, reservas, dashboards y automatización con IA.', a: 'Empresa de desarrollo de software en Argentina. Sistemas internos construidos sobre tu operación real: CRM, ERP e inventario, e-commerce, ticketing, reservas, dashboards y automatización con IA.' },
    { pag: '/en/web', meta: 'Título del navegador', de: 'Custom web development | Nolo', a: 'Web design and development | Nolo' },
    { pag: '/en/software', meta: 'Título del navegador', de: 'Custom software for companies | Nolo', a: 'Custom software development in Argentina | Nolo' }
  ];

  var VISIBLES = CAMBIOS.filter(function (c) { return !c.meta; })
    // los textos largos primero: evita que un fragmento corto marque de más
    .sort(function (a, b) { return b.a.length - a.a.length; });

  var CORTO = 25;                 // por debajo de esto exigimos que el nodo entero coincida
  var raiz = document.documentElement;

  // ── estilos ────────────────────────────────────────────────────────────────
  var css = document.createElement('style');
  css.textContent = [
    'mark.pvd{background:transparent;color:inherit;padding:0;border-radius:0;transition:background .15s}',
    'html.pvd-on mark.pvd{background:#ffe14d;color:#1c1400!important;',
    '  -webkit-box-decoration-break:clone;box-decoration-break:clone;',
    '  padding:.05em .12em;border-radius:2px;box-shadow:0 0 0 1px rgba(160,120,0,.35);cursor:help}',
    'html.pvd-on mark.pvd *{color:#1c1400!important}',
    '#pvd-tip{position:fixed;z-index:2147483647;max-width:min(34rem,88vw);display:none;',
    '  background:#101820;color:#f2f6fa;border:1px solid #3a4a5c;border-radius:4px;',
    '  padding:.6rem .8rem;font:400 13px/1.5 system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.45)}',
    '#pvd-tip b{display:block;font:600 10px/1 ui-monospace,monospace;letter-spacing:.12em;',
    '  text-transform:uppercase;color:#8fa6bd;margin-bottom:.4rem}',
    '#pvd-bar{position:fixed;left:16px;bottom:16px;z-index:2147483646;display:flex;gap:6px;',
    '  font:500 13px/1 system-ui,sans-serif}',
    '#pvd-bar button{border:1px solid #3a4a5c;background:#101820;color:#f2f6fa;border-radius:999px;',
    '  padding:.6rem .95rem;cursor:pointer;font:inherit;box-shadow:0 4px 16px rgba(0,0,0,.35)}',
    '#pvd-bar button:hover{background:#1b2836}',
    '#pvd-bar button[data-on="1"]{background:#ffe14d;color:#1c1400;border-color:#d9b400}',
    '#pvd-panel{position:fixed;inset:auto 16px 68px 16px;max-height:66vh;overflow:auto;z-index:2147483646;',
    '  display:none;background:#0d1620;color:#e8eff7;border:1px solid #33465a;border-radius:6px;',
    '  padding:1rem 1.1rem;font:400 13px/1.55 system-ui,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.5)}',
    '@media(min-width:56rem){#pvd-panel{inset:auto 16px 68px auto;width:44rem}}',
    '#pvd-panel h4{margin:0 0 .8rem;font:600 14px/1.3 system-ui,sans-serif}',
    '#pvd-panel .r{padding:.55rem 0;border-top:1px solid #22323f}',
    '#pvd-panel .p{font:600 10px/1 ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:#7f97ae}',
    '#pvd-panel .d{color:#9fb0c2;text-decoration:line-through;text-decoration-color:#6b7c8e}',
    '#pvd-panel .a{color:#ffe14d}'
  ].join('');
  document.head.appendChild(css);

  // ── marcado ────────────────────────────────────────────────────────────────
  var esp = /\s+/g;
  function n(s) { return s.replace(esp, ' ').trim(); }

  function envolver(nodo, desde, largo, original) {
    var objetivo = nodo;
    if (desde > 0) objetivo = objetivo.splitText(desde);
    if (largo != null && objetivo.nodeValue.length > largo) objetivo.splitText(largo);
    var m = document.createElement('mark');
    m.className = 'pvd';
    m.setAttribute('data-pvd', original);
    objetivo.parentNode.replaceChild(m, objetivo);
    m.appendChild(objetivo);
    return m;
  }

  var VETADOS = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, MARK: 1 };

  function marcar() {
    var vistos = 0;
    for (var i = 0; i < VISIBLES.length; i++) {
      var c = VISIBLES[i];
      var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
        acceptNode: function (t) {
          if (!t.nodeValue || !t.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          var p = t.parentNode;
          while (p && p !== document.body) {
            // ...y la propia herramienta no se marca a sí misma: el panel de la lista
            // contiene los textos nuevos y si no, se pinta entero de amarillo.
            if (VETADOS[p.nodeName] || (p.id && p.id.indexOf('pvd-') === 0)) return NodeFilter.FILTER_REJECT;
            p = p.parentNode;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      });
      var pendientes = [], t;
      while ((t = w.nextNode())) pendientes.push(t);

      for (var j = 0; j < pendientes.length; j++) {
        var nodo = pendientes[j];
        if (!nodo.parentNode) continue;
        var crudo = nodo.nodeValue;
        var idx = crudo.indexOf(c.a);
        if (idx >= 0) {
          // el texto corto sólo cuenta si el nodo entero es ese texto
          if (c.a.length < CORTO && n(crudo) !== n(c.a)) continue;
          envolver(nodo, idx, c.a.length, c.de);
          vistos++;
        } else if (c.a.length >= CORTO && n(crudo).indexOf(n(c.a)) >= 0) {
          // mismo texto pero con espacios o saltos de línea de por medio
          envolver(nodo, 0, null, c.de);
          vistos++;
        }
      }
    }
    return vistos;
  }

  // ── tooltip con el texto original ──────────────────────────────────────────
  var tip = document.createElement('div');
  tip.id = 'pvd-tip';
  function mostrarTip(m) {
    tip.innerHTML = '';
    var b = document.createElement('b');
    b.textContent = 'Texto actual en producción';
    var s = document.createElement('span');
    s.textContent = m.getAttribute('data-pvd');
    tip.appendChild(b);
    tip.appendChild(s);
    tip.style.display = 'block';
    var r = m.getBoundingClientRect(), h = tip.offsetHeight, w = tip.offsetWidth;
    var top = r.top - h - 10;
    if (top < 8) top = Math.min(r.bottom + 10, window.innerHeight - h - 8);
    var left = Math.max(8, Math.min(r.left, window.innerWidth - w - 8));
    tip.style.top = top + 'px';
    tip.style.left = left + 'px';
  }
  document.addEventListener('mouseover', function (e) {
    var m = e.target && e.target.closest ? e.target.closest('mark.pvd') : null;
    if (m && raiz.classList.contains('pvd-on')) mostrarTip(m);
  });
  document.addEventListener('mouseout', function (e) {
    if (e.target && e.target.closest && e.target.closest('mark.pvd')) tip.style.display = 'none';
  });
  document.addEventListener('scroll', function () { tip.style.display = 'none'; }, true);

  // ── barra y panel ──────────────────────────────────────────────────────────
  var barra = document.createElement('div');
  barra.id = 'pvd-bar';
  var bToggle = document.createElement('button');
  var bLista = document.createElement('button');
  bLista.textContent = 'Ver lista';
  barra.appendChild(bToggle);
  barra.appendChild(bLista);

  var panel = document.createElement('div');
  panel.id = 'pvd-panel';

  function pintarPanel() {
    panel.innerHTML = '';
    var h = document.createElement('h4');
    h.textContent = 'Todos los cambios de copy (' + CAMBIOS.length + ')';
    panel.appendChild(h);
    CAMBIOS.forEach(function (c) {
      var r = document.createElement('div'); r.className = 'r';
      var p = document.createElement('div'); p.className = 'p';
      p.textContent = c.pag + (c.meta ? ' · ' + c.meta : '');
      var d = document.createElement('div'); d.className = 'd'; d.textContent = c.de;
      var a = document.createElement('div'); a.className = 'a'; a.textContent = c.a;
      r.appendChild(p); r.appendChild(d); r.appendChild(a);
      panel.appendChild(r);
    });
  }

  function refrescarBoton() {
    var on = raiz.classList.contains('pvd-on');
    var n = document.querySelectorAll('mark.pvd').length;
    bToggle.textContent = (on ? '● ' : '○ ') + n + ' cambios en esta página';
    bToggle.setAttribute('data-on', on ? '1' : '0');
  }

  bToggle.addEventListener('click', function () {
    raiz.classList.toggle('pvd-on');
    tip.style.display = 'none';
    refrescarBoton();
  });
  bLista.addEventListener('click', function () {
    var abierto = panel.style.display === 'block';
    panel.style.display = abierto ? 'none' : 'block';
    bLista.textContent = abierto ? 'Ver lista' : 'Cerrar lista';
  });

  // ── arranque, y re-marcado cuando Angular cambia de página ────────────────
  var pendiente = null;
  function pasada() {
    marcar();
    refrescarBoton();
  }
  function agendar() {
    clearTimeout(pendiente);
    pendiente = setTimeout(pasada, 120);
  }

  function iniciar() {
    document.body.appendChild(tip);
    document.body.appendChild(barra);
    document.body.appendChild(panel);
    pintarPanel();
    raiz.classList.add('pvd-on');
    pasada();
    // Angular hidrata después del primer render y reescribe nodos al navegar.
    new MutationObserver(agendar).observe(document.body, { childList: true, subtree: true });
    setTimeout(pasada, 600);
    setTimeout(pasada, 1800);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar);
  } else {
    iniciar();
  }
})();
