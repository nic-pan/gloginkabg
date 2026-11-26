#!/usr/bin/env python3
"""Check themes.json against the CSS.

For each theme, list the CSS variables that the theme does not set and
that have no fallback in the CSS (or fall back to a fixed :root value).
Those are the places where one theme can show another theme's colors.

Run from the project root:  python3 tools/check-themes.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
themes = json.loads((ROOT / "themes.json").read_text())

css = "\n".join(p.read_text() for p in sorted((ROOT / "css").glob("*.css")))

# :root defaults
root_block = re.search(r":root\s*{([^}]*)}", css)
root_vars = set(re.findall(r"(--[\w-]+)\s*:", root_block.group(1))) if root_block else set()


def var_calls(text):
    """Yield (name, fallback_or_None) for every var(...) call, nested ones too."""
    i = 0
    while True:
        i = text.find("var(", i)
        if i < 0:
            return
        depth, j = 0, i + 3
        while j < len(text):
            if text[j] == "(":
                depth += 1
            elif text[j] == ")":
                depth -= 1
                if depth == 0:
                    break
            j += 1
        inner = text[i + 4:j]
        name, _, fallback = inner.partition(",")
        yield name.strip(), (fallback.strip() or None)
        i += 4


# For each variable: does any use of it lack a fallback?
no_fallback = set()
used = set()
for name, fallback in var_calls(css):
    used.add(name)
    if fallback is None:
        no_fallback.add(name)

problems = 0
for theme, data in themes.items():
    have = set(data.get("colors", {}))
    missing_hard = sorted(v for v in no_fallback - have if v not in root_vars)
    from_root = sorted(v for v in no_fallback - have if v in root_vars)
    if missing_hard:
        problems += 1
        print(f"WARN {theme}")
        print(f"     not set, no fallback (browser default): {', '.join(missing_hard)}")
    else:
        print(f"OK   {theme}")
    if from_root:
        # Shared defaults in :root (style.css). Fine, unless the theme needs its own value.
        print(f"     info: uses the shared :root default for {', '.join(from_root)}")

unused = sorted({v for t in themes.values() for v in t.get("colors", {})} - used)
if unused:
    print(f"\nSet in themes.json but not used in any CSS: {', '.join(unused)}")

sys.exit(1 if problems else 0)
