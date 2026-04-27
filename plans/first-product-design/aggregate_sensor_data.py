#!/usr/bin/env python3
"""
Weekly aggregation of granular sensor JSON: mean per ISO week per sensor type.

Reads: sensor-data-50e963ae-2024-12-01_2026-04-27.json (or --input)
Writes: agreggated-sensor-data.json (or --output)
"""

from __future__ import annotations

import argparse
import json
import statistics
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

SENSOR_KEYS = (
    "ambientTemperature",
    "ambientHumidity",
    "soilHumidity",
)


def week_key_utc(iso_date: str) -> tuple[int, int]:
    """Return (iso_year, iso_week) for a UTC instant."""
    dt = datetime.fromisoformat(iso_date.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    y, w, _ = dt.isocalendar()
    return (y, w)


def aggregate_sensor_series(
    readings: list[dict],
) -> list[dict[str, int | float | str]]:
    """Group by ISO week, return sorted list of { weekLabel, year, week, average, count }."""
    buckets: dict[tuple[int, int], list[float]] = defaultdict(list)
    for row in readings:
        if "date" not in row or "value" not in row:
            continue
        key = week_key_utc(str(row["date"]))
        try:
            buckets[key].append(float(row["value"]))
        except (TypeError, ValueError):
            continue

    out: list[dict[str, int | float | str]] = []
    for (year, week) in sorted(buckets.keys()):
        vals = buckets[(year, week)]
        out.append(
            {
                "week": f"{year}-W{week:02d}",
                "year": year,
                "weekNumber": week,
                "average": statistics.fmean(vals),
                "count": len(vals),
            }
        )
    return out


def main() -> None:
    here = Path(__file__).resolve().parent
    default_in = here / "sensor-data-50e963ae-2024-12-01_2026-04-27.json"
    default_out = here / "agreggated-sensor-data.json"

    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument(
        "-i",
        "--input",
        type=Path,
        default=default_in,
        help=f"Input granular JSON (default: {default_in.name})",
    )
    p.add_argument(
        "-o",
        "--output",
        type=Path,
        default=default_out,
        help=f"Output path (default: {default_out.name})",
    )
    args = p.parse_args()

    with args.input.open("r", encoding="utf-8") as f:
        raw = json.load(f)

    sensor_data = raw.get("sensorData") or {}
    weekly: dict[str, list[dict[str, int | float | str]]] = {}
    for key in SENSOR_KEYS:
        series = sensor_data.get(key)
        if not isinstance(series, list):
            weekly[key] = []
            continue
        weekly[key] = aggregate_sensor_series(series)

    out_doc = {
        "aggregatedFrom": str(args.input),
        "exportedAt": raw.get("exportedAt"),
        "module": raw.get("module"),
        "dateRange": raw.get("dateRange"),
        "note": "ISO week (Monday start), UTC. average = arithmetic mean of all readings in the week for that sensor type.",
        "weeklyAverages": weekly,
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as f:
        json.dump(out_doc, f, indent=2, ensure_ascii=False)
        f.write("\n")

    counts = ", ".join(f"{k}={len(weekly[k])} weeks" for k in SENSOR_KEYS)
    print(f"Wrote {args.output} ({counts}).")


if __name__ == "__main__":
    main()
