---
layout: post
title: "Autonomous Soft Tissue Retraction Using Demonstration-Guided Reinforcement Learning"
title_technical: "Autonomous Soft Tissue Retraction Using Demonstration-Guided Reinforcement Learning m"
date: 2023-09-20 00:00:00 +00:00
categories: research
authors: "<strong>Amritpal Singh</strong>, Wenqi Shi, May D. Wang"
venue: 'MICCAI conference'
image: /images/publications/2023_TissueRetract.gif"
paper: https://doi.org/10.48550/arXiv.2309.00837
code: https://github.com/Amritpal-001/tissue_retract
project_page: https://amritpal-001.github.io/project_pages/tissueretract/
---

{% capture clinical %}In the context of surgery, robots can provide substantial assistance by performing small, repetitive tasks such as suturing, needle exchange, and tissue retraction, thereby enabling surgeons to concentrate on more complex aspects of the procedure. However, existing surgical task learning mainly pertains to rigid body interactions, whereas the advancement towards more sophisticated surgical robots necessitates the manipulation of soft bodies. Previous work focused on tissue phantoms for soft tissue task learning, which can be expensive and can be an entry barrier to research. Simulation environments present a safe and efficient way to learn surgical tasks before their application to actual tissue. In this study, we create a Robot Operating System (ROS)-compatible physics simulation environment with support for both rigid and soft body interactions within surgical tasks. Furthermore, we investigate the soft tissue interactions facilitated by the patient-side manipulator of the DaVinci surgical robot. Leveraging the pybullet physics engine, we simulate kinematics and establish anchor points to guide the robotic arm when manipulating soft tissue. Using demonstration-guided reinforcement learning (RL) algorithms, we investigate their performance in comparison to traditional reinforcement learning algorithms. Our in silico trials demonstrate a proof-of-concept for autonomous surgical soft tissue retraction. The results corroborate the feasibility of learning soft body manipulation through the application of reinforcement learning agents. This work lays the foundation for future research into the development and refinement of surgical robots capable of managing both rigid and soft tissue interactions. {% endcapture %}
{% capture technical %} What if surgical robots could learn soft tissue manipulation before ever touching a patient? This project drops a DaVinci surgical robot into a physics simulation where it has to figure out one of the hardest parts of surgery: handling deformable soft tissue. Not rigid tools. Not fixed objects. Realistic tissue that stretches, slips, recoils, and fights back. We built a ROS-compatible soft-body simulation environment using PyBullet and trained reinforcement learning agents to autonomously perform tissue retraction tasks. The system combines demonstration-guided RL with surgical robotics, allowing agents to learn from expert-style guidance while still exploring on their own. The interesting part: the robot gradually learns behaviors almost like a trainee surgeon — first approaching tissue, then grasping anchor points, then learning how to pull without losing grip or damaging the tissue. We also compared pure RL vs demonstration-guided RL across multiple soft-tissue manipulation tasks and studied how the number of demonstrations changes performance. This work was accepted at MICCAI 2023 AE-CAI Workshop. {% endcapture %}
<div class="view-clinical">{{ clinical | markdownify }}</div>
<div class="view-technical">{{ technical | markdownify }}</div>


**Amritpal Singh\***, Wenqi Shi, May D. Wang  
*Georgia Institute of Technology and Emory University*  
MICCAI 2023 – AE-CAI Workshop

[**🔗 Project Page**](https://amritpal-001.github.io/project_pages/tissueretract/) | [**📄 Paper on arXiv**](https://arxiv.org/abs/2309.00837) | [**💻 Code Repository**](https://github.com/Amritpal-001/tissue_retract)


[pdf paper](/files/2023-tissue-retract.pdf)

### Recommended citation: 

```
@inproceedings{singh2023softtissuerl,
  title={Autonomous Soft Tissue Retraction Using Demonstration-Guided Reinforcement Learning},
  author={Singh, Amritpal and Shi, Wenqi and Wang, May D.},
  booktitle={AE-CAI Workshop, MICCAI},
  year={2023}
}
```