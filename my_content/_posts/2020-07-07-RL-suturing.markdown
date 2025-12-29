---
title:  "Training Robotic arm for Surgeries- using OpenAI and Reinforcement learning"
date:   2020-07-07 05:30:03 +0530
tags:
  - RL
  - medicine
  - old
---

=======================

# Training Robotic arm for Surgeries- using OpenAI and Reinforcement learning


![](https://amritpal001.files.wordpress.com/2020/07/screenshot_2020-07-07-ingredients-for-robotics-research.png?w=387)

![](https://amritpal001.files.wordpress.com/2020/07/null-4.png?w=386&h=502)

In a recent paper by OpenAi —Solving Rubik’s Cube with a Robot Hand — researchers introduce the concept of training robots in simulations and then deploying them to real world robots. They used a technique called [domain randomization](https://arxiv.org/abs/1703.06907) that helps creating multiple environments with slight changes in them. For example in case of Rubix’s cube — they generate cubes of different sizes and dimensions, generating more generalization for the agent to learn.

In a Nature article, [“Your robot surgeon will see you now”](https://www.nature.com/articles/d41586-019-02874-0)author describes robotic surgery bring performed in a autonomous manner.

> “Researchers are showing how it can navigate to a patient’s leaking heart valve better than some surgeons can with years of training. First, the assembly is inserted into the base of the heart. From there, it propels itself using a motorized drive system along the pulsating ventricular wall to a damaged valve near the top of the ventricle, guided by vision and touch sensors.”

In another IEEE paper, mention about [Smart Tissue Autonomous Robot (STAR)](https://spectrum.ieee.org/the-human-os/biomedical/devices/in-fleshcutting-task-autonomous-robot-surgeon-beats-human-surgeons) In Flesh-Cutting Task, Autonomous Robot Surgeon Beats Human Surgeons — The robot made more precise cuts with less tissue damage

> “In 2016, the system [sewed together two segments of pig intestine](https://spectrum.ieee.org/the-human-os/robotics/medical-robots/autonomous-robot-surgeon-bests-human-surgeons-in-world-first) with stitches that were more regular and leak-resistant than those of experienced surgeons.” ….. “Before they tested the system against human surgeons, STAR first had to prove its ability to make precise cuts in these three types of irregular soft tissue, which can resist a cutting tool and then give way abruptly, causing the tool to make inaccurate cuts.”

But here’s the problem —Autonomous robots need training by actually doing the task, and we cant allow them to operate till there accuracy is tested. To deal with this issue, there is a growing research about using of simulations to train the agents and then later transfer them to real world robots for testing.

In pursuit of accelerate research on intelligent robots, OpenAi gym has released eight new simulated robotics environments — Mainly in two categories 1. Fetch robots 2. Hand manipulation

These environments are nice place to get into the world of robotics system. Once trained in simulation, these can be deployed on a physical robot, which can learn a new task after seeing it done once. This can remove the barrier of physical worlds —requirement of multiple robots to generate data quickly and possible damage caused by the agent in initial stages when it isn’t fully trained.

**Prerequisite**
----------------

Install

1.  OpenAI gym
2.  [MuJoCo](http://www.mujoco.org/) physics simulator

* * *

**Fetch Robotics environments**
===============================

We are going to discuss 4 environments —

1.  [FetchReach-v0](https://gym.openai.com/envs/FetchReach-v0/): Fetch has to move its end-effector to the desired goal position.
2.  [FetchSlide-v0](https://gym.openai.com/envs/FetchSlide-v0/): Fetch has to hit a puck across a long table such that it slides and comes to rest on the desired goal.
3.  [FetchPush-v0](https://gym.openai.com/envs/FetchPush-v0/): Fetch has to move a box by pushing it until it reaches a desired goal position.
4.  [FetchPickAndPlace-v0](https://gym.openai.com/envs/FetchPickAndPlace-v0/): Fetch has to pick up a box from a table

![](https://amritpal001.files.wordpress.com/2020/07/null-5.png?w=504&h=562)

**Comparison between different environments**
---------------------------------------------

All the findings highlighted in blue are common among all the 4 environments.

Green highlights are common between Sliding and pushing.

Red are common between Reach and Push and Pick&Place.

![](https://amritpal001.files.wordpress.com/2020/07/null-6.png?w=582&h=465)

**Tasks that can be accomplished with these environments**
==========================================================

1.  **Pushing**. In this task a box is placed on a table in front of the robot and the task is to move it to the target location on the table. The robot fingers are locked to prevent grasping. The learned behaviour is a mixture of pushing and rolling.
2.  **Sliding.** In this task a puck is placed on a long slippery table and the target position is outside of the robot’s reach so that it has to hit the puck with such a force that it slides and then stops in the appropriate place due to friction.
3.  **Pick-and-place.** This task is similar to pushing but the target position is in the air and the fingers are not locked. To make exploration in this task easier we recorded a single state in which the box is grasped and start half of the training episodes from this state3 .

**Environment**
===============

**States:** uses MuJoCo physics engine and consists of angles and velocities of all robot joints as well as positions, rotations and velocities (linear and angular) of all objects.

**Initial Gripper position:** For all tasks the initial position of the gripper is fixed, while the initial

position of the object and the target are randomized.

For all tasks the initial position of the gripper is fixed.

*   pushing and sliding tasks it is located just above the table surface
*   pushing it is located 20cm above the table.

**Object position:** The object is placed randomly on the table in the 30cm x 30cm (20c x 20cm for sliding) square with the center directly under the gripper (both objects are 5cm wide).

![](https://amritpal001.files.wordpress.com/2020/07/null-7.png?w=624&h=442)

**Goal state:**

*   For pushing, the goal state is sampled uniformly from the same square as the box position.
*   In the pick-and-place task the target is located in the air in order to force the robot to grasp (and not just push). The x and y coordinates of the goal position are sampled uniformly from the mentioned square and the height is sampled uniformly between 10cm and 45cm.
*   For sliding the goal position is sampled from a 60cm x 60cm square centered 40cm away from the initial gripper position.
*   For all tasks we discard initial state-goal pairs in which the goal is already satisfied.

**Goal position**
-----------------

print( env.goal)

![](https://amritpal001.files.wordpress.com/2020/07/null-8.png?w=516&h=52)

**Step –**

Step defines individual action by the agent that leads to change in the state of the environment.

Each step consists of 4 parts — observations , reward , done , info

print(env.step(env.action\_space.sample()))

![](https://amritpal001.files.wordpress.com/2020/07/null-9.png?w=498&h=298)

Reward can be either -1 or 0.

**Done** — tell if the task is actually complete or not!

* * *

**2.1 Observation**
===================

The policy is given as input the

*   absolute position of the gripper
*   the relative position of the object and the target ,
*   Distance between the fingers.

The Q-function is additionally given the linear velocity of the gripper and fingers as well as relative linear and angular velocity of the object.

print(env.observation\_space)

print(env.observation\_space.sample())

![](https://amritpal001.files.wordpress.com/2020/07/null-10.png?w=498&h=234)

**2.2 Actions**
===============

**Actions:** Action space is 4-dimensional.

None of the problems requires gripper rotation, hence it is kept fixed.

*   First 3 dimensions — specify the desired relative gripper position at the next timestep.
*   Last dimension — specifies the desired distance between the 2 fingers which are position controlled.

print( env.action\_space)

print(env.action\_space.sample())

![](https://amritpal001.files.wordpress.com/2020/07/null-11.png?w=498&h=90)

**2.3 Reward**
==============

All environments by default use a sparse reward of -1, if the desired goal was not yet achieved and 0 if it was achieved (within some tolerance).

Unless stated otherwise we use binary and sparse rewards **r(s, a, g) = −\[fg (s0) = 0\]**

where s0 if the state after the execution of the action a in the state s.

OpenAI gym also includes a variant with dense rewards for each environment. However, **Sparse rewards are more realistic in robotics applications** and highly encouraged.

**2.4 Starting State — by using print(env.initial\_state)**
===========================================================

print(env.initial\_state)

qpos = initial observation of the environment presented to the agent

qvel = is the initial velocity and angular velocity of the arm, joints.

![](https://amritpal001.files.wordpress.com/2020/07/null-12.png?w=498&h=234)

**2.5 Episode Termination**
===========================

The episode terminates when:

1\. Episode length is greater than 50

**Terminologies in Code:**
==========================

*   **model\_path (string):** path to the environments XML file
*   **n\_substeps (int)**: number of substeps the simulation runs on every call to step
*   **gripper\_extra\_height** (float): additional height above the table when positioning the gripper
*   **block\_gripper (boolean**): whether or not the gripper is blocked (i.e. not movable) or not
*   **has\_object (boolean):** whether or not the environment has an object
*   **target\_in\_the\_air (boolean)**: whether or not the target should be in the air above the table or on the table surface
*   **target\_offset (float or array with 3 elements):** offset of the target
*   **obj\_range (float):** range of a uniform distribution for sampling initial object positions
*   **target\_range (float):** range of a uniform distribution for sampling a target
*   **distance\_threshold (float):** the threshold after which a goal is considered achieved
*   **initial\_qpos (dict):** a dictionary of joint names and values that define the initial configuration
*   **reward\_type (‘sparse’ or ‘dense’):** the reward type, i.e. sparse or dense

**offset** — The distance from a starting point, either the start of a file or the start of a memory address.

**Looking into Code**
=====================

**![](https://amritpal001.files.wordpress.com/2020/07/null-13.png?w=498&h=500)**

**![](https://amritpal001.files.wordpress.com/2020/07/null-14.png?w=498&h=174)**

**![](https://amritpal001.files.wordpress.com/2020/07/null-15.png?w=498&h=214)**

**![](https://amritpal001.files.wordpress.com/2020/07/null-16.png?w=498&h=201)**

**![](https://amritpal001.files.wordpress.com/2020/07/null-17.png?w=498&h=201)**

Rendering modes — “Human mode” and “rgb array”

![](https://amritpal001.files.wordpress.com/2020/07/null-18.png?w=498&h=170)

You can read more of my blogs on — [https://link.medium.com/CV6la7YfV7](https://link.medium.com/CV6la7YfV7)

To look at the code for my projects, browse my github account — [https://github.com/Amritpal-001](https://github.com/Amritpal-001)

Feel free to ask me any questions or further topics.



[jekyll-docs]: https://jekyllrb.com/docs/home
[jekyll-gh]:   https://github.com/jekyll/jekyll
[jekyll-talk]: https://talk.jekyllrb.com/
