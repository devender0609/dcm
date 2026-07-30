export type Severity = "Mild" | "Moderate" | "Severe"
export type T2Signal = "none" | "focal" | "multilevel"
export type CanalCategory = "<50%" | "50-60%" | ">60%"
export type TreatmentCategory =
  | "Structured rehabilitation with surveillance"
  | "Shared decision-making / structured rehabilitation"
  | "Surgery favored"
  | "Surgery recommended"
export type CorridorCategory =
  | "Anterior favored"
  | "Posterior favored"
  | "Circumferential or complex"
  | "Indeterminate — additional alignment/compression review required"

export interface Inputs {
  mjoa: number
  symptomDuration: number
  t2Signal: T2Signal
  canalRatio: CanalCategory
  opll: boolean
  t1Hypointensity: boolean
  gaitImpairment: boolean
  plannedLevels: number
}

export interface Outputs {
  severity: Severity
  neurologicRiskScore: number
  treatmentCategory: TreatmentCategory
  probabilityMCID: number
  probabilityState: number
  meanPostoperativeMjoa: number
  corridor: CorridorCategory | null
  rationale: string[]
  limitations: string[]
}

export function classifySeverity(mjoa: number): Severity {
  if (mjoa >= 15) return "Mild"
  if (mjoa >= 12) return "Moderate"
  return "Severe"
}

/** Manuscript Table 3 severity-stratified synthetic-cohort anchors. */
const TABLE3 = {
  Mild: { mcid: 94.2, state: 98.0, postopMjoa: 17.8 },
  Moderate: { mcid: 73.4, state: 48.4, postopMjoa: 15.8 },
  Severe: { mcid: 48.8, state: 2.2, postopMjoa: 11.8 },
} as const

/** Supplementary Table S4: prespecified additive risk-score contributions. */
export function calculateNeurologicRiskScore(input: Inputs): number {
  const severity = classifySeverity(input.mjoa)
  let score = severity === "Mild" ? 20 : severity === "Moderate" ? 45 : 65

  if (input.symptomDuration <= 6) score -= 5
  else if (input.symptomDuration >= 24) score += 10

  if (input.t2Signal === "focal") score += 5
  if (input.t2Signal === "multilevel") score += 10

  if (input.canalRatio === "50-60%") score += 2
  if (input.canalRatio === ">60%") score += 5

  if (input.opll) score += 5
  if (input.t1Hypointensity) score += 5
  if (input.gaitImpairment) score += 5

  return Math.max(0, Math.min(100, Math.round(score)))
}

function mildTreatment(_input: Inputs, _riskScore: number): TreatmentCategory {
  // The manuscript describes graded mild-DCM logic but does not publish the complete
  // patient-level threshold implementation. To avoid unsupported precision, the public
  // deployment uses the guideline-consistent shared-decision category for mild DCM.
  return "Shared decision-making / structured rehabilitation"
}

function classifyCorridor(input: Inputs, severity: Severity): CorridorCategory {
  const extensiveSignal = input.t2Signal === "multilevel"
  const markedCanal = input.canalRatio === ">60%"
  const multilevel = input.plannedLevels >= 3

  if (
    input.plannedLevels >= 4 &&
    input.opll &&
    markedCanal &&
    severity === "Severe" &&
    (extensiveSignal || input.t1Hypointensity)
  ) {
    return "Circumferential or complex"
  }

  if (multilevel && (input.opll || extensiveSignal || markedCanal)) {
    return "Posterior favored"
  }

  if (
    input.plannedLevels <= 2 &&
    !input.opll &&
    !markedCanal &&
    !extensiveSignal
  ) {
    return "Anterior favored"
  }

  return "Indeterminate — additional alignment/compression review required"
}

export function calculateOutputs(input: Inputs): Outputs {
  const severity = classifySeverity(input.mjoa)
  const riskScore = calculateNeurologicRiskScore(input)
  const treatmentCategory: TreatmentCategory =
    severity === "Mild" ? mildTreatment(input, riskScore) : "Surgery recommended"
  const operative =
    treatmentCategory === "Surgery favored" || treatmentCategory === "Surgery recommended"
  const anchor = TABLE3[severity]

  const rationale = [
    `${severity} DCM based on baseline mJOA ${input.mjoa}.`,
    `Neurologic-risk score ${riskScore}/100 from prespecified additive framework weights.`,
  ]
  if (input.gaitImpairment) rationale.push("Gait impairment contributes to neurologic concern.")
  if (input.t1Hypointensity) rationale.push("T1-weighted hypointensity is an adverse imaging feature.")
  if (input.t2Signal === "multilevel") rationale.push("Multilevel T2 signal abnormality is an adverse imaging feature.")
  if (input.canalRatio === ">60%") rationale.push("Canal-occupying ratio >60% is an adverse imaging feature.")
  if (input.opll) rationale.push("OPLL is present.")
  if (input.symptomDuration >= 24) rationale.push("Symptoms have been present for at least 24 months.")

  return {
    severity,
    neurologicRiskScore: riskScore,
    treatmentCategory,
    probabilityMCID: anchor.mcid,
    probabilityState: anchor.state,
    meanPostoperativeMjoa: anchor.postopMjoa,
    corridor: operative ? classifyCorridor(input, severity) : null,
    rationale,
    limitations: [
      "The neurologic-risk score is a relative heuristic index, not a probability of deterioration and has no specified follow-up horizon.",
      "Outcome percentages are severity-stratified results from a literature-informed synthetic cohort, not individualized clinical predictions.",
      "Corridor classification is broad and cannot replace review of compression direction, alignment, K-line status, instability, axial pain, bone quality, or OPLL morphology.",
      "The complete patient-level mild-DCM threshold logic was not reported in the manuscript; this deployment therefore defaults mild DCM to shared decision-making rather than inventing thresholds.",
      "This prototype is for research, education, and workflow evaluation only and is not clinically validated.",
    ],
  }
}
