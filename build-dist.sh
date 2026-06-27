#!/usr/bin/env bash
# Construye el directorio publicable con cache-busting por hash de contenido.
# El HTML se sirve siempre fresco (Cloudflare Pages: max-age=0), así que al cambiar
# el ?v=<hash> de un asset, el cliente baja la versión nueva al instante. Si no cambió,
# el hash es el mismo y el navegador reutiliza su caché (eficiente). Lo usan el deploy
# manual y el GitHub Action.
set -e
OUT="${1:-dist}"
rm -rf "$OUT"; mkdir -p "$OUT/assets"
cp index.html styles.css app.js "$OUT/"
cp assets/logo.png assets/hero-bg-1.jpg assets/hero-bg-2.jpg assets/tex-foam.jpg assets/tex-foam-gray.jpg assets/tex-cardboard.jpg "$OUT/assets/"
HCSS=$(shasum "$OUT/styles.css" | cut -c1-10)
HJS=$(shasum "$OUT/app.js" | cut -c1-10)
# sed -i.bak es portable BSD (macOS) + GNU (ubuntu CI)
sed -i.bak "s|href=\"styles.css\"|href=\"styles.css?v=$HCSS\"|; s|src=\"app.js\"|src=\"app.js?v=$HJS\"|" "$OUT/index.html"
rm -f "$OUT/index.html.bak"
echo "dist listo en '$OUT' (css=$HCSS js=$HJS)"
