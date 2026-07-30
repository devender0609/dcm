# Scientific deployment update

Updated to align the public prototype with the submitted manuscript and tables.

## Corrected outputs

- Replaced the prior incorrect Table 3 values with:
  - Mild: MCID 94.2%, postoperative mJOA ≥16 98.0%, mean postoperative mJOA 17.8.
  - Moderate: MCID 73.4%, postoperative mJOA ≥16 48.4%, mean postoperative mJOA 15.8.
  - Severe: MCID 48.8%, postoperative mJOA ≥16 2.2%, mean postoperative mJOA 11.8.
- Reimplemented the neurologic-risk score using the exact additive weights in Supplementary Table S4.
- Removed percentage language from the neurologic-risk score and explicitly states that it is not a calibrated probability and has no time horizon.
- Removed unsupported approach probabilities and approximate confidence intervals.
- Added the indeterminate corridor category and explicit missing-variable limitations.
- Separated model inputs from documentation-only fields.
- Added prominent research-only and nonvalidated-use warnings.

## Deliberate conservative behavior

The manuscript describes graded mild-DCM treatment logic but does not publish the complete patient-level thresholds. The deployment therefore defaults mild DCM to the guideline-consistent shared-decision/structured-rehabilitation category rather than inventing unpublished thresholds. Moderate and severe DCM remain surgery-recommended anchors.

## Clinical interface polish update (2026-07-30)
- Renamed outputs to clearly distinguish framework categories and synthetic-cohort benchmarks from individualized predictions.
- Changed neurologic-risk presentation to “relative neurologic-concern index” and removed probability-like visual language.
- Added prominent research-output warning immediately above results.
- Clarified framework inputs versus recorded-only fields with badges and a legend.
- Renamed the action to “Apply research framework.”
- Reorganized results into a clinically familiar hierarchy with improved visual contrast, spacing, and print behavior.
- Clarified when surgical-corridor classification is considered and retained uncertainty language.

## Visual interpretation update
- Added a transparent component chart showing the prespecified contributions to the neurologic-concern index.
- Added a severity-stratified benchmark comparison for MCID achievement and postoperative mJOA ≥16.
- Added an expandable synthetic-cohort management-category distribution chart.
- Avoided gauges, traffic-light risk zones, survival curves, and patient-specific trajectory graphics that could imply unsupported calibration or individualized prediction.
- Rewrote `.gitignore` as standard UTF-8 text and expanded exclusions for generated deployment folders.
