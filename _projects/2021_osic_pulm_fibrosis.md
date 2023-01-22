---
title: "OSIC Pulmonary Fibrosis Progression"
collection: competitions
permalink: /projects/2021_osic_pulm_fibrosis
excerpt: 'Position 131/2907, Predict lung function decline, Kaggle'
date: 2020-10-06
venue: 'Kaggle'
tags:
  - Deep Learning
  - Computer Vision
---

[Competition webpage](https://www.kaggle.com/competitions/osic-pulmonary-fibrosis-progression)


Evaluation metric - modified version of the Laplace Log Likelihood.

## Aim

The aim of this competition is to predict a patient’s severity of decline in lung function based on a CT scan of their lungs. Lung function is assessed based on output from a spirometer, which measures the forced vital capacity (FVC), i.e. the volume of air exhaled.


## Data provided  - 


Training data 
 - Baseline chest CT scan ( Week = 0 and has numerous follow up visits)
 - Associated clinical information for a set of patients. (smoking, sex, Age)
 - Entire history of FVC measurements.
 
Test data
 - Baseline CT scan
 - Initial FVC measurement. 
 
Goal - Predict the final three FVC measurements for each patient, as well as a confidence value in your prediction.

## Image data samples
<img src="images/competitions/2021_osic_pulm_fibrosis_sample_data_01.png" alt="Normal" height=350/>
<img src="images/competitions/2021_osic_pulm_fibrosis_sample_data_02.png" alt="Normal" height=350/>

## Dimension reduction on data using t-SNE 
<img src="images/competitions/2021_osic_pulm_fibrosis_data_tSNE.png" alt="Normal" height=350/> 

## Approach used -

Average weighted ensemble of EfficientNet models

## Feature engineering and selection


