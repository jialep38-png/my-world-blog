---
title: "Hermes Telegram 入口"
description: "把 Hermes 接入 Telegram，并通过 long polling、launchd 持久化和消息流验证，形成一个轻量外部触点。"
date: 2026-04-19
status: "in-progress"
stack: ["Hermes", "Telegram", "long polling", "launchd"]
tags: ["Telegram", "消息入口", "自动化", "本地系统"]
draft: false
featured: false
slug: "hermes-telegram-entry"
relatedEssays: []
---

## 摘要

Hermes Telegram 入口，是一次把本地系统接到外部消息渠道的实验。

4 月 19 日，我完成了 Hermes 与 Telegram 的连接，采用 long polling 接收消息，并用 launchd 保持进程持久运行。消息流验证通过后，它已经具备了作为轻量入口的基本条件。

这个项目的重点不是 Telegram 本身，而是入口设计。

## 为什么先做消息入口

很多个人系统不一定需要一开始就有完整 Web UI。

有时候，一个稳定的消息入口反而更适合快速使用：打开聊天窗口，发一句话，系统能接住，再把结果回传回来。这个路径足够短，也更接近真实使用场景。

所以我更关心这些问题：

- 外部消息如何进入本地系统；
- 进程如何长期运行；
- 消息链路如何被验证；
- 入口失效时如何定位问题。

## 做完后的感受

入口跑通以后，很多后续想法才有意义。

如果入口不稳定，能力再多也只是停在本地。只要入口足够稳定，后续能力就可以逐步挂上去：提醒、查询、摘要、执行任务，都可以从同一个消息入口开始。

这次更像是打了一个基础桩。