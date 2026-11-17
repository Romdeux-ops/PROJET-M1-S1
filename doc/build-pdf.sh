#!/usr/bin/env bash
# Regenere doc/dossier-lancement.pdf a partir de doc/dossier-lancement.md.
# Prerequis : python3 et weasyprint (brew install weasyprint, ou pip install weasyprint).
set -euo pipefail

cd "$(dirname "$0")"
python3 pdf-src/md2html.py dossier-lancement.md pdf-src/dossier.html dossier.css
weasyprint pdf-src/dossier.html dossier-lancement.pdf
echo "PDF genere : $(pwd)/dossier-lancement.pdf"
