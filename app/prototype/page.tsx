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
type FieldType = "framework" | "recorded" | "automatic"

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

const fieldClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-700/10"

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
    <main className="min-h-screen bg-[#f5f7fa] text-slate-950">
      <div className="mx-auto max-w-[1380px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        <div className="mb-5 flex items-center justify-between print:hidden">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950">
            <span aria-hidden>←</span> Back to overview
          </Link>
          <span className="hidden text-xs font-medium text-slate-500 md:block">Ascension Texas Spine and Scoliosis</span>
        </div>

        <header className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
          <div className="border-l-[6px] border-teal-700 px-6 py-6 md:px-8 md:py-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-teal-800">Research prototype</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">Synthetic-cohort framework</span>
                </div>
                <h1 className="max-w-4xl text-2xl font-bold tracking-tight text-slate-950 md:text-[32px] md:leading-tight">
                  Hybrid DCM Decision-Support Framework
                </h1>
                <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-600">
                  Guideline-informed framework outputs and severity-stratified synthetic-cohort benchmarks for degenerative cervical myelopathy.
                </p>
              </div>
              <div className="max-w-lg rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3.5 text-xs leading-5 text-amber-950">
                <strong className="block font-semibold">Not clinically validated</strong>
                Do not use as a substitute for a complete neurologic examination, imaging review, or surgeon judgment.
              </div>
            </div>
          </div>
        </header>

        <form onSubmit={runFramework} className="mt-6 grid items-start gap-6 xl:grid-cols-[0.92fr_1.08fr]">
          <section className="rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)] xl:sticky xl:top-5">
            <div className="border-b border-slate-200 px-6 py-5 md:px-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">Clinical data entry</p>
                  <h2 className="mt-1 text-xl font-bold">Patient inputs</h2>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">Only fields labeled “Framework input” affect the displayed calculation.</p>
                </div>
                <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-600">mJOA {form.mjoa}/18</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                <LegendPill type="framework" />
                <LegendPill type="recorded" />
                <LegendPill type="automatic" />
              </div>
            </div>

            <div className="px-6 py-6 md:px-7">
              <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
                <Field label="Age" type="recorded"><input className={fieldClass} type="number" min={18} max={100} value={form.age} onChange={(e) => setNumber("age", e.target.value)} /></Field>
                <Field label="Sex" type="recorded"><select className={fieldClass} value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value as "M" | "F" })}><option value="M">Male</option><option value="F">Female</option></select></Field>
                <Field label="Baseline mJOA" type="framework"><input className={fieldClass} type="number" min={0} max={18} step={1} value={form.mjoa} onChange={(e) => setNumber("mjoa", e.target.value)} /></Field>
                <Field label="DCM severity" type="automatic"><div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-800">{classifySeverity(form.mjoa)}</div></Field>
                <Field label="Symptom duration, months" type="framework"><input className={fieldClass} type="number" min={0} max={240} value={form.symptomDuration} onChange={(e) => setNumber("symptomDuration", e.target.value)} /></Field>
                <Field label="Levels for operative planning" type="framework"><input className={fieldClass} type="number" min={1} max={8} value={form.plannedLevels} onChange={(e) => setNumber("plannedLevels", e.target.value)} /></Field>
                <Field label="T2 signal pattern" type="framework"><select className={fieldClass} value={form.t2Signal} onChange={(e) => setForm({ ...form, t2Signal: e.target.value as T2Signal })}><option value="none">None</option><option value="focal">Focal</option><option value="multilevel">Multilevel</option></select></Field>
                <Field label="Canal-occupying ratio" type="framework"><select className={fieldClass} value={form.canalRatio} onChange={(e) => setForm({ ...form, canalRatio: e.target.value as CanalCategory })}><option value="<50%">&lt;50%</option><option value="50-60%">50–60%</option><option value=">60%">&gt;60%</option></select></Field>
                <YesNoField label="OPLL" type="framework" value={form.opll} setValue={(value) => setForm({ ...form, opll: value })} />
                <YesNoField label="T1 hypointensity" type="framework" value={form.t1Hypo} setValue={(value) => setForm({ ...form, t1Hypo: value })} />
                <YesNoField label="Gait impairment" type="framework" value={form.gait} setValue={(value) => setForm({ ...form, gait: value })} />
                <YesNoField label="Smoking" type="recorded" value={form.smoker} setValue={(value) => setForm({ ...form, smoker: value })} />
                <YesNoField label="Psychiatric comorbidity" type="recorded" value={form.psych} setValue={(value) => setForm({ ...form, psych: value })} />
                <Field label="NDI" type="recorded"><input className={fieldClass} type="number" min={0} max={100} value={form.ndi} onChange={(e) => setNumber("ndi", e.target.value)} /></Field>
                <Field label="SF-36 PCS" type="recorded"><input className={fieldClass} type="number" min={0} max={100} value={form.sf36Pcs} onChange={(e) => setNumber("sf36Pcs", e.target.value)} /></Field>
                <Field label="SF-36 MCS" type="recorded"><input className={fieldClass} type="number" min={0} max={100} value={form.sf36Mcs} onChange={(e) => setNumber("sf36Mcs", e.target.value)} /></Field>
              </div>

              <button type="submit" className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-700/20">
                Apply research framework <span aria-hidden>→</span>
              </button>
            </div>
          </section>

          <section className="space-y-5" aria-live="polite">
            {!result ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500">↗</div>
                <h2 className="mt-4 text-lg font-semibold text-slate-800">Framework output</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Review the inputs, then select “Apply research framework” to view the research summary.</p>
              </div>
            ) : (
              <>
                <div className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-xs leading-5 text-blue-950">
                  <strong className="block text-sm font-semibold">Research prototype output</strong>
                  The values below describe framework behavior and severity-stratified synthetic-cohort results. They are not individualized clinical predictions.
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
                  <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4 md:px-7">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Framework management category</p>
                  </div>
                  <div className="px-6 py-6 md:px-7">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h2 className="max-w-2xl text-2xl font-bold leading-tight text-teal-800">{result.treatmentCategory}</h2>
                        <p className="mt-2 text-sm text-slate-600">Guideline-informed category generated by the research framework; not an individual treatment recommendation.</p>
                      </div>
                      <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">Severity: {result.severity}</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Metric
                    title="Relative neurologic-concern index"
                    value={`${result.neurologicRiskScore} of 100`}
                    detail="Additive heuristic index; not a probability of deterioration and not linked to a defined time horizon."
                    emphasized
                  />
                  <Metric
                    title="Synthetic-cohort MCID benchmark"
                    value={`${result.probabilityMCID.toFixed(1)}%`}
                    detail={`${result.severity}-DCM subgroup proportion achieving the severity-specific mJOA MCID threshold; not an individualized estimate.`}
                  />
                  <Metric
                    title="Synthetic-cohort favorable-state benchmark"
                    value={`${result.probabilityState.toFixed(1)}%`}
                    detail={`${result.severity}-DCM subgroup proportion with postoperative mJOA ≥16; distinct from MCID and not an individualized estimate.`}
                  />
                  <Metric
                    title="Synthetic-cohort mean postoperative mJOA"
                    value={result.meanPostoperativeMjoa.toFixed(1)}
                    detail={`Descriptive 12-month mean for the ${result.severity.toLowerCase()}-DCM subgroup in the literature-informed synthetic cohort.`}
                  />
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)] md:p-7">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg text-slate-600">⇄</div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Broad surgical-corridor phenotype</p>
                      <h3 className="mt-2 text-lg font-bold leading-7 text-slate-900">{result.corridor ?? "Not assigned because operative management was not favored or recommended"}</h3>
                      <p className="mt-2 text-xs leading-5 text-slate-500">Corridor classification is considered only when the framework categorizes surgery as favored or recommended. A posterior-favored designation does not distinguish laminoplasty from posterior decompression with fusion.</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)] md:p-7">
                    <h3 className="text-base font-bold text-slate-900">Framework rationale</h3>
                    <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                      {result.rationale.map((item) => <li key={item} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-700" /><span>{item}</span></li>)}
                    </ul>
                  </div>

                  <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-6 md:p-7">
                    <h3 className="text-base font-bold text-rose-950">Required interpretation limits</h3>
                    <ul className="mt-4 space-y-3 text-xs leading-5 text-rose-950">
                      {result.limitations.map((item) => <li key={item} className="flex gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-700" /><span>{item}</span></li>)}
                    </ul>
                  </div>
                </div>

                <button type="button" onClick={() => window.print()} className="print:hidden w-full rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-800 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200">
                  Print or save research summary as PDF
                </button>
              </>
            )}
          </section>
        </form>
      </div>
    </main>
  )
}

