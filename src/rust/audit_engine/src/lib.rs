use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use js_sys::Math;

// --- EXISTING: BENFORD'S LAW ---
#[derive(Serialize, Deserialize)]
pub struct BenfordResult {
    pub actual_distribution: Vec<f64>,
    pub expected_distribution: Vec<f64>,
    pub anomaly_score: f64,
    pub total_count: usize,
}

#[wasm_bindgen]
pub fn analyze_benfords_law(data: Vec<f64>) -> JsValue {
    let mut counts = vec![0.0; 9];
    let mut total = 0.0;
    for &num in &data {
        let abs_num = num.abs();
        if abs_num < 1.0 { continue; }
        let s = abs_num.to_string();
        let first_digit = s.chars()
            .find(|c| c.is_ascii_digit() && *c != '0' && *c != '.')
            .and_then(|c| c.to_digit(10));
        if let Some(digit) = first_digit {
            if digit >= 1 && digit <= 9 {
                counts[(digit - 1) as usize] += 1.0;
                total += 1.0;
            }
        }
    }
    let expected: Vec<f64> = (1..=9).map(|d| (1.0 + 1.0 / d as f64).log10() * 100.0).collect();
    let actual: Vec<f64> = counts.iter().map(|&c| if total > 0.0 { (c / total) * 100.0 } else { 0.0 }).collect();
    let mad: f64 = actual.iter().zip(expected.iter()).map(|(a, e)| (a - e).abs()).sum::<f64>() / 9.0;
    let result = BenfordResult { actual_distribution: actual, expected_distribution: expected, anomaly_score: mad, total_count: total as usize };
    serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
}

// --- NEW: MONTE CARLO RISK SIMULATOR ---
#[derive(Serialize, Deserialize)]
pub struct MonteCarloResult {
    pub mean_loss: f64,
    pub p95_loss: f64,
    pub max_loss: f64,
    pub distribution: Vec<f64>, // Histogram buckets
}

#[wasm_bindgen]
pub fn run_risk_simulation(avg_impact: f64, probability: f64, iterations: u32) -> JsValue {
    let mut outcomes = Vec::with_capacity(iterations as usize);
    let mut total_loss = 0.0;

    for _ in 0..iterations {
        let mut loss = 0.0;
        if Math::random() < probability {
            // Log-normal distribution for impact (common in risk)
            let variance = 0.5;
            let mu = (avg_impact).ln() - 0.5 * variance;
            loss = (mu + (Math::random() - 0.5) * 2.0 * variance).exp();
        }
        outcomes.push(loss);
        total_loss += loss;
    }

    outcomes.sort_by(|a, b| a.partial_cmp(b).unwrap());
    
    let p95_idx = (iterations as f64 * 0.95) as usize;
    let p95_loss = outcomes[p95_idx.min(iterations as usize - 1)];
    let max_loss = outcomes[iterations as usize - 1];
    let mean_loss = total_loss / iterations as f64;

    // Create histogram (20 buckets)
    let mut buckets = vec![0.0; 20];
    let step = max_loss / 20.0;
    for loss in outcomes {
        let b = (loss / step).floor() as usize;
        if b < 20 { buckets[b] += 1.0; }
    }

    let result = MonteCarloResult { mean_loss, p95_loss, max_loss, distribution: buckets };
    serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
}

// --- NEW: SoD CONFLICT ANALYZER ---
#[derive(Serialize, Deserialize)]
pub struct SodConflict {
    pub user: String,
    pub roles: Vec<String>,
    pub conflicts: Vec<String>,
}

#[wasm_bindgen]
pub fn analyze_sod_conflicts(user_roles_json: String, conflict_rules_json: String) -> JsValue {
    let user_roles: HashMap<String, Vec<String>> = serde_json::from_str(&user_roles_json).unwrap_or_default();
    let conflict_rules: Vec<(String, String)> = serde_json::from_str(&conflict_rules_json).unwrap_or_default();

    let mut results = Vec::new();

    for (user, roles) in user_roles {
        let mut user_conflicts = Vec::new();
        for rule in &conflict_rules {
            if roles.contains(&rule.0) && roles.contains(&rule.1) {
                user_conflicts.push(format!("Conflict: {} & {}", rule.0, rule.1));
            }
        }
        results.push(SodConflict { user, roles, conflicts: user_conflicts });
    }

    serde_wasm_bindgen::to_value(&results).unwrap_or(JsValue::NULL)
}

use std::collections::HashMap;
