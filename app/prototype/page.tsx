"use client";

import { useState } from "react";

type ApproachKey = "anterior" | "posterior" | "circumferential";

type Result = Record<ApproachKey, string>;

export default function Prototype() {
  const [age, setAge] = useState("");
  const [severity, setSeverity] = useState<"mild" | "moderate" | "severe">(
    "mild"
  );

  const calculate = (): Result => {
    // Mock values only – replace with real engine later
    return {
      anterior: (Math.random() * 0.3 + 0.6).toFixed(3),
      posterior: (Math.random() * 0.3 + 0.4).toFixed(3),
      circumferential: (Math.random() * 0.3 + 0.3).toFixed(3),
    };
  };

  const result = calculate();
  const approaches: ApproachKey[] = [
    "anterior",
    "posterior",
    "circumferential",
  ];

  return (
    <main className="px-8 pt-14 pb-24 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 gradient-text">
        Prototype — Single Patient Input
      </h1>

      <div className="glass mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="font-semibold block mb-1">Age</label>
            <input
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-sm"
              placeholder="Enter patient age"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Severity</label>
            <select
              value={severity}
              onChange={(e) =>
                setSeverity(e.target.value as "mild" | "moderate" | "severe")
              }
              className="w-full p-2 rounded bg-slate-800 border border-slate-700 text-sm"
            >
              <option value="mild">Mild</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass">
        <h2 className="text-xl font-bold mb-4">Estimated Probabilities</h2>

        <p className="opacity-75 mb-4 text-sm">
          *Mock values for demonstration only — no clinical engine connected
          yet*
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {approaches.map((k) => (
            <div
              key={k}
              className="p-4 rounded-xl bg-slate-800 border border-slate-700"
            >
              <p className="capitalize text-sm mb-1">{k}</p>
              <p className="text-2xl font-bold">{result[k]}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
