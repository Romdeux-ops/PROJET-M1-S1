#!/usr/bin/env python3
"""Convertit doc/dossier-lancement.md en HTML (bibliotheque standard uniquement).

Sous-ensemble de markdown pris en charge : titres, paragraphes, listes a puces ou
numerotees (avec suite indentee), tableaux, blocs de code, citations (encadre),
gras, italique, code en ligne, liens. Le premier titre H1 et les paragraphes qui le
suivent jusqu'au premier tableau forment le bandeau de couverture.

Usage : md2html.py entree.md sortie.html feuille.css
"""
import html
import re
import sys


def inline(text):
    codes = []

    def keep(match):
        codes.append("<code>%s</code>" % html.escape(match.group(1)))
        return "\x00%d\x00" % (len(codes) - 1)

    text = re.sub(r"`([^`]+)`", keep, text)
    text = html.escape(text, quote=False)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2">\1</a>', text)
    text = re.sub(r"&lt;(https?://[^&\s]+)&gt;", r'<a href="\1">\1</a>', text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", text)
    return re.sub(r"\x00(\d+)\x00", lambda m: codes[int(m.group(1))], text)


def cells(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def convert(lines):
    out, i, n = [], 0, len(lines)
    banner = None
    while i < n:
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        if line.startswith("```"):
            i += 1
            block = []
            while i < n and not lines[i].startswith("```"):
                block.append(lines[i])
                i += 1
            i += 1
            out.append("<pre>%s</pre>" % html.escape("\n".join(block)))
            continue
        m = re.match(r"(#{1,3}) (.*)", line)
        if m:
            level = len(m.group(1))
            if level == 1 and banner is None:
                banner = [inline(m.group(2))]
                i += 1
                while i < n and not lines[i].startswith("|") and not lines[i].startswith("#"):
                    if lines[i].strip():
                        banner.append(inline(lines[i].strip()))
                    i += 1
                out.append(
                    '<div class="banner"><h1>%s</h1>%s</div>'
                    % (banner[0], "".join("<p>%s</p>" % b for b in banner[1:]))
                )
                continue
            out.append("<h%d>%s</h%d>" % (level, inline(m.group(2)), level))
            i += 1
            continue
        if line.startswith("|"):
            rows = []
            while i < n and lines[i].startswith("|"):
                rows.append(lines[i])
                i += 1
            head = cells(rows[0])
            body = [cells(r) for r in rows[2:]]
            t = "<table><thead><tr>%s</tr></thead><tbody>" % "".join(
                "<th>%s</th>" % inline(c) for c in head
            )
            for r in body:
                t += "<tr>%s</tr>" % "".join("<td>%s</td>" % inline(c) for c in r)
            out.append(t + "</tbody></table>")
            continue
        if line.startswith(">"):
            block = []
            while i < n and lines[i].startswith(">"):
                block.append(lines[i].lstrip(">").strip())
                i += 1
            out.append('<div class="rule">%s</div>' % inline(" ".join(block)))
            continue
        lm = re.match(r"(\s*)(-|\d+\.) (.*)", line)
        if lm:
            tag = "ul" if lm.group(2) == "-" else "ol"
            items = []
            while i < n:
                mm = re.match(r"(-|\d+\.) (.*)", lines[i])
                if mm:
                    items.append(mm.group(2))
                    i += 1
                elif lines[i].startswith("  ") and lines[i].strip() and items:
                    items[-1] += " " + lines[i].strip()
                    i += 1
                else:
                    break
            out.append("<%s>%s</%s>" % (tag, "".join("<li>%s</li>" % inline(x) for x in items), tag))
            continue
        para = []
        while i < n and lines[i].strip() and not re.match(r"(#{1,3} |\||>|```|(-|\d+\.) )", lines[i]):
            para.append(lines[i].strip())
            i += 1
        out.append("<p>%s</p>" % inline(" ".join(para)))
    return "\n".join(out)


def main():
    src, dst, css = sys.argv[1:4]
    with open(src, encoding="utf-8") as f:
        body = convert(f.read().split("\n"))
    page = (
        '<!DOCTYPE html>\n<html lang="fr">\n<head>\n<meta charset="utf-8">\n'
        "<title>FitCoach - Dossier de lancement</title>\n"
        '<link rel="stylesheet" href="%s">\n</head>\n<body>\n%s\n</body>\n</html>\n'
        % (css, body)
    )
    with open(dst, "w", encoding="utf-8") as f:
        f.write(page)


if __name__ == "__main__":
    main()
