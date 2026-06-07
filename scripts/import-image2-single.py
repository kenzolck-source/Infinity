from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "src" / "assets" / "generated"
SINGLE_DIR = ROOT / "tmp" / "playtest" / "image2-singles"
CODEX_GENERATED = Path.home() / ".codex" / "generated_images"


def newest_generated_png() -> Path:
    files = [path for path in CODEX_GENERATED.rglob("*.png") if path.is_file()]
    if not files:
        raise RuntimeError(f"No generated PNG files found under {CODEX_GENERATED}")
    return max(files, key=lambda path: path.stat().st_mtime)


def main() -> None:
    parser = argparse.ArgumentParser(description="Import the latest image2 single image into one project asset.")
    parser.add_argument("file_name", help="Destination asset file name, for example skill-jy-six-meridian-sword.png")
    parser.add_argument("--source", type=Path, default=None, help="Specific generated PNG. Defaults to newest Codex generated image.")
    args = parser.parse_args()

    source = args.source or newest_generated_png()
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    SINGLE_DIR.mkdir(parents=True, exist_ok=True)

    source_copy = SINGLE_DIR / args.file_name
    shutil.copy2(source, source_copy)

    destination = ASSET_DIR / args.file_name
    with Image.open(source) as image:
        image = image.convert("RGB").resize((640, 640), Image.Resampling.LANCZOS)
        image.save(destination, "PNG", optimize=True)

    print(json.dumps({
        "source": str(source),
        "sourceCopy": str(source_copy),
        "written": str(destination),
        "fileName": args.file_name
    }, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
