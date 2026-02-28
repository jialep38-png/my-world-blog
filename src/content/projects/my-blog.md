---
title: "霁风的小圈"
description: "用 Astro 搭建的个人博客，记录想法与项目"
date: 2026-02-28
status: "shipped"
stack: ["Astro", "TypeScript", "Markdown"]
links:
  github: "https://github.com/jialep38-png/my-world-blog"
tags: ["博客", "个人项目"]
draft: false
featured: true
slug: "my-blog"
---

## 缘起

一直想有个自己的小角落，可以随便写点东西。

社交平台太吵了，公众号又太正式。想要的很简单：一个安静的地方，想写就写，想发就发。

于是就有了这个小圈。

## 选型

找了一圈博客框架，最后选了 [Astro](https://astro.build)。

为什么是它？

- **够快**：静态生成，不需要服务器
- **够简单**：Markdown 写作，专注内容
- **够灵活**：想加什么功能都可以

主题用的是 [astro-whono](https://github.com/cxro/astro-whono)，一个极简双栏主题。喜欢它干净的设计，没有多余的装饰。

## 过程

搭建过程意外地顺利。

**第一步：Fork 主题**

从 GitHub 克隆 astro-whono 到本地，改个仓库名，就有了自己的博客仓库。

**第二步：个人化**

改了这些东西：
- 站点名称和描述
- 头像
- 侧边栏的小引言
- 删掉所有示例内容

**第三步：部署**

推送到 GitHub，自动部署。没有服务器的烦恼，也不用花钱。

整个过程大概两三个小时，大部分时间在纠结该写什么。

## 功能

目前有这些栏目：

| 栏目 | 用途 |
|-----|------|
| 随笔 | 长一点的文章 |
| 项目 | 做过的东西 |
| 絮语 | 短内容、碎碎念 |
| 小记 | 日常片段 |

还加了评论系统（Giscus），基于 GitHub Discussions，不用额外注册账号。

## 感想

搭博客这件事，技术从来不是门槛。

真正难的是坚持写。

希望这个小圈能陪我走久一点。

---

**致谢**

- 主题作者 [cxro](https://github.com/cxro) 的 [astro-whono](https://github.com/cxro/astro-whono)
- [Astro](https://astro.build) 团队
- 帮我搭建的 Claude
