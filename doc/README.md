# Documentation

| Fichier | Rôle |
| --- | --- |
| `dossier-lancement.md` | **Source** du dossier de lancement (lisible sur GitHub) |
| `dossier-lancement.pdf` | Version compilée remise à l'équipe enseignante |
| `pdf-src/md2html.py` | Convertisseur markdown → HTML (Python, bibliothèque standard) |
| `pdf-src/dossier.css` | Mise en page du PDF (A4, bandeau, tableaux) |
| `pdf-src/dossier.html` | HTML intermédiaire généré (ne pas éditer à la main) |
| `build-pdf.sh` | Régénère le PDF |

## Régénérer le PDF

Prérequis : Python 3 et [WeasyPrint](https://weasyprint.org/)
(`brew install weasyprint` ou `pip install weasyprint`).

```bash
./doc/build-pdf.sh
```

Le script convertit `dossier-lancement.md` en `pdf-src/dossier.html`, puis WeasyPrint produit
`dossier-lancement.pdf`. Le convertisseur gère le sous-ensemble de markdown utilisé par le
dossier : titres, paragraphes, listes, tableaux, blocs de code, citations (encadré), gras,
italique, code en ligne et liens. Le premier titre et les lignes qui le suivent jusqu'au
premier tableau forment le bandeau de couverture.

Le dossier évolue à chaque livraison : modifier le markdown, régénérer le PDF et versionner
les deux dans le même commit.
