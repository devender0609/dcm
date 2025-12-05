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
  severity: Severity;
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

function computeForPatient(p: PatientInputs): PatientOutputs {
  const {
    age,
    sex,
    severity,
    mjoa,
    durationMonths,
    t2Signal,
    levels,
    canalRatio,
    opll,
    t1Hypo,
    smoker,
  } = p;

  const hasCordSignal = t2Signal !== "none";
  const moderateOrSevere = severity !== "mild";
  const longSymptoms = durationMonths >= 6;
  const highCanal = canalRatio === ">60%";
  const hasOPLL = opll === "yes";
  const smokerFlag = smoker === "yes";
  const t1Flag = t1Hypo === "yes";
  const ageNum = age || 65;

  let label =
    "Non-operative trial reasonable with close follow-up and structured surveillance.";
  let risk =
    "Low–moderate risk of neurological worsening if monitored closely and risk factors remain stable.";
  let benefit =
    "Surgical benefit may be modest; decision should reflect patient goals and risk tolerance.";
  let summary = `Age ${ageNum}, ${sex}, mJOA ${mjoa} (${severity}), symptom duration ≈ ${durationMonths} months, planned levels ${levels}.`;

  if (moderateOrSevere && (hasCordSignal || longSymptoms || highCanal)) {
    label = "Surgery recommended";
    risk =
      "Moderate–severe DCM and/or cord signal change, high canal compromise, or longer duration carry substantial risk of progression without surgery.";
    benefit =
      "Most similar patients improve neurologically after decompression with acceptable complication rates.";
    summary +=
      " Profile aligns with guideline groups where surgery is generally recommended.";
  } else if (severity === "mild" && (hasCordSignal || longSymptoms)) {
    label = "Consider surgery / surgery likely beneficial";
    risk = "Mild DCM with risk markers has a meaningful chance of progression.";
    benefit =
      "Early surgery frequently yields clinically important improvement; a structured non-operative trial is reasonable if the patient prefers.";
    summary +=
      " Fits mild DCM with risk markers where guidelines support either early surgery or a monitored non-operative trial.";
  }

  // Approximate approach patterns (front-end mock; real engine will replace)
  let baseAnterior = severity === "severe" ? 0.62 : 0.78;
  let basePosterior = severity === "severe" ? 0.75 : 0.63;
  let baseCirc = 0.6;

  if (levels >= 4 || hasOPLL) {
    basePosterior += 0.05;
    baseAnterior -= 0.04;
  }

  if (ageNum > 75 || smokerFlag) {
    baseAnterior -= 0.03;
    basePosterior -= 0.03;
    baseCirc -= 0.03;
  }

  if (t1Flag || t2Signal === "multilevel") {
    baseCirc -= 0.03;
  }

  const jitter = () => (Math.random() - 0.5) * 0.05;

  const approachResult: ApproachResult = {
    anterior: Math.min(0.95, Math.max(0.3, baseAnterior + jitter())),
    posterior: Math.min(0.95, Math.max(0.3, basePosterior + jitter())),
    circumferential: Math.min(0.95, Math.max(0.3, baseCirc + jitter())),
  };

  return { label, risk, benefit, summary, approachResult };
}

