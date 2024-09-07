# SugarSense

## Description

An app which can train a model from a user's dexcom data. Currently repurposed as a mini-research project for predicting blood sugar time series data.

## Predicting Blood Sugars

This project extracts EGV Data from Dexcom "Sandbox Users" and processes the data to include four simple features at each timestamp: blood glucose, trend rate, carbs consumed, and insulin injected. It trains a Structured State Space sequence model from [Gu et al.](https://arxiv.org/abs/2111.00396) to predict both the next blood glucose and the associated trend rate. This data-driven approach yields an average test correlation of 0.95-0.97 on seen patients for a horizon of 2 hours, and 0.4 on unseen patients for a horizon of 1 hour. Results can be found in `training/train.ipynb`. Currently, I'm investigating how to better generalize the model to unseen patients.

## Citations

```
@inproceedings{gu2022efficiently,
  title={Efficiently Modeling Long Sequences with Structured State Spaces},
  author={Gu, Albert and Goel, Karan and R\'e, Christopher},
  booktitle={The International Conference on Learning Representations ({ICLR})},
  year={2022}
}
```
