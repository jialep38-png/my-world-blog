## ADDED Requirements

### Requirement: projects-collection-schema

The system SHALL provide a projects content collection using Astro Content Collections API (defineCollection + glob loader), stored in `src/content/projects/`.

#### Scenario: 创建新项目条目
- **WHEN** 在 `src/content/projects/` 下新建 `.md` 文件并填写 frontmatter
- **THEN** Astro 构建时 MUST 自动识别为 projects 集合条目，frontmatter 通过 zod schema 校验

#### Scenario: 必填字段缺失
- **WHEN** frontmatter 缺少 title、description 或 date
- **THEN** 构建 MUST 报错，提示缺失字段

#### Scenario: status 枚举校验
- **WHEN** status 字段值不在 planned/in-progress/shipped/paused/archived 中
- **THEN** 构建 MUST 报错

### Requirement: projects-pages

The system SHALL provide `/projects/` listing page and `/projects/[slug]/` detail page.

#### Scenario: 访问项目列表
- **WHEN** 用户访问 `/projects/`
- **THEN** 页面 MUST 显示所有非 draft 项目的卡片网格（2列桌面端，1列移动端），按日期降序

#### Scenario: 访问项目详情
- **WHEN** 用户访问 `/projects/[slug]/`
- **THEN** 页面 MUST 显示项目完整信息（状态、技术栈、链接）+ markdown 正文 + 关联 essay 列表

### Requirement: essay-project-cross-link

The essay collection SHALL have an optional `project: string` field, and projects collection MUST have `relatedEssays: string[]` field for bidirectional linking.

#### Scenario: 项目详情页展示关联文章
- **WHEN** 项目的 relatedEssays 包含有效 essay slug
- **THEN** 详情页 MUST 在底部显示关联 essay 链接列表

### Requirement: sidebar-projects-nav

The sidebar navigation SHALL include a Projects entry.

#### Scenario: 导航可见
- **WHEN** 用户在任意页面
- **THEN** 侧边栏 MUST 显示 Projects 导航链接，点击跳转 `/projects/`
