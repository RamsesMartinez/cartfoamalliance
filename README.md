# Cartfoam Alliance Site

Landing estática (HTML/CSS/JS, sin build, sin dependencias) con calculadora de
desarrollo de cajas. Se publica en Netlify directamente desde la raíz del repo.

## Correr en local

ES un sitio estático plano. Sírvelo con cualquier servidor:

```bash
python3 -m http.server 8080   # luego abre http://localhost:8080
# o, con Netlify CLI:
netlify dev
```

> Abrir `index.html` con doble clic también funciona (no usamos ES modules).

## Calculadora

`dieline.js` calcula el desarrollo de una caja regular **RSC (FEFCO 0201)** a
partir de las dimensiones internas y el tipo de flauta. Es una fórmula
geométrica determinista (la "IA" es solo marca). Self-check:

```bash
node dieline.test.js
```

## Reemplazar las imágenes placeholder

Las fotos son placeholders en `assets/` (`hero.svg`, `foam.svg`, `corrugado.svg`)
con un **gradiente CSS de respaldo** detrás. Para usar fotos reales:
sobrescribe el archivo en `assets/` o cambia el `src` en `index.html`. Si una
imagen no carga, el gradiente CSS queda visible como fallback.

## Deploy

Conectado a Netlify con deploy continuo: cada `git push` a la rama por defecto
redespliega el sitio. Config en `netlify.toml` (publica la raíz, sin build).
