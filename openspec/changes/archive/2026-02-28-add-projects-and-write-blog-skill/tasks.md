## 1. Projects 集合 Schema

- [x] 1.1 在 `src/content.config.ts` 新增 projects 集合定义（glob loader + zod schema：title, description, date, status, stack, links, cover, tags, draft, featured, slug, relatedEssays）
- [x] 1.2 在 essay schema 中新增可选 `project: z.string().optional()` 字段
- [x] 1.3 创建 `src/content/projects/` 目录

## 2. Content Helpers

- [x] 2.1 在 `src/lib/content.ts` 新增 ProjectEntry 类型、getProjectSlug()、getSortedProjects() 函数

## 3. 组件

- [x] 3.1 创建 `src/components/ProjectCard.astro`（上图下文卡片，状态徽章 + 技术栈标签 + 链接图标）

## 4. 页面路由

- [x] 4.1 创建 `src/pages/projects/index.astro`（网格列表页）
- [x] 4.2 创建 `src/pages/projects/[...slug].astro`（详情页，复用 ArticleLayout，底部展示关联 essay）

## 5. 导航集成

- [x] 5.1 在侧边栏导航组件中新增 Projects 链接

## 6. /write-blog Skill

- [x] 6.1 创建 `.claude/commands/write-blog.md`（支持 project/essay/both 三种模式，扫描项目路径生成 markdown）

## 7. 验证

- [x] 7.1 创建示例 project markdown 文件
- [x] 7.2 运行 `astro build` 验证构建通过
