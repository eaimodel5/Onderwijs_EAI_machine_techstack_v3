import math, json
from pathlib import Path

# E_AI* = sqrt( w1*(P*W_V) + w2*(D_A*D_B) + w3*(T*A) + w4*V + w5*M )
# default weights
w1, w2, w3, w4, w5 = 0.3, 0.3, 0.2, 0.15, 0.05

def e_ai_star(P, W_V, D_A, D_B, T, A, V, M=0.1):
    return math.sqrt(w1*(P*W_V) + w2*(D_A*D_B) + w3*(T*A) + w4*V + w5*M)

def demo():
    # Example rubric scores (0.1–1.0), conservative
    P, W_V, D_A, D_B, T, A, V = 0.7, 0.85, 0.8, 0.7, 0.8, 0.6, 0.8
    # Mirror factor from triage (if ghost assets found, set closer to 1.0)
    M = 0.9
    score = e_ai_star(P,W_V,D_A,D_B,T,A,V,M)
    print(f"E_AI* = {score:.3f} (with M={M})")
    return score

if __name__ == "__main__":
    demo()
