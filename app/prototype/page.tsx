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

                <KeyFindingBanner result={result} />

                <ClinicalSummary result={result} />

                <OutputDrivers result={result} />

                <CompactSeverityComparison currentSeverity={result.severity} />

                <PlanningBoundaries corridor={result.corridor} />

                <details className="group rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 md:px-7">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Additional research context</p>
                      <h3 className="mt-1 text-base font-bold text-slate-950">Cohort distribution and interpretation limits</h3>
                    </div>
                    <span className="text-lg text-slate-400 transition group-open:rotate-180" aria-hidden>⌄</span>
                  </summary>
                  <div className="grid gap-6 border-t border-slate-100 px-6 pb-6 pt-5 md:px-7 md:pb-7 lg:grid-cols-2">
                    <TreatmentDistributionChart currentCategory={result.treatmentCategory} embedded />
                    <div>
                      <h4 className="text-sm font-bold text-rose-950">Required interpretation limits</h4>
                      <ul className="mt-3 space-y-2.5 text-xs leading-5 text-slate-700">
                        {result.limitations.map((item) => <li key={item} className="flex gap-2.5"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-600" /><span>{item}</span></li>)}
                      </ul>
                    </div>
                  </div>
                </details>

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


function KeyFindingBanner({ result }: { result: Outputs }) {
  const favorableText = result.severity === "Severe"
    ? "Meaningful improvement remains possible, while reaching postoperative mJOA ≥16 was uncommon in the severe synthetic subgroup."
    : result.severity === "Moderate"
      ? "Meaningful improvement was common in the moderate synthetic subgroup, while about half reached postoperative mJOA ≥16."
      : "Both meaningful improvement and postoperative mJOA ≥16 were common in the mild synthetic subgroup."
  return (
    <section className="rounded-2xl border border-teal-200 bg-teal-50/80 px-5 py-4 shadow-sm">
      <div className="flex gap-3">
        <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white" aria-hidden>✓</span>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-teal-800">Key framework finding</p>
          <p className="mt-1 text-sm leading-6 text-teal-950"><strong>{result.severity} DCM</strong> with a <strong>{result.neurologicRiskScore}/100</strong> relative neurologic-concern index; <strong>{result.treatmentCategory.toLowerCase()}</strong> by the research framework. {favorableText}</p>
        </div>
      </div>
    </section>
  )
}

function ClinicalSummary({ result }: { result: Outputs }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
      <div className="border-b border-slate-200 bg-slate-50/70 px-6 py-4 md:px-7">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Clinical framework summary</p>
      </div>
      <div className="px-6 py-5 md:px-7">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold leading-tight text-teal-800">{result.treatmentCategory}</h2>
            <p className="mt-1.5 text-xs leading-5 text-slate-500">Guideline-informed framework category; not an individual treatment recommendation.</p>
          </div>
          <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700">{result.severity} DCM</span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <CompactStat label="Neurologic-concern index" value={`${result.neurologicRiskScore}/100`} note="Heuristic index · not probability" tone="teal" />
          <CompactStat label="Meaningful improvement" value={`${result.probabilityMCID.toFixed(1)}%`} note="Severity-specific MCID benchmark" tone="emerald" />
          <CompactStat label="Favorable neurologic state" value={`${result.probabilityState.toFixed(1)}%`} note="Postoperative mJOA ≥16 benchmark" tone="indigo" />
          <CompactStat label="Mean postoperative mJOA" value={result.meanPostoperativeMjoa.toFixed(1)} note="Synthetic 12-month subgroup mean" tone="slate" />
        </div>
        <p className="mt-4 text-[11px] leading-5 text-slate-500">Cohort benchmarks are descriptive synthetic-cohort results, not individualized estimates. The neurologic-concern index is not a probability and has no defined time horizon.</p>
      </div>
    </section>
  )
}

function CompactStat({ label, value, note, tone }: { label: string; value: string; note: string; tone: "teal" | "emerald" | "indigo" | "slate" }) {
  const styles = {
    teal: "border-teal-200 bg-teal-50/60 text-teal-900",
    emerald: "border-emerald-200 bg-emerald-50/60 text-emerald-900",
    indigo: "border-indigo-200 bg-indigo-50/60 text-indigo-900",
    slate: "border-slate-200 bg-slate-50/70 text-slate-900",
  }
  return <div className={`rounded-2xl border px-4 py-3.5 ${styles[tone]}`}><p className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-70">{label}</p><p className="mt-1 text-2xl font-bold tracking-tight">{value}</p><p className="mt-1 text-[11px] leading-4 opacity-70">{note}</p></div>
}

function OutputDrivers({ result }: { result: Outputs }) {
  const visible = result.riskComponents.filter((component) => component.value !== 0)
  const primaryValue = Math.max(...visible.map((component) => Math.abs(component.value)))
  const rationaleByLabel = new Map<string, string>()
  result.rationale.forEach((item) => {
    const lower = item.toLowerCase()
    if (lower.includes("severity") || lower.includes("mjoa")) rationaleByLabel.set("Baseline severity", item)
    else if (lower.includes("gait")) rationaleByLabel.set("Gait impairment", item)
    else if (lower.includes("t2")) rationaleByLabel.set("T2 signal pattern", item)
    else if (lower.includes("t1")) rationaleByLabel.set("T1 hypointensity", item)
    else if (lower.includes("opll")) rationaleByLabel.set("OPLL", item)
    else if (lower.includes("canal")) rationaleByLabel.set("Canal-occupying ratio", item)
    else if (lower.includes("duration")) rationaleByLabel.set("Symptom duration", item)
  })
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)] md:p-7">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-teal-700">Why this output was generated</p><h3 className="mt-1 text-lg font-bold text-slate-950">Active framework drivers</h3></div>
        <span className="text-sm font-bold text-slate-700">Total {result.neurologicRiskScore}/100</span>
      </div>
      <div className="mt-5 divide-y divide-slate-100">
        {visible.map((component) => {
          const negative = component.value < 0
          const width = Math.max(3, Math.abs(component.value))
          return <div key={component.label} className="grid gap-2 py-3 sm:grid-cols-[minmax(140px,0.9fr)_minmax(180px,1.6fr)_70px] sm:items-center">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-800"><span>{component.label}</span>{Math.abs(component.value) === primaryValue && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-800">Primary driver</span>}</div>
            <div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${negative ? "bg-blue-500" : "bg-teal-700"}`} style={{ width: `${width}%` }} /></div>
              <p className="mt-1 text-[11px] leading-4 text-slate-500">{rationaleByLabel.get(component.label) ?? "Prespecified additive framework contribution."}</p>
            </div>
            <div className={`text-right text-sm font-bold ${negative ? "text-blue-700" : "text-teal-800"}`}>{component.value > 0 ? "+" : ""}{component.value}</div>
          </div>
        })}
      </div>
      <p className="mt-3 text-[11px] leading-5 text-slate-500">Contribution bars reflect prespecified score weights, not independently estimated clinical effects.</p>
    </section>
  )
}

const severityBenchmarks = [
  { severity: "Mild", mcid: 94.2, state: 98.0, mean: 17.8 },
  { severity: "Moderate", mcid: 73.4, state: 48.4, mean: 15.8 },
  { severity: "Severe", mcid: 48.8, state: 2.2, mean: 11.8 },
] as const

function CompactSeverityComparison({ currentSeverity }: { currentSeverity: Outputs["severity"] }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)] md:p-7">
      <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Synthetic cohort comparison</p><h3 className="mt-1 text-lg font-bold text-slate-950">Outcomes by baseline DCM severity</h3></div>
      <div className="mt-4 rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-xs leading-5 text-sky-950"><strong>Meaningful improvement</strong> is change-based and uses severity-specific mJOA MCID thresholds. <strong>Favorable neurologic state</strong> is state-based and requires postoperative mJOA ≥16.</div>
      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">
        <div className="hidden grid-cols-[1.1fr_1fr_1fr_0.8fr] bg-slate-50 px-4 py-2 text-[10px] font-bold uppercase tracking-wide text-slate-500 sm:grid">
          <span>Severity</span><span>Meaningful improvement</span><span>Favorable state</span><span>Mean postop mJOA</span>
        </div>
        {severityBenchmarks.map((row) => {
          const active = row.severity === currentSeverity
          return <div key={row.severity} className={`grid gap-3 border-t border-slate-100 px-4 py-3 first:border-t-0 sm:grid-cols-[1.1fr_1fr_1fr_0.8fr] sm:items-center ${active ? "bg-teal-50/70" : "bg-white"}`}>
            <div className="flex items-center justify-between gap-2"><span className="text-sm font-bold text-slate-900">{row.severity}</span>{active && <span className="rounded-full bg-teal-700 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white">Current</span>}</div>
            <MiniBar label="Meaningful improvement" value={row.mcid} tone="teal" />
            <MiniBar label="Favorable neurologic state" value={row.state} tone="indigo" />
            <div><span className="sm:hidden text-[10px] font-bold uppercase text-slate-500">Mean postop mJOA · </span><span className="text-sm font-bold text-slate-900">{row.mean.toFixed(1)}</span></div>
          </div>
        })}
      </div>
      <p className="mt-4 text-[11px] leading-5 text-slate-500">Descriptive 12-month synthetic-cohort results; not individualized predictions.</p>
    </section>
  )
}

function MiniBar({ label, value, tone }: { label: string; value: number; tone: "teal" | "indigo" }) {
  return <div><div className="mb-1 flex justify-between gap-2 text-[11px] sm:hidden"><span className="text-slate-500">{label}</span><strong>{value.toFixed(1)}%</strong></div><div className="flex items-center gap-2"><div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200"><div className={`h-full rounded-full ${tone === "teal" ? "bg-teal-700" : "bg-indigo-500"}`} style={{ width: `${value}%` }} /></div><span className="hidden w-12 text-right text-xs font-bold text-slate-900 sm:block">{value.toFixed(1)}%</span></div></div>
}

function PlanningBoundaries({ corridor }: { corridor: Outputs["corridor"] }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_10px_35px_rgba(15,23,42,0.05)] md:p-7">
      <div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Clinical planning readiness</p><h3 className="mt-1 text-lg font-bold text-slate-950">What the framework can—and cannot—support</h3></div>
      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <StatusTile title="Management category available" status="Available" tone="teal" />
        <StatusTile title="Broad corridor phenotype" status={corridor ?? "Not assigned"} tone={corridor ? "teal" : "amber"} />
        <StatusTile title="Procedure-level planning" status="Incomplete" tone="amber" />
      </div>
      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-xs font-bold text-amber-950">Additional planning review still required</p>
        <p className="mt-1.5 text-xs leading-5 text-amber-900">Compression direction, cervical alignment, K-line status, instability, axial pain, bone quality, and detailed OPLL morphology are not fully represented. A posterior-favored designation does not distinguish laminoplasty from posterior decompression with fusion.</p>
      </div>
    </section>
  )
}

function StatusTile({ title, status, tone }: { title: string; status: string; tone: "teal" | "amber" }) {
  const styles = tone === "teal" ? "border-teal-200 bg-teal-50 text-teal-900" : "border-amber-200 bg-amber-50 text-amber-950"
  return <div className={`rounded-2xl border px-4 py-3 ${styles}`}><p className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-70">{title}</p><p className="mt-1 text-sm font-bold">{status}</p></div>
}

const treatmentDistribution = [
  { category: "Surgery recommended", value: 69.2 },
  { category: "Surgery favored", value: 11.4 },
  { category: "Shared decision-making / structured rehabilitation", value: 19.0 },
  { category: "Structured rehabilitation with surveillance", value: 0.4 },
] as const

function TreatmentDistributionChart({ currentCategory, embedded = false }: { currentCategory: Outputs["treatmentCategory"]; embedded?: boolean }) {
  const content = <div>
    <h4 className="text-sm font-bold text-slate-900">Management-category distribution in the synthetic development cohort</h4>
    <p className="mt-1.5 text-[11px] leading-5 text-slate-500">Cohort-level framework classifications, not patient-specific probabilities or observed treatment rates.</p>
    <div className="mt-4 space-y-3">
      {treatmentDistribution.map((row) => {
        const active = row.category === currentCategory
        return <div key={row.category}><div className="mb-1 flex items-start justify-between gap-3 text-[11px]"><span className={active ? "font-semibold text-teal-900" : "text-slate-700"}>{row.category}{active ? " · current category" : ""}</span><strong>{row.value.toFixed(1)}%</strong></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${active ? "bg-teal-700" : "bg-slate-400"}`} style={{ width: `${Math.max(row.value, 1)}%` }} /></div></div>
      })}
    </div>
  </div>
  if (embedded) return content
  return <details className="group rounded-3xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 md:px-7"><span className="text-base font-bold text-slate-950">Research cohort context</span><span className="text-lg text-slate-400 transition group-open:rotate-180" aria-hidden>⌄</span></summary><div className="border-t border-slate-100 px-6 pb-6 pt-5 md:px-7 md:pb-7">{content}</div></details>
}

