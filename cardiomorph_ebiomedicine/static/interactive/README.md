# CardioMorph rounded-chamber explorer

The only active explorer is embedded in `../../index.html#explore`, beneath the publication header. The previous `sample.html` and `interactive.html` URLs redirect there. The earlier experimental interfaces are preserved in GitHub checkpoint commit `3054972` on branch `interaative`.

The site is buildless HTML/CSS/JavaScript. Open index.html directly or serve the project folder with any static HTTP server. No inference, uploads, external runtime dependencies, or backend are required by the explorer.

## Interface

The X-ray and rounded chamber illustration share chamber visibility, landmarks and feature selection. The inspector reports the selected polygon's 2D area and closed perimeter. The Adjust menu contains opacity, fullness, zoom, outline, source-plane, mesh and graph controls. CSV export contains the five original feature measurements.

The UI uses system typography, neutral surfaces and blue accents. Chamber display colours are coral (LA), blue (RA), violet (LV) and amber (RV). SVG filters recolour the existing mask PNGs for display; the saved masks and original segmentation data are unchanged.

## Source sample and measurements

`sample/sample-xray.png` is an exact copy of the saved local h0001 X-ray. The matching source segmentation has shape (159, 512, 512). Selected largest-component masks are exported as PNGs and sample-masks.npz. The source hash and method hashes are recorded in sample-data.json.

Chamber channels: 122 LA, 123 RA, 125 LV, 126 RV. Point suffixes: 1 top, 2 bottom, 3 image left, 4 image right. The exporter reads the original extrema, connected-component, polygon and OpenCV measurement functions through AST without running or modifying the archived notebooks.

Feature definitions:

- Anterior: RA1, RA2, LV2, LA1
- Inferior: RV3, RA2, LV2, LV4
- Left: LV1, LV2, LV4, RV1
- Right: RA1, RA3, RA2
- Upper: RA1, LV1, RV1, LA1

No physical pixel calibration is available. Area is reported in px² and perimeter in px. Display changes never recalculate or alter the original measurements.

## Rounded geometry

Each chamber is a closed loft between front and back poles, with its saved contour retained at the equator. Inner rings gradually relax toward an ellipse, and smoothed vertex normals with interpolated lighting provide a rounded appearance. Fullness and relative front/back offsets are visualization choices, not patient-specific depth estimates. Chamber surfaces can intersect.

Landmarks are mapped onto their own chamber's front triangles using barycentric interpolation. Outlined markers indicate occlusion. Feature surface patches use the original 2D footprint. Visible boundary segments follow the model surface and stop at occlusion or chamber changes; optional dashed edges are a landmark graph.

`export_sample.py` can reproduce the sample assets with NumPy, OpenCV, scikit-image and Pillow. It confines writes to the selected output folder and verifies that the archived notebook and helper hashes remain unchanged. The original 159-channel array and archived repository are left in place.
