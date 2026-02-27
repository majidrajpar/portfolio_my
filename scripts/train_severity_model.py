"""
Audit Finding Severity Classifier — Model Training Script
==========================================================
Trains a Logistic Regression (multinomial softmax) on expert-labelled data
covering all 81 possible input combinations (3 factors × 4 dimensions).

Run once to regenerate src/data/severity-model.json.
Requires: pip install scikit-learn numpy

Usage:
    cd scripts
    python train_severity_model.py
"""

import json
import itertools
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import PolynomialFeatures, StandardScaler

# ─── SEVERITY CLASSES ────────────────────────────────────────────────
CLASSES = ['Low', 'Medium', 'High', 'Critical']

# ─── EXPERT LABELING FUNCTION ────────────────────────────────────────
def expert_label(e, l, d, s):
    """
    Returns severity class index (0=Low, 1=Medium, 2=High, 3=Critical)
    for a given combination of:
        e = Financial Exposure  (1=Immaterial, 2=Potentially material, 3=Material)
        l = Likelihood          (1=Rare, 2=Possible, 3=Likely/recurring)
        d = Detection           (1=Easy, 2=Moderate, 3=Hard/undetected)
        s = Scope               (1=Single transaction, 2=Department, 3=Entity-wide)

    Design principles (second pass):
    - Severity is driven by risk interaction, not just additive sum
    - Immateriality caps severity regardless of other factors
    - Three bump rules capture disproportionately dangerous combinations
    - Critical is reserved for genuinely board-notifiable situations
    """
    base = e + l + d + s  # 4-12

    bump = 0

    # Bump 1: Material + Hard to detect
    # Something material that management cannot see is disproportionately dangerous.
    # An auditor finding this after the fact implies it could have been exploited.
    if e == 3 and d == 3:
        bump += 1

    # Bump 2: Entity-wide + Hard to detect
    # A systemic, pervasive control failure that goes undetected signals a deep
    # design flaw in the control environment — worse than the factors alone suggest.
    if s == 3 and d == 3:
        bump += 1

    # Bump 3: Material + Recurring
    # Material errors that keep happening imply either intentional override or
    # a fundamentally broken process. Accumulated exposure compounds over time.
    if e == 3 and l == 3:
        bump += 1

    adjusted = base + bump

    # Immateriality cap 1: Immaterial findings cannot be Critical.
    # An immaterial finding, by definition, does not warrant Board/AC notification.
    # Maximum severity for immaterial exposure is High (adjusted <= 10).
    if e == 1:
        adjusted = min(adjusted, 10)

    # Immateriality cap 2: Immaterial + easy to detect = max Medium.
    # If the control failure is both below materiality AND caught quickly by
    # existing controls, the residual risk ceiling is Medium.
    if e == 1 and d == 1:
        adjusted = min(adjusted, 7)

    # Thresholds (tighter Critical than simple sum-based rules)
    if adjusted <= 5:
        return 0   # Low
    elif adjusted <= 7:
        return 1   # Medium
    elif adjusted <= 11:
        return 2   # High
    else:
        return 3   # Critical


# ─── GENERATE TRAINING DATA ──────────────────────────────────────────
print("Generating expert-labelled training data for all 81 combinations...")

X_raw, y = [], []
label_map = []

for e, l, d, s in itertools.product([1, 2, 3], repeat=4):
    cls = expert_label(e, l, d, s)
    X_raw.append([e, l, d, s])
    y.append(cls)
    label_map.append((e, l, d, s, CLASSES[cls]))

X_raw = np.array(X_raw)
y = np.array(y)

# Print full label distribution for review
print(f"\n{'─'*60}")
print(f"{'Exposure':>10} {'Likelihood':>12} {'Detection':>11} {'Scope':>7}  →  Label")
print(f"{'─'*60}")
for e, l, d, s, label in label_map:
    exposure_str  = {1:'Immaterial', 2:'Pot. material', 3:'Material'}[e]
    like_str      = {1:'Rare', 2:'Possible', 3:'Likely'}[l]
    detect_str    = {1:'Easy', 2:'Moderate', 3:'Hard'}[d]
    scope_str     = {1:'Single txn', 2:'Dept', 3:'Entity-wide'}[s]
    print(f"{exposure_str:>14} {like_str:>12} {detect_str:>10} {scope_str:>12}  →  {label}")

counts = {c: int(np.sum(y == i)) for i, c in enumerate(CLASSES)}
print(f"\nClass distribution: {counts}")
total = sum(counts.values())
print(f"Total: {total} samples (expected 81)")


# ─── FEATURE ENGINEERING ─────────────────────────────────────────────
# Polynomial features (degree 2) let the logistic regression learn
# non-linear interaction terms (e*d, s*d, e*l, etc.) that capture
# the bump rules encoded in the expert labels above.
poly = PolynomialFeatures(degree=2, include_bias=False)
X_poly = poly.fit_transform(X_raw)
print(f"\nFeature count after polynomial expansion: {X_poly.shape[1]}")

# Standardise for numerical stability
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X_poly)


# ─── TRAIN MODEL ─────────────────────────────────────────────────────
print("\nTraining Logistic Regression (multinomial softmax)...")
clf = LogisticRegression(
    solver='lbfgs',
    max_iter=10000,
    C=100,       # Low regularisation — we want to fit the expert labels closely
    random_state=42
)
clf.fit(X_scaled, y)


# ─── EVALUATE ────────────────────────────────────────────────────────
preds = clf.predict(X_scaled)
probs = clf.predict_proba(X_scaled)
acc = np.mean(preds == y)
print(f"\nTraining accuracy: {acc:.2%} ({int(acc*81)}/81 correct)")

# Show any misclassifications with predicted vs expected
errors = [(X_raw[i], CLASSES[y[i]], CLASSES[preds[i]], probs[i])
          for i in range(len(y)) if preds[i] != y[i]]

if errors:
    print(f"\nMisclassifications ({len(errors)}):")
    for x, true, pred, prob in errors:
        e, l, d, s = x
        print(f"  e={e} l={l} d={d} s={s}  Expected:{true}  Got:{pred}  "
              f"Probs: {dict(zip(CLASSES, [f'{p:.2f}' for p in prob]))}")
else:
    print("No misclassifications — perfect fit on training data.")

# Confidence summary
mean_conf = np.max(probs, axis=1).mean()
low_conf = np.sum(np.max(probs, axis=1) < 0.70)
print(f"\nMean confidence: {mean_conf:.1%}")
print(f"Predictions below 70% confidence: {low_conf}/81")


# ─── EXPORT MODEL ────────────────────────────────────────────────────
output_path = '../src/data/severity-model.json'

model = {
    '_comment': (
        'Trained on 81 expert-labelled combinations. '
        'Do not edit manually — regenerate via scripts/train_severity_model.py'
    ),
    'classes': CLASSES,
    'coef': clf.coef_.tolist(),          # shape: [n_classes, n_features]
    'intercept': clf.intercept_.tolist(),
    'poly_powers': poly.powers_.tolist(), # used by JS to replicate feature expansion
    'scaler_mean': scaler.mean_.tolist(),
    'scaler_scale': scaler.scale_.tolist(),
}

with open(output_path, 'w') as f:
    json.dump(model, f, indent=2)

print(f"\nModel saved to: {output_path}")
print("Done.")
