---
title: "霁风的小圈"
description: "基于 Astro 框架和 astro-whono 主题搭建的个人博客"
date: 2026-02-28
status: "shipped"
stack: ["Astro", "TypeScript", "Markdown", "CSS"]
links:
  github: "https://github.com/jialep38-png/my-world-blog"
tags: ["博客", "个人项目", "Astro"]
draft: false
featured: true
slug: "my-blog"
---

## 项目概述

一个极简风格的个人博客站点，用于记录想法、展示项目、发布短内容。

**技术栈**：
- 框架：[Astro](https://astro.build) v5.x
- 主题：[astro-whono](https://github.com/cxro/astro-whono)（MIT 协议）
- 语言：TypeScript + Markdown
- 部署：GitHub Pages / Vercel / Netlify（静态托管）

## 功能模块

### 内容栏目

| 栏目 | 路由 | 说明 |
|-----|------|------|
| 随笔 | `/essay/` | 长文章，深度内容 |
| 项目 | `/projects/` | 项目展示与记录 |
| 絮语 | `/bits/` | 短内容，类似微博 |
| 小记 | `/memo/` | 日常片段 |
| 归档 | `/archive/` | 按时间归档 |
| 关于 | `/about/` | 站点介绍 |

### 主要特性

- **双栏布局**：侧边导航 + 内容区，移动端自适应
- **深色模式**：支持浅色/深色主题切换
- **阅读模式**：专注阅读，隐藏干扰元素
- **RSS 订阅**：支持全站和分栏订阅
- **评论系统**：集成 Giscus（基于 GitHub Discussions）
- **SEO 优化**：自动生成 sitemap、Open Graph 标签

## 搭建过程

### 1. 环境准备

```
Node.js >= 22.12.0
Git
```

### 2. 获取主题

```bash
git clone https://github.com/cxro/astro-whono.git my-blog
cd my-blog
npm install
```

### 3. 个人化配置

修改 `site.config.mjs`：

```javascript
export const site = {
  url: 'https://your-domain.com',
  title: '站点名称',
  brandTitle: '品牌名',
  author: '作者名',
  authorAvatar: 'author/avatar.jpg',
  description: '站点描述'
};
```

### 4. 清理模板内容

- 删除 `src/content/` 下的示例文章
- 删除 `public/` 下的 demo 图片
- 替换头像、favicon 等资源

### 5. 本地预览

```bash
npm run dev      # 开发模式
npm run build    # 构建
npm run preview  # 预览构建结果
```

### 6. 部署上线

推送到 GitHub 后，可选择：
- **Vercel**：导入仓库，自动部署
- **Netlify**：导入仓库，自动部署
- **Cloudflare Pages**：导入仓库，配置构建命令

## 目录结构

```
├── public/              # 静态资源
│   ├── author/          # 头像
│   ├── fonts/           # 字体文件
│   └── images/          # 图片
├── src/
│   ├── components/      # 组件
│   ├── content/         # 内容（Markdown）
│   │   ├── essay/       # 随笔
│   │   ├── bits/        # 絮语
│   │   ├── memo/        # 小记
│   │   └── projects/    # 项目
│   ├── layouts/         # 布局
│   ├── pages/           # 页面路由
│   └── styles/          # 样式
├── site.config.mjs      # 站点配置
└── astro.config.mjs     # Astro 配置
```

## 后续计划

- [ ] 添加更多项目内容
- [ ] 完善絮语功能
- [ ] 优化移动端体验
- [ ] 添加搜索功能

## 参考资料

- [Astro 官方文档](https://docs.astro.build)
- [astro-whono 主题仓库](https://github.com/cxro/astro-whono)
- [Giscus 评论系统](https://giscus.app)
