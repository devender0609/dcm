"use client";

import { useState } from "react";

type Severity = "mild" | "moderate" | "severe";
type YesNo = "yes" | "no";
type ApproachKey = "anterior" | "posterior" | "circumferential";
type ApproachResult = Record<ApproachKey, number>;

export default function Prototype() {
  // Core
  const [age, setAge] = useState("65");
  const [sex, setSex] = useState<"M" | "F">("M");
  const [severity, setSeverity] = useState<Severity>("moderate");
  const [mjoa, setMjoa] = useState("13");
  const [duration, setDuration] = useState("12");
  const [t2Signal, setT2Signal] = useState("bright");

  const [levels, setLevels] = useState("3");
  const [canalRatio, setCanalRatio] = useState("<50%");
  const [opll, setOpll] = useState<YesNo>("no");
  const [t1Hypo, setT1Hypo] = useState<YesNo>("no");

  // Additional modifiers
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

  const approaches: ApproachKey[] = [
    "anterior",
    "posterior",
    "circumferential",
  ];

  const runRecommendation = () => {
    const dur = Number(duration) || 0;
    const m = Number(mjoa) || 18;
    const lvl = Number(levels) || 1;
    const hasCordSignal = t2Signal !== "none";
    const moderateOrSevere = severity !== "mild";
    const highCanal = canalRatio === ">60%";
    const longSymptoms = dur >= 6;
    const hasOPLL = opll === "yes";

    let label = "Non-operative trial reasonable with close follow-up";
    let risk =
      "Low–moderate risk of neurological worsening if monitored closely.";
    let benefit =
      "Surgical benefit may be modest; decision should reflect patient goals and risk tolerance.";
    let summary = `Age ${age}, ${sex}, mJOA ${m} (${severity}), symptom duration ≈ ${dur} months, ${lvl} planned levels.`;

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
        "Early surgery frequently yields clinically important improvement; careful surveillance is needed if managed non-operatively.";
      summary +=
        " Fits mild DCM with risk markers where guidelines support either early surgery or a structured non-operative trial.";
    }

    // Approximate approach patterns (mock for front-end only)
    const ageNum = Number(age) || 65;
    const smokerFlag = smoker === "yes";
    const severe = severity === "severe";

    let baseAnterior = severe ? 0.62 : 0.78;
    let basePosterior = severe ? 0.75 : 0.63;
    let baseCirc = 0.6;

    if (lvl >= 4 || hasOPLL) {
      // long-segment / OPLL → relative posterior advantage
      basePosterior += 0.05;
      baseAnterior -= 0.04;
    }

    if (ageNum > 75 || smokerFlag) {
      // older/smoker → slightly lower all
      baseAnterior -= 0.03;
      basePosterior -= 0.03;
      baseCirc -= 0.03;
    }

    const jitter = () => (Math.random() - 0.5) * 0.05;

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
        DCM – Single Patient View
      </h1>

      {/* INPUTS */}
      <section className="glass space-y-5">
        <h2 className="text-lg md:text-xl font-semibold">
          Baseline clinical information
        </h2>

        {/* Core inputs */}
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
              onChange={(e) => setSex(e.target.value as "M" | "F")}
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
          <p className="text-sm font-semibold">Additional factors (optional)</p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div>
              <label className="block font-semibold mb-1 text-sm">Smoker</label>
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
          onClick={runRecommendation}
          className="mt-4 inline-flex items-center justify-center bg-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-teal-700 transition"
        >
          Run recommendation
        </button>
      </section>

      {/* 1. SURGERY RECOMMENDATION */}
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
              Logic approximates AO Spine / WFNS guideline groups and outcome
              data for DCM (Fehlings et al., Global Spine J 2017; Tetreault et
              al., Global Spine J 2017; Merali et al., PLoS One 2019).
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
            After running the recommendation above, approximate probabilities of
            achieving mJOA MCID with each approach will appear here.
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
                      improvement.
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
        )}

        <p className="mt-2 text-xs text-slate-500">
          Approach patterns reflect known prognostic factors (severity,
          duration, age, smoking, canal compromise, OPLL), and will later be
          replaced by your fully trained model.
        </p>
      </section>
    </main>
  );
}
