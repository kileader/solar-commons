"""Encode approved storyboard masters without changing their composition.

Requires Pillow. Run from any directory; outputs are relative to this repository.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCES = {
    "room": "s01-civic-compute-room-start-v2.png",
    "consent-ready": "s02-permission-start-v2.png",
    "consent-pressed": "s02-permission-pressed-v1.png",
    "kite": "s03-familiar-partner-v1.png",
    "threshold": "s04-threshold-v1.png",
    "shared": "s05-shared-cognition-v1.png",
    "mara": "s06-still-human-v1.png",
    "city": "s07-living-city-v1.png",
}


def main():
    output = ROOT / "game/images/opening"
    output.mkdir(parents=True, exist_ok=True)
    for name, filename in SOURCES.items():
        destination = output / f"{name}.webp"
        with Image.open(ROOT / "docs/storyboard/server-room" / filename) as image:
            if image.size != (1672, 941):
                raise ValueError(f"Unexpected framing: {filename}: {image.size}")
            image.save(destination, "WEBP", quality=88, method=6)
        print(f"{destination.name}: {destination.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
