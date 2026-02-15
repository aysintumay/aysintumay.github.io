---
title: "Wind Energy Production Prediction"
collection: portfolio
---
---
Smart Weaning of Mechanical Circulatory Support Devices with Offline Reinforcement Learning
---
Rose Lab, University of California, San Diego.
 

We study the sequential decision-making problem for automated weaning of mechanical circulatory support (MCS) devices in patients with cardiogenic shock. MCS devices are percutaneous micro-axial flow pumps that provide left ventricular unloading and forward blood flow, but current weaning strategies vary significantly across care teams and lack data-driven approaches. We formulate this problem with Offline Reinforcement Learning (RL) with states as physiological signals, actions as MCS pump-level inputs, and the transition function as a digital twin world model. However, our setting presents challenges for traditional Offline RL methods, such as highly uncertain circulatory dynamics due to concurrent treatments and limited data availability. This consequently results in sparsity in the state-action space. We design our solution on top of model-based policy optimization with additions of (1) reward shaping with clinically-aware metrics, (2) density-aware regularization on transition rollouts during policy optimization.

<br/><img src='/images/cormpo_diagram (1) (1)'>

Check out our [latest paper](https://arxiv.org/abs/2511.06111) and the [source code](https://github.com/Rose-STL-Lab/CORMPO).
