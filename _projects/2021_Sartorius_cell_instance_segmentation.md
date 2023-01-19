---
title: "Sartorius - Cell Instance Segmentation"
collection: competitions
permalink: /projects/2021_sartorius_cell_instance_segmentation
excerpt: 'Position 230/1305, Detect single neuronal cells in microscopy images, Kaggle'
date: 2021-12-30
venue: 'Kaggle'
---


##### Description:

In this competition, you’ll detect and delineate distinct objects of interest in biological images depicting neuronal cell types commonly used in the study of neurological disorders. More specifically, you'll use phase contrast microscopy images to train and test your model for instance segmentation of neuronal cells. Successful models will do this with a high level of accuracy.


[Competition webpage](https://www.kaggle.com/competitions/sartorius-cell-instance-segmentation/overview)


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

