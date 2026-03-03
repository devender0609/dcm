export type Severity = "Mild" | "Moderate" | "Severe"

export interface Inputs {
  mjoa: number
}

export function classifySeverity(mjoa: number): Severity {
  if (mjoa >= 15) return "Mild"
  if (mjoa >= 12) return "Moderate"
  return "Severe"
}

/**
 * Table 3 (manuscript-locked) severity-stratified anchors.
 * Values are probabilities (0–1).
 */
const TABLE3 = {
  Mild: { risk: 0.356, mcid: 0.89, state: 0.977 },
  Moderate: { risk: 0.606, mcid: 0.625, state: 0.363 },
  Severe: { risk: 0.806, mcid: 0.47, state: 0.001 },
} as const

function toPct(p: number, decimals: number = 0) {
  const x = p * 100
  const f = Math.pow(10, decimals)
  return Math.round(x * f) / f
}

export function calculateOutputs(input: Inputs) {
  const severity = classifySeverity(input.mjoa)
  const base = TABLE3[severity]

  return {
    severity,
    riskWithoutSurgery: toPct(base.risk, 1),      // 35.6 / 60.6 / 80.6
    probabilityMCID: toPct(base.mcid, 1),         // 89.0 / 62.5 / 47.0
    probabilityState: toPct(base.state, 1),       // 97.7 / 36.3 / 0.1  <-- UPDATED
  }
}