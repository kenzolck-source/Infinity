from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_BATCH_PATH = ROOT / "tmp" / "playtest" / "image2-batches.json"
SHEET_DIR = ROOT / "tmp" / "playtest" / "image2-sheets"
ASSET_DIR = ROOT / "src" / "assets" / "generated"
CODEX_GENERATED = Path.home() / ".codex" / "generated_images"


def newest_generated_png() -> Path:
    files = [path for path in CODEX_GENERATED.rglob("*.png") if path.is_file()]
    if not files:
        raise RuntimeError(f"No generated PNG files found under {CODEX_GENERATED}")
    return max(files, key=lambda path: path.stat().st_mtime)


def crop_quadrants(source: Path, batch_index: int, batch_path: Path) -> list[str]:
    batches = json.loads(batch_path.read_text(encoding="utf-8"))
    batch = next((item for item in batches if item["index"] == batch_index), None)
    if not batch:
        raise RuntimeError(f"Batch {batch_index} not found in {batch_path}")

    SHEET_DIR.mkdir(parents=True, exist_ok=True)
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    saved_sheet = SHEET_DIR / f"batch-{batch_index:02d}.png"

    with Image.open(source) as image:
      image = image.convert("RGB")
      image.save(saved_sheet, "PNG")
      width, height = image.size
      grid = int(batch.get("grid", 2))
      cell_width = width // grid
      cell_height = height // grid
      crops = []
      for row in range(grid):
          for column in range(grid):
              left = column * cell_width
              top = row * cell_height
              right = width if column == grid - 1 else (column + 1) * cell_width
              bottom = height if row == grid - 1 else (row + 1) * cell_height
              crops.append((left, top, right, bottom))
      written = []
      for asset, box in zip(batch["assets"], crops):
          crop = image.crop(box).resize((640, 640), Image.Resampling.LANCZOS)
          out_path = ASSET_DIR / asset["fileName"]
          crop.save(out_path, "PNG", optimize=True)
          written.append(asset["fileName"])
    return written


def main() -> None:
    parser = argparse.ArgumentParser(description="Import the latest image2 2x2 sheet into project assets.")
    parser.add_argument("batch", type=int, help="1-based batch index from tmp/playtest/image2-batches.json")
    parser.add_argument("--batch-path", type=Path, default=DEFAULT_BATCH_PATH, help="Batch JSON path. Defaults to tmp/playtest/image2-batches.json.")
    parser.add_argument("--source", type=Path, default=None, help="Specific generated PNG sheet. Defaults to newest Codex generated image.")
    args = parser.parse_args()
    source = args.source or newest_generated_png()
    written = crop_quadrants(source, args.batch, args.batch_path)
    print(json.dumps({"batch": args.batch, "source": str(source), "written": written}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
