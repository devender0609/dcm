"use client";

import { useState } from "react";

type Severity = "mild" | "moderate" | "severe";
type ApproachKey = "anterior" | "posterior" | "circumferential";
type ApproachResult = Record<ApproachKey, number>;

export default function Prototype() {
  const [age, setAge] = useState("65");
  const [severity, setSeverity] = useState<Severity>("moderate");
  const [mjoa, setMjoa] = useState("13");
  const [duration, setDuration] = useState("12");
  const [t2Signal, setT2Signal] = useState("bright");

  const [hasRun, setHasRun] = useState(false);
  const [approachResult, setApproachResult] = useState<ApproachResult | null>(
    null
  );
  const [surgeryLabel, setSurgeryLabel] = useState("");
  const [surgerySummary, setSurgerySummary] = useState("");
  const [riskBand, setRiskBand] = useState("");
  const [benefitBand, setBenefitBand] = useState("");

  const approaches: ApproachKey[] = [
    "anterior",
    "posterior",
    "circumferential",
  ];

  const runPrototype = () => {
    const dur = Number(duration) || 0;
    const m = Number(mjoa) || 18;
    const hasCordSignal = t2Signal !== "none";
    const moderateOrSevere = severity !== "mild";

    let label = "Non-operative trial reasonable with close follow-up";
    let risk =
      "Observational cohorts suggest low–moderate risk of neurological worsening if monitored closely.";
    let benefit =
      "Surgical benefit may be modest; decision should reflect patient goals and risk tolerance.";
    let summary = `Baseline mJOA ${m} (${severity}), symptom duration about ${dur} months.`;

    // Simple rule layer approximating guideline logic
    if (moderateOrSevere && (hasCordSignal || dur >= 6)) {
      label = "Surgery recommended";
      risk =
        "Moderate–severe DCM and/or cord signal change carry a substantial risk of neurological progression without surgery.";
      benefit =
        "Most patients in similar cohorts improve neurologically after decompression, with acceptable complication rates.";
      summary +=
        " Features fit guideline groups in which surgery is generally recommended.";
    } else if (severity === "mild" && (hasCordSignal || dur >= 6)) {
      label = "Consider surgery / surgery likely beneficial";
      risk =
        "Mild DCM with risk markers has an increased chance of progression over time.";
      benefit =
        "Many patients achieve clinically meaningful improvement with early surgery; close follow-up is required if managed non-operatively.";
      summary +=
        " This profile lies in the range where guidelines support either early surgery or a structured non-operative trial.";
    }

    // Mock approach probabilities: this will later be replaced by your real model.
    const baseAnterior = severity === "severe" ? 0.62 : 0.78;
    const basePosterior = severity === "severe" ? 0.75 : 0.63;
    const baseCirc = 0.6;
    const jitter = () => (Math.random() - 0.5) * 0.06;

    const result: ApproachResult = {
      anterior: Math.min(0.95, Math.max(0.3, baseAnterior + jitter())),
      posterior: Math.min(0.95, Math.max(0.3, basePosterior + jitter())),
      circumferential: Math.min(0.95, Math.max(0.3, baseCirc + jitter())),
    };

    setSurgeryLabel(label);
    setSurgerySummary(summary);
    setRiskBand(risk);
    setBenefitBand(benefit);
    setApproachResult(result);
    setHasRun(true);
  };

  const bestApproach =
    approachResult &&
    (Object.entries(approachResult).sort((a, b) => b[1] - a[1])[0][0] as
      | ApproachKey
      | undefined);

  return (
    <main className="px-6 md:px-10 pt-8 md:pt-10 pb-20 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl md:text-3xl font-bold gradient-text">
        DCM Prototype — Single Patient View
      </h1>

      {/* INPUT CARD */}
      <section className="glass space-y-5">
        <h2 className="text-lg md:text-xl font-semibold">
          Enter key baseline information
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
            <label className="block font-semibold mb-1 text-sm">mJOA</label>
            <input
              value={mjoa}
              onChange={(e) => setMjoa(e.target.value)}
              className="w-full p-2 rounded border border-slate-300 bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-sm">Severity</label>
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
              onChange={(e) => setT2Signal(e.target.value)}
              className="w-full p-2 rounded border border-slate-300 bg-white"
            >
              <option value="none">None</option>
              <option value="bright">Hyperintense / bright</option>
              <option value="multilevel">Multilevel / extensive</option>
            </select>
          </div>
        </div>

        <button
          onClick={runPrototype}
          className="mt-2 inline-flex items-center justify-center bg-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-teal-700 transition"
        >
          Run mock recommendation
        </button>

        <p className="mt-2 text-xs text-slate-600 max-w-xl">
          Prototype only: logic is a simplified representation of guideline
          concepts and surgical outcome data. Final engine will call your
          trained model.
        </p>
      </section>

      {/* 1. SURGERY RECOMMENDATION */}
      <section className="glass space-y-4">
        <h2 className="text-lg md:text-xl font-semibold">
          1. Should this patient undergo surgery?
        </h2>

        {!hasRun ? (
          <p className="text-sm text-slate-600">
            Enter patient details and click <strong>Run mock recommendation</strong>.
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
                  <span className="font-semibold">Risk without surgery:</span>{" "}
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
              Based on AO Spine / WFNS guidelines and major outcome cohorts
              (Fehlings et al., Global Spine J 2017; Tetreault et al., Global
              Spine J 2017; Merali et al., PLoS One 2019).
            </p>
          </div>
        )}
      </section>

      {/* 2. APPROACH COMPARISON */}
      <section className="glass space-y-4">
        <h2 className="text-lg md:text-xl font-semibold">
          2. If surgery is offered, which approach?
        </h2>

        {!hasRun || !approachResult ? (
          <p className="text-sm text-slate-600">
            Run the recommendation above to view approximate probabilities of
            achieving mJOA MCID with each approach.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            {approaches.map((k) => {
              const p = approachResult[k];
              const isBest = k === bestApproach;
              const label = k.charAt(0).toUpperCase() + k.slice(1);
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
                      Highest estimated chance of clinically meaningful mJOA
                      improvement if surgery is performed.
                    </p>
                  ) : (
                    <p className="text-xs text-slate-600">
                      Lower modeled probability compared with the leading
                      approach.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <p className="mt-2 text-xs text-slate-500">
          Approach-level patterns are inspired by published prognostic factors
          (baseline severity, duration, age, smoking, canal compromise, and MRI
          signal) but this front-end currently uses mock probabilities for
          demonstration.
        </p>
      </section>
    </main>
  );
}
