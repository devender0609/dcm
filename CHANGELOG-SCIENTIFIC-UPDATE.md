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
