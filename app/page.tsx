import Image from "next/image"
import Link from "next/link"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-8 text-center">
          <div className="relative h-14 w-64"><Image src="/ascension-seton-logo.png" alt="Ascension Seton" fill className="object-contain" priority /></div>
          <div><h1 className="text-3xl font-semibold md:text-4xl">Ascension Texas Spine and Scoliosis</h1><p className="mt-1 text-sm text-slate-600">Hybrid Degenerative Cervical Myelopathy Decision-Support Framework</p></div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-7 px-6 py-10">
        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">In silico methodological platform</p>
          <h2 className="mt-3 text-2xl font-semibold md:text-3xl">Transparent, uncertainty-aware DCM framework</h2>
          <p className="mt-4 max-w-4xl text-sm leading-7 text-slate-700 md:text-base">
            This research prototype implements guideline-informed rules developed and internally evaluated in a literature-informed synthetic cohort of 200,000 virtual patients. It reports a relative neurologic-risk score, a four-category treatment recommendation, severity-specific mJOA MCID achievement, postoperative mJOA ≥16, and a broad surgical-corridor classification.
          </p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Info title="Treatment gradation" text="Moderate and severe DCM are operative anchors. Mild DCM retains surveillance, shared-decision, and surgery-favored categories." />
            <Info title="Distinct outcomes" text="MCID is a change-based endpoint; postoperative mJOA ≥16 is a favorable-state endpoint. They are not interchangeable." />
            <Info title="Uncertainty preserved" text="The corridor may be indeterminate when alignment, compression direction, K-line status, instability, or other planning variables are unavailable." />
          </div>
          <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950"><strong>Important:</strong> This prototype has not undergone external calibration or prospective clinical validation. The risk score is not a probability of deterioration and should not be interpreted as one.</div>
          <Link href="/prototype" className="mt-7 inline-flex rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700">Open research prototype →</Link>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-9">
          <h3 className="text-lg font-semibold">Framework boundaries</h3>
          <div className="mt-4 grid gap-5 text-sm leading-6 text-slate-700 md:grid-cols-2">
            <p>The neurologic-risk score is an additive 0–100 heuristic index using baseline severity, symptom duration, T2 signal pattern, canal compromise, OPLL, T1 hypointensity, and gait impairment. It has no calibrated probability interpretation or specified follow-up horizon.</p>
            <p>The broad corridor output does not distinguish laminoplasty from posterior decompression with fusion and cannot replace complete imaging review or individualized operative planning.</p>
          </div>
        </section>
      </div>
    </main>
  )
}

function Info({ title, text }: { title: string; text: string }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><h3 className="font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div>
}
