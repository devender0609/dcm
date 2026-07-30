# Hybrid DCM Decision-Support Framework

Research and educational web prototype implementing the manuscript-aligned hybrid framework for degenerative cervical myelopathy.

## Scientific scope

- Literature-informed synthetic cohort: 200,000 virtual patients.
- Severity: mild mJOA 15–17, moderate 12–14, severe ≤11.
- Relative neurologic-risk score: additive 0–100 heuristic index; **not** a calibrated probability and no follow-up horizon is implied.
- Four treatment categories: structured rehabilitation with surveillance; shared decision-making / structured rehabilitation; surgery favored; surgery recommended.
- Severity-specific synthetic outcome anchors:
  - Mild: MCID 94.2%; postoperative mJOA ≥16 98.0%; mean postoperative mJOA 17.8.
  - Moderate: MCID 73.4%; postoperative mJOA ≥16 48.4%; mean postoperative mJOA 15.8.
  - Severe: MCID 48.8%; postoperative mJOA ≥16 2.2%; mean postoperative mJOA 11.8.
- Broad corridor categories: anterior favored, posterior favored, circumferential or complex, and indeterminate.

## Deployment

```bash
npm install
npm run build
npm start
```

For Vercel, import the repository as a Next.js project. No environment variables are required.

## Limitation

This application is an in silico research prototype. It is not clinically validated and must not replace clinical examination, imaging review, or surgeon judgment.
