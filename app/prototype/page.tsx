"use client";

import Link from "next/link";
import { useState } from "react";

type Severity = "mild" | "moderate" | "severe";
type YesNo = "yes" | "no";
type Sex = "M" | "F";
type ApproachKey = "anterior" | "posterior" | "circumferential";
type ApproachResult = Record<ApproachKey, number>;
type Tab = "single" | "batch";

interface PatientInputs {
  age: number;
  sex: Sex;
  severity: Severity; // derived from mJOA
  mjoa: number;
  durationMonths: number;
  t2Signal: "none" | "bright" | "multilevel";
  levels: number;
  canalRatio: "<50%" | "50–60%" | ">60%";
  opll: YesNo;
  t1Hypo: YesNo;
  smoker: YesNo;
}

interface PatientOutputs {
  label: string;
  risk: string;
  benefit: string;
  summary: string;
  approachResult: ApproachResult;
}

interface BatchSummary {
  total: number;
  surgeryRecommended: number;
  consider: number;
  nonOp: number;
  anterior: number;
  posterior: number;
  circumferential: number;
}

// -----------------------------
// Shared logic with Python engine
// -----------------------------

function deriveSeverityFromMJOA(mjoa: number): Severity {
  if (mjoa >= 15) return "mild";
  if (mjoa >= 12) return "moderate";
  return "severe";
}

function classifyRiskGroup(p: PatientInputs, severity: Severity) {
  const hasCordSignal = p.t2Signal === "bright" || p.t2Signal === "multilevel";
  const longSymptoms = p.durationMonths >= 6;
  const veryLong = p.durationMonths >= 12;
  const highCanal = p.canalRatio === ">60%";
  const multilevel = p.levels >= 3;

  let label =
    "Non-operative trial reasonable with close follow-up and structured surveillance.";
  let risk =
    "Low–moderate short-term risk of neurological worsening with careful monitoring, assuming no new red-flag features develop.";
  let benefit =
    "Surgical benefit may be modest in mild, stable disease. Shared decision-making is important.";

  if (
    (severity === "moderate" || severity === "severe") &&
    (hasCordSignal || longSymptoms || highCanal || multilevel)
  ) {
    label = "Surgery recommended";
    risk =
      "Moderate–severe DCM with cord signal change, extended symptoms, multilevel stenosis or high canal occupying ratio carries substantial risk of progression without surgery.";
    benefit =
      "Most patients in similar cohorts gain clinically meaningful mJOA and functional improvement following decompression, with acceptable complication rates.";
  } else if (
    severity === "mild" &&
    (hasCordSignal || longSymptoms || highCanal)
  ) {
    label = "Consider surgery / surgery likely beneficial";
    risk =
      "Mild DCM with MRI or duration risk markers has a meaningful chance of progression over time.";
    benefit =
      "Early decompression often yields clinically important improvement, but a monitored non-operative trial is reasonable if symptoms are stable and the patient prefers to delay surgery.";
  }

  return { label, risk, benefit };
}

function baselineMCIDBySeverity(severity: Severity): number {
  if (severity === "mild") return 0.65;
  if (severity === "moderate") return 0.55;
  return 0.45;
}

