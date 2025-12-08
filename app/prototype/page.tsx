"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import jsPDF from "jspdf";

type Sex = "M" | "F" | "";
type Severity = "mild" | "moderate" | "severe";
type T2Signal = "none" | "focal" | "multilevel";
type CanalCat = "<50%" | "50-60%" | ">60%";
type ApproachKey = "anterior" | "posterior" | "circumferential";

interface PatientInput {
  age: number | "";
  sex: Sex;
  smoker: 0 | 1;
  symptom_duration_months: number | "";
  baseline_mJOA: number | "";
  levels_operated: number | "";
  OPLL: 0 | 1;
  canal_occupying_ratio_cat: CanalCat | "";
  T2_signal: T2Signal | "";
  T1_hypointensity: 0 | 1;
  gait_impairment: 0 | 1;
  psych_disorder: 0 | 1;
  baseline_NDI: number | "";
  baseline_SF36_PCS: number | "";
  baseline_SF36_MCS: number | "";
}

type UncertaintyLevel = "low" | "moderate" | "high";

interface RecommendationResult {
  p_surgery_combined: number;    // 0–1
  p_MCID_mJOA_ml: number;        // 0–1
  best_approach: ApproachKey | "none";
  approach_probs: Record<ApproachKey, number>; // 0–1 each
  uncertainty_level: UncertaintyLevel;
  risk_score: number;            // 0–100
  benefit_score: number;         // 0–100
  recommendation_label: string;
  risk_text: string;
  benefit_text: string;
}

const approachLabels: Record<ApproachKey, string> = {
  anterior: "Anterior",
  posterior: "Posterior",
  circumferential: "Circumferential",
};

const approachDescriptions: Record<ApproachKey, string> = {
  anterior: "Typical for 1–2 level ventral compression without extensive OPLL.",
  posterior: "Favoured for 3–4+ levels or multilevel dorsal/focal compression.",
  circumferential:
    "Reserved for high-risk, severe deformity / OPLL / >60% canal compromise.",
};

// ---------- Helper functions ----------

// Derive severity from mJOA (simple rule set; can adjust to your final schema)
function deriveSeverityFrommJOA(mJOA: number | ""): Severity | "" {
  if (mJOA === "" || isNaN(Number(mJOA))) return "";
  const v = Number(mJOA);
  if (v >= 15) return "mild";
  if (v >= 12) return "moderate";
  return "severe";
}

