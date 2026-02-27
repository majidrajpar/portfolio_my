"""
Train Governance Maturity Assessment ML model.
Framework: COSO / King IV maturity (5 levels)
6 domains: Board & Leadership, Risk Management, Internal Controls,
           Ethics & Integrity, Compliance, Reporting
Output: src/data/governance-maturity-model.json
"""
import json, numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

np.random.seed(99)
CLASSES = ['Initial', 'Developing', 'Defined', 'Managed', 'Optimising']

def label(scores):
    avg = np.mean(scores)
    min_s = np.min(scores)
    if avg >= 4.4 and min_s >= 3.8:   return 4  # Optimising
    if avg >= 3.5 and min_s >= 2.8:   return 3  # Managed
    if avg >= 2.6 and min_s >= 1.8:   return 2  # Defined
    if avg >= 1.8:                     return 1  # Developing
    return 0                                      # Initial

rows, labels = [], []
for _ in range(600):
    v = np.random.uniform(1, 5, 6)
    rows.append(v); labels.append(label(v))

for combo in np.mgrid[1:5.5:1, 1:5.5:1, 1:5.5:1, 1:5.5:1, 1:5.5:1, 1:5.5:1].reshape(6,-1).T:
    rows.append(combo); labels.append(label(combo))

X = np.array(rows); y = np.array(labels)

poly = PolynomialFeatures(degree=2, include_bias=False)
scaler = StandardScaler()
Xp = poly.fit_transform(X)
Xs = scaler.fit_transform(Xp)

clf = LogisticRegression(max_iter=3000, C=0.8, solver='lbfgs')
clf.fit(Xs, y)

out = {
    "classes": CLASSES,
    "coef": clf.coef_.tolist(),
    "intercept": clf.intercept_.tolist(),
    "poly_powers": poly.powers_.tolist(),
    "scaler_mean": scaler.mean_.tolist(),
    "scaler_scale": scaler.scale_.tolist(),
}
path = "src/data/governance-maturity-model.json"
with open(path, "w") as f: json.dump(out, f)
print(f"✓ {path}  classes={CLASSES}  features={Xp.shape[1]}  accuracy={clf.score(Xs,y):.3f}")
