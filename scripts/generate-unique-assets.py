from __future__ import annotations

import colorsys
import argparse
import hashlib
import json
import math
import os
import random
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "src" / "assets" / "generated"
REPORT_PATH = ROOT / "tmp" / "playtest" / "unique-assets-report.json"
SIZE = 640


def find_node() -> str:
    candidates = [
        os.environ.get("NODE_EXE"),
        shutil.which("node"),
        Path.home() / ".cache" / "codex-runtimes" / "codex-primary-runtime" / "dependencies" / "node" / "bin" / "node.exe",
    ]
    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return str(candidate)
    raise RuntimeError("Node.js was not found. Set NODE_EXE or install Node.js to export game data.")


def load_game_data(manifest_path: Path | None = None) -> dict:
    if manifest_path:
        return json.loads(manifest_path.read_text(encoding="utf-8"))

    script = """
await import('./src/game-data.js');
const data = globalThis.MainGodData;
console.log(JSON.stringify({
  cards: data.cards,
  equipment: data.equipment
}));
"""
    result = subprocess.run(
        [find_node(), "--input-type=module", "-e", script],
        cwd=ROOT,
        text=True,
        capture_output=True,
        check=True,
    )
    return json.loads(result.stdout)


def stable_digest(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def color_from_digest(digest: str, offset: int = 0, saturation: float = 0.68, value: float = 0.88) -> tuple[int, int, int]:
    hue = ((int(digest[offset : offset + 8], 16) % 360) / 360.0)
    red, green, blue = colorsys.hsv_to_rgb(hue, saturation, value)
    return int(red * 255), int(green * 255), int(blue * 255)


def mix(a: tuple[int, int, int], b: tuple[int, int, int], amount: float) -> tuple[int, int, int]:
    return tuple(int(a[i] * (1 - amount) + b[i] * amount) for i in range(3))


def alpha(color: tuple[int, int, int], opacity: int) -> tuple[int, int, int, int]:
    return color[0], color[1], color[2], opacity


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        Path("C:/Windows/Fonts/NotoSansTC-VF.ttf"),
        Path("C:/Windows/Fonts/NotoSansHK-VF.ttf"),
        Path("C:/Windows/Fonts/kaiu.ttf"),
        Path("C:/Windows/Fonts/msjh.ttc"),
        Path("C:/Windows/Fonts/arialbd.ttf" if bold else "C:/Windows/Fonts/arial.ttf"),
    ]
    for path in candidates:
        if path.exists():
            return ImageFont.truetype(str(path), size=size)
    return ImageFont.load_default()


FONT_TITLE = load_font(42, bold=True)
FONT_SUBTITLE = load_font(22)
FONT_BADGE = load_font(24, bold=True)
FONT_CODE = load_font(18, bold=True)


def text_width(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont) -> int:
    if not text:
        return 0
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0]


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, width: int) -> list[str]:
    lines: list[str] = []
    current = ""
    for char in text:
        candidate = current + char
        if current and text_width(draw, candidate, font) > width:
            lines.append(current)
            current = char
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines[:2]


def label_for_skill(asset: dict) -> str:
    if asset.get("category") == "signature":
        return "專屬技能"
    labels = {
        "attack": "攻擊卡",
        "guard": "防護卡",
        "support": "支援卡",
        "tactic": "戰術卡",
        "curse": "詛咒卡",
    }
    return labels.get(asset.get("type"), "技能卡")


def label_for_equipment(asset: dict) -> str:
    if asset.get("weaponClass") == "firearm":
        return "槍械裝備"
    labels = {
        "attackBonus": "神器武裝",
        "firstAttackBonus": "首攻武器",
        "firstAttackPierce": "破甲神器",
        "firstAttackBurn": "燃燒武器",
        "openingDraw": "開場秘寶",
        "openingEnergy": "能量秘寶",
        "turnBlock": "防護神器",
        "turnStressRelief": "鎮魂神器",
        "turnHealLowest": "醫療裝備",
        "openingEvade": "閃避裝備",
    }
    return labels.get(asset.get("effect"), "唯一裝備")


def line(draw: ImageDraw.ImageDraw, points: list[tuple[float, float]], fill, width: int = 4) -> None:
    draw.line([(int(x), int(y)) for x, y in points], fill=fill, width=width, joint="curve")


