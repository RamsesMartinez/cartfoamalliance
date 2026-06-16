// Self-check de la geometría del troquel. Correr: node dieline.test.js
// Sin framework, sin DOM. Si la lógica se rompe, esto falla.
const assert = require('assert');
const { calcDieline } = require('./dieline.js');

// Caja del reference: 350 x 250 x 200, flauta sencilla
const d = calcDieline({ largo: 350, ancho: 250, alto: 200, flauta: 'sencilla' });
assert.strictEqual(d.largoTotal, 2 * (350 + 250) + 35, 'largo total del troquel');
assert.strictEqual(d.altoTotal, 200 + 250, 'alto total = alto + ancho');
assert.deepStrictEqual(d.paneles.map(p => p.ancho), [250, 350, 250, 350], 'anchos de paneles');
assert.strictEqual(d.flapSuperior, 125, 'flap superior = ancho/2');
assert.strictEqual(d.flapInferior, 125, 'flap inferior = ancho/2');
assert.strictEqual(d.espesor, 3, 'flauta sencilla ~ 3mm');

// Cubo 100^3, flauta doble
const c = calcDieline({ largo: 100, ancho: 100, alto: 100, flauta: 'doble' });
assert.strictEqual(c.largoTotal, 2 * 200 + 35, 'cubo: largo total');
assert.strictEqual(c.altoTotal, 200, 'cubo: alto total');
assert.strictEqual(c.espesor, 7, 'flauta doble ~ 7mm');

console.log('✓ dieline OK (RSC FEFCO 0201)');
