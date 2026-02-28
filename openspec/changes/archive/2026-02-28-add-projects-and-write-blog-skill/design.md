## Context

astro-whono-main 是一个极简双栏 Astro 博客主题，现有 essay/bits/memo 三种内容集合。用户需要新增项目展示能力和 Claude Code 自动写博客的 skill。项目使用 Astro 5.16+、TypeScript strict、Tailwind（无）纯 CSS、Netlify 部署。

## Goals / Non-Goals

**Goals:**
- 新增 projects 集合，与现有集合模式一致（glob loader + zod schema）
- 提供卡片式列表页和详情页，视觉风格与现有主题一致
- projects 与 essay 双向关联
- /write-blog skill 能从任意项目路径自动生成内容
- 所有变更不破坏现有功能

**Non-Goals:**
- 不做评论系统、CMS 集成
- 不做分页（项目数量初期不多，后续按需加）
- 不做首页精选项目展示（后续微调阶段再加）
- 不改现有主题配色/字体/布局

## Decisions

1. **projects schema 用 string[] 而非 object[] 表示 stack** — 简单够用，卡片上直接渲染为标签。后续需要图标/链接时再升级。

2. **links 用 object { github?, demo? } 而非 array** — 字段固定，类型安全，模板渲染简单。

3. **relatedEssays 用 slug string[] 而非 Astro reference()** — 避免循环引用复杂度，slug 匹配足够可靠。

4. **详情页复用 ArticleLayout** — 保持视觉一致性，减少新组件开发量。

5. **/write-blog 用 Claude Code command（.claude/commands/write-blog.md）** — 最轻量的 skill 形式，无需额外脚本，Claude 直接执行指令。

6. **生成内容默认 draft: true** — 防止误发布，用户确认后手动改为 false。

## Risks / Trade-offs

- **slug 关联松耦合**：relatedEssays 用字符串而非强引用，拼写错误不会构建报错。可接受，因为内容量小且由 AI 生成。
- **无分页**：项目多了之后列表页会变长。初期可接受，后续按 essay 的分页模式加。
- **skill 依赖 Claude Code 上下文**：/write-blog 的质量取决于 Claude 对项目的理解深度。通过扫描 README + package.json + 关键源码来保证。
