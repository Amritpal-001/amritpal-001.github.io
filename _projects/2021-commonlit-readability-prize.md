---
title: "CommonLit Readability Prize"
collection: competitions
permalink: /projects/2021-commonlit-readability-prize
excerpt: 'Position 305/3852, Kaggle'
date: 2021-08-02
venue: 'Kaggle'
---

#### Rate the complexity of literary passages for grades 3-12 classroom use

[Competition webpage](https://www.kaggle.com/competitions/commonlitreadabilityprize/overview)

## Aim

"In this competition, we're predicting the reading ease of excerpts from literature. We've provided excerpts from several time periods and a wide range of reading ease scores. Note that the test set includes a slightly larger proportion of modern texts (the type of texts we want to generalize to) than the training set."

## Data provided  - 

Training data 

    id - unique ID for excerpt
    url_legal - URL of source - this is blank in the test set.
    license - license of source material - this is blank in the test set.
    excerpt - text to predict reading ease of
    target - reading ease
    standard_error - measure of spread of scores among multiple raters for each excerpt. Not included for test data.

 
Goal - Predict the final three FVC measurements for each patient, as well as a confidence value in your prediction.

Evaluation metric - root mean squared error. RMSE

## Models used -

LightGBM, XGboost, TabNet


## Feature engineering and selection


## Images

