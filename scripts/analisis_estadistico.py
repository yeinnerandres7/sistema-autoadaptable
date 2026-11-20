"""Análisis estadístico de las mediciones exportadas desde la página de Comparación.

Uso:
    pip install pandas scipy
    python scripts/analisis_estadistico.py mediciones-autoadaptable.csv

Para cada perfil de prueba empareja cada repetición con motor activo con su repetición con motor
desactivado (misma repetición, mismo perfil) y aplica la prueba de Wilcoxon de rangos con signo para
muestras pareadas. Los p-valores se ajustan con Holm por el número de comparaciones.
La prueba U de Mann-Whitney no se usa: asume muestras independientes, y aquí las mediciones están pareadas.
"""
import sys

import pandas as pd
from scipy.stats import wilcoxon

METRICS = ["lcp_ms", "tbt_ms", "tareas_largas_ms", "heap_mb"]
PROFILES = ["low", "medium", "high"]
ALPHA = 0.05


def holm(pvalues):
    """Ajuste de Holm para una lista de p-valores. Devuelve la lista ajustada en el mismo orden."""
    m = len(pvalues)
    order = sorted(range(m), key=lambda i: pvalues[i])
    adjusted = [None] * m
    running = 0.0
    for rank, i in enumerate(order):
        value = min(1.0, (m - rank) * pvalues[i])
        running = max(running, value)
        adjusted[i] = running
    return adjusted


def main(path):
    df = pd.read_csv(path)
    rows = []
    for profile in PROFILES:
        sub = df[df["perfil_prueba"] == profile]
        active = sub[sub["condicion"] == "activo"].set_index("repeticion")
        control = sub[sub["condicion"] == "inactivo"].set_index("repeticion")
        pairs = active.index.intersection(control.index)
        for metric in METRICS:
            a = active.loc[pairs, metric].astype(float)
            c = control.loc[pairs, metric].astype(float)
            n = len(pairs)
            if n < 2 or (a - c).abs().sum() == 0:
                p = float("nan")
            else:
                p = float(wilcoxon(a, c, alternative="two-sided").pvalue)
            rows.append({"perfil": profile, "metrica": metric, "pares": n,
                         "mediana_activo": a.median() if n else float("nan"),
                         "mediana_inactivo": c.median() if n else float("nan"),
                         "p": p})

    valid = [i for i, r in enumerate(rows) if r["p"] == r["p"]]  # descarta NaN
    adjusted = holm([rows[i]["p"] for i in valid])
    for i, pa in zip(valid, adjusted):
        rows[i]["p_holm"] = pa

    print(f"Archivo: {path}   Alfa = {ALPHA} (ajustado con Holm por {len(valid)} comparaciones válidas)\n")
    for r in rows:
        if r["pares"] < 2:
            print(f"{r['perfil']:>6} | {r['metrica']:<17} | pares insuficientes ({r['pares']})")
            continue
        p_adj = r.get("p_holm", float("nan"))
        verdict = "significativo" if p_adj < ALPHA else "no significativo"
        print(f"{r['perfil']:>6} | {r['metrica']:<17} | pares={r['pares']:>2} | "
              f"mediana activo={r['mediana_activo']:.1f} inactivo={r['mediana_inactivo']:.1f} | "
              f"p={r['p']:.4f} p_holm={p_adj:.4f} | {verdict}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("Uso: python scripts/analisis_estadistico.py mediciones-autoadaptable.csv")
    main(sys.argv[1])
