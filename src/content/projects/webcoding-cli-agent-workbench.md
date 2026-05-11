---
title: "Webcoding：浏览器里的本机 CLI Agent 工作台"
description: "一个面向 Claude Code / Codex 的轻量浏览器工作台，用 Web 会话管理本机 CLI Agent、后台任务和多渠道通知。"
date: 2026-05-10
status: "in-progress"
stack: ["Node.js", "WebSocket", "Claude Code", "Codex", "PWA"]
tags: ["Webcoding", "Claude Code", "Codex", "浏览器工作台", "本地工具"]
draft: false
featured: false
slug: "webcoding-cli-agent-workbench"
relatedEssays: []
---

## 摘要

Webcoding 是本地已有的一个轻量浏览器工作台，用来在网页里远程接入本机 CLI Agent。

它的核心思路很直接：浏览器负责会话、配置和可视化交互，本机继续运行 Claude Code 或 Codex 这类 CLI Agent。这样既保留了本机工具链，又让操作入口更接近日常 Web 使用习惯。

## 为什么这个项目值得记录

我越来越需要一种介于“终端”和“完整平台”之间的工作台。

终端足够强，但不适合所有场景；完整平台又容易太重。Webcoding 这个方向的价值在于，它把很多本机能力包到一个更容易访问的界面里：

- Claude / Codex 双 Agent 会话；
- 会话切换、续接和历史导入；
- 后台任务继续运行；
- PushPlus、Telegram、飞书等通知；
- 本地 API 桥接；
- 移动端访问和简单预览能力。

这些能力不是为了替代 CLI，而是给 CLI 增加一个更轻的使用入口。

## 我怎么看它

Webcoding 更像一个本机 Agent 的“控制台”。

它不应该把所有复杂度都吞进去，而是把几个高频动作做顺：启动、续接、查看、通知、恢复。只要这些路径稳定，本机 Agent 就可以从“必须守着终端”变成“可以在浏览器里持续管理”。

这个项目也和我最近做的很多入口实验是一条线：不是追求一开始就宏大，而是先把真实可用的入口跑稳。