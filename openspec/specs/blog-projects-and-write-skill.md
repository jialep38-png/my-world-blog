# 个人博客：Projects 集合 + /write-blog Skill

## 状态：Phase 2 完成，Phase 3-4 待实施

## 项目基础
- 主题：astro-whono-main（Astro 5.16+，极简双栏）
- 位置：`C:\Users\shmil\Desktop\博客\astro-whono-main`
- 部署：Netlify（已有 netlify.toml）
- 个人信息：暂用默认
- 微调：项目完成后再做

## 需求摘要
1. 新增 `projects` 内容集合（卡片式项目展示）
2. 保留 `essay` 集合写详细项目复盘长文
3. 创建 `/write-blog` Claude Code skill，项目结束后自动生成博客

## 零决策执行计划

### Step 1 — projects 集合 Schema（Task #1）
文件：`src/content.config.ts`
- 新增 `projects` 集合，glob loader，base: `./src/content/projects`
- frontmatter 字段：
  - title: string（必填）
  - description: string（必填）
  - date: date（必填，coerce）
  - status: enum(planned | in-progress | shipped | paused | archived)
  - stack: string[]（技术栈标签）
  - links: object { github?: string, demo?: string }
  - cover: string?（封面图）
  - tags: string[]（默认 []）
  - draft: boolean（默认 true）
  - featured: boolean（默认 false，首页精选）
  - slug: string?（lowercase kebab-case）
  - relatedEssays: string[]（关联 essay slug 列表）
- essay schema 新增可选字段：project: string?（反向关联 project slug）

### Step 2 — 页面路由和组件（Task #2）
- `/projects/` 列表页：网格卡片（2列桌面端，1列移动端）
- `/projects/[slug]/` 详情页：轻量 hub（状态、技术栈、链接、关联 essay）
- 新建 `src/components/ProjectCard.astro`
- 详情页复用 `ArticleLayout`
- 长文复盘保持在 `/archive/[slug]/`

### Step 3 — 导航集成（Task #3）
- 侧边栏新增 Projects 导航项
- 首页可选展示 `featured: true` 的精选项目

### Step 4 — /write-blog Skill（Task #4）
- 入口：`.claude/commands/write-blog.md`
- 流程：接受项目路径 → 扫描 README/package.json/源码 → 推断 metadata/stack/status → 询问缺失字段 → 生成 markdown
- 三种模式：project（卡片）、essay（复盘长文）、both
- 默认 draft: true
- 安全：不读 .env、密钥文件

### Step 5 — 验证（Task #5）
- 创建示例 project markdown
- 运行 astro build 验证

### Step 6 — 部署
- Netlify 已有配置，无需改动

### Step 7 — 微调
- 配色/字体/布局收尾（用户要求最后做）

## content helpers 扩展（src/lib/content.ts）
新增：
- `ProjectEntry` 类型
- `getProjectSlug()` 函数
- `getSortedProjects()` 函数
- `getFeaturedProjects()` 函数

## 多模型分析要点
- Codex：status 用 5 值 enum，links 至少存在一个，skill 用 command + script 双层架构
- Gemini：卡片上图下文，2列网格，状态徽章 + 技术栈标签，详情页底部关联 essay

## 关键文件清单
- `src/content.config.ts` — 集合定义
- `src/lib/content.ts` — 内容查询 helpers
- `src/components/` — 组件目录
- `src/layouts/ArticleLayout.astro` — 复用的文章布局
- `src/pages/` — 页面路由
- `site.config.mjs` — 站点配置
- `scripts/new-bit.mjs` — 参考的脚本生成模式
- `.claude/commands/` — skill 命令目录
