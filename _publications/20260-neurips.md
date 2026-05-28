---
title: "Generative OOD-regularized Model-based Policy Optimization"
layout: single
collection: publications
excerpt: ''
date: 2026-05-23
venue: 'NeurIPS'
status: "Submitted"
---
[arXiv:2605.24405](https://arxiv.org/abs/2605.24405)

We study sequential decision-making with offline reinforcement learning (RL). Traditional offline RL policies may result in out-of-distribution (OOD) actions when training relies only on sparse offline representations. To ensure safe offline policies in a sparse state-action space, we explore how density estimation models can be integrated into model-based RL methods to avoid the OOD regions. Generative models are capable of explicitly modeling the density in sparse state-action spaces. Building on this, we introduce Generative OOD-regularized Model-based Policy Optimization (GORMPO), a density-regularized offline RL algorithm that uses generative density modeling to restrict policy updates to high-density areas of the dataset. Furthermore, we examine whether better OOD detection corresponds to better model-based offline policies. We compare (1) the OOD detection capabilities of various density estimators and (2) their performance within the GORMPO framework on a real-world medical dataset and sparse offline RL datasets. We theoretically guarantee GORMPO's performance under mild assumptions. Empirically, GORMPO outperforms state-of-the-art baselines by 17% on a real-world medical dataset and enhances the base model on the offline RL datasets. Our empirical findings show that better OOD detection generally results in improved policies in environments with stable dynamics, while conservative penalties with poor density estimation are favored when dynamics are uncertain.


Recommended citation:

```bibtex
@misc{tumay2026generativeoodregularizedmodelbasedpolicy,
      title={Generative OOD-regularized Model-based Policy Optimization}, 
      author={Aysin Tumay and Jiahe Huang and Elise Jortberg and Rose Yu},
      year={2026},
      eprint={2605.24405},
      archivePrefix={arXiv},
      primaryClass={cs.LG},
      url={https://arxiv.org/abs/2605.24405}, 
}
```
