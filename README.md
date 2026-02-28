# astro-whono

[中文](README.md) | [English](README.en.md)

[![CI](https://img.shields.io/github/actions/workflow/status/cxro/astro-whono/ci.yml?style=flat&label=CI&labelColor=2E3440&color=A3BE8C&logo=githubactions&logoColor=ECEFF4)](https://github.com/cxro/astro-whono/actions/workflows/ci.yml)  [![Node](https://img.shields.io/badge/Node-%3E%3D22.12.0-81A1C1?style=flat&labelColor=2E3440&logo=nodedotjs&logoColor=ECEFF4)](https://github.com/cxro/astro-whono#%E7%8E%AF%E5%A2%83%E8%A6%81%E6%B1%82)  [![Astro](https://img.shields.io/github/package-json/dependency-version/cxro/astro-whono/astro?branch=main&style=flat&label=Astro&labelColor=2E3440&color=BC52EE&logo=astro&logoColor=ECEFF4)](https://docs.astro.build/)  [![License](https://img.shields.io/badge/License-MIT-4C566A?style=flat&labelColor=2E3440&logo=opensourceinitiative&logoColor=ECEFF4)](LICENSE)

一个极简双栏的 Astro 主题，用于个人写作与轻量内容发布。

## 链接

- 在线演示：<https://astro.whono.me>
- 仓库地址：<https://github.com/cxro/astro-whono>


## 预览

<p align="center">
  <img src="public/preview-light.png" width="49%" alt="浅色预览" />
  <img src="public/preview-dark.png" width="49%" alt="深色预览" />
</p>


## 特性

- 双栏布局（侧栏导航 + 内容区）
- 移动端适配
- 内容集合：随笔 / 絮语 / 小记（归档为目录视图）
- 絮语草稿生成器：/bits 页面一键生成 Markdown（复制/下载），支持多图与自动读取尺寸
- RSS：聚合 + 分栏订阅
- 浅色 / 深色模式 + 阅读模式


## 开始使用

### 环境要求

- Node.js 22.12+（建议使用 `.nvmrc`）


### 快速开始

```bash
npm i
# 可重复安装（推荐 CI/排障时使用）
# npm ci
npm run dev
npm run build && npm run preview
```

<details>
  <summary>Windows（PowerShell）提示</summary>

如遇执行策略拦截 `npm.ps1`，可用：

- `cmd /c npm run ...`
- 或改用 Git Bash / WSL
</details>


### 常用命令

- `npm run check`
- `npm run ci`
- `npm run audit:prod`
- `npm run new:bit`
- `npm run font:build`


## 部署

### 一键部署

[![Deploy to Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/new/clone?repository-url=https://github.com/cxro/astro-whono)&nbsp;&nbsp;[![Deploy to Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=flat&logo=netlify&logoColor=white)](https://app.netlify.com/start/deploy?repository=https://github.com/cxro/astro-whono)&nbsp;&nbsp;[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?style=flat&logo=cloudflare&logoColor=white)](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

> 建议在生产环境设置：SITE_URL=https://你的域名（不要以 / 结尾）。
> 未设置时会使用占位地址，页面可访问，但分享与收录相关链接可能不完整。

<details>
  <summary><strong>Cloudflare Pages 部署（手动导入仓库）</strong></summary>

**构建设置**
- Framework preset：Astro
- Build command：`npm run build`
- Output directory：`dist`

**Node.js 版本（通常不用填）**
- 本项目已提供 `.nvmrc`，Cloudflare Pages 会自动读取。
- 如需手动指定，可在 Pages 的环境变量里设置：`NODE_VERSION=22.22.0`

**环境变量（强烈推荐：生产环境一定要设）**
- 在 Pages 项目 → Settings → Environment variables 添加：`SITE_URL=https://你的域名`（例如 `https://astro.whono.me`，不要以 `/` 结尾）

**为什么要设 `SITE_URL`？**
- Astro 会用它生成 canonical、Open Graph 的 `og:url`、RSS 链接、sitemap 等“必须是完整网址”的内容；不设置时，站点也能部署，但这些链接可能变成相对地址或占位域名，影响分享预览和搜索引擎收录。

**关于 sitemap / robots**
- 只有设置了 `SITE_URL`，才会生成 sitemap，并且 `/robots.txt` 才会输出 `Sitemap:` 行（避免指向错误域名）。

</details>

<details>
<summary><strong>部署后检查</strong></summary>

- 首页 / 列表 / 详情页可访问
- RSS 可访问（`/rss.xml` 及分栏 RSS）
- 设置 `SITE_URL` 后：canonical / `og:url` 指向你的域名
- Network 不再请求演示域名资源

</details>


## 配置与入口

### 项目入口

- 站点配置：`site.config.mjs`
- 内容集合：`src/content.config.ts`
- 样式入口：`src/styles/global.css`


## 内容与写作

### 内容与路由

内容集合（Content Collections）：
- 随笔：位于 `src/content/essay` 目录
- 絮语：位于 `src/content/bits` 目录
- 小记：位于 `src/content/memo/index.md`
- 归档：由随笔集合按 `archive` 字段生成目录视图

主要路由：
- 列表页：`/archive/`、`/essay/`、`/bits/`、`/memo/`、`/about/`
- 详情页：`/archive/[...slug]`（唯一入口）


### 核心字段（Frontmatter）

随笔：
```yaml
title: My Post
date: 2026-01-01
draft: false        # 草稿：上线后不会出现在列表/RSS（本地预览可见，默认是 false，可省略）
archive: true       # 归档开关：false 不进 /archive 与 /archive/rss.xml（默认 true，详情与 /essay 仍可见，可省略）
slug: optional      # 自定义 URL slug（默认用文件名）
badge: optional     # 列表徽标；未填时列表显示“随笔”
```

絮语（bits）：
```yaml
date: 2026-01-01T12:00:00+08:00 # 示例；生成器按本地时区输出
tags:                           # 可选标签（默认空数组，可省略）
  - loc:深圳                    # 地点标签写法：loc:<地点>，仅展示第一个
  - 阅读
images:                         # 可选：多图（自动读取图片尺寸，用于减少页面跳动 CLS）
  - src: bits/demo-01.webp      # 支持相对路径 bits/... 或绝对 URL https://...
    width: 800
    height: 800
# draft: true   # 可选：草稿；`dev` 可见，`build/preview` 与线上默认不显示
```

作者信息（仅 /bits/ 页面）：

- 默认作者与头像配置在 `site.config.mjs`：`site.author` / `site.authorAvatar`
- `authorAvatar` 仅写相对路径（不带 `public/`、不带前导 `/`），例如：`author/avatar.webp`
- 单条 bits 可在 frontmatter 用 `author` 覆盖：

```yaml
author:
  name: Alice
  avatar: author/alice.webp
```

- 头像图片缺失或加载失败时，会自动回退到首字母头像


### 摘要与描述（description）

- 列表摘要默认从正文生成（清洗后截断）
- 可用 `<!-- more -->` 指定摘要截取位置
- `description` 仅用于 SEO/OG（meta description），不影响列表摘要


### 写作约定（内容块）

- Callout：推荐语法糖 `:::note[title] ... :::`（note / tip / info / warning）；HTML 方式使用 `.callout-title`，隐藏图标用 `data-icon="none"`
- Figure：`figure > (img|picture) + figcaption?`
- Gallery：`ul.gallery > li > figure > (img|picture) + figcaption?`（可选 cols-2/cols-3）
- Quote：标准 `blockquote`，可选 `cite` 标注来源
- Pullquote：`blockquote.pullquote`
- Code Block：构建时增强工具栏/复制按钮/行号（作者无需额外写法）

Callout 示例：

```md
:::note[Note]
这里是正文……
:::
```

HTML 示例：

```html
<div class="callout note">
  <p class="callout-title" data-icon="none">Note</p>
  <p>这里是正文……</p>
</div>
```


## 字体与许可

本主题使用两套字体排版（自托管 + 子集化）：
- Noto Serif SC（400 / 600）
- LXGW WenKai Lite（Regular）

仓库提交的是子集化后的 WOFF2 字体（latin / cjk-common / cjk-ext 三段，`unicode-range` 按需加载），因此 **clone 即用**。
子集字符集由仓库文本 + `tools/charset-base.txt`（3500 常用字）共同生成，用来降低缺字概率。

重新生成字体子集：
1. 准备源字体放入 `tools/fonts-src/`
2. 运行 `npm run font:build`
3. 若出现缺字，将缺失字符补到 `tools/charset-common.txt` 后重跑

<details>
  <summary>字体文件清单（子集 + 源字体）</summary>

子集文件（仓库内）：
- `public/fonts/lxgw-wenkai-lite-latin.woff2`
- `public/fonts/lxgw-wenkai-lite-cjk-common.woff2`
- `public/fonts/lxgw-wenkai-lite-cjk-ext.woff2`
- `public/fonts/noto-serif-sc-400-latin.woff2`
- `public/fonts/noto-serif-sc-400-cjk-common.woff2`
- `public/fonts/noto-serif-sc-400-cjk-ext.woff2`
- `public/fonts/noto-serif-sc-600-latin.woff2`
- `public/fonts/noto-serif-sc-600-cjk-common.woff2`
- `public/fonts/noto-serif-sc-600-cjk-ext.woff2`

源字体（不入库）：
- `tools/fonts-src/LXGWWenKaiLite-Regular.woff2`
- `tools/fonts-src/NotoSerifSC-Regular.ttf`
- `tools/fonts-src/NotoSerifSC-SemiBold.ttf`
</details>

字体许可：SIL Open Font License 1.1（见 `public/fonts/OFL-LXGW-WenKai-Lite.txt` 与 `public/fonts/OFL-NotoSerifSC.txt`）。


## RSS

- `/rss.xml`（聚合）
- `/archive/rss.xml`
- `/essay/rss.xml`

部署时建议设置 `SITE_URL`（影响 RSS/OG/canonical 的绝对链接）。


## 贡献

欢迎创建 Issue 来报告问题或提出想法。
欢迎提交 Pull Request 参与开发，建议从 feature/* 分支发起。

### Fork 同步上游

```bash
git remote add upstream https://github.com/cxro/astro-whono.git
git fetch upstream --tags
git checkout main
git merge upstream/main
git push origin main --tags
```


## 致谢

- 感谢 [elizen/elizen-blog](https://github.com/elizen/elizen-blog)，这是本主题设计的起点，其风格源自Hugo 主题  [yihui/hugo-ivy](https://github.com/yihui/hugo-ivy)


## 许可证

License：MIT


