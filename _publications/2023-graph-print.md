---
title: "GraphPrint: Combining Traditional Fingerprint with Graph Neural Networks For Drug Target Prediction"
collection: publications
permalink: /publication/2023-graph-print
excerpt: 'Combining traditional molecular and protein features with 3D features from graph neural network for drug target aﬀinity prediction.'
date: 2023-10-25
venue: 'NEURIPS'
paperurl: 
---

Accurate drug target affinity prediction can improve drug candidate selection, accelerate the drug discovery process, and reduce drug production costs. Previous work focused on traditional fingerprints or used features extracted based on the amino acid sequence in the protein, ignoring its 3D structure which affects its binding affinity.In this work, we propose GraphPrint: a framework for incorporating 3D protein structure features for drug target affinity prediction. We generate graph representations for protein 3D structures using amino acid residue location coordinates and combine them with drug graph representation and traditional features to jointly learn drug target affinity. Our model achieves a mean square error of 0.1378 and a concordance index of 0.8929 on the KIBA dataset and improves over using traditional protein features alone. Our ablation study shows that the 3D protein structure-based features provide information complementary to traditional features. 

[pdf paper](/files/2023-graph-print.pdf)

Recommended citation: 