// Very simple front-end “engine” to generate reasonable example outputs.
// This mirrors the structure of your Python engine so wiring to a real API later
// is straightforward.
function mockRecommend(patient: PatientInput): RecommendationResult {
  const mJOA = Number(patient.baseline_mJOA || 0);
  const duration = Number(patient.symptom_duration_months || 0);
  const levels = Number(patient.levels_operated || 1);
  const t2 = patient.T2_signal;
  const canal = patient.canal_occupying_ratio_cat;
  const opp = Number(patient.OPLL || 0);
  const gait = Number(patient.gait_impairment || 0);

  const severity = deriveSeverityFrommJOA(mJOA) || "moderate";

  // --- Surgery probability (combined rule+ML feel) ---
  let p_surg = 0.3;
  if (severity === "moderate") p_surg = 0.7;
  if (severity === "severe") p_surg = 0.9;
  if (t2 === "multilevel" || canal === ">60%" || opp === 1) {
    p_surg = Math.max(p_surg, 0.85);
  }
  if (severity === "mild" && t2 === "none" && duration < 6 && gait === 0) {
    p_surg = 0.2;
  }

  // --- MCID probability ---
  let p_mcid = 0.7;
  if (severity === "mild") p_mcid = 0.85;
  if (severity === "moderate") p_mcid = 0.65;
  if (severity === "severe") p_mcid = 0.35;
  if (t2 === "multilevel") p_mcid -= 0.1;
  if (duration > 24) p_mcid -= 0.1;
  p_mcid = Math.min(Math.max(p_mcid, 0.01), 0.99);

  // --- Risk & benefit scores (0–100) ---
  let risk = 20;
  if (severity === "moderate") risk = 55;
  if (severity === "severe") risk = 80;
  if (t2 === "multilevel" || canal === ">60%" || opp === 1) risk += 10;
  if (severity === "mild" && t2 === "none" && duration < 6 && gait === 0) {
    risk = 10;
  }
  risk = Math.min(Math.max(risk, 0), 100);

  let benefit = Math.round(p_mcid * 100);
  if (severity === "severe" && duration > 24 && t2 === "multilevel") {
    benefit = Math.min(benefit, 20);
  }

  // --- Approach probabilities ---
  let anterior = 0.3;
  let posterior = 0.6;
  let circumferential = 0.1;

  if (levels <= 2 && canal !== ">60%" && t2 !== "multilevel" && opp === 0) {
    anterior = 0.65;
    posterior = 0.3;
    circumferential = 0.05;
  } else if (
    levels >= 3 &&
    (t2 === "multilevel" || canal === "50-60%") &&
    opp === 0
  ) {
    anterior = 0.2;
    posterior = 0.7;
    circumferential = 0.1;
  } else if (
    levels >= 4 &&
    opp === 1 &&
    canal === ">60%" &&
    t2 === "multilevel"
  ) {
    anterior = 0.1;
    posterior = 0.35;
    circumferential = 0.55;
  }

  const sum = anterior + posterior + circumferential || 1;
  anterior /= sum;
  posterior /= sum;
  circumferential /= sum;

  const approach_probs: Record<ApproachKey, number> = {
    anterior,
    posterior,
    circumferential,
  };

  // pick best + second best
  const entries = Object.entries(approach_probs) as [ApproachKey, number][];
  const sorted = [...entries].sort((a, b) => b[1] - a[1]);
  const best = sorted[0];
  const second = sorted[1] ?? best;
  const best_approach = best[1] === 0 || p_surg < 0.4 ? "none" : best[0];

  let uncertainty: UncertaintyLevel = "low";
  const delta = best[1] - second[1];
  if (delta < 0.1) uncertainty = "high";
  else if (delta < 0.25) uncertainty = "moderate";

  // Recommendation label
  let label = "Surgery recommended";
  if (p_surg < 0.4) {
    label = "Non-operative trial reasonable with close follow-up";
  } else if (p_surg >= 0.4 && p_surg < 0.7) {
    label = "Consider surgery / surgery likely beneficial";
  }

  // Texts
  let risk_text = "";
  if (risk < 20) {
    risk_text =
      "Low short-term neurologic progression risk based on current severity and imaging, but symptoms should be monitored and follow-up arranged.";
  } else if (severity === "mild") {
    risk_text =
      "Mild DCM with some long-term risk of neurologic progression, particularly with persistent symptoms or adverse imaging features.";
  } else if (severity === "moderate") {
    risk_text =
      "Moderate DCM with meaningful risk of neurologic decline without decompression, especially with gait disturbance or T2 signal change.";
  } else {
    risk_text =
      "Severe DCM with high risk of further irreversible neurologic deficit if decompression is significantly delayed.";
  }

  const benefit_text =
    "Estimated probability of achieving clinically meaningful improvement in mJOA based on severity, symptom duration, MRI surrogates, and comorbidity patterns.";

  return {
    p_surgery_combined: p_surg,
    p_MCID_mJOA_ml: p_mcid,
    best_approach,
    approach_probs,
    uncertainty_level: uncertainty,
    risk_score: Math.round(risk),
    benefit_score: Math.round(benefit),
    recommendation_label: label,
    risk_text,
    benefit_text,
  };
}

// ---------- Main component ----------

