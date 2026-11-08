---
layout: post
title: "Multi-Modal Deep Feature Integration for Alzheimer’s Disease Staging"
title_technical: "Multi-Modal Deep Feature Integration for Alzheimer’s Disease Staging"
date: 2023-10-20 00:00:00 +00:00
categories: research
venue: 'IEEE BIBM conference'
paper: https://ieeexplore.ieee.org/abstract/document/10431906
authors: "<strong>Amritpal Singh</strong>, Wenqi Shi, May D. Wang"
image: /images/publications/2023_alz_IEEE_bibm.png"
project_page:   https://amritpal-001.github.io/multimodal_Alzheimer_page/
---



{% capture clinical %}Alzheimer's disease (AD) is one of the leading causes of dementia and 7th leading cause of death in the United States. The provisional diagnosis of AD relies on comprehensive examinations, including medical history, neurological and psychiatric examinations, cognitive assessments, and neuroimaging studies. Integrating diverse sets of clinical data, including electronic health records (EHRs), medical imaging, and genomic data, enables a holistic view of AD staging analysis. In this study, we propose an end-to-end deep learning architecture to jointly learn from magnetic resonance imaging (MRI), positron emission tomography (PET), EHRs, and genomics data to classify patients into AD, mild cognitive disorders, and controls. We conduct extensive experiments to explore different feature-level and intermediate-level fusion methods. Our findings suggest intermediate multiplicative fusion achieves the best stage prediction performance on the external validation dataset. Compared with unimodal baselines, we can observe that integrative approaches that leverage all four modalities demonstrate superior performance to baselines reliant solely on one or two modalities. In an age-wise comparison, we observe a unique pattern that all fusion methods exhibited superior performance in the earlier age brackets (50-70 years), with performance diminishing as the age group advanced (70-90 years). The proposed integration framework has the potential to augment our understanding of disease diagnosis and progression by leveraging complementary information from multimodal patient data.{% endcapture %}
{% capture technical %} What happens when you force MRI scans, PET metabolism maps, EHR timelines, and genomic signals into the same latent space and ask them to agree on whether a brain is aging normally or collapsing toward Alzheimer’s? This work builds a multimodal deep learning framework that treats Alzheimer’s staging as a representation alignment problem across radically different biomedical modalities. Surprisingly, simple multiplicative fusion consistently beat larger concatenative models, suggesting that cross-modal interaction mattered more than parameter count. The study also uncovered a strange age effect: models became highly predictive in earlier disease windows, then progressively failed in older cohorts, hinting at hidden subtypes of neurodegenerative aging. We even transformed structured clinical/genomic variables into image-like spatial embeddings to co-train with 3D neuroimaging pipelines. The result is less of a medical classifier and more of a small-scale experiment in multimodal reasoning over noisy human biology. {% endcapture %}
<div class="view-clinical">{{ clinical | markdownify }}</div>
<div class="view-technical">{{ technical | markdownify }}</div>



