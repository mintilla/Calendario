#!/bin/sh
# Publica una versión: pone el mismo identificador (fecha y hora) en index.html, sw.js y version.json, y sube a GitHub.
# Uso: ./publicar.sh "mensaje del commit"
set -e
cd "$(dirname "$0")"
BUILD=$(TZ=Europe/Madrid date +%Y-%m-%dT%H:%M:%S)
VER=$(sed -n "s/^const VERSION = '\(.*\)';.*/\1/p" index.html)
sed -i "s/^const BUILD = '[^']*'/const BUILD = '$BUILD'/" index.html sw.js
printf '{ "build": "%s", "version": "%s" }\n' "$BUILD" "$VER" > version.json
grep -q "const BUILD = '$BUILD'" index.html && grep -q "const BUILD = '$BUILD'" sw.js
git add -A
git commit -q -m "$1"
git -c push.negotiate=true push -q origin main
echo "Publicado $VER · $BUILD"
