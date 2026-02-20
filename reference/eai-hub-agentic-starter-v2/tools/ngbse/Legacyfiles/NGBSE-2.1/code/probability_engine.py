
import math
import datetime

def scenario_probability(evidence_score, days_old=0, half_life=7):
    """Decay-based probability weighting for scenario visibility."""
    decay = 0.5 ** (days_old / half_life)
    return round(evidence_score * decay, 2)
