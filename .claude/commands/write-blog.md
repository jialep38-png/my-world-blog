# /write-blog

按“霁风的小圈”当前标准，把任意项目整理为**可进入发布闸门**的博客草稿（本命令不负责发布）。

## 参数

- `$ARGUMENTS`：项目路径（必填）
- 可选 flag：`--mode=project|essay|both`（默认 `both`）
- 可选 flag：`--quality=standard|launch`（默认 `standard`）

> `quality=launch` 用于“上线标准版复盘”，会启用长文与结构约束。

## 用法

```bash
/write-blog /path/to/project
/write-blog /path/to/project --mode=project
/write-blog /path/to/project --mode=both --quality=launch
```

## 执行流程

### 1) 解析参数

从 `$ARGUMENTS` 中提取：
- 项目路径（第一个非 flag 参数）
- mode（默认 `both`）
- quality（默认 `standard`）

### 2) 扫描项目上下文

读取以下文件获取上下文（跳过敏感目录）：
- `README.md` / `README`
- `package.json` / `Cargo.toml` / `pyproject.toml` / `go.mod`
- 入口文件（`src/index.*`, `src/main.*`, `app.*`, `main.*`）
- 配置文件（`*.config.*`, `.env.example`）

安全约束（必须跳过）：
- `.env*`（非 example）
- `*credentials*`
- `*secret*`
- `node_modules/`、`.git/`、`dist/`、`build/`

### 3) 生成内容（生成即合规）

#### 3.1 通用合规要求（强制）

- `draft` 默认必须为 `true`
- `slug` 必须是 lowercase kebab-case：`^[a-z0-9]+(?:-[a-z0-9]+)*$`
- 新生成文件的 slug 不得与现有内容冲突（检查对应集合目录）
- URL 字段仅允许 `http` / `https`

#### 3.2 mode=project 或 mode=both

生成 `src/content/projects/<slug>.md`，frontmatter 必须与 `src/content.config.ts` 对齐：

```yaml
---
title: "<项目名>"
description: "<一句话描述>"
date: <今天日期>
status: "planned" # 仅允许：planned|in-progress|shipped|paused|archived
stack: ["<技术1>", "<技术2>"]
links:
  github: "https://..." # 如无则省略该键
  demo: "https://..."    # 如无则省略该键
cover: ""
tags: ["<标签>"]
draft: true
featured: false
slug: "<slug>"
relatedEssays: []
---

<项目简介>
```

约束：
- `status` 必须来自 5 值枚举：`planned|in-progress|shipped|paused|archived`
- `links.github` / `links.demo` 若存在，必须是合法 `http/https` URL

#### 3.3 mode=essay 或 mode=both

生成 `src/content/essay/<slug>-review.md`，frontmatter 示例：

```yaml
---
title: "<项目名> 开发复盘"
description: "<摘要>"
date: <今天日期>
tags: ["复盘", "<技术标签>"]
draft: true
archive: true
project: "<project-slug>"
---
```

约束：
- `project` 必须引用已存在的 project slug（或本次同时生成的 project slug）
- `mode=both` 时，必须先生成 project，再生成 essay，并强制 `essay.project = project.slug`

#### 3.4 质量档位约束

- `quality=standard`：输出可发布草稿（结构完整、事实一致）
- `quality=launch`：按“霁风的小圈上线标准”输出
  - 项目文档目标字数：≥ 10,000（中文长文）
  - 必含章节：前言、目标与边界、架构/模型、关键实现、移动端体验、发布闸门、踩坑与回滚、上线标准、后续路线、结语
  - 可读性要求：短段落（2-5句为主）、列表化表达、术语首现解释、每章有结论句
  - 内容真实性：不得虚构仓库中不存在的模块、脚本、流程

### 4) 输出

输出必须包含三部分：

1. 生成文件清单
2. Schema 合规摘要（逐文件）
3. 质量摘要（仅 `quality=launch` 必填）

Schema 合规摘要至少覆盖：
- 必填字段完整性
- `status` 枚举合法性（project）
- `slug` 规则与冲突检查
- `links` 协议合法性（project）
- `essay.project` 关联有效性（essay）
- `draft: true` 状态确认

质量摘要（launch）至少覆盖：
- 字数目标是否达标
- 章节覆盖率
- 可读性检查（段落长度 / 列表密度 / 术语噪声）
- 事实一致性检查（与仓库文件对应）

## 示例

```text
> /write-blog ~/projects/my-cli-tool --mode=both --quality=launch

扫描项目: ~/projects/my-cli-tool
检测到: package.json, README.md, src/index.ts

生成文件:
- src/content/projects/my-cli-tool.md
- src/content/essay/my-cli-tool-review.md

Schema 合规摘要:
- projects/my-cli-tool.md: required fields ✓ | status enum ✓ | slug format ✓ | slug conflict ✓ | links protocol ✓ | draft=true ✓
- essay/my-cli-tool-review.md: required fields ✓ | project relation ✓ | draft=true ✓

质量摘要:
- 字数目标(>=10000): ✓
- 章节覆盖: ✓
- 可读性检查: ✓
- 事实一致性: ✓

下一步: 使用 /publish-blog <project-md> <essay-md> 进入发布闸门。
```
