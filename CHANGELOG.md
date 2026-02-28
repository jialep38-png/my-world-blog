# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project aims to follow Semantic Versioning.


## [Unreleased]

## [0.1.1] - 2026-02-07
### Added
- 新增 `public/_headers`（Cloudflare Pages 安全响应头基线：CSP/Referrer-Policy/X-Content-Type-Options/Permissions-Policy/HSTS）
- 新增 `netlify.toml` 固化 Netlify 构建与发布参数
- 新增 sitemap 与构建期 `robots.txt`（仅在设置 `SITE_URL` 时启用）
- 新增 `tools/charset-base.txt`（3500 常用字基础表）
- 新增通用 Lightbox 组件/脚本/样式（正文页与 bits 复用）
- 正文页（随笔/归档/小记）图片支持轻灯箱（禁用缩放/拖拽/下滑关闭）
- bits 新增轻量图片预览 dialog 与 Markdown 语法演示
- bits 支持作者覆盖（`author.name`/`author.avatar`）与草稿生成器作者输入
- 新增 `/archive/index.json` 与 `/essay/index.json` 静态搜索索引端点（构建期生成，可缓存）
- 新增 `src/scripts/entry-search.ts`，用于 archive/essay 懒加载索引搜索
### Changed
- 图标体系统一：`src/components/Icon.astro` 扩展并覆盖侧栏、阅读按钮、列表页与 `BitsDraftDialog` 常用图标，清理组件内联 SVG
- 浮层回顶按钮改为模板克隆：`src/layouts/BaseLayout.astro` 新增 `#scroll-top-template`，`src/scripts/sidebar-theme.ts` 改为克隆模板并绑定行为，移除 `innerHTML` 拼接 SVG
- 依赖治理优化：`@astrojs/check` 调整为 `devDependencies`，并新增 `overrides` 锁定 `fast-xml-parser`/`tar` 安全版本
- 新增 `npm run audit:prod`（`npm audit --omit=dev --audit-level=high`）并接入 GitHub Actions CI
- Markdown 渲染链路新增 `rehype-raw` + `rehype-sanitize`（含 allowlist），在保留 callout/gallery/code-block 等结构前提下补齐 XSS 防护
- /bits 列表渲染改为按正文长度分流：清洗后 `<=180` 字保留原 Markdown 结构渲染，`>180` 字显示摘要文本
- archive/essay 列表页与分页页复用 `src/lib/content.ts` 公共工具（`createWithBase`、`getPageSlice`、`getTotalPages`、`buildPaginatedPaths` 等）
- base-aware 路径拼接工具统一为 `src/utils/format.ts` 的 `createWithBase`，清理 BaseLayout/Sidebar/BitCard/RSS/首页/归档详情/bits 脚本中的重复 `withBase` 实现；`src/lib/content.ts` 保留兼容转导出
- `/archive/` 与 `/essay/`（含分页页）新增搜索框与搜索按钮，按索引匹配当前页条目并给出命中状态提示
- 构建时强制内联样式表（`inlineStylesheets: 'always'`），减少首屏阻塞
- `SITE_URL` 缺失时不输出 canonical/og:url，并补充生产警告与部署说明
- bits 灯箱复用通用控制器并统一样式入口（新增 `lightbox.css`）
- 可访问性增强：skip link、`sr-only` 标题、`:focus-visible`、/bits 搜索 label
- bits 图片字段升级为 `images[]`（Breaking：移除旧字段），并重做草稿录入与多图展示策略
- bits 多图展示与交互优化（缩略比例、`+N` 标签、移动端网格、平板泳道等）
- bits 作者与头像策略细化（默认入口、兜底、尺寸）
- 首页 Hero 图片改用 `astro:assets`（AVIF/WebP）与 LCP 控制
- 字体子集化与自托管（LXGW WenKai Lite / Noto Serif SC），移除大字体 preload
- 路由/集合调整：归档入口统一 `/archive/`，/essay 仅重定向，/memo 替代 /kids
### Fixed
- 修复 `src/scripts/lightbox.ts` 在 `exactOptionalPropertyTypes` 下的类型错误（避免 `npm run check` 失败）
- `robots.txt` 移除误导性的 sitemap 注释
- 统一 `page/` 保留 slug 过滤，避免列表与详情不一致导致潜在 404
- 修复 bits 多图 `+N` 点击无响应
- 修复灯箱遮挡与默认露出问题