export default function PrototypePage() {
  const [form, setForm] = useState<PatientInput>({
    age: "",
    sex: "",
    smoker: 0,
    symptom_duration_months: "",
    baseline_mJOA: "",
    levels_operated: "",
    OPLL: 0,
    canal_occupying_ratio_cat: "",
    T2_signal: "",
    T1_hypointensity: 0,
    gait_impairment: 0,
    psych_disorder: 0,
    baseline_NDI: "",
    baseline_SF36_PCS: "",
    baseline_SF36_MCS: "",
  });

  const derivedSeverity = deriveSeverityFrommJOA(form.baseline_mJOA);
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange =
    (field: keyof PatientInput) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = e.target.value;

      setForm((prev) => {
        const next: PatientInput = { ...prev };
        if (
          field === "age" ||
          field === "symptom_duration_months" ||
          field === "baseline_mJOA" ||
          field === "levels_operated" ||
          field === "baseline_NDI" ||
          field === "baseline_SF36_PCS" ||
          field === "baseline_SF36_MCS"
        ) {
          next[field] = value === "" ? "" : Number(value);
        } else if (
          field === "smoker" ||
          field === "OPLL" ||
          field === "T1_hypointensity" ||
          field === "gait_impairment" ||
          field === "psych_disorder"
        ) {
          next[field] = value === "" ? 0 : (Number(value) as 0 | 1);
        } else {
          next[field] = value as any;
        }
        return next;
      });
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // For now, all logic is front-end only
    const rec = mockRecommend(form);
    setResult(rec);
    setIsSubmitting(false);
  };

  const formatPercent = (p: number) => `${Math.round(p * 100)}%`;

  const handleDownloadPdf = () => {
    if (!result) return;

    const doc = new jsPDF();
    let y = 15;

    doc.setFontSize(16);
    doc.text("DCM Surgery Recommendation Summary", 10, y);
    y += 10;

    doc.setFontSize(12);
    doc.text("Patient inputs", 10, y);
    y += 7;

    const sev = derivedSeverity || "";
    const linesInputs = [
      `Age: ${form.age ?? ""}   Sex: ${form.sex || ""}`,
      `Baseline mJOA: ${form.baseline_mJOA ?? ""}   Derived severity: ${
        sev || ""
      }`,
      `Duration of symptoms: ${form.symptom_duration_months ?? ""} months`,
      `Levels operated (planned): ${form.levels_operated ?? ""}`,
      `T2 signal: ${form.T2_signal || ""}   Canal compromise: ${
        form.canal_occupying_ratio_cat || ""
      }   OPLL: ${form.OPLL ? "Yes" : "No"}`,
      `Gait impairment: ${form.gait_impairment ? "Yes" : "No"}   T1 hypointensity: ${
        form.T1_hypointensity ? "Yes" : "No"
      }`,
    ];

    linesInputs.forEach((line) => {
      doc.text(line, 10, y);
      y += 6;
    });

    y += 4;
    doc.setFontSize(12);
    doc.text("Model outputs", 10, y);
    y += 7;

    const bestApproachLabel =
      result.best_approach === "none"
        ? "None (non-operative focus)"
        : approachLabels[result.best_approach];

    const linesOutputs = [
      `Surgery recommendation: ${result.recommendation_label}`,
      `P(surgery recommended): ${formatPercent(result.p_surgery_combined)}`,
      `P(MCID mJOA): ${formatPercent(result.p_MCID_mJOA_ml)}`,
      `Risk without surgery (0–100): ${result.risk_score}`,
      `Expected benefit with surgery (0–100): ${result.benefit_score}`,
      `Recommended approach: ${bestApproachLabel}`,
      `Uncertainty level: ${result.uncertainty_level}`,
    ];

    linesOutputs.forEach((line) => {
      doc.text(line, 10, y);
      y += 6;
    });

    y += 4;
    doc.setFontSize(11);
    doc.text("Risk notes:", 10, y);
    y += 6;
    const riskLines = doc.splitTextToSize(result.risk_text, 190);
    doc.text(riskLines, 10, y);
    y += 6 + riskLines.length * 5;

    doc.text("Benefit notes:", 10, y);
    y += 6;
    const benLines = doc.splitTextToSize(result.benefit_text, 190);
    doc.text(benLines, 10, y);

    doc.save("dcm_surgery_recommendation_summary.pdf");
  };

  const severityDisplay = derivedSeverity ? derivedSeverity.toUpperCase() : "--";

  // Determine colour for uncertainty chip
  const uncertaintyColorClass =
    result?.uncertainty_level === "low"
      ? "bg-emerald-100 text-emerald-800 border-emerald-300"
      : result?.uncertainty_level === "moderate"
      ? "bg-amber-100 text-amber-800 border-amber-300"
      : "bg-rose-100 text-rose-800 border-rose-300";

  // Position of risk / benefit “dial” (0–100) mapped into width %
  const riskWidth = result ? `${result.risk_score}%` : "0%";
  const benefitWidth = result ? `${result.benefit_score}%` : "0%";

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-50 via-slate-50 to-white px-4 md:px-8 py-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Top bar with back to home, etc. */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-sky-700 hover:text-sky-900 underline underline-offset-4"
          >
            ← Back to overview
          </Link>
        </div>

        {/* Centered logo + clinic name */}
        <header className="flex flex-col items-center text-center space-y-3">
          <div className="relative h-20 w-52">
            <Image
              src="/logo_new.png"
              alt="Ascension logo"
              fill
              priority
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
            Ascension Texas Spine and Scoliosis
          </h1>
          <p className="text-base md:text-lg text-slate-700 max-w-2xl">
            Degenerative Cervical Myelopathy (DCM) – Surgery Timing & Approach
            Decision Support
          </p>
        </header>

        {/* Layout: left = inputs, right = outputs */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Left: Patient inputs */}
          <section className="bg-white/80 border border-slate-200 rounded-2xl shadow-sm p-5 md:p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">
              1. Enter patient characteristics
            </h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Age, sex, smoker */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Age (years)
                  </label>
                  <input
                    type="number"
                    min={18}
                    max={95}
                    value={form.age}
                    onChange={handleChange("age")}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Sex
                  </label>
                  <select
                    value={form.sex}
                    onChange={handleChange("sex")}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  >
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Current smoker
                  </label>
                  <select
                    value={form.smoker}
                    onChange={handleChange("smoker")}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
              </div>

              {/* Baseline mJOA + derived severity + duration */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Baseline mJOA
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    max={18}
                    value={form.baseline_mJOA}
                    onChange={handleChange("baseline_mJOA")}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  />
                  <p className="mt-1 text-[11px] text-slate-500">
                    Severity derives automatically from mJOA.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Derived severity
                  </label>
                  <div className="w-full rounded-lg border border-dashed border-slate-300 px-2 py-2 text-sm bg-slate-50 text-slate-800">
                    {severityDisplay}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Symptom duration (months)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={form.symptom_duration_months}
                    onChange={handleChange("symptom_duration_months")}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </div>
              </div>

              {/* Levels, OPLL, canal, T2 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Planned decompressed levels
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={6}
                    value={form.levels_operated}
                    onChange={handleChange("levels_operated")}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    OPLL present
                  </label>
                  <select
                    value={form.OPLL}
                    onChange={handleChange("OPLL")}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Canal occupying ratio
                  </label>
                  <select
                    value={form.canal_occupying_ratio_cat}
                    onChange={handleChange("canal_occupying_ratio_cat")}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  >
                    <option value="">Select</option>
                    <option value="<50%">&lt;50%</option>
                    <option value="50-60%">50–60%</option>
                    <option value=">60%">&gt;60%</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    T2 cord signal
                  </label>
                  <select
                    value={form.T2_signal}
                    onChange={handleChange("T2_signal")}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  >
                    <option value="">Select</option>
                    <option value="none">None</option>
                    <option value="focal">Focal</option>
                    <option value="multilevel">Multilevel</option>
                  </select>
                </div>
              </div>

              {/* Gait, T1, psych */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Gait impairment
                  </label>
                  <select
                    value={form.gait_impairment}
                    onChange={handleChange("gait_impairment")}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    T1 hypointensity
                  </label>
                  <select
                    value={form.T1_hypointensity}
                    onChange={handleChange("T1_hypointensity")}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  >
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Psych. comorbidity
                  </label>
                  <select
                    value={form.psych_disorder}
                    onChange={handleChange("psych_disorder")}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  >
                    <option value={0}>No / not limiting</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
              </div>

              {/* Baseline NDI / SF-36 */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Baseline NDI (0–100)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.baseline_NDI}
                    onChange={handleChange("baseline_NDI")}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    SF-36 PCS
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.baseline_SF36_PCS}
                    onChange={handleChange("baseline_SF36_PCS")}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    SF-36 MCS
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.baseline_SF36_MCS}
                    onChange={handleChange("baseline_SF36_MCS")}
                    className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 inline-flex items-center justify-center rounded-full bg-sky-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-sky-800 disabled:opacity-60"
              >
                {isSubmitting ? "Running recommendation..." : "Run recommendation"}
              </button>
            </form>
          </section>

          {/* Right: Results */}
          <section className="space-y-4">
            {/* Summary card */}
            <div className="bg-white/90 border border-sky-100 rounded-2xl shadow-sm p-5 md:p-6 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    2. Recommendation summary
                  </h2>
                  <p className="text-xs text-slate-500">
                    Outputs are intended to support, not replace, expert clinical
                    judgment.
                  </p>
                </div>
                {result && (
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${uncertaintyColorClass}`}
                  >
                    Uncertainty: {result.uncertainty_level}
                  </span>
                )}
              </div>

              {result ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-sky-700 mb-1">
                      Surgery decision
                    </p>
                    <p className="text-base font-semibold text-slate-900">
                      {result.recommendation_label}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      P(surgery recommended) ≈{" "}
                      <span className="font-semibold">
                        {formatPercent(result.p_surgery_combined)}
                      </span>
                      .
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Risk dial */}
                    <div>
                      <p className="text-xs font-medium text-slate-700 mb-1">
                        Risk without surgery
                      </p>
                      <div className="h-2 w-full rounded-full bg-rose-50 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500"
                          style={{ width: riskWidth }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        Score:{" "}
                        <span className="font-semibold">
                          {result.risk_score}/100
                        </span>
                      </p>
                    </div>
                    {/* Benefit dial */}
                    <div>
                      <p className="text-xs font-medium text-slate-700 mb-1">
                        Expected benefit with surgery
                      </p>
                      <div className="h-2 w-full rounded-full bg-emerald-50 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-400 via-amber-400 to-emerald-500"
                          style={{ width: benefitWidth }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-600">
                        Score:{" "}
                        <span className="font-semibold">
                          {result.benefit_score}/100
                        </span>{" "}
                        (P(MCID mJOA) ≈{" "}
                        <span className="font-semibold">
                          {formatPercent(result.p_MCID_mJOA_ml)}
                        </span>
                        )
                      </p>
                    </div>
                  </div>

                  {/* Confidence band for approach selection */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-700">
                      Approach selection – confidence band
                    </p>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs text-slate-600 mb-2">
                        The bar below reflects how clearly one approach dominates.
                        Narrow separation between probabilities →{" "}
                        <span className="font-semibold">higher uncertainty</span>.
                      </p>
                      <div className="relative h-2 w-full rounded-full bg-slate-200">
                        {/* simple indicator: best vs second best difference */}
                        {/* purely visual; not exact scale */}
                        <div
                          className="absolute left-0 top-0 h-full bg-sky-500 rounded-full"
                          style={{
                            width:
                              result.uncertainty_level === "low"
                                ? "80%"
                                : result.uncertainty_level === "moderate"
                                ? "50%"
                                : "20%",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Approach cards */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-slate-700">
                      Suggested surgical approach
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(Object.keys(approachLabels) as ApproachKey[]).map(
                        (k) => {
                          const isBest = result.best_approach === k;
                          const prob = result.approach_probs[k] || 0;
                          return (
                            <div
                              key={k}
                              className={`rounded-xl border p-3 text-xs space-y-1 ${
                                isBest
                                  ? "border-sky-500 bg-sky-50"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              <p className="font-semibold text-slate-900">
                                {approachLabels[k]}
                              </p>
                              <p className="text-lg font-bold text-slate-900">
                                {Math.round(prob * 100)}%
                              </p>
                              <p className="text-[11px] text-slate-600">
                                {approachDescriptions[k]}
                              </p>
                              {isBest && (
                                <span className="inline-flex mt-1 rounded-full bg-sky-600/10 text-sky-800 px-2 py-0.5 text-[10px] font-semibold">
                                  Recommended
                                </span>
                              )}
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>

                  {/* Explanatory text */}
                  <div className="grid grid-cols-1 gap-3 text-xs text-slate-700">
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                      <p className="font-semibold mb-1">Risk rationale</p>
                      <p>{result.risk_text}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
                      <p className="font-semibold mb-1">Benefit rationale</p>
                      <p>{result.benefit_text}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
                    >
                      Download PDF summary
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 mt-2">
                  Enter patient details on the left and click{" "}
                  <span className="font-semibold">Run recommendation</span> to
                  view outputs.
                </p>
              )}
            </div>

            {/* Compact footer disclaimer */}
            <p className="text-[10px] text-slate-500 leading-relaxed">
              This tool is an early research decision-support interface for
              degenerative cervical myelopathy. It draws on published AO
              Spine/WFNS guidance and outcome cohorts but has not yet been
              validated as a standalone clinical decision rule. Outputs are
              provided for educational and research use only and should always be
              interpreted in the context of full clinical assessment and surgeon
              judgment.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
