#!/usr/bin/env python3
"""Baut die Store-Pakete: dist/entgender-chrome-<version>.zip und dist/entgender-firefox-<version>.zip.

    python3 tools/build.py [--gecko-id entgender@deine-domain.tld]

Die Firefox-ID (Standard: entgender@bakuretsubaka.github.io) kann mit --gecko-id oder der
Umgebungsvariable GECKO_ID überschrieben werden. Sie ist bei AMO dauerhaft: nie mehr ändern.
"""
import argparse
import json
import os
import shutil
import zipfile

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DIST = os.path.join(ROOT, "dist")

FILES = [
    "manifest.json", "rules.js", "content.js", "background.js",
    "popup.html", "popup.js", "options.html", "options.js", "ui.css",
    "icons/icon16.png", "icons/icon48.png", "icons/icon128.png",
    "LICENSE",
]
DEFAULT_ID = "entgender@bakuretsubaka.github.io"
FIREFOX_MIN = "142.0"  # data_collection_permissions: Desktop ab 140, Android ab 142


def load_manifest():
    with open(os.path.join(ROOT, "manifest.json"), encoding="utf-8") as f:
        return json.load(f)


def stage(name, manifest):
    out = os.path.join(DIST, name)
    shutil.rmtree(out, ignore_errors=True)
    for rel in FILES:
        dst = os.path.join(out, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if rel == "manifest.json":
            with open(dst, "w", encoding="utf-8") as f:
                json.dump(manifest, f, ensure_ascii=False, indent=2)
                f.write("\n")
        else:
            shutil.copyfile(os.path.join(ROOT, rel), dst)
    return out


def make_zip(src_dir, zip_path):
    # Feste Zeitstempel und Reihenfolge: gleiche Quellen ergeben identische ZIPs.
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
        for rel in sorted(FILES):
            info = zipfile.ZipInfo(rel, date_time=(2026, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            with open(os.path.join(src_dir, rel), "rb") as f:
                z.writestr(info, f.read())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--gecko-id", default=os.environ.get("GECKO_ID", ""))
    args = ap.parse_args()

    base = load_manifest()
    version = base["version"]
    os.makedirs(DIST, exist_ok=True)

    chrome_dir = stage("chrome", base)
    make_zip(chrome_dir, os.path.join(DIST, f"entgender-chrome-{version}.zip"))

    ff = json.loads(json.dumps(base))
    ff["background"] = {"scripts": ["background.js"]}
    gecko_id = args.gecko_id or DEFAULT_ID
    ff["browser_specific_settings"] = {
        "gecko": {
            "id": gecko_id,
            "strict_min_version": FIREFOX_MIN,
            "data_collection_permissions": {"required": ["none"]},
        }
    }
    ff_dir = stage("firefox", ff)
    make_zip(ff_dir, os.path.join(DIST, f"entgender-firefox-{version}.zip"))

    print("Gebaut:", ", ".join(sorted(f for f in os.listdir(DIST) if f.endswith(".zip"))))


if __name__ == "__main__":
    main()
