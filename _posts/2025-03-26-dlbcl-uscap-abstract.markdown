---
layout: post
title: "Spatial Arrangement of Neoplastic Lymphocytes Predicts Molecular Subtypes in Diffuse Large B-cell Lymphoma"
title_technical: "Graph Neural Networks to Spatial Arrangement of Neoplastic Lymphocytes in DLBCL"
date: 2025-03-26 00:00:00 +00:00
categories: research
authors: "<strong>Amritpal Singh</strong>, Tilak Pathak, Germán Corredor, Anant Madabhushi"
venue: 'USCAP (Boston, USA)'
paper: https://laboratoryinvestigation.org/article/S0023-6837(24)03207-0/fulltext
image: /images/publications/2025_DLBCL.jpg"

---

{% capture clinical %} Diffuse large B-cell lymphoma (DLBCL) is the most common non-Hodgkin lymphoma and can be fatal if untreated. Accurate cell-of-origin (COO) classification is critical for prognosis and treatment, but standard immunohistochemistry (IHC) for BCL6, MUM1, and CD10 is costly, time-consuming, and not widely accessible. Alternative approaches using routine histopathology could improve scalability and access. We analyzed digitized H&E tissue microarray images from DLBCL patients. Images were tiled, neoplastic lymphocytes segmented with Hover-Net, and nuclear morphology and intensity features extracted. A graph neural network, MNeo, was trained to predict BCL6, MUM1, and CD10 expression, compared to a baseline foundation model. MNeo reliably predicted molecular subtypes from H&E images, outperforming the baseline. Feature maps highlighted regions most informative for each marker, showing that nuclear morphology patterns carry meaningful molecular information. This study demonstrates that graph-based computational pathology can serve as a cost-effective, accessible alternative to IHC, enhancing diagnostic efficiency and enabling broader application of precision medicine in DLBCL. {% endcapture %}
{% capture technical %} Under the microscope, DLBCL can look deceptively similar across patients — but the spatial organization of lymphocytes tells a much richer molecular story. In this work, we modeled lymphoma tissue as a graph. Using Hover-Net nuclei segmentation, handcrafted nuclear morphology/intensity features, and Delaunay-based graph construction, we trained GNNs to predict molecular subtype markers directly from routine H&E slides. The interesting part was that the model was not just learning individual cells — it was learning neighborhood structure, tissue topology, and spatial cellular interactions linked to BCL6, MUM1, and CD10 expression. Our graph-based framework, MNeo, outperformed baseline foundation models and showed that spatial lymphocyte architecture itself encodes latent molecular phenotype information. Presented at the USCAP 2025. **Oral presentation**
{% endcapture %}
<div class="view-clinical">{{ clinical | markdownify }}</div>
<div class="view-technical">{{ technical | markdownify }}</div>
