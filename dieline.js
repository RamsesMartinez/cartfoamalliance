// dieline.js — Desarrollo (troquel) de una caja regular RSC, estándar FEFCO 0201.
// Función PURA, sin DOM: la usa el navegador (global) y el self-check en node.
//
// Geometría del blank plano:
//   horizontal: [ceja] + Posterior(Ancho) + Lateral(Largo) + Frontal(Ancho) + Lateral(Largo)
//   vertical:   [flap superior = Ancho/2] + cuerpo(Alto) + [flap inferior = Ancho/2]

// ponytail: espesor de pared como constante simple por flauta (informativo);
// ruta de upgrade -> calibres/ECT reales por tabla de proveedor + compensación de cotas.
var ESPESOR_MM = { sencilla: 3, doble: 7 };

var CEJA_MM = 35; // pestaña/ceja de pegado

function calcDieline(opts) {
  var largo = +opts.largo, ancho = +opts.ancho, alto = +opts.alto;
  var flauta = opts.flauta === 'doble' ? 'doble' : 'sencilla';

  var paneles = [
    { nombre: 'Posterior', ancho: ancho, alto: alto },
    { nombre: 'Lateral',   ancho: largo, alto: alto },
    { nombre: 'Frontal',   ancho: ancho, alto: alto },
    { nombre: 'Lateral',   ancho: largo, alto: alto },
  ];

  var flap = ancho / 2; // los flaps superior e inferior se encuentran al centro

  return {
    paneles: paneles,
    ceja: CEJA_MM,
    flapSuperior: flap,
    flapInferior: flap,
    flauta: flauta,
    espesor: ESPESOR_MM[flauta],
    largoTotal: 2 * (largo + ancho) + CEJA_MM,
    altoTotal: alto + 2 * flap, // = alto + ancho
  };
}

// Doble vida: global en el navegador, require() en node (self-check). Sin build.
if (typeof module !== 'undefined' && module.exports) module.exports = { calcDieline: calcDieline };
