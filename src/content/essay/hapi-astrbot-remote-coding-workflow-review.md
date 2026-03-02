---
title: "HAPI + AstrBot 远程 Vibe Coding 部署复盘"
description: "一次远程 AI 编码工作流的部署体验：如何让 Claude  Code 在手机端可控。"
date: 2026-03-02
tags: ["复盘", "远程开发", "AstrBot", "HAPI"]
draft: false
archive: true
project: "hapi-astrbot-remote-coding-workflow"
slug: "hapi-astrbot-remote-coding-workflow-review"
---

## 项目链接

- HAPI：<https://github.com/tiann/hapi>
- AstrBot 插件：<https://github.com/LiJinHao999/astrbot_plugin_hapi_connector>

## 为什么要折腾这个

天气冷不想一直坐电脑前，但 AI 还在跑任务。传统方案要么用 Happy（需要公网 + Telegram），要么就只能干等着。

看到 @weishu 的 HAPI 项目后觉得很实用：本地部署，不强依赖公网，而且 @LiJinHao999 还做了个 AstrBot 插件，能把 HAPI 接到 QQ/微信这些国内常用的 IM 上。

于是花了点时间部署了一套，记录一下体验。

### 为什么不用 OpenClaw

OpenClaw 是另一个远程控制方案，但对于**自己的电脑**来说，HAPI 这套更方便：

- **本地优先**：HAPI 直接跑在本地，不需要额外的云服务中转
- **部署更轻**：一个 npm 包 + 一个 AstrBot 插件，不用折腾服务端
- **内网直连**：AstrBot 和 HAPI 在同一台机器时，直接 localhost 通信，延迟低、稳定

OpenClaw 更适合需要管理多台远程机器的场景；如果只是控制自己手边的开发机，HAPI 这套开箱即用更省心。

## 部署过程

### HAPI 侧

```bash
npx @twsxtd/hapi hub --relay     # 启动 hub，开启中继
npx @twsxtd/hapi                 # 启动 claude code
```

HAPI 本身部署很简单，一个 npm 包搞定。它会在终端显示 QR 码和 URL，可以用网页或 PWA 访问。

### AstrBot 插件侧

1. 在 AstrBot 插件市场搜索 `hapi_connector` 安装
2. 填写配置：
   - `hapi_endpoint`：HAPI 服务地址（如 `http://localhost:3006`）
   - `access_token`：HAPI 的 access token
3. 重启 AstrBot

如果 AstrBot 和 HAPI 在同一台机器，直接内网连接就行，不需要公网。

## 实际使用体验

### 好用的点

**审批链路短**：权限请求推到 QQ 后，戳一戳机器人就能批准，比打开网页快。

**通知可控**：`output_level` 可以调，不想被刷屏就用 `silence`，只推权限请求。

**快捷前缀**：`> 继续` 比 `/hapi to 1 继续` 省事多了。

**忙时托管**：设个 23:00-07:00 自动审批，睡觉时让 AI 自己跑。

### 踩的坑

**SSE 连接不稳**：如果 AstrBot 和 HAPI 网络不稳，SSE 会断线重连。插件做了指数退避，但偶尔还是会漏消息。

**Cloudflare 验证**：如果用了 Cloudflare Tunnel 且开了 Access，需要配置 Service Token，否则 SSE 连接会被拦截。

**消息格式**：`detail` 模式信息量大，手机上看着有点乱。建议日常用 `simple` 或 `summary`。

## 总结

这套组合的核心价值：**把"离开电脑就断联"的场景补齐了**。

它不是替代 Claude  Code/Codex/Gemini 本身，而是在这些工具之上加了一层"可远程"的能力。对于需要长时间跑任务、又不想一直守在电脑前的场景，很实用。

感谢 @weishu 和 @LiJinHao999 的开源贡献。
