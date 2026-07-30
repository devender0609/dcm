"use client"

import Link from "next/link"
import { useState } from "react"
import {
  calculateOutputs,
  classifySeverity,
  type CanalCategory,
  type Outputs,
  type T2Signal,
} from "@/lib/dcmEngine"

type YesNo = "Yes" | "No"

interface FormState {
  age: number
  sex: "M" | "F"
  mjoa: number
  symptomDuration: number
  t2Signal: T2Signal
  plannedLevels: number
  canalRatio: CanalCategory
  opll: YesNo
  t1Hypo: YesNo
  gait: YesNo
  smoker: YesNo
  psych: YesNo
  ndi: number
  sf36Pcs: number
  sf36Mcs: number
}

const fieldClass = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"

export default function PrototypePage() {
  const [form, setForm] = useState<FormState>({
    age: 65,
    sex: "M",
    mjoa: 13,
    symptomDuration: 12,
    t2Signal: "multilevel",
    plannedLevels: 3,
    canalRatio: "50-60%",
    opll: "No",
    t1Hypo: "No",
    gait: "Yes",
    smoker: "No",
    psych: "No",
    ndi: 40,
    sf36Pcs: 32,
    sf36Mcs: 45,
  })
  const [result, setResult] = useState<Outputs | null>(null)

  const setNumber = (key: keyof FormState, value: string) => {
    const number = Number(value)
    if (!Number.isNaN(number)) setForm((current) => ({ ...current, [key]: number }))
  }

  const runFramework = (event: React.FormEvent) => {
    event.preventDefault()
    setResult(
      calculateOutputs({
        mjoa: form.mjoa,
        symptomDuration: form.symptomDuration,
        t2Signal: form.t2Signal,
        plannedLevels: form.plannedLevels,
        canalRatio: form.canalRatio,
        opll: form.opll === "Yes",
        t1Hypointensity: form.t1Hypo === "Yes",
        gaitImpairment: form.gait === "Yes",
      }),
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl space-y-6 px-5 py-6 md:px-8 md:py-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-900">← Back to overview</Link>
          <span className="hidden text-xs text-slate-500 md:block">Ascension Texas Spine and Scoliosis</span>
        </div>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Research prototype</p>
          <h1 className="text-2xl font-semibold md:text-3xl">Hybrid DCM Decision-Support Framework</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Guideline-informed rules and synthetic-cohort outcome summaries. Outputs preserve uncertainty and should not be used as patient-level clinical predictions.
          </p>
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
            Not clinically validated. Do not use as a substitute for complete neurologic examination, imaging review, or surgeon judgment.
          </div>
        </section>

        <form onSubmit={runFramework} className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-xl font-semibold">Patient inputs</h2>
            <p className="mt-1 text-xs text-slate-500">Fields used by the published framework are marked as model inputs; additional fields are retained for documentation only.</p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Field label="Age (documentation)"><input className={fieldClass} type="number" min={18} max={100} value={form.age} onChange={(e) => setNumber("age", e.target.value)} /></Field>
              <Field label="Sex (documentation)"><select className={fieldClass} value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value as "M" | "F" })}><option value="M">Male</option><option value="F">Female</option></select></Field>
              <Field label="Baseline mJOA (model input)"><input className={fieldClass} type="number" min={0} max={18} step={1} value={form.mjoa} onChange={(e) => setNumber("mjoa", e.target.value)} /></Field>
              <Field label="Severity (automatic)"><div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm">{classifySeverity(form.mjoa)}</div></Field>
              <Field label="Symptom duration, months (model input)"><input className={fieldClass} type="number" min={0} max={240} value={form.symptomDuration} onChange={(e) => setNumber("symptomDuration", e.target.value)} /></Field>
              <Field label="Levels for operative planning (model input)"><input className={fieldClass} type="number" min={1} max={8} value={form.plannedLevels} onChange={(e) => setNumber("plannedLevels", e.target.value)} /></Field>
              <Field label="T2 signal pattern (model input)"><select className={fieldClass} value={form.t2Signal} onChange={(e) => setForm({ ...form, t2Signal: e.target.value as T2Signal })}><option value="none">None</option><option value="focal">Focal</option><option value="multilevel">Multilevel</option></select></Field>
              <Field label="Canal-occupying ratio (model input)"><select className={fieldClass} value={form.canalRatio} onChange={(e) => setForm({ ...form, canalRatio: e.target.value as CanalCategory })}><option value="<50%">&lt;50%</option><option value="50-60%">50–60%</option><option value=">60%">&gt;60%</option></select></Field>
              <YesNoField label="OPLL (model input)" value={form.opll} setValue={(value) => setForm({ ...form, opll: value })} />
              <YesNoField label="T1 hypointensity (model input)" value={form.t1Hypo} setValue={(value) => setForm({ ...form, t1Hypo: value })} />
              <YesNoField label="Gait impairment (model input)" value={form.gait} setValue={(value) => setForm({ ...form, gait: value })} />
              <YesNoField label="Smoking (documentation)" value={form.smoker} setValue={(value) => setForm({ ...form, smoker: value })} />
              <YesNoField label="Psychiatric comorbidity (documentation)" value={form.psych} setValue={(value) => setForm({ ...form, psych: value })} />
              <Field label="NDI (documentation)"><input className={fieldClass} type="number" min={0} max={100} value={form.ndi} onChange={(e) => setNumber("ndi", e.target.value)} /></Field>
              <Field label="SF-36 PCS (documentation)"><input className={fieldClass} type="number" min={0} max={100} value={form.sf36Pcs} onChange={(e) => setNumber("sf36Pcs", e.target.value)} /></Field>
              <Field label="SF-36 MCS (documentation)"><input className={fieldClass} type="number" min={0} max={100} value={form.sf36Mcs} onChange={(e) => setNumber("sf36Mcs", e.target.value)} /></Field>
            </div>

            <button type="submit" className="mt-7 w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">Generate framework output</button>
          </section>

          <section className="space-y-6">
            {!result ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Complete the inputs and generate the framework output.</div>
            ) : (
              <>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Treatment category</p>
                  <h2 className="mt-2 text-2xl font-semibold text-emerald-800">{result.treatmentCategory}</h2>
                  <p className="mt-2 text-sm text-slate-600">Severity: <strong>{result.severity}</strong></p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Metric title="Neurologic-risk score" value={`${result.neurologicRiskScore}/100`} detail="Relative heuristic score; not a percentage or time-specific probability." />
                  <Metric title="Severity-specific mJOA MCID" value={`${result.probabilityMCID.toFixed(1)}%`} detail="Synthetic-cohort proportion achieving the severity-specific MCID threshold." />
                  <Metric title="Postoperative mJOA ≥16" value={`${result.probabilityState.toFixed(1)}%`} detail="Synthetic-cohort favorable-state proportion, distinct from MCID." />
                  <Metric title="Mean postoperative mJOA" value={result.meanPostoperativeMjoa.toFixed(1)} detail="Severity-stratified simulated 12-month mean." />
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Broad surgical corridor</p>
                  <h3 className="mt-2 text-lg font-semibold">{result.corridor ?? "Not assigned because operative management was not favored or recommended"}</h3>
                  <p className="mt-2 text-xs leading-5 text-slate-500">Posterior favored does not distinguish laminoplasty from posterior decompression with fusion.</p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                  <h3 className="font-semibold">Framework rationale</h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-700">{result.rationale.map((item) => <li key={item} className="flex gap-2"><span>•</span><span>{item}</span></li>)}</ul>
                </div>

                <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6">
                  <h3 className="font-semibold text-rose-900">Required interpretation limits</h3>
                  <ul className="mt-3 space-y-2 text-xs leading-5 text-rose-900">{result.limitations.map((item) => <li key={item} className="flex gap-2"><span>•</span><span>{item}</span></li>)}</ul>
                </div>

                <button type="button" onClick={() => window.print()} className="w-full rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold hover:bg-slate-100">Print / save summary as PDF</button>
              </>
            )}
          </section>
        </form>
      </div>
    </main>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-600">{label}</span>{children}</label>
}

function YesNoField({ label, value, setValue }: { label: string; value: YesNo; setValue: (value: YesNo) => void }) {
  return <Field label={label}><select className={fieldClass} value={value} onChange={(e) => setValue(e.target.value as YesNo)}><option value="No">No</option><option value="Yes">Yes</option></select></Field>
}

function Metric({ title, value, detail }: { title: string; value: string; detail: string }) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p><p className="mt-2 text-2xl font-semibold">{value}</p><p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p></div>
}
