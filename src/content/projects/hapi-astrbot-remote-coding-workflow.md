---
title: "HAPI + AstrBot 远程 Vibe Coding"
description: "部署 HAPI 与 AstrBot 插件，在 QQ/微信/Telegram 远程管理 Claude  Code / Codex / Gemini 会话的实践记录。"
date: 2026-03-02
status: "shipped"
stack: ["HAPI", "AstrBot", "Python", "TypeScript", "SSE"]
links:
  github: "https://github.com/LiJinHao999/astrbot_plugin_hapi_connector"
cover: ""
tags: ["远程开发", "Agent", "AstrBot", "HAPI"]
draft: false
featured: false
slug: "hapi-astrbot-remote-coding-workflow"
relatedEssays: ["hapi-astrbot-remote-coding-workflow-review"]
---

## 项目链接

- HAPI：<https://github.com/tiann/hapi>
- AstrBot 插件：<https://github.com/LiJinHao999/astrbot_plugin_hapi_connector>

## 摘要

这是一套远程 Vibe Coding 工作流的部署实践：本地机器跑 HAPI 管理 AI 编码会话，聊天侧通过 AstrBot 插件接入，实现在 QQ / 微信 / Telegram 等平台上远程查看进度、发送指令、审批权限。

核心组件：
- **HAPI**（`tiann/hapi`）：本地会话管理后端，支持 Claude  Code / Codex / Gemini / OpenCode
- **AstrBot 插件**（`LiJinHao999/astrbot_plugin_hapi_connector`）：把 HAPI 能力映射为聊天指令

价值点：离开电脑时 AI 可以继续跑，权限请求能在手机上一键审批，不用卡在那等着。

## 项目来源

本项目基于以下开源项目部署使用，非原创开发：

| 组件 | 仓库 | 作者 |
|------|------|------|
| HAPI 后端 | [tiann/hapi](https://github.com/tiann/hapi) | @weishu |
| AstrBot 插件 | [LiJinHao999/astrbot_plugin_hapi_connector](https://github.com/LiJinHao999/astrbot_plugin_hapi_connector) | @LiJinHao999 |

## 核心能力

### 会话管理
- 列出所有活跃会话（`/hapi list`）
- 切换当前会话（`/hapi sw`）
- 创建/归档/删除会话

### 消息交互
- 快捷前缀发消息：`> 继续写完这个功能`
- 查看最近消息：`/hapi msg`
- 实时 SSE 推送到聊天窗口

### 权限审批
- 一键全部批准：`/hapi a`
- 戳一戳 QQ 机器人快速审批
- 忙时托管：设定时间段自动审批

### 输出控制
- `silence`：仅推送权限请求
- `simple`：推送 AI 纯文本消息
- `detail`：推送所有消息含工具调用

## 部署架构

```
┌─────────────────────────────────────────────────────────┐
│  本地开发机                                              │
│  ┌─────────────┐    ┌─────────────┐                     │
│  │ Claude  Code │    │   Codex     │                     │
│  │   Gemini    │    │  OpenCode   │                     │
│  └──────┬──────┘    └──────┬──────┘                     │
│         │                  │                            │
│         └────────┬─────────┘                            │
│                  ▼                                      │
│         ┌───────────────┐                               │
│         │     HAPI      │ ◄─── 统一会话管理              │
│         │  (Hub + CLI)  │                               │
│         └───────┬───────┘                               │
│                 │ HTTP/SSE                              │
└─────────────────┼───────────────────────────────────────┘
                  │
                  ▼
         ┌───────────────┐
         │   AstrBot     │ ◄─── 多平台聊天框架
         │   + 插件      │
         └───────┬───────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌──────┐    ┌──────┐    ┌──────────┐
│  QQ  │    │ 微信 │    │ Telegram │
└──────┘    └──────┘    └──────────┘
```

## 使用场景

1. **出门在外继续推任务**：手机发一条消息让 AI 继续干活
2. **快速审批权限请求**：AI 要执行文件操作时，戳一戳机器人放行
3. **睡前托管**：开启忙时自动审批，让 AI 跑一夜
4. **多会话并行**：同时跑多个项目，随时切换查看