def polygon(draw: ImageDraw.ImageDraw, points: list[tuple[float, float]], fill, outline=None, width: int = 1) -> None:
    converted = [(int(x), int(y)) for x, y in points]
    draw.polygon(converted, fill=fill)
    if outline:
        draw.line(converted + [converted[0]], fill=outline, width=width, joint="curve")


def draw_background(draw: ImageDraw.ImageDraw, image: Image.Image, rng: random.Random, digest: str, kind: str) -> tuple[tuple[int, int, int], tuple[int, int, int]]:
    base = color_from_digest(digest, 0, saturation=0.62, value=0.54)
    accent = color_from_digest(digest, 8, saturation=0.78, value=0.95)
    deep = mix(base, (8, 7, 10), 0.74)
    for y in range(SIZE):
        ratio = y / (SIZE - 1)
        horizontal = 0.12 * math.sin((y / 36.0) + rng.random())
        row = mix(deep, base, min(1, max(0, ratio * 0.55 + horizontal)))
        draw.line([(0, y), (SIZE, y)], fill=row)

    noise = Image.effect_noise((SIZE, SIZE), 42).convert("L")
    noise = ImageEnhance.Contrast(noise).enhance(1.7)
    image.alpha_composite(Image.merge("RGBA", [noise, noise, noise, noise]).point(lambda p: int(p * 0.10)))

    center = (SIZE / 2 + rng.randint(-70, 70), SIZE / 2 + rng.randint(-50, 50))
    for radius in range(250, 40, -45):
        opacity = max(18, 84 - radius // 4)
        box = [center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius]
        draw.ellipse(box, outline=alpha(accent, opacity), width=2)

    for _ in range(34):
        x = rng.randint(-60, SIZE + 60)
        y = rng.randint(-60, SIZE + 60)
        length = rng.randint(60, 210)
        angle = rng.uniform(-0.9, 0.9) + (0.85 if kind == "equipment" else -0.2)
        end = (x + math.cos(angle) * length, y + math.sin(angle) * length)
        line(draw, [(x, y), end], alpha(accent, rng.randint(20, 62)), width=rng.randint(1, 3))

    return base, accent


def draw_attack(draw: ImageDraw.ImageDraw, rng: random.Random, accent, secondary) -> None:
    for i in range(5):
        x1 = 90 + i * 26 + rng.randint(-16, 22)
        y1 = 460 - i * 52 + rng.randint(-28, 24)
        x2 = 500 + rng.randint(-30, 50)
        y2 = 120 + i * 18 + rng.randint(-20, 20)
        line(draw, [(x1, y1), (x2, y2)], alpha(accent, 225 - i * 22), width=18 - i * 2)
        line(draw, [(x1 + 18, y1 + 8), (x2 + 18, y2 + 8)], alpha((255, 244, 205), 128), width=4)
    for _ in range(18):
        x, y = rng.randint(120, 520), rng.randint(110, 470)
        draw.ellipse([x - 3, y - 3, x + 3, y + 3], fill=alpha(secondary, rng.randint(115, 220)))


def draw_guard(draw: ImageDraw.ImageDraw, rng: random.Random, accent, secondary) -> None:
    points = [(320, 94), (500, 168), (466, 424), (320, 536), (174, 424), (140, 168)]
    polygon(draw, points, fill=alpha(mix(accent, (20, 18, 22), 0.42), 180), outline=alpha(accent, 235), width=8)
    inner = [(320, 150), (438, 197), (414, 390), (320, 474), (226, 390), (202, 197)]
    polygon(draw, inner, fill=alpha((12, 10, 13), 90), outline=alpha(secondary, 160), width=4)
    line(draw, [(320, 158), (320, 464)], alpha((255, 255, 236), 105), width=5)


def draw_support(draw: ImageDraw.ImageDraw, rng: random.Random, accent, secondary) -> None:
    for r, opacity in [(190, 68), (130, 110), (78, 170)]:
        draw.ellipse([320 - r, 270 - r, 320 + r, 270 + r], outline=alpha(accent, opacity), width=6)
    draw.rounded_rectangle([270, 142, 370, 438], radius=18, fill=alpha(secondary, 208))
    draw.rounded_rectangle([172, 240, 468, 340], radius=18, fill=alpha(secondary, 208))
    draw.rounded_rectangle([288, 160, 352, 420], radius=10, fill=alpha((255, 250, 232), 82))


def draw_tactic(draw: ImageDraw.ImageDraw, rng: random.Random, accent, secondary) -> None:
    nodes = []
    for i in range(8):
        angle = (math.tau * i / 8) + rng.uniform(-0.12, 0.12)
        radius = rng.randint(120, 210)
        nodes.append((320 + math.cos(angle) * radius, 280 + math.sin(angle) * radius))
    for i, point in enumerate(nodes):
        for target in nodes[i + 1 :]:
            if rng.random() < 0.38:
                line(draw, [point, target], alpha(accent, 74), width=3)
    for x, y in nodes:
        draw.ellipse([x - 17, y - 17, x + 17, y + 17], fill=alpha(secondary, 210), outline=alpha((255, 255, 230), 110), width=3)
    draw.ellipse([260, 220, 380, 340], outline=alpha(accent, 220), width=8)
    line(draw, [(280, 280), (360, 280)], alpha((255, 255, 230), 130), width=4)
    line(draw, [(320, 240), (320, 320)], alpha((255, 255, 230), 130), width=4)


def draw_curse(draw: ImageDraw.ImageDraw, rng: random.Random, accent, secondary) -> None:
    center = (320, 282)
    for i in range(9):
        radius = 42 + i * 22
        start = rng.randint(0, 320)
        draw.arc([center[0] - radius, center[1] - radius, center[0] + radius, center[1] + radius], start, start + 210, fill=alpha(accent, 205 - i * 15), width=max(2, 13 - i))
    for i in range(7):
        angle = i * math.tau / 7 + rng.random()
        points = []
        for step in range(6):
            r = 50 + step * 35
            points.append((center[0] + math.cos(angle + step * 0.25) * r, center[1] + math.sin(angle + step * 0.25) * r))
        line(draw, points, alpha(secondary, 128), width=5)


def draw_sword(draw: ImageDraw.ImageDraw, rng: random.Random, accent, secondary) -> None:
    polygon(draw, [(320, 78), (358, 350), (320, 558), (282, 350)], fill=alpha(accent, 215), outline=alpha((255, 245, 220), 128), width=4)
    line(draw, [(320, 110), (320, 522)], alpha((255, 255, 240), 120), width=4)
    draw.rounded_rectangle([210, 364, 430, 392], radius=10, fill=alpha(secondary, 230))
    draw.ellipse([286, 392, 354, 468], fill=alpha(mix(secondary, (20, 16, 12), 0.25), 230))


def draw_axe(draw: ImageDraw.ImageDraw, rng: random.Random, accent, secondary) -> None:
    draw.rounded_rectangle([300, 122, 340, 552], radius=14, fill=alpha(mix(secondary, (40, 24, 14), 0.28), 225))
    polygon(draw, [(318, 120), (138, 190), (178, 330), (318, 302)], fill=alpha(accent, 220), outline=alpha((255, 250, 226), 110), width=4)
    polygon(draw, [(322, 120), (502, 190), (462, 330), (322, 302)], fill=alpha(mix(accent, (255, 255, 255), 0.16), 214), outline=alpha((255, 250, 226), 110), width=4)


def draw_firearm(draw: ImageDraw.ImageDraw, rng: random.Random, accent, secondary) -> None:
    draw.rounded_rectangle([116, 248, 488, 310], radius=18, fill=alpha(accent, 220), outline=alpha((255, 246, 220), 120), width=4)
    draw.rectangle([478, 263, 572, 292], fill=alpha(mix(accent, (18, 18, 20), 0.3), 230))
    draw.rounded_rectangle([260, 306, 366, 402], radius=16, fill=alpha(secondary, 225))
    polygon(draw, [(330, 398), (404, 520), (348, 540), (286, 420)], fill=alpha(mix(secondary, (30, 22, 16), 0.28), 220), outline=alpha((255, 240, 210), 80), width=3)
    for x in [152, 206, 424]:
        draw.ellipse([x - 18, 230, x + 18, 266], fill=alpha((255, 236, 180), 102))


def draw_artifact(draw: ImageDraw.ImageDraw, rng: random.Random, accent, secondary, asset_id: str) -> None:
    lower = asset_id.lower()
    if "gun" in lower or "pistol" in lower or "eagle" in lower or "magazine" in lower or "core" in lower:
        draw_firearm(draw, rng, accent, secondary)
    elif any(token in lower for token in ["axe"]):
        draw_axe(draw, rng, accent, secondary)
    elif any(token in lower for token in ["sword", "blade", "saber", "zhuxian", "zangetsu", "enma"]):
        draw_sword(draw, rng, accent, secondary)
    elif "ring" in lower or "na-" in lower:
        draw.ellipse([178, 154, 462, 438], outline=alpha(accent, 235), width=38)
        draw.ellipse([244, 220, 396, 372], outline=alpha((255, 248, 220), 96), width=8)
    elif "bell" in lower:
        polygon(draw, [(230, 200), (410, 200), (462, 464), (178, 464)], fill=alpha(accent, 205), outline=alpha((255, 250, 226), 120), width=5)
        draw.ellipse([188, 430, 452, 506], fill=alpha(secondary, 210))
    elif "tower" in lower:
        for i in range(5):
            w = 260 - i * 34
            y = 496 - i * 82
            draw.rounded_rectangle([320 - w / 2, y - 50, 320 + w / 2, y], radius=12, fill=alpha(mix(accent, secondary, i / 6), 205), outline=alpha((255, 248, 220), 88), width=3)
    elif "armor" in lower or "cloak" in lower:
        polygon(draw, [(320, 112), (470, 210), (424, 520), (320, 564), (216, 520), (170, 210)], fill=alpha(accent, 196), outline=alpha((255, 248, 224), 120), width=5)
    elif "book" in lower:
        draw.rounded_rectangle([172, 128, 468, 512], radius=22, fill=alpha(accent, 218), outline=alpha((255, 242, 210), 118), width=5)
        line(draw, [(320, 140), (320, 500)], alpha((255, 242, 210), 82), width=4)
    else:
        draw.ellipse([170, 130, 470, 430], fill=alpha(accent, 160), outline=alpha((255, 250, 230), 128), width=6)
        polygon(draw, [(320, 116), (424, 280), (320, 444), (216, 280)], fill=alpha(secondary, 170), outline=alpha((255, 250, 230), 100), width=4)


def draw_unique_marks(draw: ImageDraw.ImageDraw, rng: random.Random, digest: str, accent, secondary) -> None:
    for i in range(12):
        angle = (int(digest[i * 2 : i * 2 + 2], 16) / 255) * math.tau
        inner = 70 + (int(digest[24 + i : 25 + i], 16) % 80)
        outer = inner + 38 + (int(digest[36 + i : 37 + i], 16) % 56)
        p1 = (320 + math.cos(angle) * inner, 284 + math.sin(angle) * inner)
        p2 = (320 + math.cos(angle) * outer, 284 + math.sin(angle) * outer)
        line(draw, [p1, p2], alpha(accent if i % 2 else secondary, 58 + (i % 4) * 22), width=2 + (i % 3))

    code = digest[:6].upper()
    draw.rounded_rectangle([470, 34, 604, 70], radius=12, fill=alpha((0, 0, 0), 92), outline=alpha(accent, 130), width=2)
    draw.text((486, 42), code, font=FONT_CODE, fill=alpha((255, 246, 222), 205))


def draw_title(draw: ImageDraw.ImageDraw, asset: dict, label: str, accent) -> None:
    draw.rounded_rectangle([30, 492, 610, 615], radius=22, fill=alpha((10, 8, 9), 210), outline=alpha(accent, 130), width=2)
    draw.text((52, 510), label, font=FONT_SUBTITLE, fill=alpha(accent, 230))
    title_lines = wrap_text(draw, asset["name"], FONT_TITLE, 510)
    y = 540
    for line_text in title_lines:
        draw.text((52, y), line_text, font=FONT_TITLE, fill=alpha((255, 244, 220), 245))
        y += 44


def render_asset(asset: dict, output_path: Path) -> None:
    digest = stable_digest(f"{asset['kind']}|{asset['id']}|{asset['name']}|{asset.get('type', '')}|{asset.get('effect', '')}")
    rng = random.Random(int(digest[:16], 16))
    image = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 255))
    draw = ImageDraw.Draw(image, "RGBA")
    base, accent = draw_background(draw, image, rng, digest, asset["kind"])
    secondary = color_from_digest(digest, 16, saturation=0.82, value=0.98)

    if asset["kind"] == "equipment":
        draw_artifact(draw, rng, accent, secondary, asset["id"])
        label = label_for_equipment(asset)
    else:
        card_type = asset.get("type")
        if card_type == "attack":
            draw_attack(draw, rng, accent, secondary)
        elif card_type == "guard":
            draw_guard(draw, rng, accent, secondary)
        elif card_type == "support":
            draw_support(draw, rng, accent, secondary)
        elif card_type == "tactic":
            draw_tactic(draw, rng, accent, secondary)
        elif card_type == "curse":
            draw_curse(draw, rng, mix(accent, (100, 0, 80), 0.35), secondary)
        else:
            draw_tactic(draw, rng, accent, secondary)
        label = label_for_skill(asset)

    draw_unique_marks(draw, rng, digest, accent, secondary)
    draw_title(draw, asset, label, accent)
    draw.rounded_rectangle([10, 10, SIZE - 10, SIZE - 10], radius=34, outline=alpha(accent, 210), width=5)
    draw.rounded_rectangle([18, 18, SIZE - 18, SIZE - 18], radius=28, outline=alpha((255, 248, 225), 44), width=2)

    image = image.filter(ImageFilter.UnsharpMask(radius=1.2, percent=115, threshold=3)).convert("RGB")
    output_path.parent.mkdir(parents=True, exist_ok=True)
    image.save(output_path, "PNG", optimize=True)


