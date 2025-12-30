---
layout: post
title: "Spatial Arrangement of Neoplastic Lymphocytes Predicts Molecular Subtypes in Diffuse Large B-cell Lymphoma"
date: 2025-03-26 00:00:00 +00:00
categories: research
authors: "<strong>Amritpal Singh</strong>, Tilak Pathak, Germán Corredor, Anant Madabhushi"
image: /images/publications/2025_DLBCL.jpg"
venue: 'USCAP (Boston, USA). Mar 2025'
website: https://laboratoryinvestigation.org/article/S0023-6837(24)03207-0/fulltext
---

Diffuse large B-cell lymphoma (DLBCL), the most common form of non-Hodgkin lymphoma, accounts for 30% of cases and can be fatal if untreated. Based on the cell of origin (COO), DLBCL can be Germinal center B cell-like (GCB) and non-GCB, with different prognosis and treatment options. BCL6, MUM1, and CD10 immunohistochemistry (IHC) staining are used in routine practice to determine COO but can be expensive, time-consuming, and not widely available. This study evaluated the role of computerized image analysis-derived features of nuclear morphology in H&E tissue microarray images to predict positivity for BCL6, MUM1, and CD10 subtypes in DLBCL patients.
**Design**: We used 290 digitized H&E images from de novo, CD20+ I-IV Modified Ann Arbor stage DLBCL patients, treated with R-CHOP immunochemotherapy from a medical institution in the USA. Images were randomly split into two sets: D1(N=205) was used for training and D2 (N=85) as the holdout set. Each image was divided into tiles of fixed dimensions, with each tile representing a node in a graph. The Hover-Net algorithm was used to identify neoplastic lymphocytes in each tile, followed by the extraction of nuclear morphology and intensity features. Aggregated features (mean, standard deviation, variance, skewness) from all nuclei in the tile region were used to represent nodes on a graph. A graph neural network MNeo was trained using these features to predict the molecular status of BCL6, MUM1, and CD10. H-optimus-0, a state-of-the-art foundation model (MF) was used as a baseline comparator.
**Results**: Our model MNeo achieved AUC of 0.76, 0.74, and 0.72 for BCL6, MUM1, and CD10 expression, respectively, suggesting a discriminative nature of our signature. This performance was higher than that of MF, which had corresponding AUCs of 0.67, 0.70, and 0.62. Figure 1B shows the feature map visualisation overlayed on H&E images for MNeo, showing local scores for each tile, which are later combined by MNeo to predict overall molecular status. Red/orange denotes regions of higher likelihood, and blue regions denote lower likelihood.