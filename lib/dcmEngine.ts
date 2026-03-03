
export type Severity = "Mild" | "Moderate" | "Severe"

export interface Inputs {
  mjoa: number
}

export function classifySeverity(mjoa: number): Severity {
  if (mjoa >= 15) return "Mild"
  if (mjoa >= 12) return "Moderate"
  return "Severe"
}

const TABLE3 = {
  Mild: { risk: 0.356, mcid: 0.89, state: 0.977 },
  Moderate: { risk: 0.606, mcid: 0.625, state: 0.363 },
  Severe: { risk: 0.806, mcid: 0.47, state: 0.001 },
}

// Logistic recalibration constants from manuscript
const alpha = 0.0
const beta = 1.0

function logit(p: number) {
  return Math.log(p / (1 - p))
}

function expit(x: number) {
  return 1 / (1 + Math.exp(-x))
}

function recalibrate(p: number) {
  return expit(alpha + beta * logit(p))
}

export function calculateOutputs(input: Inputs) {
  const severity = classifySeverity(input.mjoa)
  const base = TABLE3[severity]

  return {
    severity,
    riskWithoutSurgery: Math.round(base.risk * 100),
    probabilityMCID: Math.round(recalibrate(base.mcid) * 100),
    probabilityState: Math.round(recalibrate(base.state) * 100),
  }
}
