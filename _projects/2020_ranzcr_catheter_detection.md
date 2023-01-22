---
title: "RANZCR CLiP - Catheter and Line Position Challenge"
collection: competitions
permalink: /projects/2021_ranzcr_catheter_detection
excerpt: '<img src="/images/competitions/2021_ranzcr_catheter_detection_GradCam.png" alt="Logo" width="150" height="100" /> Classify the presence and correct placement of tubes on chest x-rays to save lives, Kaggle Competition'
date: 2021-03-16
venue: 'Kaggle'
tags:
  - Deep Learning
  - Computer Vision
---

[Competition webpage](https://www.kaggle.com/competitions/ranzcr-clip-catheter-line-classification/overview)


## Task
Classify the presence and correct placement of tubes on chest x-rays to save lives

## Evaluation metric

Modified version of the Laplace Log Likelihood.

## Aim

1. Detect Catheter on Chest Xrays into Endotracheal tube, Nasogastric catheter, CVC 
2. Detect is the catheter in Normal(functionally), Abnormal(Needs to be replaced) or boderline

Classification problem with 14 classes.

## Data provided  - 

40,000 images, along with binary labels for

    StudyInstanceUID - unique ID for each image
    ETT - Abnormal - endotracheal tube placement abnormal
    ETT - Borderline - endotracheal tube placement borderline abnormal
    ETT - Normal - endotracheal tube placement normal
    NGT - Abnormal - nasogastric tube placement abnormal
    NGT - Borderline - nasogastric tube placement borderline abnormal
    NGT - Incompletely Imaged - nasogastric tube placement inconclusive due to imaging
    NGT - Normal - nasogastric tube placement borderline normal
    CVC - Abnormal - central venous catheter placement abnormal
    CVC - Borderline - central venous catheter placement borderline abnormal
    CVC - Normal - central venous catheter placement normal
    Swan Ganz Catheter Present
    PatientID - unique ID for each patient in the dataset


Evalution metrics - AUC-ROC 

## Approach used -

Average weighted ensemble of DenseNet and EfficientNet models

## Feature engineering and selection
| <img src="/images/competitions/2021_ranzcr_catheter_detection_clahe_augmentation.png" alt="Normal" height=350/> |


## Images

<img src="/images/competitions/2021_ranzcr_catheter_detection_counts.jpeg" alt="Normal" height=350/> 
<img src="/images/competitions/2021_ranzcr_catheter_detection_Model.jpeg" alt="Normal" height=350/> 
<img src="/images/competitions/2021_ranzcr_catheter_detection_overlap.png" alt="Normal" height=350/> 
| <img src="/images/competitions/2021_ranzcr_catheter_detection_Tubes_overlay.png" alt="Normal" height=350/>


## Explainability
<img src="/images/competitions/2021_ranzcr_catheter_detection_GradCam.png" alt="Normal" height=350/> 

 |




