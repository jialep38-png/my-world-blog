---
title: "pai-codex-bridge 开发复盘"
description: "从双层桥接策略、runtime 事件模型与工程落地三个维度复盘这次 PAI 到 Codex 的迁移工作。"
date: 2026-03-02
tags: ["复盘", "PAI", "Codex", "跨平台迁移", "工程方法"]
draft: false
archive: true
project: "pai-codex-bridge"
---

## 背景

这次改造不是"写几个脚本"，而是把原本深度耦合 Claude 机制的 PAI 系统迁移到 Codex 可日常使用的状态。PAI 依赖 Claude 的 Hook 生命周期、settings.json 配置和上下文注入，这些都不能直接在 Codex 内核层复用。

## 技术选型

runtime 部分选 Python，原因是标准库覆盖足够，适合做 CLI 和跨平台命令编排。桥接生成器也用 Python，与 runtime 统一语言减少维护负担。一键入口用 PowerShell 和 Bash，分别面向 Windows 和 POSIX。

## 实现过程

第一层做静态桥接：`Tools/codex_bridge_generator.py` 读取 PAI 发布目录，自动生成 Codex 可读的 `AGENTS.md`。第二层做运行时桥接：`Tools/pai_codex_runtime.py` 在外部模拟 `SessionStart/PreToolUse/PostToolUse/Stop/SessionEnd`，把原有 Hook 尽可能复用。第三层做体验收敛：一键脚本 + profile 自动接管，让日常使用不需要记复杂命令。

## 遇到的问题

第一个问题是依赖缺失导致 Hook 静默失败。修正办法是增加 `doctor` 把依赖状态显式输出。第二个问题是 Windows 下命令解析和编码差异导致行为不稳定。修正办法是在 runtime 层加强命令归一化和路径解析。第三个问题是追求"100% 等价"导致决策模糊。修正办法是明确边界，不做不现实承诺，用"高等价可运行 + 已知限制"替代。

## 总结

这次工作的关键收获是：跨平台迁移首先是机制映射，不是代码复制；可用性工程决定项目能否被长期使用；保留原生逃生路径是成熟做法。当入口、执行、验证、治理都闭环后，项目才真正从"能跑"升级为"可交付、可协作、可持续"。