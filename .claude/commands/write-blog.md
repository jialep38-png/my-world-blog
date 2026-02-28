# /write-blog

从项目路径自动生成博客内容。

## 参数

- `$ARGUMENTS` - 项目路径（必填）
- 可选 flag：`--mode=project|essay|both`（默认 both）

## 用法

```
/write-blog /path/to/project
/write-blog /path/to/project --mode=project
/write-blog /path/to/project --mode=essay
```

## 执行流程

### 1. 解析参数

从 `$ARGUMENTS` 中提取：
- 项目路径（第一个非 flag 参数）
- mode（默认 `both`）

### 2. 扫描项目

读取以下文件获取项目上下文（跳过敏感目录）：
- `README.md` / `README`
- `package.json` / `Cargo.toml` / `pyproject.toml` / `go.mod`
- 入口文件（`src/index.*`, `src/main.*`, `app.*`, `main.*`）
- 配置文件（`*.config.*`, `.env.example`）

**安全约束**：跳过 `.env*`（非 example）、`*credentials*`、`*secret*`、`node_modules/`、`.git/`、`dist/`、`build/`

### 3. 生成内容

#### mode=project 或 mode=both

生成 `src/content/projects/<slug>.md`：

```yaml
---
title: "<项目名>"
description: "<一句话描述>"
date: <今天日期>
status: "shipped"  # 根据项目状态推断：有 release → shipped，有 TODO → in-progress
stack: ["<技术1>", "<技术2>"]  # 从 dependencies 推断
links:
  github: "<repo-url>"  # 如果有 .git
  demo: "<demo-url>"    # 如果有
cover: ""  # 留空
tags: ["<标签>"]
draft: true
featured: false
slug: "<slug>"
relatedEssays: []
---

<项目简介，2-3 段>
```

#### mode=essay 或 mode=both

生成 `src/content/essay/<slug>-review.md`：

```yaml
---
title: "<项目名> 开发复盘"
description: "<摘要>"
date: <今天日期>
tags: ["复盘", "<技术标签>"]
draft: true
archive: true
project: "<project-slug>"  # 关联到 project
---

## 背景

为什么做这个项目？

## 技术选型

选择了哪些技术，为什么？

## 实现过程

关键实现细节。

## 遇到的问题

踩过的坑。

## 总结

学到了什么。
```

### 4. 输出

- 列出生成的文件路径
- 提示用户检查 `draft: true`，确认后改为 `false`

## 示例

```
> /write-blog ~/projects/my-cli-tool --mode=both

扫描项目: ~/projects/my-cli-tool
检测到: package.json, README.md, src/index.ts

生成文件:
- src/content/projects/my-cli-tool.md
- src/content/essay/my-cli-tool-review.md

请检查生成的内容，确认后将 draft: true 改为 false 以发布。
```
