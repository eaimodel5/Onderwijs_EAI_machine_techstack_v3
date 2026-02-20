
import math

def e_ai_score(P, W_V, D_A, D_B, T, A, V, M=0.0):
    """Compute extended E_AI* score with Mirror factor (M)."""
    w1, w2, w3, w4, w5 = 0.3, 0.3, 0.2, 0.15, 0.05
    score = math.sqrt(
        w1*(P*W_V) +
        w2*(D_A*D_B) +
        w3*(T*A) +
        w4*V +
        w5*M
    )
    return round(score, 3)

def detect_blindspots(P, W_V, D_A, D_B, T, A, V):
    """Simple rule-based blindspot detector."""
    issues = []
    if A > 0.7 and D_B < 0.4:
        issues.append("High autonomy with low teacher control (A↑, D_B↓).")
    if P > 0.6 and W_V < 0.4:
        issues.append("High presence with weak didactic value (P↑, W_V↓).")
    if (P > 0.6 or A > 0.6) and T < 0.4:
        issues.append("Strong adoption but weak technical integration (P/A↑, T↓).")
    return issues
