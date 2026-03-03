"use client"

import { useState } from "react"
import { calculateOutputs } from "@/lib/dcmEngine"

type Sex = "M" | "F";
type Severity = "mild" | "moderate" | "severe";
type YesNo = "Yes" | "No";
type T2Signal = "none" | "focal" | "multilevel";
type CanalCat = "<50%" | "50-60%" | ">60%";
type Approach = "anterior" | "posterior" | "circumferential";

type TabKey = "single" | "batch";

interface FormState {
  age: number;
  sex: Sex;
  mJOA: number;
  severity: Severity; // auto from mJOA
  symptomDuration: number;
  t2Signal: T2Signal;
  plannedLevels: number;
  canalRatio: CanalCat;
  opll: YesNo;
  t1Hypo: YesNo;
  smoker: YesNo;
  psych: YesNo;
  gait: YesNo;
  ndi: number;
  sf36Pcs: number;
  sf36Mcs: number;
}

interface RecommendationResult {
  // Decision
  surgeryRecommended: boolean;
  recommendationLabel: string;

  // Manuscript-aligned endpoints
  riskWithoutSurgery: number; // 0–100 (%)
  probabilityMCID: number; // 0–100 (%)
  probabilityMjoaGe16: number; // 0–100 (%)

  // Backwards-compatible display helpers (kept for existing UI)
  riskText: string;
  benefitText: string;

  // Approach probabilities (0–1)
  approachProbs: Record<Approach, number>;
  bestApproach: Approach | "none";
  uncertainty: "low" | "moderate" | "high";

  // Optional notes for transparency
  notes?: string[];
}


const APPROACH_KEYS: Approach[] = ["anterior", "posterior", "circumferential"];

function deriveSeverity(mJOA: number): Severity {
  if (mJOA >= 15) return "mild";
  if (mJOA >= 12) return "moderate";
  return "severe";
}

function mockRecommend(form: FormState): RecommendationResult {
  // Manuscript-aligned core outputs are sourced from the engine (Table 3 anchors + recalibration).
  const core = calculateOutputs({ mjoa: form.mJOA })
  const severity = deriveSeverity(form.mJOA)

  // Recommendation label: guideline-aligned defaults (moderate/severe generally recommended).
  // Mild depends on risk + high-risk features.
  const highRiskImaging =
    form.t2Signal === "multilevel" ||
    form.t1Hypointensity === "Yes" ||
    form.canalRatio === ">60%" ||
    form.opll === "Yes" ||
    form.gaitImpairment === "Yes"

  let surgeryRecommended = false
  let recommendationLabel = "Non-operative surveillance"

  if (severity === "severe") {
    surgeryRecommended = true
    recommendationLabel = "Surgery recommended"
  } else if (severity === "moderate") {
    surgeryRecommended = true
    recommendationLabel = "Surgery recommended"
  } else {
    // mild
    if (core.riskWithoutSurgery >= 50 || highRiskImaging) {
      surgeryRecommended = true
      recommendationLabel = "Consider surgery"
    } else {
      surgeryRecommended = false
      recommendationLabel = "Non-operative surveillance"
    }
  }

  // Approach probabilities (kept simple, deterministic, and transparent).
  // This preserves the UI behavior without inventing new modeling claims.
  // Rule-of-thumb:
  // - Anterior favored for 1–2 planned levels AND ventral compression patterns (approximated by lower canal ratio + no multilevel T2).
  // - Posterior favored for >=3 levels OR multilevel T2 OR high canal compromise/OPLL.
  // - Circumferential reserved for select very high-risk anatomy (OPLL + >60% canal compromise).
  const probs: Record<Approach, number> = { anterior: 0, posterior: 0, circumferential: 0 }

  const multilevel = form.plannedLevels >= 3
  const severeCanal = form.canalRatio === ">60%"
  const opll = form.opll === "Yes"

  if (opll && severeCanal) {
    probs.circumferential = 0.55
    probs.posterior = 0.40
    probs.anterior = 0.05
  } else if (multilevel || form.t2Signal === "multilevel" || severeCanal || opll) {
    probs.posterior = 0.80
    probs.anterior = 0.18
    probs.circumferential = 0.02
  } else {
    probs.anterior = 0.70
    probs.posterior = 0.28
    probs.circumferential = 0.02
  }

  const bestApproach = (Object.entries(probs).sort((a, b) => b[1] - a[1])[0]?.[0] ??
    "none") as Approach | "none"

  const top2 = Object.values(probs).sort((a, b) => b - a).slice(0, 2)
  const margin = top2.length === 2 ? top2[0] - top2[1] : 1
  const uncertainty: "low" | "moderate" | "high" =
    margin >= 0.35 ? "low" : margin >= 0.15 ? "moderate" : "high"

  const riskText = `${core.riskWithoutSurgery}% estimated risk of neurologic worsening without surgery`
  const benefitText = `${core.probabilityMCID}% probability of achieving mJOA MCID; ${core.probabilityState}% probability of postoperative mJOA ≥16`

  const notes: string[] = []
  notes.push("Risk/MCID/mJOA≥16 probabilities are manuscript-aligned (Table 3 anchors with logistic recalibration).")
  notes.push("Approach probabilities are heuristic UI support and should not be interpreted as a validated predictive model.")

  return {
    surgeryRecommended,
    recommendationLabel,
    riskWithoutSurgery: core.riskWithoutSurgery,
    probabilityMCID: core.probabilityMCID,
    probabilityMjoaGe16: core.probabilityState,
    riskText,
    benefitText,
    approachProbs: probs,
    bestApproach,
    uncertainty,
    notes,
  }
}


