## Why

用户需要一个个人博客来展示做过的项目和玩过的内容。现有 astro-whono-main 主题仅有 essay/bits/memo 三种内容集合，缺少专门的项目展示能力。同时需要 Claude Code 能在项目结束后自动生成博客文章，减少手动写作成本。

## What Changes

1. 新增 `projects` 内容集合，支持卡片式项目展示（技术栈、状态、链接）
2. 新增 `/projects/` 列表页和 `/projects/[slug]/` 详情页
3. essay 集合新增可选 `project` 字段，实现项目与复盘文章的双向关联
4. 侧边栏新增 Projects 导航项
5. 新增 `/write-blog` Claude Code skill，自动从项目上下文生成博客内容

## Capabilities

### New Capabilities

- `projects-collection`: 项目展示内容集合，含 status/stack/links/featured 等字段，支持卡片网格列表和详情页
- `write-blog-skill`: Claude Code skill 命令，扫描项目路径自动生成 project 卡片和/或 essay 复盘文章

### Modified Capabilities

- `essay-collection`: 新增可选 `project: string` 字段，反向关联 project slug
- `sidebar-navigation`: 新增 Projects 导航入口

## Impact

- `src/content.config.ts` — 新增 projects 集合 schema，essay schema 新增 project 字段
- `src/content/projects/` — 新增内容目录
- `src/lib/content.ts` — 新增 ProjectEntry 类型和查询 helpers
- `src/components/ProjectCard.astro` — 新增卡片组件
- `src/pages/projects/` — 新增列表页和详情页路由
- `src/components/Sidebar.astro`（或等效导航组件）— 新增 Projects 链接
- `.claude/commands/write-blog.md` — 新增 skill 命令
- 无新依赖，无破坏性变更
