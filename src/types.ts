// src/types.ts

// ─── RISK DOMAIN DEFINITIONS ───
export interface FraudDomain {
  id: string;
  label: string;
  description: string;
  questions: string[];
}

export interface RiskConfigItem {
  label: string;
  bg: string;
  border: string;
  text: string;
  bar: string;
  topBorder: string;
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

// ─── ML MODEL DEFINITIONS ───
export interface FraudMLModel {
  classes: string[];
  poly_powers: number[][];
  scaler_mean: number[];
  scaler_scale: number[];
  coef: number[][];
  intercept: number[];
}

export interface MLPrediction {
  className: string;
  confidence: number;
  probabilities: Record<string, number>;
}

// ─── RISK MATRIX DEFINITIONS ───
export interface RiskItem {
  id: number;
  name: string;
  likelihood: number;
  impact: number;
}

// ─── SUBSTACK FEED DEFINITIONS ───
export interface SubstackArticle {
  title: string;
  pubDate: string;
  link: string;
  description: string;
  outlet: string;
}
