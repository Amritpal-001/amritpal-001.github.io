---
title: "MLB Player Digital Engagement Forecasting"
collection: competitions
permalink: /projects/2021-mlb_player_digital_engagement
excerpt: 'Position 65/852, Kaggle'
date: 2021-07-31
venue: 'Kaggle'
---

Comp description as per organisers : 

'In this competition, you’ll predict how fans engage with MLB players’ digital content on a daily basis for a future date range. You’ll have access to player performance data, social media data, and team factors like market size. Successful models will provide new insights into what signals most strongly correlate with and influence engagement.'

[Competition webpage](https://www.kaggle.com/competitions/mlb-player-digital-engagement-forecasting)


Evaluation metric - Mean column-wise mean absolute error (MCMAE). A mean absolute error is calculated for each of the four target variables and the score is the average of those four MAE values.


Data provided  - 

Following categories of data were provided, with each having several labels of their own.
- nextDayPlayerEngagement
- games
- playerBoxScores
- teamBoxScores
- transactions
- standings
- awards
- events
- player_twitter_followers
- team_twitter_followers



## Approach used -

LightGBM, XGboost




## Data visualisation

<img src="Images/counts.jpeg" alt="Normal" height=350/> 
<img src="Images/GradCam.png" alt="Normal" height=350/> 

## Feature engineering and selection
