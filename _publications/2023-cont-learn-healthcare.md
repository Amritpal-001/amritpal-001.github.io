---
title: "Class-Incremental Continual Learning for General Purpose Healthcare Models"
collection: publications
permalink: /publication/2023-cont-learn-healthcare
excerpt: 'Building medical imaging AI that can learn new diseases without catastrophic forgetting on previous tasks, in different medical modalities, specialties, and hospitals.'
date: 2023-10-25
venue: 'NEURIPS'
paperurl: 
---

Healthcare clinics regularly encounter dynamic data that changes due to variations in patient populations, treatment policies, medical devices, and emerging disease patterns. Deep learning models can suffer from catastrophic forgetting when fine-tuned in such scenarios, causing poor performance on previously learned tasks. Continual learning allows learning on new tasks without performance drop on previous tasks. In this work, we investigate the performance of continual learning models on four different medical imaging scenarios involving ten classification datasets from diverse modalities, clinical specialties, and hospitals. We implement various continual learning approaches and evaluate their performance in these scenarios. Our results demonstrate that a single model can sequentially learn new tasks from different specialties and achieve comparable performance to naive methods. These findings indicate the feasibility of recycling or sharing models across the same or different medical specialties, offering another step towards the development of general-purpose medical imaging AI that can be shared across institutions.

[pdf paper](/files/2023-cont-learn-healthcare.pdf)

Recommended citation: 