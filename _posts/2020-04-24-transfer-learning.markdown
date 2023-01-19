---
title:  "Transfer learning in Medicine – Pros and Cons!"
date:   2020-04-24 05:30:03 +0530
tags:
  - DL
  - old
---

=======================


# Transfer learning in Medicine – Pros and Cons!

This post is going to longer than noraml post and is divided into –
*   Transfer learning in general, its pros, cons
*   Fine-tuning the top layers of a pre-trained network
*   Talking specific to Medicine
*   Gooogle’s article – Transfer leanring in medicine
*   What if you still have to transfer learn?
*   Resource-limited CNN

### **What is Transfer learning?**

**Transfer learning (TL)** is a research problem in [machine learning](https://en.wikipedia.org/wiki/Machine_learning) (ML) that focuses on storing knowledge gained while solving one problem and applying it to a different but related problem.[\[1\]](https://en.wikipedia.org/wiki/Transfer_learning#cite_note-1) For example, knowledge gained while learning to [recognize](https://en.wikipedia.org/wiki/Computer_vision#Recognition) cars could apply when trying to recognize trucks.

Motivation for Transfer Learning
--------------------------------

Humans don’t learn everything from the ground up and leverage and transfer their knowledge from previously learnt domains to newer domains and tasks. Given the craze for **_True Artificial General Intelligence_**_, transfer learning is something which data scientists and researchers believe can further our progress towards _AGI_._

_Transfer learning should enable us to utilize knowledge from previously learned tasks and apply them to newer, related ones. If we have significantly more data for task **_T1_**_, we may utilize its learning, and generalize this knowledge (features, weights) for task **_T2_** _(which has significantly less data). In the case of problems in the computer vision domain, certain low-level features, such as edges, shapes, corners and intensity, can be shared across tasks, and thus enable knowledge transfer among tasks!___

___**Problem formulation!**___

___**Healthcare data are generallly**___

___**1) often small sample size**___

___**2) different data content from the pre-trained model (e.g., ImageNet).  
Recently research discoveries may say that ImageNet pre-trained model has very limited help for some tasks. ImageNet pre-trained model is mainly trained using natural images. Because of the big difference between natural images and medical images (e.g., Xray/CT/MRI), we have to fine-tune our networks with transfer learning.**___

___****Advantages****___

*   ___Save training time___
*   ___you do not need a lot of data___
*   ___Neural network works better in most cases___

___Use Transfer Learning when you do not have sufficiently marked training data to train your network from the beginning and/or there is already a network that is previously trained in a similar task that is usually trained on huge amounts of data.___

___Transfer Learning works only if the functions learned from the first task are generic, which means that they can also be useful in other related tasks.___

### ___Fine-tuning the top layers of a pre-trained network___

___To further improve our previous result, we can try to “fine-tune” the last convolutional block of the VGG16 model alongside the top-level classifier. Fine-tuning consists of starting from a trained network, then re-training it on a new dataset using very small weight updates. In our case, this can be done in 3 steps:___

*   ___instantiate the convolutional base of VGG16 and load its weights___
*   ___add our previously defined fully-connected model on top, and load its weights___
*   ___freeze the layers of the VGG16 model up to the last convolutional block___

___Note that:___

*   ___in order to perform fine-tuning, all layers should start with properly trained weights: for instance, you should not slap a randomly initialized fully-connected network on top of a pre-trained convolutional base. This is because the large gradient updates triggered by the randomly initialized weights would wreck the learned weights in the convolutional base. so this is why we first train the top-level classifier and only then start fine-tuning convolutional weights alongside it.___
*   ___we choose to only fine-tune the last convolutional block rather than the entire network in order to prevent overfitting since the entire network would have a very large entropic capacity and thus a strong tendency to overfit. The features learned by low-level convolutional blocks are more general, less abstract than those found higher-up, so it is sensible to keep the first few blocks fixed (more general features) and only fine-tune the last one (more specialized features).___
*   ___fine-tuning should be done with a very slow learning rate, and typically with the SGD optimizer rather than an adaptative learning rate optimizer such as RMSProp. This is to make sure that the magnitude of the updates stays very small, so as not to wreck the previously learned features.___

___To improve performance further, here are some other things we could try:___