function Field({ label, type, children }: { label: string; type: FieldType; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 flex min-h-5 items-center justify-between gap-2 text-xs font-semibold text-slate-700"><span>{label}</span><FieldBadge type={type} /></span>{children}</label>
}

function YesNoField({ label, type, value, setValue }: { label: string; type: FieldType; value: YesNo; setValue: (value: YesNo) => void }) {
  return <Field label={label} type={type}><select className={fieldClass} value={value} onChange={(e) => setValue(e.target.value as YesNo)}><option value="No">No</option><option value="Yes">Yes</option></select></Field>
}

function FieldBadge({ type }: { type: FieldType }) {
  const styles = {
    framework: "border-teal-200 bg-teal-50 text-teal-800",
    recorded: "border-slate-200 bg-slate-50 text-slate-500",
    automatic: "border-blue-200 bg-blue-50 text-blue-700",
  }
  const labels = { framework: "Framework input", recorded: "Recorded only", automatic: "Automatic" }
  return <span className={`hidden shrink-0 rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide sm:inline ${styles[type]}`}>{labels[type]}</span>
}

function LegendPill({ type }: { type: FieldType }) {
  const text = type === "framework" ? "Framework input" : type === "recorded" ? "Recorded, not calculated" : "Automatically derived"
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-slate-600"><span className={`h-2 w-2 rounded-full ${type === "framework" ? "bg-teal-600" : type === "recorded" ? "bg-slate-400" : "bg-blue-500"}`} />{text}</span>
}

function Metric({ title, value, detail, emphasized = false }: { title: string; value: string; detail: string; emphasized?: boolean }) {
  return <div className={`rounded-3xl border bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] md:p-6 ${emphasized ? "border-teal-200 ring-1 ring-teal-100" : "border-slate-200"}`}><p className={`text-[11px] font-bold uppercase tracking-[0.12em] ${emphasized ? "text-teal-700" : "text-slate-500"}`}>{title}</p><p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p><p className="mt-2.5 text-xs leading-5 text-slate-500">{detail}</p></div>
}
