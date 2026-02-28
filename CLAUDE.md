# 霁月小圈 - 项目说明

## 项目概述

这是**霁风**的个人博客/小圈，基于 Astro 5.x 构建，部署于 GitHub Pages。

- **站点名称**: 霁月
- **作者**: 霁风
- **定位**: 什么都发的小圈（项目展示 + 随想记录）

## 技术栈

- **框架**: Astro 5.16+
- **语言**: TypeScript
- **样式**: 内联 CSS（无外部框架）
- **部署**: GitHub Pages（自动构建）
- **评论**: Giscus

## 目录结构

```
src/
├── content/           # 内容集合（Markdown）
│   ├── essay/         # 文章/随想
│   ├── projects/      # 项目展示（尚未添加内容）
│   └── memo/          # 备忘录
├── pages/             # 页面路由
│   ├── index.astro    # 首页
│   ├── archive/       # 文章归档
│   ├── projects/      # 项目列表
│   ├── essay/         # 随想列表
│   ├── bits/          # 碎片
│   └── about/         # 关于
├── components/        # 可复用组件
├── layouts/           # 页面布局
├── lib/               # 内容处理逻辑
└── utils/             # 工具函数
```

## 内容格式

### 文章 (essay)

```yaml
---
title: "标题"
description: "描述"
date: 2026-02-28
tags: ["标签"]
draft: false          # true 为草稿不发布
archive: true         # 是否显示在归档
---
正文内容...
```

### 项目 (projects)

```yaml
---
title: "项目名"
description: "一句话描述"
date: 2026-02-28
status: "shipped"     # shipped | in-progress | archived
stack: ["Astro", "TypeScript"]
links:
  github: "https://github.com/..."
  demo: "https://..."
cover: ""
tags: ["标签"]
draft: false
featured: false
slug: "project-slug"
---
项目介绍...
```

## 常用命令

```bash
npm run dev      # 本地开发 http://localhost:4321
npm run build    # 构建生产版本
npm run preview  # 预览构建结果
```

## 自定义命令 (Skills)

- `/write-blog <项目路径>` - 从项目自动生成博客内容
  - `--mode=project` 只生成项目介绍
  - `--mode=essay` 只生成复盘文章
  - `--mode=both` 同时生成（默认）

## 配置文件

- `site.config.mjs` - 站点元信息（标题、作者、描述）
- `astro.config.mjs` - Astro 配置（插件、Markdown 处理）

## 部署

推送到 main 分支后自动通过 GitHub Actions 构建并部署到 GitHub Pages。

## 注意事项

1. 新文章放在 `src/content/essay/` 目录
2. 新项目放在 `src/content/projects/` 目录
3. 图片资源放在 `public/` 目录下
4. 修改后运行 `npm run dev` 本地预览确认
5. 所有内容默认 `draft: true`，确认后改为 `false` 发布