## [0.1.0] - 2026-01-28 (Pre-release)
### Added
- 代码块工具栏（语言/行数/复制）与 Shiki 构建期注入
- Callout 语法糖管线（`remark-directive` + `remark-callout`）与 DOM 协议实现
- Figure/Caption 与 code-block 组件样式拆分并由 `global.css` 聚合
- bits 搜索索引端点 `/bits/index.json` 与可访问提示
- 客户端交互脚本目录 `src/scripts/`（搜索、主题/阅读模式）
- 移动端/平板回到顶部按钮（渐进增强）
- 文章详情上下篇导航
- CI 与本地聚合命令（`npm run ci`）
- 语言图标映射工具与图标依赖

### Changed
- 代码块变量与结构体系重构（含行号与复制按钮的增强）
- Markdown 指南与 README 补充 Callout / Figure 规则与示例
- `.prose` 排版与 `global.css` 入口拆分、导入顺序整理
- bits 搜索索引改为 JSON 懒加载并加入摘要
- 主题/阅读模式与搜索脚本迁移至 TS 模块，非沉浸页禁用提示
- 移动端断点与布局/触控优化（导航、列表、图像、工具栏等）
- 图标策略优化（logos 优先、别名补充）
- 文档目录结构调整与代码字体入口统一

### Fixed
- 修复暗色模式下纯文本代码块可读性
- 修复代码块语言图标 viewBox 裁切问题
- 修复阅读模式退出按钮错位
- 修复行内代码换行导致背景断裂
- 修复小屏长行内容撑宽导致横向滚动

## Pre-release（未发布历史）

### Added
- 新增最薄 `Callout.astro` 组件，统一输出 callout 结构与属性

### Changed
- callout 图标渲染改为 `.callout-title::before`，支持 `data-icon` 覆盖与 `data-icon="none"`
- callout 样式迁移到 `src/styles/components/callout.css`，`global.css` 使用 `@import` 聚合

### Added
- 增加 `@astrojs/check` 与 `typescript` 依赖以支持 `astro check`
- **夜间模式**：支持浅色/深色主题切换
  - 使用 `data-theme="dark"` 属性切换
  - 自动跟随系统偏好，支持手动切换
  - 切换按钮位于侧栏底部，带无障碍支持（`aria-pressed`、`aria-label`）
  - Shiki 代码高亮双主题（`github-light` / `github-dark`）
- 侧栏底部新增阅读模式与 RSS 按钮（黑白图标、悬停提示），阅读模式全站入口，文章/小记页支持沉浸阅读与退出按钮
- 小记页面 TOC 区域折叠指示器（三角形图标，展开/折叠时旋转）
- Initial Astro theme scaffold with fixed sidebar + content layout.
- Routes: `/`, `/archive/`, `/essay/`, `/bits/`, `/memo/`, `/about/`.
- Content Collections: `essay`, `bits`, `memo`.
- Bits draft generator: `npm run new:bit`.
- RSS endpoints: `/rss.xml`, `/archive/rss.xml`, `/essay/rss.xml`.

### Changed
- callout 样式改为极简竖线形态，移除背景/边框/标题分隔线
- callout 图标改为 `.callout-icon` 钩子，CSS mask 提供 SVG；tip 使用 Lucide sparkles 并设为低饱和绿
- 更新 Markdown 指南中的 callout 示例结构
- 正文图片统一最大宽度为 75% 并居中显示（`.prose img`）
- 小记示例内容替换为可开源保留的原创示例
- 配色调整为暖色调（Stone 色系）
- TOC 区域行间距增加（`gap: 14px`，一级标题间距 `20px`）
- 引用和代码块背景色改用 CSS 变量，适配夜间模式
- 引用样式优化：去除斜体，调整内边距
- 深色模式下 badge 与 bits 搜索按钮配色更统一，提升可读性
- 统一列表页标题结构，新增 `.page-header` 组件（主标题+副标题单行显示）
- 调整背景色为 `#fffefc`（米白色）
- 侧栏标题 hover 效果移除颜色变化，只保留放大
- 导航链接 hover 效果改为向左平移

### Fixed
- 修复 `astro check` 类型检查错误（隐式 `any`、DOM 类型收窄、小记 TOC 类型推断）
- 修正文档指引路径（AI-GUIDE 指向 docs）
- 修复引用内 `<p>` 标签默认 margin 导致的高度问题
- 修复深色模式代码块背景未切换、日间高亮被覆盖的问题

### Removed
- 清理未使用的 CSS 样式（`.bits-hero`、`.memo-subtitle`）
