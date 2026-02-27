"""
Train Fraud Risk Calculator ML model.
Framework: Fraud Triangle (Opportunity, Pressure, Rationalization) + Control Environment
Output: src/data/fraud-risk-model.json  (same schema as severity-model.json)
"""
import json, numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

np.random.seed(42)
CLASSES = ['Low', 'Medium', 'High', 'Critical']

# Features: [Opportunity, Pressure, Rationalization, ControlEnvironment] each 1-5
def label(o, p, r, c):
    avg = (o + p + r + c) / 4
    max_d = max(o, p, r, c)
    if avg >= 4.2 or (avg >= 3.8 and max_d >= 4.8):   return 3  # Critical
    if avg >= 3.4 or max_d >= 4.2:                      return 2  # High
    if avg >= 2.4 or max_d >= 3.2:                      return 1  # Medium
    return 0                                                        # Low

rows, labels = [], []
for _ in range(500):
    v = np.random.uniform(1, 5, 4)
    rows.append(v); labels.append(label(*v))

# Add deterministic boundary examples
for o in np.linspace(1,5,6):
  for p in np.linspace(1,5,6):
    for r in np.linspace(1,5,4):
      for c in np.linspace(1,5,4):
        rows.append([o,p,r,c]); labels.append(label(o,p,r,c))

X = np.array(rows); y = np.array(labels)

poly = PolynomialFeatures(degree=2, include_bias=False)
scaler = StandardScaler()
Xp = poly.fit_transform(X)
Xs = scaler.fit_transform(Xp)

clf = LogisticRegression(max_iter=2000, C=1.0, solver='lbfgs')
clf.fit(Xs, y)

out = {
    "classes": CLASSES,
    "coef": clf.coef_.tolist(),
    "intercept": clf.intercept_.tolist(),
    "poly_powers": poly.powers_.tolist(),
    "scaler_mean": scaler.mean_.tolist(),
    "scaler_scale": scaler.scale_.tolist(),
}
path = "src/data/fraud-risk-model.json"
with open(path, "w") as f: json.dump(out, f)
print(f"✓ {path}  classes={CLASSES}  features={Xp.shape[1]}  accuracy={clf.score(Xs,y):.3f}")
