
"use client"
import { useState } from "react"
import { calculateOutputs } from "@/lib/dcmEngine"

export default function PrototypePage() {
  const [mjoa, setMjoa] = useState(12)
  const [result, setResult] = useState<any>(null)

  const handleRun = () => {
    const outputs = calculateOutputs({ mjoa })
    setResult(outputs)
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Hybrid DCM Decision Support</h1>

      <label>Baseline mJOA:</label>
      <input
        type="number"
        value={mjoa}
        onChange={(e) => setMjoa(Number(e.target.value))}
      />

      <button onClick={handleRun}>Calculate</button>

      {result && (
        <div style={{ marginTop: 20 }}>
          <p><b>Severity:</b> {result.severity}</p>
          <p><b>Risk without surgery:</b> {result.riskWithoutSurgery}%</p>
          <p><b>Probability of MCID:</b> {result.probabilityMCID}%</p>
          <p><b>Probability of mJOA ≥16:</b> {result.probabilityState}%</p>
        </div>
      )}
    </div>
  )
}
