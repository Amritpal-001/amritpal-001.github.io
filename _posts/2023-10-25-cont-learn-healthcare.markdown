---
layout: post
title: "Class-Incremental Continual Learning for General Purpose Healthcare Models"
date: 2023-10-25 00:00:00 +00:00
categories: research
venue: 'NEURIPS'
authors: "<strong>Amritpal Singh</strong>, Mustafa Burak Gurbuz, Shiva Souhith Gantha, Prahlad Jasti"
paper: https://arxiv.org/abs/2311.04301
image: /images/publications/2023_contlearning.jpg"
---

Healthcare clinics regularly encounter dynamic data that changes due to variations in patient populations, treatment policies, medical devices, and emerging disease patterns. Deep learning models can suffer from catastrophic forgetting when fine-tuned in such scenarios, causing poor performance on previously learned tasks. Continual learning allows learning on new tasks without performance drop on previous tasks. In this work, we investigate the performance of continual learning models on four different medical imaging scenarios involving ten classification datasets from diverse modalities, clinical specialties, and hospitals. We implement various continual learning approaches and evaluate their performance in these scenarios. Our results demonstrate that a single model can sequentially learn new tasks from different specialties and achieve comparable performance to naive methods. These findings indicate the feasibility of recycling or sharing models across the same or different medical specialties, offering another step towards the development of general-purpose medical imaging AI that can be shared across institutions.