export default function Prototype() {
  const [activeTab, setActiveTab] = useState<Tab>("single");

  // Single-patient state
  const [age, setAge] = useState("65");
  const [sex, setSex] = useState<Sex>("M");
  const [severity, setSeverity] = useState<Severity>("moderate");
  const [mjoa, setMjoa] = useState("13");
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
    const inputs: PatientInputs = {
      age: Number(age) || 65,
      sex,
      severity,
      mjoa: Number(mjoa) || 18,
      durationMonths: Number(duration) || 0,
      t2Signal,
      levels: Number(levels) || 1,
      canalRatio: canalRatio as "<50%" | "50–60%" | ">60%",
      opll,
      t1Hypo,
      smoker,
    };

    const { label, risk, benefit, summary, approachResult } =
      computeForPatient(inputs);

    setSurgeryLabel(label);
    setRiskBand(risk);
    setBenefitBand(benefit);
    setSurgerySummary(summary);
    setApproachResult(approachResult);
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
    const sevIdx = idx("severity");
    const mjoaIdx = idx("mjoa");
    const durIdx = idx("duration_months");
    const levelsIdx = idx("levels");
    const canalIdx = idx("canal_ratio");
    const t2Idx = idx("t2_signal");
    const opllIdx = idx("opll");
    const smokerIdx = idx("smoker");

    if (
      [ageIdx, sexIdx, sevIdx, mjoaIdx, durIdx, levelsIdx, canalIdx, t2Idx].some(
        (i) => i === -1
      )
    ) {
      setBatchError(
        "Required columns: age, sex, severity, mjoa, duration_months, levels, canal_ratio, t2_signal (plus optional: opll, smoker)."
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

      const inputs: PatientInputs = {
        age: Number(row[ageIdx]) || 65,
        sex: (row[sexIdx] as Sex) || "M",
        severity: (row[sevIdx] as Severity) || "moderate",
        mjoa: Number(row[mjoaIdx]) || 18,
        durationMonths: Number(row[durIdx]) || 0,
        t2Signal: (row[t2Idx] as "none" | "bright" | "multilevel") || "bright",
        levels: Number(row[levelsIdx]) || 1,
        canalRatio:
          (row[canalIdx] as "<50%" | "50–60%" | ">60%") || "<50%",
        opll:
          (row[opllIdx] as YesNo) &&
          (row[opllIdx] as YesNo).toLowerCase() === "yes"
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

      const { label, approachResult } = computeForPatient(inputs);
      summary.total += 1;

      if (label.startsWith("Surgery recommended")) {
        summary.surgeryRecommended += 1;
      } else if (label.startsWith("Consider surgery")) {
        summary.consider += 1;
      } else {
        summary.nonOp += 1;
      }

      const best = Object.entries(approachResult).sort(
        (a, b) => b[1] - a[1]
      )[0][0] as ApproachKey;

      summary[best] += 1;
    }

    setBatchSummary(summary);
  };

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
          Single-patient and batch views using guideline-informed logic and
          outcome patterns.
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
                  Severity
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as Severity)}
                  className="w-full p-2 rounded border border-slate-300 bg-white"
                >
                  <option value="mild">Mild (mJOA 15–17)</option>
                  <option value="moderate">Moderate (mJOA 12–14)</option>
                  <option value="severe">Severe (mJOA ≤11)</option>
                </select>
              </div>

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
                      <span className="font-semibold">Expected benefit:</span>{" "}
                      {benefitBand}
                    </p>
                  </div>
                </div>

                <p>{surgerySummary}</p>

                <p className="text-xs text-slate-500">
                  Logic approximates AO Spine / WFNS guideline groups and
                  outcome data for DCM (Fehlings et al., Global Spine J 2017;
                  Tetreault et al., Global Spine J 2017; Merali et al., PLoS
                  One 2019).
                </p>
              </div>
            )}
          </section>

          {/* APPROACH COMPARISON */}
          <section className="glass space-y-4">
            <h2 className="text-lg md:text-xl font-semibold">
              2. If surgery is offered, which approach?
            </h2>

            {!hasRun || !approachResult ? (
              <p className="text-sm text-slate-600">
                After running the recommendation above, approximate
                probabilities of achieving mJOA MCID with each approach will
                appear here.
              </p>
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
                            Lower modeled probability than the leading
                            approach.
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
              Approach patterns reflect known prognostic factors (severity,
              duration, age, smoking, canal compromise, OPLL) and will later be
              replaced by your fully trained model.
            </p>
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
              age, sex, severity, mjoa, duration_months, levels, canal_ratio,
              t2_signal
            </code>{" "}
            Optional:{" "}
            <code className="bg-slate-100 px-2 py-1 rounded">opll, smoker</code>
          </p>

          <textarea
            rows={10}
            value={batchCsv}
            onChange={(e) => setBatchCsv(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs font-mono"
            placeholder={`age,sex,severity,mjoa,duration_months,levels,canal_ratio,t2_signal,opll,smoker
65,M,moderate,13,12,3,<50%,bright,no,no
78,M,severe,8,24,4,>60%,multilevel,yes,yes`}
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
