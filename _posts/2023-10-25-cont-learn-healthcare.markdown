---
layout: post
title: "Class-Incremental Continual Learning for General Purpose Healthcare Models"
title_technical: "Class-Incremental Continual Learning for General Purpose Healthcare Models"
date: 2023-10-25 00:00:00 +00:00
categories: research
venue: 'NEURIPS'
authors: "<strong>Amritpal Singh</strong>, Mustafa Burak Gurbuz, Shiva Souhith Gantha, Prahlad Jasti"
paper: https://arxiv.org/abs/2311.04301
image: /images/publications/2023_contlearning.jpg"
project_page: https://amritpal-001.github.io/med_continual_learn_page/

---

{% capture clinical %} Healthcare clinics regularly encounter dynamic data that changes due to variations in patient populations, treatment policies, medical devices, and emerging disease patterns. Deep learning models can suffer from catastrophic forgetting when fine-tuned in such scenarios, causing poor performance on previously learned tasks. Continual learning allows learning on new tasks without performance drop on previous tasks. In this work, we investigate the performance of continual learning models on four different medical imaging scenarios involving ten classification datasets from diverse modalities, clinical specialties, and hospitals. We implement various continual learning approaches and evaluate their performance in these scenarios. Our results demonstrate that a single model can sequentially learn new tasks from different specialties and achieve comparable performance to naive methods. These findings indicate the feasibility of recycling or sharing models across the same or different medical specialties, offering another step towards the development of general-purpose medical imaging AI that can be shared across institutions.{% endcapture %}
{% capture technical %}Can a single model remember what it learned from dermatology, pathology, and radiology without quietly overwriting its own past? We simulate sequential exposure to ten heterogeneous medical imaging tasks across hospitals, modalities, and specialties, where each new dataset acts like a distributional shock that destabilizes previously learned feature hierarchies. The interesting failure mode is not accuracy on new tasks, but representational drift: shared CNN backbones either fragment into task-specific subspaces or collapse into overly conservative features that forget fine-grained medical cues. Replay-based continual learning (especially MAS+r and DER++) stabilizes this drift, but in a non-uniform way-some tasks act as anchors while others behave like destructive interference patterns in the latent space. What emerges is not a “general-purpose medical model,” but a constrained plasticity system where forgetting is not eliminated, only redistributed across tasks depending on how compatible their visual statistics are.
{% endcapture %}
<div class="view-clinical">{{ clinical | markdownify }}</div>
<div class="view-technical">{{ technical | markdownify }}</div>



