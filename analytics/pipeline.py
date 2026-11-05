"""
Bússola Urbana — pipeline de análise (Python + scikit-learn)

Entrada : planilha SSP-SP "SPDadosCriminais_2026.xlsx" (ou o CSV filtrado de Sorocaba)
Saída   : data/areas.json, data/ocorrencias.json, data/meta.json  (carregados no Supabase por `npm run seed`)

Método (igual ao relatório da AF): furto, roubo e tráfico com coordenada válida em Sorocaba;
DBSCAN eps=250 m, mínimo 20 ocorrências; Índice de Atenção = 50% percentil de volume +
50% percentil de concentração no período do dia de pico. "Em hora incerta" nunca vira pico.

Uso:  python analytics/pipeline.py --entrada caminho.xlsx [--inicio 2026-01-01] [--fim 2026-09-30]
"""
import argparse, csv, json, os
import numpy as np, pandas as pd
from sklearn.cluster import DBSCAN

IBGE_SOROCABA = 3552205
PERIODOS = ["De madrugada", "Pela manhã", "A tarde", "A noite"]

def extrair_sorocaba(caminho):
    if caminho.lower().endswith(".csv"):
        return pd.read_csv(caminho, low_memory=False)
    import openpyxl
    wb = openpyxl.load_workbook(caminho, read_only=True)
    linhas, cab = [], None
    for nome in wb.sheetnames:
        ws = wb[nome]; it = ws.iter_rows(values_only=True)
        h = next(it)
        if "COD IBGE" not in h: continue
        cab = h; ix = h.index("COD IBGE")
        linhas += [r for r in it if r[ix] == IBGE_SOROCABA]
    return pd.DataFrame(linhas, columns=cab)

def coord(x):
    try:
        if pd.isna(x) or str(x) in ("0", "-", "NULL", ""): return None
        return float(str(x).replace(",", "."))
    except Exception:
        return None

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--entrada", required=True); ap.add_argument("--saida", default="data")
    ap.add_argument("--inicio", default="2026-01-01"); ap.add_argument("--fim", default="2026-12-31")
    a = ap.parse_args()
    d = extrair_sorocaba(a.entrada)
    d["lat"] = d.LATITUDE.map(coord); d["lon"] = d.LONGITUDE.map(coord)
    d["dt"] = pd.to_datetime(d.DATA_OCORRENCIA_BO)
    m = d.NATUREZA_APURADA.str.contains("FURTO|ROUBO|TR[AÁ]FICO", na=False, regex=True)
    v = d[m & d.lat.between(-23.65, -23.35) & d.lon.between(-47.60, -47.30) & (d.dt >= a.inicio) & (d.dt <= a.fim)].copy()

    k = np.cos(np.radians(v.lat.mean()))
    X = np.c_[v.lon * 111.32 * k, v.lat * 110.574]
    v["c"] = DBSCAN(eps=0.25, min_samples=20).fit(X).labels_

    areas = []
    for c in sorted(set(v.c) - {-1}):
        g = v[v.c == c]; n = len(g)
        gk = g[g.DESC_PERIODO.isin(PERIODOS)]
        if len(gk):
            pc = gk.DESC_PERIODO.value_counts(); pico = pc.idxmax(); conc = pc.max() / len(gk); inc = (n - len(gk)) / n * 100
        else:
            pico, conc, inc = "não disponível", 0, 100.0
        dx = (g.lon - g.lon.mean()) * 111.32 * k; dy = (g.lat - g.lat.mean()) * 110.574
        nat = g.NATUREZA_APURADA
        areas.append(dict(
            n=n, bairro=g.BAIRRO.value_counts().idxmax(), natureza_top=nat.value_counts().idxmax(),
            ambiente_top=str(g.DESCR_TIPOLOCAL.value_counts().idxmax()) if g.DESCR_TIPOLOCAL.notna().any() else None,
            pct_veiculo=round(float(nat.str.contains("VE[IÍ]CULO|CARRO|MOTO|AUTO", regex=True).mean() * 100), 1),
            periodo_pico=pico, concentracao_pico=round(conc * 100, 1), pct_hora_incerta=round(inc, 1),
            lat=round(g.lat.mean(), 6), lon=round(g.lon.mean(), 6),
            raio_km=round(float(np.percentile(np.sqrt(dx**2 + dy**2), 90)), 2),
            furto=int(nat.str.contains("FURTO").sum()), roubo=int(nat.str.contains("ROUBO").sum()),
            trafico=int(nat.str.contains("TR[AÁ]FICO", regex=True).sum()), _c=int(c)))
    ns = [x["n"] for x in areas]; cs = [x["concentracao_pico"] for x in areas]
    for x in areas:
        x["score_volume"] = round(sum(n <= x["n"] for n in ns) / len(ns) * 50)
        x["score_temporal"] = round(sum(c <= x["concentracao_pico"] for c in cs) / len(cs) * 50)
        x["indice"] = x["score_volume"] + x["score_temporal"]
    areas.sort(key=lambda x: (-x["indice"], -x["n"]))
    lut = {}
    for i, x in enumerate(areas, 1): x["id"] = i; lut[x.pop("_c")] = i

    oc = []
    for r in v.itertuples():
        nat = "roubo" if "ROUBO" in r.NATUREZA_APURADA else "furto" if "FURTO" in r.NATUREZA_APURADA else "trafico"
        oc.append(dict(lat=round(r.lat, 5), lon=round(r.lon, 5), area_id=lut.get(r.c),
                       natureza=nat, periodo=r.DESC_PERIODO if r.DESC_PERIODO in PERIODOS else "Em hora incerta", mes=int(r.dt.month)))
    meta = dict(periodo_inicio=a.inicio, periodo_fim=str(v.dt.max().date()), n_total=len(oc),
                n_em_areas=int(sum(x["n"] for x in areas)), n_areas=len(areas),
                fonte="SSP-SP, Dados Criminais 2026", gerado=str(pd.Timestamp.today().date()))
    os.makedirs(a.saida, exist_ok=True)
    for nome, obj in (("areas", areas), ("ocorrencias", oc), ("meta", meta)):
        json.dump(obj, open(f"{a.saida}/{nome}.json", "w", encoding="utf-8"), ensure_ascii=False)
    print(meta)

if __name__ == "__main__":
    main()
