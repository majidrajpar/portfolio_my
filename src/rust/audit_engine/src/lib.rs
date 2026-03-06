use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct BenfordResult {
    pub actual_distribution: Vec<f64>,
    pub expected_distribution: Vec<f64>,
    pub anomaly_score: f64,
    pub total_count: usize,
}

#[wasm_bindgen]
pub fn analyze_benfords_law(data: Vec<f64>) -> JsValue {
    let mut counts = vec![0.0; 9]; // indices 0-8 represent digits 1-9
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

    let expected: Vec<f64> = (1..=9)
        .map(|d| (1.0 + 1.0 / d as f64).log10() * 100.0)
        .collect();

    let actual: Vec<f64> = counts.iter()
        .map(|&c| if total > 0.0 { (c / total) * 100.0 } else { 0.0 })
        .collect();

    let mad: f64 = actual.iter().zip(expected.iter())
        .map(|(a, e)| (a - e).abs())
        .sum::<f64>() / 9.0;

    let result = BenfordResult {
        actual_distribution: actual,
        expected_distribution: expected,
        anomaly_score: mad,
        total_count: total as usize,
    };

    serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
}
