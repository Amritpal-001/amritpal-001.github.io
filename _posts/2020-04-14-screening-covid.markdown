---
title:  "Screening COVID-19 using Xrays?"
date:   2020-04-14 05:30:03 +0530
tags:
  - DL
  - old
---

=======================



# Screening COVID-19 using Xrays?

Contents of this post –
 - Problem statement of Xrays in COVID-19
 - Why neural nets can help?
 - My model and its result of testing

In this situation of Corona pandemic, the world is going through stressful times. Many countries have adopted lockdown and extensive testing approach. Extensive testing is proving beneficial, but we also face a shortage of COVID-19 diagnostic kits. Several startups and Biotech companies have stepped ahead to answer this problem.

**COVID-19**

**Coronavirus disease 2019** (**COVID-19**) is due to a virus belonging to the SARS family called severe acute respiratory syndrome coronavirus 2 (SARS-CoV-2). The disease was first identified in December of 2019 in Wuhan, the capital of China’s Hubei province and has spread since then, to what is currently a global pandemic.

Some common symptoms of Novel Corona Virus COVID-19 include fever, cough, and shortness of breath. Other symptoms may include fatigue, muscle pain, diarrhea, sore throat, loss of smell, and abdominal pain. The symptoms may seem to overlap with many other diseases and hence difficult to diagnose. (But in this state of pandemic every suspected person with these symptoms is assumed as infected and should be tested to confirm.)

The virus is mainly spread between people during close contact, often via small droplets produced during coughing, sneezing, or talking.

Till now there is no cure or vaccine against this virus. The only preventive measures we have are social distancing and performing good hygiene.

For latest government guidelines, visit official govt. sites- [https://www.mygov.in/covid-19/](https://www.mygov.in/covid-19/)

**Diagnosis** –

The standard method of diagnosis is by real-time reverse transcription polymerase chain reaction (rRT-PCR) from a nasopharyngeal swab. Results are generally available within a few hours to two days.

Scientists were able to isolate a strain of the coronavirus and obtain the genetic sequence. which was then used to develop polymerase chain reaction (PCR) tests to detect infection by the virus.

Chest CT imaging may also be helpful for diagnosis in individuals where there is a high suspicion of infection based on symptoms and risk factors. It is believed to be highly specific, but with sensitivity reported as low as 60-70% and as high as 95-97%[](https://radiopaedia.org/articles/covid-19-3).

**Pathology**

Little data are available about microscopic lesions and the pathophysiology of COVID.

The main pathological findings at autopsy are:

Macroscopy: pleurisy, pericarditis, lung consolidation, and pulmonary edema

Four types of severity of viral pneumonia can be observed:

*   minor pneumonia: minor serous exudation, minor fibrin exudation
*   mild pneumonia: pulmonary edema, pneumocyte hyperplasia, large atypical pneumocytes, interstitial inflammation with lymphocytic infiltration and multinucleated giant cell formation
*   severe pneumonia: diffuse alveolar damage with diffuse alveolar exudates
*   healing pneumonia: organization of exudates in alveolar cavities and pulmonary interstitial fibrosis

(Source – [Autopsy in suspected COVID-19 cases](https://jcp.bmj.com/content/early/2020/04/01/jclinpath-2020-206522) by Brian Hanley et. al )

**PROBLEM STATEMENT FOR XRAYS IN COVID**

**Shortcomings of xrays in COVID** –

Xrays have limited importance in the diagnosis for following reasons-

*   limited changes in the early stages
*   resemblance of findings to pneumonia due to other causes.

Humans have lived in the macroscopic world for millions of years. Our eyes and the optic center has developed to recognize different macroscopic objects of our surrounding. To understand the microscopic world, It took us the invention of Microscopy for us to be able to magnify microbes. Without zooming a image, minor changes go un-detected to human eye.

On contrast, neural networks work in a very different way. Even small changes, as small as pixel can be detected and if done rightly can differentiate images which may seem completely similar to the human eye.

**Aim of this project**

**Overcoming shortcomings of xrays –** resemblance to other pneumonia and limited changes in early stages by-

1.  **Model that can** differentiate **between different types of pneumonia**
2.  **Grading disease with some sort of severity.**(At the time of writing of this article, I couldn’t find any guidelines for grading COVID cases.)

**Why Xrays?**

Although CT scan is being considered better for COVID-19 diagnosis. In resource-limited setups like India, Xrays can be used as a great tool due to following reasons-

1.  Readily available
2.  Quick results, in a matter of seconds to minutes (compared to 1 day for oral swap reports)
3.  Relatively cheaper
4.  Available in remote areas too.
5.  Tele-medicine for areas with symptomatic cases, but poor connectivity.

**Definition of a Screening**

According to WHO, Screening is defined as “presumptive identification of unrecognized disease in an apparently healthy, asymptomatic population by means of tests, examinations or other procedures that can be applied rapidly and easily to the target population.”

While screening tests are not 100% accurate, Screening people before actual diagnostic tests could help in controlling COVID-19 and better utilisation of diagnostic kits.

(Disclaimer – While this might fit in criteria for a screening test, the author does not currently hold any diagnostic claims. Until proper clinical study has been conducted to prove medical efficacy of a model, author doesn’t recommend using this model for diagnosis purposes.)

Specifications of my model-

To begin with a simple problem, 3 classes were chosen.

1.  COVID-19
2.  Pneumonia
3.  Normal Xrays

It was built over a Pretrained _Inception V3 model,_ with some augmentation and removal of layers.

**Achieved results/Accuracy**

After the final session of training, great results could be obtained. (Total epochs= 25)

**Final validation accuracy achieved was 89.88%**

****Shortcomings-****

**Specific for 2 diseases only.**

**It clubs all other classes of pneumonia, under a single group.**

****Future work –****

*   **A thorough study of sensitivity and specificity of this model**
*   **Model for diagnosis of COVID-19 for Ct scans**
*   **Explainability of the model – asking the model to give us reason why it ‘thinks’ the given Xray is COVID positive or negative**
*   **Using different models and ensemble learning for better accuracy**

**Links –**

**Radiological findings of COVID – [https://radiologyassistant.nl/chest/lk-jg-1](https://radiologyassistant.nl/chest/lk-jg-1)**

**[https://radiopaedia.org/articles/covid-19-3](https://radiopaedia.org/articles/covid-19-3)**

**[http://sumerdoc.blogspot.com/2020/03/covid-19-ct-teaching-video.html](https://sumerdoc.blogspot.com/2020/03/covid-19-ct-teaching-video.html)**


[jekyll-docs]: https://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/
