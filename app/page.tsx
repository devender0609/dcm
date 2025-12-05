import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="px-6 md:px-10 pt-8 md:pt-10 pb-20 max-w-6xl mx-auto space-y-10">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="logo-wrap">
            <Image
              src="/clinic-logo.png"
              width={190}
              height={70}
              alt="Ascension Seton logo"
              className="logo-merged"
              priority
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold leading-snug">
              Ascension Seton Spine Clinic
            </h1>
            <p className="text-sm md:text-base text-slate-600 mt-1">
              Degenerative Cervical Myelopathy Decision-Support Tool
            </p>
          </div>
        </div>
      </header>

      {/* MAIN EXPLANATION */}
      <section className="glass space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2 gradient-text">
            DCM Surgical Decision Support
          </h2>
          <p className="text-sm md:text-base text-slate-700 max-w-3xl">
            This tool is being developed to support discussions about{" "}
            <span className="font-semibold">
              when to offer surgery and which approach may provide the highest
              chance of meaningful improvement
            </span>{" "}
            in degenerative cervical myelopathy (DCM). It is grounded in AO
            Spine / WFNS guideline concepts and major surgical outcome cohorts,
            and will be calibrated on prospectively collected Ascension Seton
            data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm md:text-base">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
            <h3 className="font-semibold mb-2">
              1. Should this patient undergo surgery?
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>
                Uses baseline{" "}
                <span className="font-semibold">
                  mJOA, symptom duration, and MRI cord signal
                </span>{" "}
                to classify patients as:
              </li>
              <li className="ml-4">
                <span className="font-semibold">“Surgery recommended”</span>{" "}
                (typically moderate–severe or progressive DCM).{" "}
                <span className="text-xs">
                  (Fehlings et al., Global Spine J 2017; Gulati et al.,
                  Neurosurgery 2021)
                </span>
              </li>
              <li className="ml-4">
                <span className="font-semibold">“Consider surgery”</span> (mild
                DCM with risk markers or patient-prioritized goals).
              </li>
              <li className="ml-4">
                <span className="font-semibold">
                  “Non-operative trial reasonable”
                </span>{" "}
                for carefully selected mild cases, with close follow-up.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
            <h3 className="font-semibold mb-2">
              2. If surgery is offered, which approach?
            </h3>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              <li>
                Compares estimated probability of achieving{" "}
                <span className="font-semibold">
                  clinically meaningful mJOA improvement (MCID)
                </span>{" "}
                after anterior, posterior, and circumferential procedures.
              </li>
              <li>
                Patterns reflect prognostic factors such as baseline severity,
                duration, age, smoking, canal compromise, and MRI signal.{" "}
                <span className="text-xs">
                  (Tetreault et al., Global Spine J 2017; Merali et al., PLoS
                  One 2019)
                </span>
              </li>
              <li>
                Literature-based rules (e.g., kyphosis, multilevel disease,
                OPLL) can override small model differences when appropriate.
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <Link
            href="/prototype"
            className="inline-flex items-center justify-center bg-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-700 transition text-sm md:text-base"
          >
            Launch single-patient view →
          </Link>
        </div>
      </section>

      {/* KEY REFS */}
      <section className="glass space-y-3 text-xs md:text-sm text-slate-700">
        <h3 className="text-sm md:text-base font-semibold">
          Key references informing the current logic
        </h3>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Fehlings MG, et al.{" "}
            <span className="italic">
              A Clinical Practice Guideline for the Management of Patients With
              Degenerative Cervical Myelopathy.
            </span>{" "}
            Global Spine J. 2017.
          </li>
          <li>
            Tetreault L, et al.{" "}
            <span className="italic">
              Change in Function, Pain, and Quality of Life Following Operative
              Treatment for DCM.
            </span>{" "}
            Global Spine J. 2017.
          </li>
          <li>
            Merali Z, et al.{" "}
            <span className="italic">
              Using a Machine Learning Approach to Predict Outcome After Surgery
              for DCM.
            </span>{" "}
            PLoS One. 2019.
          </li>
          <li>
            Matz PG, Fehlings MG, et al.{" "}
            <span className="italic">
              The Natural History of Cervical Spondylotic Myelopathy.
            </span>{" "}
            J Neurosurg Spine. 2009.
          </li>
          <li>
            Gulati S, et al.{" "}
            <span className="italic">
              Surgery for Degenerative Cervical Myelopathy: A Practical
              Overview.
            </span>{" "}
            Neurosurgery. 2021.
          </li>
        </ul>
      </section>
    </main>
  );
}