def title_from_id(asset_id: str) -> str:
    return asset_id.replace("-", " ").replace("_", " ").title()


def build_assets(data: dict) -> list[dict]:
    assets: list[dict] = []
    known_skill_ids: set[str] = set()
    for card in data["cards"]:
        known_skill_ids.add(card["id"])
        assets.append({"kind": "skill", **card})

    for existing in sorted(ASSET_DIR.glob("skill-*.png")):
        asset_id = existing.stem.removeprefix("skill-")
        if asset_id not in known_skill_ids:
            assets.append({"kind": "skill", "id": asset_id, "name": title_from_id(asset_id), "type": "tactic", "category": "extra"})

    for equipment in data["equipment"]:
        assets.append({"kind": "equipment", **equipment})
    return assets


def assert_unique_hashes(assets: list[dict]) -> dict:
    groups: dict[str, list[str]] = {}
    missing: list[str] = []
    for asset in assets:
        prefix = "skill" if asset["kind"] == "skill" else "equipment"
        path = ASSET_DIR / f"{prefix}-{asset['id']}.png"
        if not path.exists():
            missing.append(path.name)
            continue
        digest = hashlib.sha256(path.read_bytes()).hexdigest()
        groups.setdefault(digest, []).append(path.name)
    duplicates = [names for names in groups.values() if len(names) > 1]
    if missing or duplicates:
        raise RuntimeError(json.dumps({"missing": missing, "duplicates": duplicates}, ensure_ascii=False, indent=2))
    return {
        "skill_count": sum(1 for asset in assets if asset["kind"] == "skill"),
        "equipment_count": sum(1 for asset in assets if asset["kind"] == "equipment"),
        "unique_hashes": len(groups),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate unique PNG assets for all cards and equipment.")
    parser.add_argument("--manifest", type=Path, help="JSON manifest exported by scripts/export-asset-manifest.mjs")
    args = parser.parse_args()

    data = load_game_data(args.manifest)
    assets = build_assets(data)
    for index, asset in enumerate(assets, 1):
        prefix = "skill" if asset["kind"] == "skill" else "equipment"
        render_asset(asset, ASSET_DIR / f"{prefix}-{asset['id']}.png")
        print(f"[{index:03d}/{len(assets):03d}] {prefix}-{asset['id']}.png")

    report = assert_unique_hashes(assets)
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(report, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
