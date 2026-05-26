---
layout: post
title: "GraphPrint: Combining Traditional Fingerprint with Graph Neural Networks For Drug Target Prediction"
title_technical: "GraphPrint: Combining Traditional Fingerprint with Graph Neural Networks For Drug Target Prediction"
date: 2023-10-25 00:00:00 +00:00
categories: research
venue: 'NEURIPS'
authors: "<strong>Amritpal Singh</strong>"
paper: https://arxiv.org/abs/2407.10452
image: /images/publications/2023_graphprint.jpg"

---

{% capture clinical %} Accurate drug target affinity prediction can improve drug candidate selection, accelerate the drug discovery process, and reduce drug production costs. Previous work focused on traditional fingerprints or used features extracted based on the amino acid sequence in the protein, ignoring its 3D structure which affects its binding affinity.In this work, we propose GraphPrint: a framework for incorporating 3D protein structure features for drug target affinity prediction. We generate graph representations for protein 3D structures using amino acid residue location coordinates and combine them with drug graph representation and traditional features to jointly learn drug target affinity. Our model achieves a mean square error of 0.1378 and a concordance index of 0.8929 on the KIBA dataset and improves over using traditional protein features alone. Our ablation study shows that the 3D protein structure-based features provide information complementary to traditional features.  [pdf paper](/files/2023-graph-print.pdf) {% endcapture %}
{% capture technical %} Can a protein’s function really be learned from its sequence if the physics is encoded in its 3D folding geometry, not its letters? We construct GraphPrint by collapsing AlphaFold-derived protein structures into residue-level graphs, where each node is not just an amino acid but a geometric event in 3D space carrying latent physicochemical constraints. The model then fuses this structural manifold with ligand graphs, but the interesting behavior is not fusion—it is redundancy breakdown, where sequence fingerprints and structure embeddings stop agreeing and begin encoding orthogonal binding priors. On KIBA, the system does not just improve correlation; it exposes a sharp failure mode where sequence-only baselines systematically mis-rank large, aromatic, high-bond-count ligands, suggesting that binding affinity errors scale with molecular complexity in a way graph convolutions alone cannot linearize. The key signal is that adding 3D geometry does not “add information” in a simple sense—it reshapes the protein representation space so that docking behavior becomes a graph alignment problem rather than a language modeling problem.
{% endcapture %}
<div class="view-clinical">{{ clinical | markdownify }}</div>
<div class="view-technical">{{ technical | markdownify }}</div>
