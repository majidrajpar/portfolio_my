"""
Train Internal Control Evaluator ML model.
Framework: COSO 2013 (5 components)
Components: Control Environment, Risk Assessment, Control Activities,
            Information & Communication, Monitoring
Output: src/data/icfr-control-model.json
"""
import json, numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

np.random.seed(7)
CLASSES = ['No Deficiency', 'Control Deficiency', 'Significant Deficiency', 'Material Weakness']

def label(scores):
    avg = np.mean(scores)
    min_s = np.min(scores)
    # Material Weakness: any component very low or overall very low
    if min_s <= 1.5 or avg <= 2.0:       return 3  # Material Weakness
    # Significant Deficiency: one or more components low
    if min_s <= 2.5 or avg <= 2.8:       return 2  # Significant Deficiency
    # Control Deficiency: minor gaps
    if min_s <= 3.5 or avg <= 3.5:       return 1  # Control Deficiency
    return 0                                         # No Deficiency

rows, labels = [], []
for _ in range(500):
    v = np.random.uniform(1, 5, 5)
    rows.append(v); labels.append(label(v))

for c1 in np.linspace(1,5,6):
  for c2 in np.linspace(1,5,6):
    for c3 in np.linspace(1,5,5):
      for c4 in np.linspace(1,5,4):
        for c5 in np.linspace(1,5,4):
          rows.append([c1,c2,c3,c4,c5]); labels.append(label([c1,c2,c3,c4,c5]))

X = np.array(rows); y = np.array(labels)

poly = PolynomialFeatures(degree=2, include_bias=False)
scaler = StandardScaler()
Xp = poly.fit_transform(X)
Xs = scaler.fit_transform(Xp)

clf = LogisticRegression(max_iter=3000, C=1.0, solver='lbfgs')
clf.fit(Xs, y)

out = {
    "classes": CLASSES,
    "coef": clf.coef_.tolist(),
    "intercept": clf.intercept_.tolist(),
    "poly_powers": poly.powers_.tolist(),
    "scaler_mean": scaler.mean_.tolist(),
    "scaler_scale": scaler.scale_.tolist(),
}
path = "src/data/icfr-control-model.json"
with open(path, "w") as f: json.dump(out, f)
print(f"✓ {path}  classes={CLASSES}  features={Xp.shape[1]}  accuracy={clf.score(Xs,y):.3f}")
