use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};

// --- FORENSIC PATTERN VALIDATOR (BENFORD'S LAW) ---
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

// --- RELATIONSHIP NETWORK GENERATOR ---
// Models entity relationship networks for the hero canvas animation.
// Each node is an entity (company, intermediary, official).
// Edges represent relationships — sparse, like real intermediary networks.

#[derive(Serialize, Deserialize, Clone)]
pub struct NetworkNode {
    pub id: usize,
    pub x: f64,
    pub y: f64,
    pub vx: f64,
    pub vy: f64,
    pub radius: f64,
    pub tier: u8,  // 0=principal, 1=intermediary, 2=endpoint
}

#[derive(Serialize, Deserialize)]
pub struct NetworkEdge {
    pub source: usize,
    pub target: usize,
    pub weight: f64,
}

#[derive(Serialize, Deserialize)]
pub struct NetworkState {
    pub nodes: Vec<NetworkNode>,
    pub edges: Vec<NetworkEdge>,
}

// Seeded pseudo-random (no external crate needed)
fn lcg(seed: u64) -> impl FnMut() -> f64 {
    let mut s = seed;
    move || {
        s = s.wrapping_mul(6364136223846793005).wrapping_add(1442695040888963407);
        ((s >> 33) as f64) / (u32::MAX as f64)
    }
}

#[wasm_bindgen]
pub fn generate_network(node_count: usize, seed: u32) -> JsValue {
    let mut rng = lcg(seed as u64 + 42);

    // Generate nodes across three tiers
    let mut nodes: Vec<NetworkNode> = (0..node_count).map(|i| {
        let tier = if i == 0 { 0u8 } else if i < node_count / 4 { 1u8 } else { 2u8 };
        let radius = match tier { 0 => 3.5, 1 => 2.2, _ => 1.4 };
        NetworkNode {
            id: i,
            x: rng() * 1200.0,
            y: rng() * 600.0,
            vx: (rng() - 0.5) * 0.3,
            vy: (rng() - 0.5) * 0.3,
            radius,
            tier,
        }
    }).collect();

    // Cluster tier-1 nodes near tier-0 (principal → intermediary hub pattern)
    let cx = nodes[0].x;
    let cy = nodes[0].y;
    for node in nodes.iter_mut().skip(1) {
        if node.tier == 1 {
            node.x = cx + (rng() - 0.5) * 400.0;
            node.y = cy + (rng() - 0.5) * 300.0;
        }
    }

    // Build sparse edges: hub-spoke from tier-0, then tier-1→tier-2 chains
    let mut edges: Vec<NetworkEdge> = Vec::new();
    let mut rng2 = lcg(seed as u64 + 99);

    // Principal connects to all intermediaries
    for i in 1..node_count {
        if nodes[i].tier == 1 {
            edges.push(NetworkEdge { source: 0, target: i, weight: 0.8 });
        }
    }

    // Each intermediary connects to 2-3 endpoints
    let tier1_ids: Vec<usize> = nodes.iter().filter(|n| n.tier == 1).map(|n| n.id).collect();
    let tier2_ids: Vec<usize> = nodes.iter().filter(|n| n.tier == 2).map(|n| n.id).collect();

    if !tier2_ids.is_empty() {
        for &src in &tier1_ids {
            let connections = 2 + (rng2() * 2.0) as usize;
            for _ in 0..connections {
                let tgt_idx = (rng2() * tier2_ids.len() as f64) as usize;
                let tgt = tier2_ids[tgt_idx.min(tier2_ids.len() - 1)];
                if src != tgt {
                    edges.push(NetworkEdge { source: src, target: tgt, weight: 0.4 });
                }
            }
        }
    }

    let state = NetworkState { nodes, edges };
    serde_wasm_bindgen::to_value(&state).unwrap_or(JsValue::NULL)
}

#[wasm_bindgen]
pub fn tick_network(state_js: JsValue) -> JsValue {
    let mut state: NetworkState = match serde_wasm_bindgen::from_value(state_js) {
        Ok(s) => s,
        Err(_) => return JsValue::NULL,
    };

    let width = 1200.0_f64;
    let height = 600.0_f64;
    let damping = 0.998_f64;

    for node in state.nodes.iter_mut() {
        // Slow drift with boundary reflection
        node.x += node.vx;
        node.y += node.vy;

        if node.x < 20.0 || node.x > width - 20.0 { node.vx *= -1.0; }
        if node.y < 20.0 || node.y > height - 20.0 { node.vy *= -1.0; }

        node.x = node.x.clamp(10.0, width - 10.0);
        node.y = node.y.clamp(10.0, height - 10.0);
        node.vx *= damping;
        node.vy *= damping;
    }

    serde_wasm_bindgen::to_value(&state).unwrap_or(JsValue::NULL)
}
