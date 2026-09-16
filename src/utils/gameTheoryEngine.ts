// Game Theory Engine: Solves 2x2 and NxM normal form bimatrix games for Pure and Mixed Nash Equilibria
const EPS = 1e-8;

function subsets<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const [head, ...tail] = arr;
  return [
    ...subsets(tail, k - 1).map(s => [head, ...s]),
    ...subsets(tail, k),
  ];
}

function solve(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[maxRow][col])) maxRow = r;
    }
    [M[col], M[maxRow]] = [M[maxRow], M[col]];
    if (Math.abs(M[col][col]) < EPS) return null;

    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r][col] / M[col][col];
      for (let k = col; k <= n; k++) M[r][k] -= f * M[col][k];
    }
  }

  return M.map((row, i) => row[n] / row[i]);
}

function solveQ(A: number[][], rowSup: number[], colSup: number[]): number[] | null {
  const k = colSup.length;
  const mat = rowSup.map(i => [...colSup.map(j => A[i][j]), -1]);
  mat.push([...Array(k).fill(1), 0]);
  return solve(mat, [...Array(rowSup.length).fill(0), 1]);
}

function solveP(B: number[][], rowSup: number[], colSup: number[]): number[] | null {
  const k = rowSup.length;
  const mat = colSup.map(j => [...rowSup.map(i => B[i][j]), -1]);
  mat.push([...Array(k).fill(1), 0]);
  return solve(mat, [...Array(colSup.length).fill(0), 1]);
}

export interface PureEquilibrium {
  row_idx: number;
  col_idx: number;
  payoffs: [number, number];
}

export interface MixedStrategy {
  row_probs: number[];
  col_probs: number[];
  expected_payoffs: [number, number];
}

export interface GameAnalysisResult {
  pure_equilibria: PureEquilibrium[];
  mixed_strategies: MixedStrategy[];
}

export function analyzeGame(matrixA: number[][], matrixB: number[][]): GameAnalysisResult {
  const numRows = matrixA.length;
  const numCols = matrixA[0].length;
  const rowIndices = Array.from({ length: numRows }, (_, i) => i);
  const colIndices = Array.from({ length: numCols }, (_, i) => i);

  const pure_equilibria: PureEquilibrium[] = [];
  const mixed_strategies: MixedStrategy[] = [];

  for (let k = 1; k <= Math.min(numRows, numCols); k++) {
    for (const rowSup of subsets(rowIndices, k)) {
      for (const colSup of subsets(colIndices, k)) {
        const qSol = solveQ(matrixA, rowSup, colSup);
        if (!qSol) continue;
        const q = qSol.slice(0, k);
        if (q.some(v => v < -EPS || v > 1 + EPS)) continue;

        const pSol = solveP(matrixB, rowSup, colSup);
        if (!pSol) continue;
        const p = pSol.slice(0, k);
        if (p.some(v => v < -EPS || v > 1 + EPS)) continue;

        const vA = qSol[k];
        const vB = pSol[k];

        // Verify best response
        const rowValid = rowIndices
          .filter(i => !rowSup.includes(i))
          .every(i => colSup.reduce((s, j, idx) => s + matrixA[i][j] * q[idx], 0) <= vA + EPS);
        if (!rowValid) continue;

        const colValid = colIndices
          .filter(j => !colSup.includes(j))
          .every(j => rowSup.reduce((s, i, idx) => s + matrixB[i][j] * p[idx], 0) <= vB + EPS);
        if (!colValid) continue;

        const rowProbs = Array(numRows).fill(0);
        rowSup.forEach((i, idx) => { rowProbs[i] = Math.max(0, p[idx]); });

        const colProbs = Array(numCols).fill(0);
        colSup.forEach((j, idx) => { colProbs[j] = Math.max(0, q[idx]); });

        let expA = 0, expB = 0;
        for (let i = 0; i < numRows; i++) {
          for (let j = 0; j < numCols; j++) {
            expA += rowProbs[i] * colProbs[j] * matrixA[i][j];
            expB += rowProbs[i] * colProbs[j] * matrixB[i][j];
          }
        }

        if (k === 1) {
          pure_equilibria.push({
            row_idx: rowSup[0],
            col_idx: colSup[0],
            payoffs: [matrixA[rowSup[0]][colSup[0]], matrixB[rowSup[0]][colSup[0]]],
          });
        } else {
          mixed_strategies.push({
            row_probs: rowProbs,
            col_probs: colProbs,
            expected_payoffs: [expA, expB],
          });
        }
      }
    }
  }

  return { pure_equilibria, mixed_strategies };
}
