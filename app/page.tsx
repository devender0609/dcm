import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-sky-50 to-slate-100 px-6 md:px-10 py-8 md:py-12">
      {/* Header: logo + clinic name centered */}
      <header className="max-w-5xl mx-auto mb-10 md:mb-12">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center justify-center gap-2">
            <div className="relative h-10 md:h-12 w-auto">
              <Image
                src="/logo_new.png"
                alt="Ascension Seton"
                width={280}
                height={48}
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900">
              Ascension Texas Spine and Scoliosis
            </h1>
            <p className="mt-1 text-sm md:text-base text-slate-600">
              Degenerative Cervical Myelopathy Decision-Support Tool
            </p>
          </div>
        </div>
      </header>

      {/* Main card */}
      <section className="max-w-5xl mx-auto space-y-8">
        <div className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-sm rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
              DCM Surgical Decision Support
            </h2>
            <p className="mt-2 text-sm md:text-base text-slate-700">
              This tool supports discussions about{" "}
              <strong>when to offer surgery</strong> and{" "}
              <strong>which approach may provide the highest chance of
              meaningful improvement</strong> in degenerative cervical
              myelopathy (DCM). It is grounded in AO Spine / WFNS guideline
              concepts and major surgical outcome cohorts and will be
              calibrated on prospectively collected Ascension Texas data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-sm md:text-base">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5 space-y-2">
              <h3 className="font-semibold text-slate-900 mb-1">
                1. Should this patient undergo surgery?
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>
                  Uses baseline <strong>mJOA</strong>,
                  <strong> symptom duration</strong>, and{" "}
                  <strong>MRI cord signal</strong> to classify patients as:
                </li>
                <li>
                  <strong>“Surgery recommended”</strong> – typically
                  moderate–severe or progressive DCM.{" "}
                  <span className="text-xs text-slate-500">
                    (Fehlings et al., Global Spine J 2017; Gulati et al.,
                    Neurosurgery 2021)
                  </span>
                </li>
                <li>
                  <strong>“Consider surgery”</strong> – mild DCM with risk
                  markers or patient-prioritized goals.
                </li>
                <li>
                  <strong>“Non-operative trial reasonable”</strong> – carefully
                  selected mild cases, with structured follow-up.
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5 space-y-2">
              <h3 className="font-semibold text-slate-900 mb-1">
                2. If surgery is offered, which approach?
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                <li>
                  Compares modeled probability of achieving{" "}
                  <strong>clinically meaningful mJOA improvement (MCID)</strong>{" "}
                  after anterior, posterior, and circumferential approaches.
                </li>
                <li>
                  Patterns reflect prognostic factors such as baseline severity,
                  duration, age, smoking, canal compromise, OPLL, and MRI
                  signal.
                  <span className="text-xs text-slate-500">
                    {" "}
                    (Tetreault et al., Global Spine J 2017; Merali et al., PLoS
                    One 2019)
                  </span>
                </li>
                <li>
                  Literature-based rules (e.g., kyphosis, multilevel disease,
                  OPLL) can override small modeled differences when appropriate.
                </li>
              </ul>
            </div>
          </div>

          <div>
            <Link
              href="/prototype"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-2xl bg-teal-600 text-white text-sm md:text-base font-semibold shadow hover:bg-teal-700 transition"
            >
              Launch decision-support view →
            </Link>
          </div>
        </div>

        {/* References */}
        <div className="bg-white/70 backdrop-blur-xl border border-slate-200 shadow-sm rounded-3xl p-5 md:p-6">
          <h3 className="text-sm md:text-base font-semibold text-slate-900 mb-3">
            Key references informing the current logic
          </h3>
          <ul className="list-disc pl-5 text-xs md:text-sm text-slate-700 space-y-1.5">
            <li>
              Fehlings MG, et al.{" "}
              <em>
                A Clinical Practice Guideline for the Management of Patients
                With Degenerative Cervical Myelopathy.
              </em>{" "}
              Global Spine J. 2017.
            </li>
            <li>
              Tetreault L, et al.{" "}
              <em>
                Change in Function, Pain, and Quality of Life Following Operative
                Treatment for DCM.
              </em>{" "}
              Global Spine J. 2017.
            </li>
            <li>
              Merali Z, et al.{" "}
              <em>
                Using a Machine Learning Approach to Predict Outcome After
                Surgery for DCM.
              </em>{" "}
              PLoS One. 2019.
            </li>
            <li>
              Matz PG, Fehlings MG, et al.{" "}
              <em>
                The Natural History of Cervical Spondylotic Myelopathy.
              </em>{" "}
              J Neurosurg Spine. 2009.
            </li>
            <li>
              Gulati S, et al.{" "}
              <em>
                Surgery for Degenerative Cervical Myelopathy: A Practical
                Overview.
              </em>{" "}
              Neurosurgery. 2021.
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
