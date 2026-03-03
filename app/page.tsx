// app/page.tsx
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top hero with centered logo + clinic name */}
      <header className="border-b border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col items-center text-center gap-4">
          {/* Logo */}
          <div className="flex items-center justify-center">
            <div className="relative h-14 w-64">
              <Image
                src="/ascension-seton-logo.png"
                alt="Ascension Seton"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Clinic name */}
          <div className="space-y-1">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Ascension Texas Spine and Scoliosis
            </h1>
            <p className="text-sm md:text-base text-slate-600">
              Degenerative Cervical Myelopathy Decision-Support Tool
            </p>
          </div>
        </div>
      </header>

      {/* Main body */}
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        {/* Intro card */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 px-6 md:px-10 py-8 md:py-10">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-slate-900">
            DCM Surgical Decision Support
          </h2>
          <p className="text-sm md:text-base text-slate-700 mb-6 leading-relaxed">
            This tool supports discussions about{" "}
            <strong>when to offer surgery</strong> and{" "}
            <strong>which approach may provide the highest chance of meaningful improvement</strong>{" "}
            in degenerative cervical myelopathy (DCM). It integrates AO Spine / WFNS guideline
            concepts with synthetic outcome patterns derived from published surgical cohorts and
            will later be calibrated on prospectively collected Ascension Texas cases.
          </p>

          {/* Two-column questions */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {/* Question 1 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-5 md:px-6 md:py-6 text-sm md:text-base">
              <h3 className="text-slate-900 font-semibold mb-3">
                1. Should this patient undergo surgery?
              </h3>
              <p className="mb-3">
                Uses baseline <strong>mJOA</strong>,{" "}
                <strong>symptom duration</strong>, and{" "}
                <strong>MRI cord signal / canal compromise</strong> to classify patients as:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <strong>“Surgery recommended”</strong> – typically moderate–severe or progressive
                  DCM, or mild DCM with high-risk markers.{" "}
                  <span className="text-xs text-slate-500">
                    (Fehlings et al., Global Spine J 2017; Tetreault et al., Neurosurgery 2021)
                  </span>
                </li>
                <li>
                  <strong>“Consider surgery”</strong> – mild DCM with risk markers or
                  patient-prioritized goals.
                </li>
                <li>
                  <strong>“Non-operative trial reasonable”</strong> – carefully selected mild cases
                  with structured follow-up and surveillance imaging.
                </li>
              </ul>
            </div>

            {/* Question 2 */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-5 py-5 md:px-6 md:py-6 text-sm md:text-base">
              <h3 className="text-slate-900 font-semibold mb-3">
                2. If surgery is offered, which approach?
              </h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  Compares modeled probability of achieving{" "}
                  <strong>clinically meaningful mJOA improvement (MCID)</strong> with anterior,
                  posterior, and circumferential procedures.
                </li>
                <li>
                  Patterns reflect prognostic factors such as baseline severity, duration, age,
                  smoking, multilevel disease, OPLL, canal compromise, and MRI cord signal.{" "}
                  <span className="text-xs text-slate-500">
                    (Tetreault et al., Global Spine J 2017; Merali et al., PLoS One 2019)
                  </span>
                </li>
                <li>
                  Literature-based rules (e.g., fixed kyphosis, extensive OPLL, multilevel
                  compression) can override small modeled differences when appropriate.
                </li>
              </ul>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8">
            <Link
              href="/prototype"
              className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm md:text-base font-medium text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              Launch decision-support view →
            </Link>
          </div>
        </section>

        {/* References */}
        <section className="bg-white rounded-3xl shadow-sm border border-slate-200 px-6 md:px-10 py-6 md:py-7">
          <h3 className="text-base md:text-lg font-semibold mb-3">
            Key references informing the current logic
          </h3>
          <ul className="text-xs md:text-sm text-slate-700 space-y-1.5">
            <li>
              Fehlings MG, et al. <em>A Clinical Practice Guideline for the Management of Patients
              With Degenerative Cervical Myelopathy.</em> Global Spine J. 2017.
            </li>
            <li>
              Tetreault L, et al.{" "}
              <em>
                Change in Function, Pain, and Quality of Life Following Operative Treatment for DCM.
              </em>{" "}
              Global Spine J. 2017.
            </li>
            <li>
              Merali Z, et al.{" "}
              <em>
                Using a Machine Learning Approach to Predict Outcome After Surgery for DCM.
              </em>{" "}
              PLoS One. 2019.
            </li>
            <li>
              Matz PG, Fehlings MG, et al.{" "}
              <em>The Natural History of Cervical Spondylotic Myelopathy.</em> J Neurosurg Spine.
              2009.
            </li>
            <li>
              Gulati S, et al.{" "}
              <em>Surgery for Degenerative Cervical Myelopathy: A Practical Overview.</em>{" "}
              Neurosurgery. 2021.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
