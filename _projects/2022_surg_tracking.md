---
title: "Surgical Tracking in endoscopic videos"
collection: competitions
permalink: /projects/2022_surg_tracking
excerpt: '<img src="/images/competitions/2022_surg_tracking_01.gif" alt="Logo" width="150" height="100" /> Tracking surgical views in endoscopic videos'
date: 2022-09-15
venue: 'Grand Challenge'
tags:
  - Deep Learning
  - Computer Vision
---

# Description by organisers

Visual tracking involves following a bounding box throughout a video sequence. This is a crucial task in Computer-Assisted Interventions (CAI), with a range of applications including soft tissue deformation estimation, lesion tracking, augmented reality and robotic visual servoing. Medical applications require accurate trackers that are robust in challenging conditions prevalent in surgery. Hence prior to being utilized in real-world practice, tissue trackers need to be evaluated in large and diverse datasets that capture multiple challenging conditions. The general problem of tracking has been well studied within the computer vision community, focusing on natural scenes i.e. VOT. However, datasets for the same challenge in surgical scenes are still lacking. Hence, there is a dire need for a large publicly available dataset for benchmarking tissue trackers in surgery, for fueling development in this area and improving surgery. To address this, we propose the SurgT challenge, a new first-of-a-kind collection of tools and datasets for training and benchmarking tissue trackers in surgery.


<img src="/images/competitions/2022_surg_tracking_01.gif" alt="Normal" height=350/> 


## Task
Goal: The development of tissue trackers for stereo endoscopic videos.

The SurgT challenge has been created for the purpose of exploring tracking methods for surgical scenes, where there is limited annotated data available. The participants of this challenge are expected to develop tracking methods, which can learn to perform accurate keypoint tracking on surgical tissue, without the use of human-annotated endoscopic videos. This challenge encourages the development of self-supervised tracking methods, and also generalised tracking methods which have been trained on annotated non-surgical scenes. Traditional computer vision methods are also welcomed.

For this challenge, the participants are asked to develop tracking methods for stereo endoscopic videos, as shown in the image above.

## Evaluation metric

Modified version of the Laplace Log Likelihood.

## Data
A large collection of non-annotated videos (125 videos from 12 cases) is provided to enable the training of tracking methods.  The lack of annotation in the train set is to encourage techniques such as self-supervision or cross dataset generalizability; A smaller collection of annotated videos (12 videos from 3 cases ) is also provided, to be used for validation.  The validation videos should not be used for training, but only to assess the performance of the developed method. A hidden collection of videos will be used for testing and ranking of the submitted methods; the test set does not include any validation videos. The videos have an average duration of 30 seconds. You can rectify the videos using the provided  camera parameters. The SurgT_benchmarking tool will automatically rectify the videos for you. A file containing a description of the surgery is also provided.



<img src="/images/competitions/2022_surg_tracking_02.png" alt="Normal" height=350/> 


# Organisers
<img src="/images/competitions/2022_surg_tracking_03.png" alt="Normal" height=150/> 


# Sources
1. SurgT: Surgical tracking competition  https://surgt.grand-challenge.org

