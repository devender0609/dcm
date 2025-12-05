"use client";

import { useState } from "react";

type Severity = "mild" | "moderate" | "severe";
type ApproachKey = "anterior" | "posterior" | "circumferential";

type ApproachResult = Record<ApproachKey, number>;

export default function Prototype() {
  const [age, setAge] = useState<string>("65");
  const [severity, setSeverity] = useState<Severity>("moderate");
  const [mjoa, setMjoa] = useState<string>("13");
  const [duration, setDuration] = useState<string>("12");
  const [t2Signal, setT2Signal] = useState<string>("bright");

  const [hasRun, setHasRun] = useState(false);
  const [approachResult, setApproachResult] = useState<ApproachResult | null>(
    null
  );
  const [surgeryLabel, setSurgeryLabel] = useState<string>("");
  const [surgeryText, setSurgeryText] = useState<string>("");
  const [riskBand, setRiskBand] = useState<string>("");
  const [benefitBand, setBenefitBand] = useState<string>("");

  const approaches: ApproachKey[] = [
    "anterior",
    "posterior",
    "circumferential",
  ];

  // TEMP MOCK: this simulates behaviour of your Python engine
  const runPrototype = () => {
    // crude mock logic: more severe + longer duration => “surgery recommended”
    const dur = Number(duration) || 0;
    const m = Number(mjoa) || 18;

    let label = "Non-operative trial reasonable with close follow-up";
    let risk = "~10–20% risk of neurological worsening without surgery";
    let benefit =
      "Surgical benefit uncertain; non-operative trial appropriate initially";
    let explanation = `Baseline mJOA ≈ ${m} (${severity}). Symptom duration ≈ ${dur} months.`;

    const hasCordSignal = t2Signal !== "none";
    const moderateOrSevere = severity !== "mild";
    const longSymptoms = dur >= 6;

    if (moderateOrSevere && (hasCordSignal || longSymptoms)) {
      label = "Surgery recommended";
      risk = "~40–60%+ risk of neurological worsening without surgery";
      benefit =
        "~70–85% chance of clinically meaningful improvement with surgery";
      explanation +=
        " Cord signal change and/or longer symptom duration suggest higher risk without decompression.";
    } else if (severity === "mild" && (hasCordSignal || longSymptoms)) {
      label = "Consider surgery / surgery likely beneficial";
      risk = "~20–40% risk of neurological worsening without surgery";
      benefit =
        "~60–80% chance of clinically meaningful improvement with surgery";
      explanation +=
        " Early myelopathy with risk markers — surgery often considered depending on patient goals.";
    }

    // Mock approach probabilities: anterior slightly favoured in mild/mod, posterior in severe
    const baseAnterior = severity === "severe" ? 0.62 : 0.78;
    const basePosterior = severity === "severe" ? 0.75 : 0.63;
    const baseCirc = 0.6;

    const noise = () => (Math.random() - 0.5) * 0.06;

    const result: ApproachResult = {
      anterior: Math.min(0.95, Math.max(0.3, baseAnterior + noise())),
      posterior: Math.min(0.95, Math.max(0.3, basePosterior + noise())),
      circumferential: Math.min(0.95, Math.max(0.3, baseCirc + noise())),
    };

    setSurgeryLabel(label);
    setSurgeryText(explanation);
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
    <main className="px-6 md:px-10 pt-10 md:pt-14 pb-24 max-w-5xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 gradient-text">
        DCM Prototype — Single Patient View
      </h1>

      {/* INPUT CARD */}
      <section className="glass mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-4">
          Enter key baseline information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
          <div>
            <label className="block font-semibold mb-1">Age</label>
            <input
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-2 rounded bg-slate-900 border border-slate-700"
              placeholder="Years"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">mJOA</label>
            <input
              value={mjoa}
              onChange={(e) => setMjoa(e.target.value)}
              className="w-full p-2 rounded bg-slate-900 border border-slate-700"
              placeholder="e.g., 13"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Severity</label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              className="w-full p-2 rounded bg-slate-900 border border-slate-700"
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1">
              Symptom duration (months)
            </label>
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full p-2 rounded bg-slate-900 border border-slate-700"
              placeholder="e.g., 12"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">T2 cord signal</label>
            <select
              value={t2Signal}
              onChange={(e) => setT2Signal(e.target.value)}
              className="w-full p-2 rounded bg-slate-900 border border-slate-700"
            >
              <option value="none">None</option>
              <option value="bright">Hyperintense / bright</option>
              <option value="multilevel">Multilevel</option>
            </select>
          </div>
        </div>

        <button
          onClick={runPrototype}
          className="mt-6 inline-flex items-center justify-center bg-clinicTeal text-slate-900 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-clinicGold transition"
        >
          Run mock recommendation
        </button>

        <p className="mt-3 text-xs text-slate-300/80 max-w-lg">
          This page currently uses mock logic to illustrate layout only. The
          live engine will call the Python model you built (with synthetic data
          and literature-based rules) via an API.
        </p>
      </section>

      {/* RESULTS: SURGERY NEED */}
      <section className="glass mb-8">
        <h2 className="text-lg md:text-xl font-semibold mb-4">
          1. Should this patient undergo surgery?
        </h2>

        {!hasRun ? (
          <p className="text-sm text-slate-300/80">
            Enter patient details above and click{" "}
            <span className="font-semibold">"Run mock recommendation"</span>.
          </p>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <p className="font-semibold text-base md:text-lg">
                Recommendation:{" "}
                <span className="text-clinicTeal">{surgeryLabel}</span>
              </p>
              <div className="text-xs md:text-sm text-right">
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

            <p className="text-slate-200/85">{surgeryText}</p>
          </div>
        )}
      </section>

      {/* RESULTS: APPROACH COMPARISON */}
      <section className="glass">
        <h2 className="text-lg md:text-xl font-semibold mb-4">
          2. If surgery is offered, which approach?
        </h2>

        {!hasRun || !approachResult ? (
          <p className="text-sm text-slate-300/80">
            Run the mock recommendation above to see approach-level probabilities.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
            {approaches.map((k) => {
              const p = approachResult[k];
              const isBest = k === bestApproach;
              return (
                <div
                  key={k}
                  className={`rounded-2xl p-5 border ${
                    isBest
                      ? "bg-slate-900/80 border-clinicTeal shadow-glow"
                      : "bg-slate-900/60 border-slate-700"
                  }`}
                >
                  <p className="text-xs uppercase tracking-wide text-slate-400 mb-1">
                    {k}
                  </p>
                  <p className="text-2xl font-bold mb-1">
                    {(p * 100).toFixed(1)}%
                  </p>
                  {isBest ? (
                    <p className="text-xs text-clinicTeal/90 font-semibold">
                      Highest estimated chance of achieving MCID if surgery is
                      performed.
                    </p>
                  ) : (
                    <p className="text-xs text-slate-300/80">
                      Lower modeled probability compared with the leading
                      approach.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
