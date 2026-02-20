import os, json, math, glob
from typing import Dict, List
from ..logger import LOGGER

def ewma(values: List[float], alpha: float=0.4) -> float:
    if not values: return 0.0
    s = values[0]
    for v in values[1:]:
        s = alpha*v + (1-alpha)*s
    return s

def build_forecast(out_dir: str) -> Dict:
    """
    Leest eerdere runs (out/history/*.asset_scores.json) en projecteert een korte-termijn trend per asset.
    """
    history_glob = os.path.join(out_dir, "history", "*.asset_scores.json")
    series = {}
    for path in sorted(glob.glob(history_glob)):
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            for asset, vals in data.items():
                series.setdefault(asset, []).append(vals.get("avg_e_ai_star",0.0))
        except Exception:
            continue
    forecast = {}
    for asset, seq in series.items():
        forecast[asset] = {
            "last": seq[-1] if seq else 0.0,
            "ewma": ewma(seq, alpha=0.5),
            "projected_next": ewma(seq, alpha=0.5)  # simple persistence
        }
    LOGGER.info("forecast.done", n_assets=len(forecast))
    return forecast