function approachMCIDAdjustments(
  p: PatientInputs,
  severity: Severity,
  baseProb: number
): ApproachResult {
  let probs: ApproachResult = {
    anterior: baseProb,
    posterior: baseProb,
    circumferential: baseProb - 0.03, // generally for more complex cases
  };

  const hasCordSignal = p.t2Signal === "bright" || p.t2Signal === "multilevel";
  const multilevel = p.levels >= 3;
  const longSymptoms = p.durationMonths >= 6;
  const veryLong = p.durationMonths >= 12;
  const highCanal = p.canalRatio === ">60%";
  const midCanal = p.canalRatio === "50–60%";
  const hasOPLL = p.opll === "yes";
  const elderly = p.age >= 75;
  const highBurden =
    elderly || p.smoker === "yes" || p.t1Hypo === "yes" || hasCordSignal;

  // Mild, non-OPLL, short segment, lower canal compromise → anterior modestly favoured
  if (severity === "mild" && !hasOPLL && !multilevel && !highCanal) {
    probs.anterior += 0.05;
    probs.posterior += 0.0;
    probs.circumferential -= 0.02;
  }

  // Multilevel disease or very long duration → posterior more attractive
  if (multilevel || veryLong) {
    probs.posterior += 0.05;
    probs.anterior -= 0.02;
    probs.circumferential += 0.02;
  }

  // OPLL-specific adjustments
  if (hasOPLL) {
    if (highCanal) {
      // High canal occupying ratio OPLL: anterior has higher recovery but more complications
      probs.anterior += 0.1;
      probs.posterior += 0.03;
    } else if (midCanal) {
      // Intermediate canal occupying ratio: anterior and posterior similar
      probs.anterior += 0.03;
      probs.posterior += 0.03;
    } else {
      // Lower canal occupying ratio: posterior often favoured due to complication profile
      probs.posterior += 0.05;
      probs.anterior += 0.02;
    }
  }

  // Multilevel T2 signal → posterior and circumferential slightly favoured
  if (p.t2Signal === "multilevel") {
    probs.posterior += 0.03;
    probs.anterior -= 0.01;
    probs.circumferential += 0.01;
  }

  // Long symptoms in non-OPLL moderate/severe: small downshift
  if (longSymptoms && !hasOPLL && (severity === "moderate" || severity === "severe")) {
    probs.anterior -= 0.01;
    probs.posterior -= 0.01;
  }

  // Global downshift for frail/high burden
  if (highBurden) {
    (["anterior", "posterior", "circumferential"] as ApproachKey[]).forEach(
      (k) => {
        probs[k] -= 0.03;
      }
    );
  }

  // Clamp to [0.25, 0.9]
  (["anterior", "posterior", "circumferential"] as ApproachKey[]).forEach(
    (k) => {
      probs[k] = Math.max(0.25, Math.min(0.9, probs[k]));
    }
  );

  return probs;
}

function computeUncertaintyLevel(approachResult: ApproachResult): "" | "low" | "moderate" | "high" {
  const vals = Object.values(approachResult).sort((a, b) => b - a);
  if (vals.length < 2) return "high";
  const delta = vals[0] - vals[1];
  if (delta >= 0.15) return "low";
  if (delta >= 0.08) return "moderate";
  return "high";
}

function estimateRiskBenefit(
  p: PatientInputs,
  severity: Severity
): { riskScore: number; benefitScore: number } {
  let risk: number;
  let benefit: number;

  if (severity === "mild") {
    risk = 20;
    benefit = 40;
  } else if (severity === "moderate") {
    risk = 40;
    benefit = 65;
  } else {
    risk = 60;
    benefit = 80;
  }

  if (p.durationMonths >= 12) {
    risk += 5;
    benefit += 3;
  } else if (p.durationMonths < 3) {
    risk -= 3;
    benefit += 2;
  }

  if (p.t2Signal === "bright") {
    risk += 5;
    benefit += 3;
  } else if (p.t2Signal === "multilevel") {
    risk += 10;
    benefit += 5;
  }

  if (p.canalRatio === ">60%") {
    risk += 5;
    benefit += 3;
  }

  if (p.opll === "yes") {
    risk += 3;
    benefit += 2;
  }

  risk = Math.max(5, Math.min(95, risk));
  benefit = Math.max(10, Math.min(95, benefit));

  return { riskScore: risk, benefitScore: benefit };
}

// -----------------------------
// React component
// -----------------------------

