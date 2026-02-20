from typing import List, Dict, Any


def _seed_row(query: str, seed_type: str, priority: float, time_window_days: int = 60) -> Dict[str, Any]:
    priority = max(0.1, min(1.0, float(priority)))
    return {
        "id": "S-NEW",
        "query": query,
        "type": seed_type,
        "priority": priority,
        "time_window_days": time_window_days,
    }


def propose_next_seeds(
    findings: List[Dict[str, Any]],
    asset_scores: Dict[str, Dict[str, float]],
    blindspots: Dict[str, Any],
) -> List[Dict[str, Any]]:
    proposals: List[Dict[str, Any]] = []
    seen_queries = set()

    # 1) High-risk assets → site: seeds
    top_assets = sorted(
        asset_scores.items(), key=lambda kv: kv[1].get("avg_e_ai_star", 0.0), reverse=True
    )[:8]
    for asset, score in top_assets:
        if not asset:
            continue
        q = f"site:{asset}"
        if q in seen_queries:
            continue
        seen_queries.add(q)
        proposals.append(_seed_row(q, "web", score.get("avg_e_ai_star", 0.6)))

    # 2) Underrepresented source types → generic themed seeds
    coverage = (blindspots or {}).get("coverage", {}).get("ratios", {})
    if coverage:
        # If Web dominates heavily, suggest code/ti_post to improve balance
        if coverage.get("Web", 0) >= 0.6:
            for q, tp in [
                ("github oidc token actions.amazonaws.com", "code"),
                ("x-amz-signature=", "ti_post"),
                ("sv= signature= blob.core.windows.net", "ti_post"),
            ]:
                if q not in seen_queries:
                    seen_queries.add(q)
                    proposals.append(_seed_row(q, tp, 0.7))

    # 3) Per finding, suggest narrower follow-ups for API-sources
    for f in findings[:20]:
        src = f.get("source", {})
        st = (src.get("type") or "").lower()
        url = src.get("url") or ""
        asset = (f.get("asset") or "").lower()
        if st in {"github", "code"} and asset:
            q = f"site:github.com {asset} token"
            if q not in seen_queries:
                seen_queries.add(q)
                proposals.append(_seed_row(q, "code", 0.6))
        elif st in {"infra"} and asset:
            q = f"port:1883 MQTT {asset}"
            if q not in seen_queries:
                seen_queries.add(q)
                proposals.append(_seed_row(q, "infra", 0.55))

    return proposals


