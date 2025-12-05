import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="px-6 md:px-10 pt-10 md:pt-14 pb-24 max-w-6xl mx-auto">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
        <div className="flex items-center gap-4">
          <div className="logo-wrap">
            <Image
              src="/clinic-logo.png"
              width={190}
              height={70}
              alt="Ascension Seton"
              className="logo-merged"
              priority
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl md:text-4xl font-bold text-slate-50 leading-snug">
              Ascension Seton Spine Clinic
            </h1>
            <p className="text-sm md:text-base text-slate-300/80 mt-1">
              Degenerative Cervical Myelopathy Decision-Support Prototype
            </p>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <span className="badge">Research Preview Only</span>
          <p className="text-xs text-slate-300/70 max-w-xs md:text-right">
            Not for direct clinical use. Designed to be reviewed with surgeons
            and refined using real-world prospective data.
          </p>
        </div>
      </header>

      {/* HERO / MAIN CARD */}
      <section className="glass mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
          DCM Surgical Decision Support
        </h2>
        <p className="text-base md:text-lg opacity-90 leading-relaxed">
          This tool is being developed to help surgeons reason through two
          critical questions in degenerative cervical myelopathy:
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-slate-900/60 border border-slate-700/70 p-6">
            <p className="text-sm font-semibold text-clinicTeal mb-1">
              Question 1
            </p>
            <h3 className="text-xl font-semibold mb-2">
              Should this patient undergo surgery?
            </h3>
            <p className="text-sm text-slate-200/80">
              A guideline-based logic layer (AO Spine / WFNS concepts) estimates
              whether surgery is recommended, surgery should be considered, or a
              non-operative trial with close follow-up is reasonable. It also
              provides approximate natural-history vs surgical benefit bands.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/60 border border-slate-700/70 p-6">
            <p className="text-sm font-semibold text-clinicTeal mb-1">
              Question 2
            </p>
            <h3 className="text-xl font-semibold mb-2">
              If surgery is offered, which approach?
            </h3>
            <p className="text-sm text-slate-200/80">
              A synthetic-data–trained model compares the probability of
              achieving clinically meaningful mJOA improvement with anterior,
              posterior, and circumferential approaches, with literature-based
              tie-break rules for complex cases.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row gap-4 md:items-center">
          <Link
            href="/prototype"
            className="inline-flex items-center justify-center bg-clinicTeal text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-clinicGold transition text-sm md:text-base"
          >
            Launch Prototype →
          </Link>
          <p className="text-xs md:text-sm text-slate-300/80 max-w-lg">
            The current web interface is a visual and workflow prototype. The
            underlying engine is being developed and calibrated against published
            literature and synthetic datasets and will later be validated on
            prospectively collected Ascension Seton cases.
          </p>
        </div>
      </section>

      {/* INFO SECTION */}
      <section className="glass">
        <h3 className="text-xl md:text-2xl font-semibold mb-4">
          What clinicians will see in future versions
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-200/80">
          <div className="bg-slate-900/60 border border-slate-800/70 rounded-2xl p-5">
            <h4 className="font-semibold mb-2">Surgery Recommendation</h4>
            <p>
              A three-level classification:
              <br />
              <span className="italic">
                “Surgery recommended”, “Consider surgery”, or “Non-operative
                trial reasonable”
              </span>
              , with a short explanation referencing mJOA, MRI signal change,
              symptom duration, and structural risk.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/70 rounded-2xl p-5">
            <h4 className="font-semibold mb-2">Risk vs Benefit Bands</h4>
            <p>
              Approximate risk of neurological progression without surgery and
              estimated likelihood of clinically meaningful improvement with
              surgery, based on published natural history and outcome cohorts.
            </p>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/70 rounded-2xl p-5">
            <h4 className="font-semibold mb-2">Approach-Level Outcomes</h4>
            <p>
              Probabilities of mJOA MCID for anterior, posterior, and
              circumferential approaches, with flags when guideline-based rules
              override a small modeled difference between options.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
