import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="px-8 pt-14 pb-24 max-w-5xl mx-auto">
      <header className="flex items-center gap-4 mb-14">
        <Image
          src="/clinic-logo.png"
          width={180}
          height={60}
          alt="Ascension Seton"
        />
        <h1 className="text-3xl font-bold gradient-text">
          Spine Research Prototype
        </h1>
      </header>

      <section className="glass mb-12">
        <h2 className="text-4xl font-bold mb-4 gradient-text">
          DCM Surgical Approach Recommender
        </h2>
        <p className="text-lg opacity-90 leading-relaxed">
          This prototype demonstrates how data-driven decision support can help
          spine surgeons evaluate whether anterior, posterior, or
          circumferential approaches may optimize outcomes in degenerative
          cervical myelopathy.
        </p>

        <Link
          href="/prototype"
          className="mt-8 inline-block bg-clinicTeal text-slate-900 px-6 py-3 rounded-xl font-semibold hover:bg-clinicGold transition"
        >
          Launch Prototype →
        </Link>
      </section>

      <section className="glass">
        <h3 className="text-2xl font-semibold mb-4">What this site includes</h3>
        <ul className="list-disc pl-6 space-y-2 opacity-90">
          <li>Interactive single-patient prototype</li>
          <li>Surgical approach probability preview (mock)</li>
          <li>Designed for clinician review and eventual IRB pilot</li>
          <li>Fully anonymized and non-clinical — research preview only</li>
        </ul>
      </section>
    </main>
  );
}