export default function Prototype() {
  const [activeTab, setActiveTab] = useState<Tab>("single");

  // Single-patient state
  const [age, setAge] = useState("65");
  const [sex, setSex] = useState<Sex>("M");
  const [mjoa, setMjoa] = useState("13");
  const [severity, setSeverity] = useState<Severity>("moderate"); // auto-set from mJOA
  const [duration, setDuration] = useState("12");
  const [t2Signal, setT2Signal] = useState<"none" | "bright" | "multilevel">(
    "bright"
  );
  const [levels, setLevels] = useState("3");
  const [canalRatio, setCanalRatio] = useState("<50%");
  const [opll, setOpll] = useState<YesNo>("no");
  const [t1Hypo, setT1Hypo] = useState<YesNo>("no");
  const [smoker, setSmoker] = useState<YesNo>("no");
  const [psych, setPsych] = useState<YesNo>("no");
  const [gait, setGait] = useState<YesNo>("yes");
  const [ndi, setNdi] = useState("40");
  const [sf36pcs, setSf36pcs] = useState("32");
  const [sf36mcs, setSf36mcs] = useState("45");

  const [hasRun, setHasRun] = useState(false);
  const [approachResult, setApproachResult] = useState<ApproachResult | null>(
    null
  );
  const [surgeryLabel, setSurgeryLabel] = useState("");
  const [surgerySummary, setSurgerySummary] = useState("");
  const [riskBand, setRiskBand] = useState("");
  const [benefitBand, setBenefitBand] = useState("");
  const [uncertaintyLevel, setUncertaintyLevel] = useState<
    "" | "low" | "moderate" | "high"
  >("");
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [benefitScore, setBenefitScore] = useState<number | null>(null);

  // Batch state
  const [batchCsv, setBatchCsv] = useState("");
  const [batchSummary, setBatchSummary] = useState<BatchSummary | null>(null);
  const [batchError, setBatchError] = useState<string | null>(null);

  const approaches: ApproachKey[] = [
    "anterior",
    "posterior",
    "circumferential",
  ];

  const runSingleRecommendation = () => {
    const mNum = Number(mjoa) || 18;
    const derivedSeverity = deriveSeverityFromMJOA(mNum);
    setSeverity(derivedSeverity);

    const inputs: PatientInputs = {
      age: Number(age) || 65,
      sex,
      severity: derivedSeverity,
      mjoa: mNum,
      durationMonths: Number(duration) || 0,
      t2Signal,
      levels: Number(levels) || 1,
      canalRatio: canalRatio as "<50%" | "50–60%" | ">60%",
      opll,
      t1Hypo,
      smoker,
    };

    const rg = classifyRiskGroup(inputs, derivedSeverity);
    const baseProb = baselineMCIDBySeverity(derivedSeverity);
    const appr = approachMCIDAdjustments(inputs, derivedSeverity, baseProb);
    const unc = computeUncertaintyLevel(appr);
    const rb = estimateRiskBenefit(inputs, derivedSeverity);

    const summary = `Age ${inputs.age}, ${sex}, mJOA ${mNum} (${derivedSeverity}), symptom duration ≈ ${
      inputs.durationMonths
    } months, planned levels ${inputs.levels}.`;

    setSurgeryLabel(rg.label);
    setRiskBand(rg.risk);
    setBenefitBand(rg.benefit);
    setSurgerySummary(summary);
    setApproachResult(appr);
    setUncertaintyLevel(unc);
    setRiskScore(rb.riskScore);
    setBenefitScore(rb.benefitScore);
    setHasRun(true);
  };

  const bestApproach =
    approachResult &&
    (Object.entries(approachResult).sort((a, b) => b[1] - a[1])[0][0] as
      | ApproachKey
      | undefined);

  const handleBatchRun = () => {
    setBatchError(null);
    setBatchSummary(null);

    const text = batchCsv.trim();
    if (!text) {
      setBatchError("Please paste a CSV with a header row.");
      return;
    }

    const rows = text
      .split(/\r?\n/)
      .map((r) => r.split(",").map((s) => s.trim()));
    if (rows.length < 2) {
      setBatchError("CSV must include at least one data row.");
      return;
    }

    const header = rows[0].map((h) => h.toLowerCase());
    const idx = (name: string) => header.indexOf(name);

    const ageIdx = idx("age");
    const sexIdx = idx("sex");
    const mjoaIdx = idx("mjoa");
    const durIdx = idx("duration_months");
    const levelsIdx = idx("levels");
    const canalIdx = idx("canal_ratio");
    const t2Idx = idx("t2_signal");
    const opllIdx = idx("opll");
    const smokerIdx = idx("smoker");

    if (
      [ageIdx, sexIdx, mjoaIdx, durIdx, levelsIdx, canalIdx, t2Idx].some(
        (i) => i === -1
      )
    ) {
      setBatchError(
        "Required columns: age, sex, mjoa, duration_months, levels, canal_ratio, t2_signal (optional: opll, smoker)."
      );
      return;
    }

    const summary: BatchSummary = {
      total: 0,
      surgeryRecommended: 0,
      consider: 0,
      nonOp: 0,
      anterior: 0,
      posterior: 0,
      circumferential: 0,
    };

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      if (!row.length || row.every((c) => c === "")) continue;

      const mNum = Number(row[mjoaIdx]) || 18;
      const derivedSeverity = deriveSeverityFromMJOA(mNum);

      const inputs: PatientInputs = {
        age: Number(row[ageIdx]) || 65,
        sex: (row[sexIdx] as Sex) || "M",
        severity: derivedSeverity,
        mjoa: mNum,
        durationMonths: Number(row[durIdx]) || 0,
        t2Signal: (row[t2Idx] as "none" | "bright" | "multilevel") || "bright",
        levels: Number(row[levelsIdx]) || 1,
        canalRatio:
          (row[canalIdx] as "<50%" | "50–60%" | ">60%") || "<50%",
        opll:
          opllIdx !== -1 &&
          row[opllIdx] &&
          row[opllIdx].toLowerCase() === "yes"
            ? "yes"
            : "no",
        t1Hypo: "no",
        smoker:
          smokerIdx !== -1 && row[smokerIdx]
            ? ((row[smokerIdx].toLowerCase() === "yes"
                ? "yes"
                : "no") as YesNo)
            : "no",
      };

      const rg = classifyRiskGroup(inputs, derivedSeverity);
      const baseProb = baselineMCIDBySeverity(derivedSeverity);
      const appr = approachMCIDAdjustments(inputs, derivedSeverity, baseProb);

      summary.total += 1;

      if (rg.label.startsWith("Surgery recommended")) {
        summary.surgeryRecommended += 1;
      } else if (rg.label.startsWith("Consider surgery")) {
        summary.consider += 1;
      } else {
        summary.nonOp += 1;
      }

      const best = Object.entries(appr).sort((a, b) => b[1] - a[1])[0][0] as ApproachKey;
      summary[best] += 1;
    }

    setBatchSummary(summary);
  };

  const handlePrintSummary = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const uncertaintyLabel =
    uncertaintyLevel === ""
      ? ""
      : `Uncertainty: ${uncertaintyLevel}`;

  const uncertaintyClass =
    uncertaintyLevel === "low"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : uncertaintyLevel === "moderate"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : "bg-rose-50 text-rose-700 border-rose-200";

  const isNonOp = surgeryLabel.startsWith("Non-operative trial reasonable");

  const severityDisplay =
    severity === "mild"
      ? "Mild (mJOA 15–17)"
      : severity === "moderate"
      ? "Moderate (mJOA 12–14)"
      : "Severe (mJOA ≤11)";

  return (
    <main className="px-6 md:px-10 pt-8 md:pt-10 pb-20 max-w-5xl mx-auto space-y-8">
      {/* Back + title */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/"
          className="text-sm text-teal-700 hover:text-teal-800 underline decoration-teal-400"
        >
          ← Back to overview
        </Link>
        <span className="text-xs md:text-sm text-slate-500">
          Ascension Texas Spine and Scoliosis
        </span>
      </div>

      <div>
        <h1 className="text-2xl md:text-3xl font-bold gradient-text">
          DCM Surgical Decision-Support
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Single-patient and batch views using guideline-informed logic and outcome patterns.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 glass p-3">
        <button
          onClick={() => setActiveTab("single")}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === "single"
              ? "bg-teal-600 text-white shadow"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Single patient
        </button>
        <button
          onClick={() => setActiveTab("batch")}
          className={`flex-1 py-2 rounded-xl text-sm font-semibold transition ${
            activeTab === "batch"
              ? "bg-teal-600 text-white shadow"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
          }`}
        >
          Batch (CSV)
        </button>
      </div>

      {/* SINGLE PATIENT VIEW */}
      {activeTab === "single" && (
        <>
          {/* INPUTS */}
          <section className="glass space-y-5">
            <h2 className="text-lg md:text-xl font-semibold">
              Baseline clinical information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              {/* age / sex / mJOA / severity (auto) */}
              <div>
                <label className="block font-semibold mb-1 text-sm">Age</label>
                <input
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-sm">Sex</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value as Sex)}
                  className="w-full p-2 rounded border border-slate-300 bg-white"
                >
                  <option value="M">M</option>
                  <option value="F">F</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-sm">mJOA</label>
                <input
                  value={mjoa}
                  onChange={(e) => setMjoa(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-sm">
                  Severity (auto from mJOA)
                </label>
                <div className="w-full p-2 rounded border border-slate-200 bg-slate-50 text-slate-700 text-xs md:text-sm">
                  {severityDisplay}
                </div>
              </div>

              {/* symptom duration / T2 / levels / canal ratio */}
              <div>
                <label className="block font-semibold mb-1 text-sm">
                  Symptom duration (months)
                </label>
                <input
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-sm">
                  T2 cord signal
                </label>
                <select
                  value={t2Signal}
                  onChange={(e) =>
                    setT2Signal(
                      e.target.value as "none" | "bright" | "multilevel"
                    )
                  }
                  className="w-full p-2 rounded border border-slate-300 bg-white"
                >
                  <option value="none">None</option>
                  <option value="bright">Hyperintense / bright</option>
                  <option value="multilevel">Multilevel / extensive</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-sm">
                  Planned operated levels
                </label>
                <input
                  value={levels}
                  onChange={(e) => setLevels(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-sm">
                  Canal occupying ratio
                </label>
                <select
                  value={canalRatio}
                  onChange={(e) => setCanalRatio(e.target.value)}
                  className="w-full p-2 rounded border border-slate-300 bg-white"
                >
                  <option value="<50%">&lt;50%</option>
                  <option value="50–60%">50–60%</option>
                  <option value=">60%">&gt;60%</option>
                </select>
              </div>

              {/* OPLL / T1 hypo */}
              <div>
                <label className="block font-semibold mb-1 text-sm">
                  OPLL present
                </label>
                <select
                  value={opll}
                  onChange={(e) => setOpll(e.target.value as YesNo)}
                  className="w-full p-2 rounded border border-slate-300 bg-white"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-sm">
                  T1 hypointensity
                </label>
                <select
                  value={t1Hypo}
                  onChange={(e) => setT1Hypo(e.target.value as YesNo)}
                  className="w-full p-2 rounded border border-slate-300 bg-white"
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </div>
            </div>

            {/* Additional factors */}
            <div className="mt-4 space-y-3">
              <p className="text-sm font-semibold">Additional factors</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <label className="block font-semibold mb-1 text-sm">
                    Smoker
                  </label>
                  <select
                    value={smoker}
                    onChange={(e) => setSmoker(e.target.value as YesNo)}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-sm">
                    Psychiatric disorder
                  </label>
                  <select
                    value={psych}
                    onChange={(e) => setPsych(e.target.value as YesNo)}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-sm">
                    Gait impairment
                  </label>
                  <select
                    value={gait}
                    onChange={(e) => setGait(e.target.value as YesNo)}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-sm">
                    Baseline NDI
                  </label>
                  <input
                    value={ndi}
                    onChange={(e) => setNdi(e.target.value)}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-sm">
                    SF-36 PCS
                  </label>
                  <input
                    value={sf36pcs}
                    onChange={(e) => setSf36pcs(e.target.value)}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-sm">
                    SF-36 MCS
                  </label>
                  <input
                    value={sf36mcs}
                    onChange={(e) => setSf36mcs(e.target.value)}
                    className="w-full p-2 rounded border border-slate-300 bg-white"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={runSingleRecommendation}
              className="mt-4 inline-flex items-center justify-center bg-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-teal-700 transition"
            >
              Run recommendation
            </button>
          </section>

          {/* SURGERY RECOMMENDATION */}
          <section className="glass space-y-4">
            <h2 className="text-lg md:text-xl font-semibold">
              1. Should this patient undergo surgery?
            </h2>

            {!hasRun ? (
              <p className="text-sm text-slate-600">
                Enter baseline information and select{" "}
                <strong>Run recommendation</strong>.
              </p>
            ) : (
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <p className="font-semibold text-base md:text-lg">
                    Recommendation:{" "}
                    <span className="text-teal-700">{surgeryLabel}</span>
                  </p>
                  <div className="text-xs md:text-sm md:text-right">
                    <p>
                      <span className="font-semibold">
                        Risk without surgery:
                      </span>{" "}
                      {riskBand}
                    </p>
                    <p>
                      <span className="font-semibold">
                        Expected benefit with surgery:
                      </span>{" "}
                      {benefitBand}
                    </p>
                  </div>
                </div>

                <p>{surgerySummary}</p>

                {/* Risk vs benefit dial */}
                {riskScore !== null && benefitScore !== null && (
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
                    <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-3">
                      <p className="font-semibold text-rose-800 mb-1">
                        Risk of neurological worsening without surgery
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2.5 rounded-full bg-rose-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-rose-500"
                            style={{ width: `${riskScore}%` }}
                          />
                        </div>
                        <span className="w-12 text-right font-semibold text-rose-800">
                          {riskScore}%
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3">
                      <p className="font-semibold text-emerald-800 mb-1">
                        Expected chance of meaningful improvement with surgery
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2.5 rounded-full bg-emerald-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${benefitScore}%` }}
                          />
                        </div>
                        <span className="w-12 text-right font-semibold text-emerald-800">
                          {benefitScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-500">
                  Logic approximates AO Spine / WFNS guideline groups and outcome
                  data for DCM and OPLL. Exact probabilities will be calibrated
                  on prospective Ascension Seton data.
                </p>
              </div>
            )}
          </section>

          {/* APPROACH COMPARISON */}
          <section className="glass space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg md:text-xl font-semibold">
                2. If surgery is offered, which approach?
              </h2>
              {hasRun && approachResult && uncertaintyLevel && !isNonOp && (
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-semibold ${
                    uncertaintyClass
                  }`}
                >
                  {uncertaintyLabel}
                </span>
              )}
            </div>

            {!hasRun || !approachResult ? (
              <p className="text-sm text-slate-600">
                After running the recommendation above, approximate probabilities
                of achieving mJOA MCID with each approach will appear here.
              </p>
            ) : isNonOp ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="font-semibold mb-1">
                  Non-operative trial recommended at this time.
                </p>
                <p className="mb-1">
                  Surgery is not being recommended as the primary strategy for
                  this profile, assuming the patient can be followed closely and
                  risk factors remain stable.
                </p>
                {bestApproach && (
                  <p>
                    If the patient later requires surgery (progression of signs
                    or symptoms), the current engine would favour{" "}
                    <span className="font-semibold">
                      {bestApproach.charAt(0).toUpperCase() +
                        bestApproach.slice(1)}
                    </span>{" "}
                    over the other options based on estimated probability of
                    achieving clinically meaningful mJOA improvement.
                  </p>
                )}
                <p className="mt-2 text-xs text-slate-500">
                  Approach preferences reflect severity, duration, canal
                  compromise, OPLL, MRI signal, age and smoking, and will be
                  refined using your prospective data.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {approaches.map((k) => {
                    const p = approachResult[k];
                    const isBest = k === bestApproach;
                    const label =
                      k.charAt(0).toUpperCase() + k.slice(1);

                    return (
                      <div
                        key={k}
                        className={`rounded-2xl p-5 border ${
                          isBest
                            ? "border-teal-600 bg-teal-50"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">
                          {label}
                        </p>
                        <p className="text-2xl font-bold mb-1">
                          {(p * 100).toFixed(1)}%
                        </p>
                        {isBest ? (
                          <p className="text-xs text-teal-800 font-semibold">
                            Highest estimated chance of clinically meaningful
                            mJOA improvement.
                          </p>
                        ) : (
                          <p className="text-xs text-slate-600">
                            Lower modeled probability than the leading approach.
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Simple bar graph */}
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-600">
                    P(MCID) by approach
                  </p>
                  <div className="space-y-2">
                    {approaches.map((k) => {
                      const p = approachResult[k];
                      const label =
                        k.charAt(0).toUpperCase() + k.slice(1);
                      const pct = Math.round(p * 100);

                      return (
                        <div key={k} className="flex items-center gap-3">
                          <div className="w-20 text-xs text-slate-600">
                            {label}
                          </div>
                          <div className="flex-1 h-2.5 rounded-full bg-slate-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                k === bestApproach
                                  ? "bg-teal-500"
                                  : "bg-indigo-400"
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <div className="w-10 text-xs text-right text-slate-600">
                            {pct}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <p className="mt-2 text-xs text-slate-500">
              Approach patterns are derived from DCM and OPLL outcome literature
              (anterior vs posterior vs circumferential) and will be formally
              calibrated once real Ascension Texas Spine and Scoliosis data are
              available.
            </p>

            {/* PDF / print summary */}
            <div className="mt-4">
              <button
                onClick={handlePrintSummary}
                className="inline-flex items-center justify-center bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
              >
                Download / print summary (PDF)
              </button>
              <p className="mt-1 text-[11px] text-slate-500">
                Uses the browser’s print-to-PDF function to create a one-page
                summary of the current patient inputs and recommendations.
              </p>
            </div>
          </section>
        </>
      )}

      {/* BATCH VIEW */}
      {activeTab === "batch" && (
        <section className="glass space-y-4">
          <h2 className="text-lg md:text-xl font-semibold">
            Batch view (CSV import)
          </h2>

          <p className="text-sm text-slate-600">
            Paste a CSV with one row per patient to obtain summary counts of
            recommendation categories and preferred approaches.
          </p>

          <p className="text-xs text-slate-600">
            Required columns (header row):{" "}
            <code className="bg-slate-100 px-2 py-1 rounded">
              age, sex, mjoa, duration_months, levels, canal_ratio, t2_signal
            </code>{" "}
            Optional:{" "}
            <code className="bg-slate-100 px-2 py-1 rounded">opll, smoker</code>
          </p>

          <textarea
            rows={10}
            value={batchCsv}
            onChange={(e) => setBatchCsv(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs font-mono"
            placeholder={`age,sex,mjoa,duration_months,levels,canal_ratio,t2_signal,opll,smoker
65,M,13,12,3,<50%,bright,no,no
78,M,8,24,4,>60%,multilevel,yes,yes`}
          />

          {batchError && (
            <p className="text-xs text-red-600 font-semibold">{batchError}</p>
          )}

          <button
            onClick={handleBatchRun}
            className="inline-flex items-center justify-center bg-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-teal-700 transition"
          >
            Run batch recommendation
          </button>

          {batchSummary && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold mb-2">Surgery recommendation</p>
                <ul className="space-y-1 text-slate-700 text-sm">
                  <li>
                    Total patients:{" "}
                    <span className="font-semibold">
                      {batchSummary.total}
                    </span>
                  </li>
                  <li>
                    Surgery recommended:{" "}
                    <span className="font-semibold">
                      {batchSummary.surgeryRecommended}
                    </span>
                  </li>
                  <li>
                    Consider surgery:{" "}
                    <span className="font-semibold">
                      {batchSummary.consider}
                    </span>
                  </li>
                  <li>
                    Non-operative trial reasonable:{" "}
                    <span className="font-semibold">
                      {batchSummary.nonOp}
                    </span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold mb-2">Preferred approach</p>
                <ul className="space-y-1 text-slate-700 text-sm">
                  <li>
                    Anterior best:{" "}
                    <span className="font-semibold">
                      {batchSummary.anterior}
                    </span>
                  </li>
                  <li>
                    Posterior best:{" "}
                    <span className="font-semibold">
                      {batchSummary.posterior}
                    </span>
                  </li>
                  <li>
                    Circumferential best:{" "}
                    <span className="font-semibold">
                      {batchSummary.circumferential}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  );
}
