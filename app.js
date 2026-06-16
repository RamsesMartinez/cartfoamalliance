// app.js — conecta el formulario con el cálculo (calcDieline, global) y dibuja el troquel.
(function () {
  var $ = function (id) { return document.getElementById(id); };

  // ---- Menú móvil ----
  var toggle = $('navToggle'), sidebar = $('sidebar');
  if (toggle) toggle.addEventListener('click', function () {
    var open = sidebar.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
  });
  // cerrar el menú al elegir una sección (móvil)
  sidebar && sidebar.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { sidebar.classList.remove('open'); });
  });

  // ---- Fallback de imágenes: si una foto real (al reemplazar) no carga, se oculta
  //      y queda visible el gradiente CSS de respaldo. ----
  document.querySelectorAll('.mat-img img').forEach(function (img) {
    img.addEventListener('error', function () { img.style.display = 'none'; });
  });

  // ---- Calculadora ----
  var form = $('calcForm');
  if (!form) return;

  function leerInputs() {
    return {
      largo: Math.max(1, Math.round(+$('largo').value) || 1),
      ancho: Math.max(1, Math.round(+$('ancho').value) || 1),
      alto:  Math.max(1, Math.round(+$('alto').value)  || 1),
      flauta: (document.querySelector('input[name="flauta"]:checked') || {}).value || 'sencilla',
    };
  }

  function actualizarCotas(v) {
    $('cota-largo').textContent = v.largo + ' mm';
    $('cota-ancho').textContent = v.ancho + ' mm';
    $('cota-alto').textContent  = v.alto + ' mm';
  }

  // ---- Render del troquel en SVG (unidades = mm) ----
  var SW = 2, FILL_PANEL = '#1b2542', FILL_FLAP = '#131d33', FILL_CEJA = '#2a2113',
      STROKE = '#e8923a', GOLD = '#f4b063', TXT = '#cfd6e6';

  function cell(x, y, w, h, fill) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h +
           '" fill="' + fill + '" stroke="' + STROKE + '" stroke-width="' + SW + '"/>';
  }
  function label(cx, cy, name, dim, fs) {
    return '<text x="' + cx + '" y="' + cy + '" text-anchor="middle" font-family="Montserrat,sans-serif">' +
           '<tspan fill="' + GOLD + '" font-size="' + fs + '" font-weight="600">' + name + '</tspan>' +
           '<tspan x="' + cx + '" dy="' + (fs * 1.3) + '" fill="' + TXT + '" font-size="' + (fs * 0.85) + '">' + dim + '</tspan></text>';
  }

  function dibujarTroquel(d) {
    var flap = d.flapSuperior, body = d.altoTotal - d.flapSuperior - d.flapInferior;
    var cols = [{ name: 'Ceja', w: d.ceja, ceja: true }].concat(
      d.paneles.map(function (p) { return { name: p.nombre, w: p.ancho, h: p.alto }; }));
    var W = d.largoTotal, H = d.altoTotal, PAD = Math.max(50, W * 0.05);
    var fs = Math.max(16, Math.round(W / 60));
    var s = '<svg viewBox="' + (-PAD) + ' ' + (-PAD) + ' ' + (W + PAD * 2) + ' ' + (H + PAD * 2) +
            '" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Desarrollo del troquel">';

    var x = 0;
    cols.forEach(function (c) {
      var cx = x + c.w / 2;
      if (c.ceja) {
        // la ceja solo ocupa la franja del cuerpo
        s += cell(x, flap, c.w, body, FILL_CEJA);
        s += label(cx, flap + body / 2 - fs * 0.2, 'Ceja', c.w + ' mm', fs * 0.8);
      } else {
        s += cell(x, 0, c.w, flap, FILL_FLAP);                 // flap superior
        s += cell(x, flap, c.w, body, FILL_PANEL);             // panel
        s += cell(x, flap + body, c.w, flap, FILL_FLAP);       // flap inferior
        s += label(cx, flap + body / 2 - fs * 0.5, c.name, c.w + ' × ' + c.h, fs);
        s += label(cx, flap / 2 + fs * 0.1, 'Flap', flap + ' mm', fs * 0.75);
        s += label(cx, flap + body + flap / 2 + fs * 0.1, 'Flap', flap + ' mm', fs * 0.75);
      }
      x += c.w;
    });

    // cotas globales
    s += '<text x="' + (W / 2) + '" y="' + (H + PAD * 0.7) + '" text-anchor="middle" fill="' + GOLD +
         '" font-size="' + fs + '" font-family="Montserrat,sans-serif">' + W + ' mm (TOTAL)</text>';
    s += '<text x="' + (W + PAD * 0.6) + '" y="' + (H / 2) + '" text-anchor="middle" fill="' + GOLD +
         '" font-size="' + fs + '" font-family="Montserrat,sans-serif" transform="rotate(90 ' + (W + PAD * 0.6) + ' ' + (H / 2) + ')">' + H + ' mm</text>';
    s += '</svg>';
    return s;
  }

  function generar() {
    var v = leerInputs();
    actualizarCotas(v);
    var d = calcDieline(v);
    $('troquel').innerHTML = dibujarTroquel(d);
    var area = ((d.largoTotal * d.altoTotal) / 1e6).toFixed(3);
    $('troquelResumen').textContent =
      'Caja regular (RSC) ' + v.largo + '×' + v.ancho + '×' + v.alto + ' mm — ' +
      'flauta ' + d.flauta + ' (pared ~' + d.espesor + ' mm). ' +
      'Lámina: ' + d.largoTotal + ' × ' + d.altoTotal + ' mm · flaps ' + d.flapSuperior +
      ' mm · ceja ' + d.ceja + ' mm · área ~' + area + ' m².';
  }

  form.addEventListener('submit', function (e) { e.preventDefault(); generar(); });
  form.addEventListener('input', generar); // vista previa en vivo
  generar(); // render inicial con los valores por defecto
})();