*   ___Increasing or decreasing the number of new convolutional layers___
*   ___Increasing or decreasing the number of nodes in each new convolutional layer.___
*   ___Tuning hyperparameters like activation functions and learning rates.___
*   ___Experiment with the image preprocessing.___
*   ___Unfreezing the fully-connected layer and adjusting/training that as well.___
*   ___Unfreezing one or more preexisting convolutional layers and (re-)training those as well___

### ___**Downsides of Transfer learning** **–**___

___**Transfer learning may have a very limited effect when we switch the data content from one type to another. Hence, transfer learning, in this case, maybe no better than training from scratch, as the networks learn very different high-level features in the two tasks.**___

___**Talking very ideally, You can only use transfer learning when there is a relation between your dataset and the pre-trained model. For example, you can use different pre-trained model over ImageNet dataset with Cifar10,100 datasets, but you should not use the pre-trained model of ImageNet with biomedical images because of ImageNet not contains images belong to the biomedical field, so in such case, you should trains the model from scratch over biomedical images and then you can uses this model for transfer learning.**___

___**1\. On pre-trained CNNs networks with over 25 million parameters, After reaching 95% accuracy, after convergence, I changed the learning rate to a bit bigger number to find another probable local minimum.**___

___**2\. Distribution of the training data which your pre-trained model has used should be like the data that you are going to face during test time or at least don’t vary too much.**___

___**3\. The number of training data for transfer learning should be in a way that you don’t overfit the model. If you have a few numbers of labeled training data, and your typical pre-trained model, like ResNet, has millions of parameters, you have to be aware of overfitting by choosing appropriate metrics for evaluation and good testing data which represent the real distribution of the real population.**___

___**4\. We can not remove layers with confidence to reduce the number of parameters of the network.**___

*   ___**If we remove the convolutional layers from the first layers, we won’t have good learning because of the nature of the architecture which finds low-level features.**___
*   ___**Removing first layers will create a problem for dense layers because of the number of trainable parameters changes in this way.**___

___**(Densely connected layers and deep convolutional layers can be good points for a reduction but it may take time to find how many layers and neurons to be diminished in order not to overfit.)**___

___**—————————————-**___

___**One of the biggest limitations is – Negative transfer.**___

___**Transfer learning only works if the initial and target problems are similar enough for the first round of training to be relevant. Developers can draw reasonable conclusions about what type of training counts as “similar enough” to the target, but the algorithm doesn’t have to agree. If the first round of training is too far off the mark, the model may actually perform worse than if it had never been trained at all.**___

*   ___**whenever you use transfer learning, your training data should have two options. First of all, the distribution of the training data which your pre-trained model has used should be like the data that you are going to face during test time or at least don’t vary too much. Second, the number of training data for transfer learning should be in a way that you don’t overfit the model**___

___**Let’s take a network that has already been trained on a different set of data. For example the 8 layer Alexnet.**___

___**Now you have some new data.**___

___**1\. If you freeze the weights of the first k layers and then only train the remaining 8-k layers on the new data it has been shown that it is not accurate. Instead, **you have to take the initializations of the first k layers and then randomly initialized the remaining 8-k layers, followed by retraining on the complete network.****___

___**2\. Performing task 1. above requires a data size that is not too heavily skewed compared to the data that was used to train the original network. For example, if the old network was trained on a million images it may be inefficient to take just 100 images and retrain the whole thing. I think it still requires a slightly large set.**___

___**Let’s **discuss few studies of transfer learning –****___

