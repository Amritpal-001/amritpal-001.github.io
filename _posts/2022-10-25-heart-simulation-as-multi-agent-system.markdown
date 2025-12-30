---
layout: post
title: "Efficient blood pumping in Bionic heart via distributed control as Multi-agent system"
date: 2022-10-25 00:00:00 +00:00
image: /images/projects/2022-heart-simulation-as-multi-agent-system-main_idea.jpg
categories: projects
tags:
  - Reinforcement Learning
---

Decentralised control of heart muscles dynamics to allow efficient coordination for pumping blood. Programmed directed acyclic graph based reinforcement learning environment with vertices representing agents, and edges equal to blood flow. Two sub-problems to solve: 1. Calculate blood flow using mathematics of fluid dynamics and then using Ford-Fulkerson max flow algorithm to derive find max blood flow in graph at any time. 2. Reinforcement learning algo to solve for optimal coordination policy