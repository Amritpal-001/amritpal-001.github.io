---
title: "Optiver Realized Volatility Prediction"
collection: competitions
permalink: /projects/2021_optiver_volatility
excerpt: 'Position 356/3852, Kaggle, Apply your data science skills to make financial markets better'
date: 2021-09-27
venue: 'Kaggle'
---


### Apply your data science skills to make financial markets better

[Competition webpage](https://www.kaggle.com/competitions/optiver-realized-volatility-prediction)


## Aim

The aim of this competition is to predict a patient’s severity of decline in lung function based on a CT scan of their lungs. Lung function is assessed based on output from a spirometer, which measures the forced vital capacity (FVC), i.e. the volume of air exhaled.

Evaluation metric - Root mean square percentage error (RMPSE)

## Data provided  - 

Training data 
    stock_id - ID code for the stock. Not all stock IDs exist in every time bucket. Parquet coerces this column to the categorical data type when loaded; you may wish to convert it to int8.
    time_id - ID code for the time bucket. Time IDs are not necessarily sequential but are consistent across all stocks.
    seconds_in_bucket - Number of seconds from the start of the bucket, always starting from 0.
    bid_price[1/2] - Normalized prices of the most/second most competitive buy level.
    ask_price[1/2] - Normalized prices of the most/second most competitive sell level.
    bid_size[1/2] - The number of shares on the most/second most competitive buy level.
    ask_size[1/2] - The number of shares on the most/second most competitive sell level.

 
Goal - Predict the final three FVC measurements for each patient, as well as a confidence value in your prediction.

## Approach used -

LightGBM, XGboost, TabNet

## Feature engineering and selection



## Images

<img src="/images/competitions/2021_optiver_volatility_data_sample_1.png" alt="Normal" height=350/> 
<img src="/images/competitions/2021_optiver_volatility_data_sample_2.png" alt="Normal" height=350/> 