___****[Transfer Learning based Detection of Diabetic Retinopathy from Small Dataset](https://arxiv.org/abs/1905.07203) by Misgina Tsighe Hagos and Shri Kant****___

___****Preprocessing required –****___

___****The fundus images were cropped from the input images to remove the black surrounding pixels using Opencv-Python.****___

___****After cropping, the images were resized to 300×300.****___

___****Results****___

___****“We tested our model on a previously unseen dataset of 5000 fundus images. Our classifier model resulted in an accuracy of 90.9%, with a 3.94% loss. As can be seen in Table 1 our trained model has scored a higher accuracy than a model that employed a pre-trained Inception-V3 to classify the Kaggle dataset with data augmentation into binary classes “****___

### Talking specific to Medicine

Let’s get specific to Medicine now, we will discuss a research paper- Transfusion **transfer learning in medicine**

The pretraining step helps the network learn general features that can be reused on the target task. This kind of two-stage paradigm has become extremely popular in many settings, and particularly so in _medical imaging_.

In the context of transfer learning, standard architectures designed for ImageNet with corresponding pre-trained weights are fine-tuned on medical tasks ranging from [interpreting chest x-rays](https://ai.googleblog.com/2019/12/developing-deep-learning-models-for.html) and [identifying eye diseases](https://jamanetwork.com/journals/jamapediatrics/fullarticle/2588763), to [early detection of Alzheimer’s disease](https://pubs.rsna.org/doi/abs/10.1148/radiol.2018180958).

> Despite its widespread use, the precise effects of transfer learning are not yet well understood. While recent work challenges many common assumptions, including [the effects on performance improvement](http://openaccess.thecvf.com/content_ICCV_2019/papers/He_Rethinking_ImageNet_Pre-Training_ICCV_2019_paper.pdf), [contribution of the underlying architecture](https://arxiv.org/abs/1805.08974) and impact of [pretraining dataset type and size](https://arxiv.org/abs/1811.07056), these results are all in the natural image setting and leave many questions open for specialized domains, such as medical images. In our [NeurIPS 2019](https://nips.cc/Conferences/2019) paper, “[Transfusion: Understanding Transfer Learning for Medical Imaging](https://arxiv.org/abs/1902.07208),” we investigate these central questions for transfer learning in medical imaging tasks. Through both a detailed performance evaluation and analysis of neural network hidden represent ations, we uncover many surprising conclusions,

*   limited benefits of transfer learning for performance on the tested medical imaging tasks, a detailed characterization of how representations evolve through the training process across different models and hidden layers, and _feature independent_ benefits of transfer learning for convergence speed.

**Performance Evaluation**

They looked at two large scale medical imaging tasks — diagnosing [diabetic retinopathy](https://www.mayoclinic.org/diseases-conditions/diabetic-retinopathy/symptoms-causes/syc-20371611) from [fundus photographs](https://en.wikipedia.org/wiki/Fundus_photography) and identifying [five different diseases from chest x-rays](https://arxiv.org/abs/1901.07031). they evaluated various neural network architectures including both standard architectures popularly used for medical imaging ([ResNet50](https://arxiv.org/abs/1512.03385), [Inception-v3](https://arxiv.org/abs/1512.00567)) as well as a family of simple, lightweight [convolutional neural networks](https://en.wikipedia.org/wiki/Convolutional_neural_network) that consist of four or five layers of the standard _convolution-[batchnorm](https://arxiv.org/abs/1502.03167)–[ReLU](https://en.wikipedia.org/wiki/Rectifier_(neural_networks))_ [progression, or CBRs.](https://en.wikipedia.org/wiki/Rectifier_(neural_networks))

The results from evaluating all of these models on the different tasks with and without transfer learning give us four main takeaways:

*   _Surprisingly, transfer learning does not significantly affect performance on medical imaging tasks, with models trained from scratch performing nearly as well as standard ImageNet transferred models._
*   _On the medical imaging tasks, the much smaller CBR models perform at a level comparable to the standard ImageNet architectures._

*   _As the CBR models are much smaller and shallower than the standard ImageNet models, they perform much worse on ImageNet classification, highlighting that ImageNet performance is _not__ indicative of performance on medical tasks.

The two medical tasks are much smaller in size than ImageNet (~200k vs ~1.2m training images), but in the very small data regime, there may only be a few thousand training examples. They evaluated transfer learning in this very small data regime, finding that while there was a larger gap in performance between transfer and training from scratch for large models (ResNet) this was not true for smaller models (CBRs), suggesting that the **large models designed for ImageNet might be too overparameterized for the very small data regime.**

Despite all the above discussed points, transfer learning is still prevalent amongst medical research papers.

So what if you have to use transfer learning, and you don’t have an option?

### **What to do if there isn’t enough data and there is already a pre-trained model?**

****A) Pretrained model doesn’t have common labels**** for most of its classes.

In this case, we can forget all the fully connected layers and replace new ones. Basically what they do is just classifying the features that the network has found to reduce the error rate. About the convolutional layers you have to consider two major points:

1.  _Pooling layers try to sum up the information in a local neighborhood and make a higher representation of the inputs. Suppose that the inputs of a pooling layer have nose, eyes, eyebrows and so on. Your pooling layers somehow attempt to check whether they exist in a neighborhood or not. Consequently, convolutional layers after pooling layers usually keep information that may be irrelevant to your task. There is a downside to this interpretation. The information may be distributed among different activation maps as Jason Yosinski _et al._ have investigated this nature at [Understanding neural networks through deep visualization](http://yosinski.com/media/papers/Yosinski__2015__ICML_DL__Understanding_Neural_Networks_Through_Deep_Visualization__.pdf) where you can read _One of the most interesting conclusions so far has been that representations on **some**__ **_layers seem to be surprisingly local. Instead of finding distributed_ _representations on all layers, we see, for example, detectors for text, flowers, fruit, and faces on conv4 and conv5. These conclusions can be_ _drawn either from the live visualization or the optimized images (or, best, by using both in concert) and suggest several directions for future research_ and _These visualizations suggest that further_ _study into the exact nature of learned representations—whether they are_ _local to a single channel or distributed across several_… A partial solution can be keeping the first layers that find low-level features that are usually shared among different data distributions and removing deeper convolutional layers that find higher abstractions.**
2.  **As stated, the main problem of convolutional layers is that the information they find may be distributed among different activation maps. Consequently, you can not be sure by removing a layer you can have better performance or not.**

****B) Pretrained model has common labels** **for most of its classes. If this is the case we can visualize the activations using the techniques like-****

****[http://yosinski.com/deepvis](http://yosinski.com/deepvis)****

*   ****They have shown that although human face is not a label in ImageNet, some of internal activation maps get activated by face. This observation can be seen for other labels too.****
*   ****For instance, networks for deciding a scene contains a car or not are usually sensitive to roads and trees. The image below shows which parts of outputs get activated for which parts of images. This can help you when you don’t have enough data and you have to use transfer learning.****

 ****[](http://yosinski.com/deepvis)****

****Here you can find some guidelines that need to be contextualized in the specific use case. Generally speaking, given a task A and a task B, **Transfer Learning** (from A -> B) makes sense if three conditions are satisfied:****

1.  ******Task A and B have the same input**; e.g. task A can be an _image recognition_ _task_ and task B can be a _radiology diagnosis task_…****
2.  ******You have a lot of more data for task A than task B**; e.g. it is likely that you have much more data – e.g. 1 million images – for a general purpose image recognition task (=task A) than for a radiology diagnosis task (=task B) – e.g. 1,000 images –****
3.  ******Low level features from A could be helpful for learning B**; e.g. you could suspect that low level features of image recognition can help learning radiology diagnosis …****

****In case these three conditions are satisfied, you can decide to****

*   ****_just_ **fine tuning** the network meaning that you take the pre-trained network of task A, just replace the last layers and retrain the network using the samples available for task B assuming **immutable the weights of the pre-trained network of task A**; basically, you are just training the last layers on the new samples of task B; this practice is typically recommended if you have not many (<<) samples for task B compared with the number of samples for task A: _e.g. 1 million samples for task A and 1,000 samples for task B … also, this is the option that you want typically choose in NLP tasks using pre-trained word embedding and you don’t have millions of samples for task B;_****
*   ******retrain end-to-end** the network including **the weights of the pre-trained network of task A**; _e.g. 1 million samples for task A and 100,000 samples for task B._****

****As a final note, **Transfer Learning does not make sense** if you have **much more data for task B than for task A**. In our example, if you have much more radiology images than images for a generic image recognition task. Hope this can give you some suggestion …****

### ****Resource-limited CNN****

****For Data limited areas, Resource-limited CNN architectures such as simple AlexNet, MobileNet, ShuffleNet, ANTNets should be not used.****

****Furether reading –****

****[https://ai.googleblog.com/2019/12/understanding-transfer-learning-for.html](https://ai.googleblog.com/2019/12/understanding-transfer-learning-for.html)****

****[Transfusion: Understanding Transfer Learning for Medical Imaging –](https://ai.googleblog.com/2019/12/understanding-transfer-learning-for.html) [https://arxiv.org/abs/1902.07208](https://arxiv.org/abs/1902.07208)****



[jekyll-docs]: https://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/