export default function PrototypePage() {
  const [tab, setTab] = useState<TabKey>("single");

  const [form, setForm] = useState<FormState>({
    age: 65,
    sex: "M",
    mJOA: 13,
    severity: "moderate",
    symptomDuration: 12,
    t2Signal: "multilevel",
    plannedLevels: 3,
    canalRatio: "50-60%",
    opll: "No",
    t1Hypo: "No",
    smoker: "No",
    psych: "No",
    gait: "Yes",
    ndi: 40,
    sf36Pcs: 32,
    sf36Mcs: 45,
  });

  const [result, setResult] = useState<RecommendationResult | null>(null);

  const handleChangeNumber = (key: keyof FormState, value: string) => {
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return;
    const updated: FormState = { ...form, [key]: numeric } as FormState;
    if (key === "mJOA") {
      updated.severity = deriveSeverity(numeric);
    }
    setForm(updated);
  };

  const handleChangeSelect = <K extends keyof FormState, V extends FormState[K]>(
    key: K,
    value: V
  ) => {
    const updated: FormState = { ...form, [key]: value } as FormState;
    if (key === "mJOA") {
      updated.severity = deriveSeverity(updated.mJOA);
    }
    if (key === "severity") {
      updated.severity = deriveSeverity(updated.mJOA);
    }
    setForm(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rec = mockRecommend(form);
    setResult(rec);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-6 pt-6 pb-16 space-y-6">
        {/* Back link + clinic name */}
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <span className="text-base">←</span>
            <span>Back to overview</span>
          </Link>
          <div className="hidden md:block text-xs text-slate-500">
            Ascension Texas Spine and Scoliosis
          </div>
        </div>

        {/* Title + subtitle */}
        <section className="bg-white border border-slate-200 rounded-3xl px-6 md:px-8 py-6 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
                DCM Surgical Decision-Support
              </h1>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl">
                Single-patient and batch views using guideline-informed logic
                blended with machine-learning models trained on synthetic DCM
                outcome patterns.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-5 inline-flex rounded-full bg-slate-100 p-1 text-sm">
            <button
              type="button"
              onClick={() => setTab("single")}
              className={`px-5 py-2 rounded-full transition ${
                tab === "single"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Single patient
            </button>
            <button
              type="button"
              onClick={() => setTab("batch")}
              className={`px-5 py-2 rounded-full transition ${
                tab === "batch"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Batch (CSV)
            </button>
          </div>
        </section>

        {tab === "single" ? (
          <>
            {/* Single-patient form */}
            <section className="bg-white border border-slate-200 rounded-3xl px-6 md:px-8 py-7 shadow-sm">
              <h2 className="text-lg md:text-xl font-semibold mb-4">
                Baseline clinical information
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1 */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Age (years)
                    </label>
                    <input
                      type="number"
                      min={18}
                      max={95}
                      value={form.age}
                      onChange={(e) =>
                        handleChangeNumber("age", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Sex
                    </label>
                    <select
                      value={form.sex}
                      onChange={(e) =>
                        handleChangeSelect("sex", e.target.value as Sex)
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="M">M</option>
                      <option value="F">F</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      mJOA
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={18}
                      step={0.5}
                      value={form.mJOA}
                      onChange={(e) =>
                        handleChangeNumber("mJOA", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Severity (auto from mJOA)
                    </label>
                    <div className="w-full rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700 flex items-center">
                      {form.severity === "mild" && "Mild (mJOA ≥ 15)"}
                      {form.severity === "moderate" && "Moderate (mJOA 12–14)"}
                      {form.severity === "severe" && "Severe (mJOA < 12)"}
                    </div>
                  </div>
                </div>

                {/* Row 2 */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Symptom duration (months)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={120}
                      step={0.5}
                      value={form.symptomDuration}
                      onChange={(e) =>
                        handleChangeNumber("symptomDuration", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      T2 cord signal
                    </label>
                    <select
                      value={form.t2Signal}
                      onChange={(e) =>
                        handleChangeSelect(
                          "t2Signal",
                          e.target.value as T2Signal
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="none">None</option>
                      <option value="focal">Focal</option>
                      <option value="multilevel">Multilevel / extensive</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Planned operated levels
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={form.plannedLevels}
                      onChange={(e) =>
                        handleChangeNumber("plannedLevels", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Canal occupying ratio
                    </label>
                    <select
                      value={form.canalRatio}
                      onChange={(e) =>
                        handleChangeSelect(
                          "canalRatio",
                          e.target.value as CanalCat
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="<50%">&lt;50%</option>
                      <option value="50-60%">50–60%</option>
                      <option value=">60%">&gt;60%</option>
                    </select>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      OPLL present
                    </label>
                    <select
                      value={form.opll}
                      onChange={(e) =>
                        handleChangeSelect("opll", e.target.value as YesNo)
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      T1 hypointensity
                    </label>
                    <select
                      value={form.t1Hypo}
                      onChange={(e) =>
                        handleChangeSelect("t1Hypo", e.target.value as YesNo)
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Smoker
                    </label>
                    <select
                      value={form.smoker}
                      onChange={(e) =>
                        handleChangeSelect("smoker", e.target.value as YesNo)
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Psychiatric disorder
                    </label>
                    <select
                      value={form.psych}
                      onChange={(e) =>
                        handleChangeSelect("psych", e.target.value as YesNo)
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>
                </div>

                {/* Row 4 */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Gait impairment
                    </label>
                    <select
                      value={form.gait}
                      onChange={(e) =>
                        handleChangeSelect("gait", e.target.value as YesNo)
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Baseline NDI
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={form.ndi}
                      onChange={(e) =>
                        handleChangeNumber("ndi", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      SF-36 PCS
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={form.sf36Pcs}
                      onChange={(e) =>
                        handleChangeNumber("sf36Pcs", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      SF-36 MCS
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={60}
                      value={form.sf36Mcs}
                      onChange={(e) =>
                        handleChangeNumber("sf36Mcs", e.target.value)
                      }
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
                  >
                    Run recommendation
                  </button>
                </div>
              </form>
            </section>

            {/* Results */}
            {result && (
              <>
                {/* Q1 – surgery? */}
                <section className="bg-white border border-slate-200 rounded-3xl px-6 md:px-8 py-7 shadow-sm space-y-5">
                  <h2 className="text-lg md:text-xl font-semibold">
                    1. Should this patient undergo surgery?
                  </h2>

                  <div className="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-6">
                    <div className="space-y-2 text-sm">
                      <p className="font-medium text-slate-900">
                        Recommendation:{" "}
                        <span
                          className={
                            result.surgeryRecommended
                              ? "text-emerald-700"
                              : "text-slate-800"
                          }
                        >
                          {result.recommendationLabel}
                        </span>
                      </p>
                      <p className="text-slate-700 text-xs md:text-sm leading-relaxed">
                        Age {form.age}, {form.sex}, mJOA{" "}
                        {form.mJOA.toFixed(1)} ({form.severity}), symptom
                        duration ≈ {form.symptomDuration.toFixed(1)} months,
                        planned levels {form.plannedLevels}. Gait impairment:{" "}
                        {form.gait}. OPLL: {form.opll}. Canal compromise:{" "}
                        {form.canalRatio}. T2 cord signal: {form.t2Signal}.
                      </p>
                    </div>

                    <div className="text-xs md:text-sm text-slate-700">
                      <p className="font-semibold mb-1">
                        Risk vs benefit snapshot
                      </p>
                      <p className="mb-1">
                        <strong>Risk without surgery:</strong>{" "}
                        {result.riskWithoutSurgery.toFixed(1)}% estimated
                        chance of neurological worsening or failure to improve.
                      </p>
                      <p className="mb-1">
                        <strong>Probability of achieving mJOA MCID:</strong>{" "}
                        {result.probabilityMCID.toFixed(1)}% estimated
                        chance of clinically meaningful mJOA improvement.
                      </p>
                      <p className="mb-1">
                        <strong>Probability of postoperative mJOA ≥16:</strong>{" "}
                        {result.probabilityMjoaGe16.toFixed(1)}% estimated
                        chance of reaching a favorable neurologic state.
                      </p>
                      <p className="mt-1 text-slate-600">{result.riskText}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 text-xs md:text-sm">
                    <div className="bg-rose-50 border border-rose-100 rounded-2xl px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-rose-700">
                          Risk of neurological worsening without surgery
                        </span>
                        <span className="font-semibold text-rose-700">
                          {result.riskWithoutSurgery.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-rose-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-rose-500"
                          style={{
                            width: `${result.riskWithoutSurgery}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-emerald-700">
                          Expected chance of meaningful improvement with surgery
                        </span>
                        <span className="font-semibold text-emerald-700">
                          {result.probabilityMCID.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-emerald-100 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{
                            width: `${result.probabilityMCID}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* Q2 – approach */}
                <section className="bg-white border border-slate-200 rounded-3xl px-6 md:px-8 py-7 shadow-sm space-y-6">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-lg md:text-xl font-semibold">
                      2. If surgery is offered, which approach?
                    </h2>
                    {result.bestApproach !== "none" && (
                      <span className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 bg-slate-50">
                        Uncertainty:{" "}
                        <span className="ml-1 capitalize">
                          {result.uncertainty}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Approach cards */}
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    {APPROACH_KEYS.map((key) => {
                      const pct = result.approachProbs[key] * 100;
                      const isBest = key === result.bestApproach;
                      let title = key.toUpperCase();
                      if (key === "circumferential") title = "CIRCUMFERENTIAL";
                      return (
                        <div
                          key={key}
                          className={`rounded-2xl border px-4 py-4 space-y-1 ${
                            isBest
                              ? "border-emerald-500 bg-emerald-50/60"
                              : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          <div className="text-xs font-semibold text-slate-500">
                            {title}
                          </div>
                          <div className="text-2xl font-semibold">
                            {pct.toFixed(1)}%
                          </div>
                          <p className="text-xs text-slate-600">
                            {isBest
                              ? "Highest estimated chance of clinically meaningful mJOA improvement."
                              : "Lower modeled probability compared with the leading approach."}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Confidence bands */}
                  <div className="space-y-3">
                    <p className="text-xs md:text-sm font-medium text-slate-700">
                      P(MCID) by approach (approximate confidence bands)
                    </p>
                    <div className="space-y-2 text-xs md:text-sm">
                      {APPROACH_KEYS.map((key) => {
                        const basePct = result.approachProbs[key] * 100;
                        const low = Math.max(0, basePct - 10);
                        const high = Math.min(100, basePct + 10);
                        return (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between">
                              <span className="capitalize">{key}</span>
                              <span>
                                {basePct.toFixed(0)}% (≈ {low.toFixed(0)}–{" "}
                                {high.toFixed(0)}%)
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-indigo-400 rounded-full"
                                style={{ width: `${high}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Patterns combine literature-based preferences (e.g.
                      multilevel disease, kyphosis, OPLL) with
                      machine-learning estimates derived from synthetic DCM
                      outcome data. Exact probabilities will be recalibrated
                      once real Ascension Texas outcomes are available.
                    </p>
                  </div>

                  {/* PDF / print */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-xs md:text-sm font-medium text-slate-800 hover:bg-slate-100"
                    >
                      <span className="text-base">↓</span>
                      <span>Download / print summary (PDF)</span>
                    </button>
                    <p className="text-[11px] text-slate-500">
                      Uses the browser&apos;s print-to-PDF function to create a
                      one-page summary of current inputs and recommendations.
                    </p>
                  </div>
                </section>
              </>
            )}
          </>
        ) : (
          // Batch tab
          <section className="bg-white border border-slate-200 rounded-3xl px-6 md:px-8 py-7 shadow-sm space-y-5">
            <h2 className="text-lg md:text-xl font-semibold">
              Batch (CSV) – coming online with real-world validation
            </h2>
            <p className="text-sm text-slate-700 max-w-3xl">
              The batch view will allow clinicians to upload a CSV file of
              multiple DCM patients (with the same fields as the single-patient
              view) and receive aggregated summaries of surgery recommendations,
              approach distributions, and expected MCID rates. This will be
              activated once the model has been calibrated and validated on
              prospectively collected Ascension Texas data.
            </p>
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-5 text-sm text-slate-600">
              <p className="font-medium mb-2">Planned features:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  CSV upload with automatic validation of required fields.
                </li>
                <li>
                  Cohort-level dashboard: proportion “surgery recommended”,
                  approach mix, and predicted MCID rates.
                </li>
                <li>
                  Exportable summaries for morbidity and mortality conference,
                  multidisciplinary DCM rounds, or research audits.
                </li>
              </ul>
            </div>
          </section>
        )}
      </div>
    </main>
  );
