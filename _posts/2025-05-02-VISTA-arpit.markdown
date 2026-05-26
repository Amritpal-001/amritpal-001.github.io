---
layout: post
title: "Artificial intelligence-based virtual staining platform for identifying tumor-associated macrophages from hematoxylin and eosin-stained images"
title_technical: "Image to Image translation: Virtual staining for Marcophage detection"
date: 2025-05-2 00:00:00 +00:00
categories: research
authors: "Arpit Aggarwal, Mayukhmala Jana, <strong>Amritpal Singh</strong>, Tanmoy Dam, Himanshu Maurya, Tilak Pathak, Sandra Orsulic, Kailin Yang, Deborah Chute, Justin A Bishop, Farhoud Faraji, Wade M Thorstad, Shlomo Koyfman, Scott Steward, Qiuying Shi, Vlad Sandulache, Nabil F Saba, James S Lewis Jr, Germán Corredor, Anant Madabhushi"
venue: 'European Journal of Cancer'
paper: https://doi.org/10.1016/j.ejca.2025.115390
image: /images/publications/2025-VISTA-arpit.jpg
---

{% capture clinical %}**Background**: Virtual staining is an artificial intelligence-based approach that transforms pathology images between stain types, such as hematoxylin and eosin (H&E) to immunohistochemistry (IHC), providing a tissue-preserving and efficient alternative to traditional IHC staining. However, existing methods for translating H&E to virtual IHC often fail to generate images of sufficient quality for accurately delineating cell nuclei and IHC+ regions. To address these limitations, we introduce VISTA, an artificial intelligence-based virtual staining platform designed to translate H&E into virtual IHC.**Methods and Results**: We applied VISTA to identify M2-subtype tumor-associated macrophages (M2-TAMs) in H&E images from 968 patients with HPV+ oropharyngeal squamous cell carcinoma across six institutional cohorts. Co-registered H&E and CD163 + IHC tissue microarrays were used to train (D1, N = 102) and test (D2, N = 50) the VISTA platform. M2-TAM density, defined as the ratio of M2-TAMs to total nuclei. High M2-TAM density was associated with worse overall survival in D4 (p = 0.0152, Hazard Ratio=1.63 [1.1–2.42]). VISTA outperformed existing methods, generating higher-quality virtual CD163 + IHC images in D2, with a Structural Similarity Index of 0.72, a Peak Signal-to-Noise Ratio of 21.5, and a Fréchet Inception Distance of 41.4. Additionally, VISTA demonstrated superior performance in segmenting M2-TAMs in D2 (Dice=0.74).{% endcapture %}
{% capture technical %}Pathologists see immune cells everywhere in H&E slides. The problem is that identifying specific phenotypes like CD163+ tumor-associated macrophages still usually requires an additional IHC stain, extra tissue sections, added cost, and a slower workflow. So we asked a simple question: Can a model learn the mapping from morphology in H&E directly to immunophenotype-specific staining patterns? VISTA — a multi-task virtual staining framework that translates H&E into virtual CD163 IHC while simultaneously generating: macrophage-positive segmentation masks
along with high-fidelity synthetic IHC. The system combines conditional GANs with a shared multi-objective optimization framework. Instead of treating image translation and segmentation independently, VISTA jointly optimizes all three tasks together using ResNet-based generators for stain translation, U-Net generators for segmentation, PatchGAN discriminators for high-frequency structural realism along with hybrid adversarial + Huber + segmentation objectives. The pipeline was trained using co-registered H&E/CD163 tissue microarrays and then deployed on large-scale whole slide cohorts across multiple institutions. Compared against Pix2Pix, CycleGAN, CUT, FastCUT, PyramidPix2Pix, and PSPStain, VISTA achieved stronger reconstruction fidelity and better macrophage segmentation performance. Even more interesting: the derived M2-TAM density biomarker from *virtual* staining remained prognostic for overall survival in HPV+ OPSCC. {% endcapture %}
<div class="view-clinical">{{ clinical | markdownify }}</div>
<div class="view-technical">{{ technical | markdownify }}</div>







