## ADDED Requirements

### Requirement: write-blog-skill-command

The system SHALL provide a Claude  Code skill command `/write-blog` that accepts a project path and auto-generates blog markdown.

#### Scenario: 生成 project 卡片
- **WHEN** 用户执行 `/write-blog` 并指定项目路径和 mode=project
- **THEN** skill MUST 扫描项目文件，生成 `src/content/projects/<slug>.md`，draft 默认 true

#### Scenario: 生成 essay 复盘
- **WHEN** 用户执行 `/write-blog` 并指定 mode=essay
- **THEN** skill MUST 生成 `src/content/essay/<slug>.md`，含项目背景、技术选型、实现过程、总结

#### Scenario: 同时生成两者
- **WHEN** 用户执行 `/write-blog` 并指定 mode=both
- **THEN** skill MUST 先生成 project 卡片，再生成 essay 复盘，essay 自动填入 project 字段关联

#### Scenario: 安全约束
- **WHEN** 扫描项目文件时
- **THEN** skill MUST 跳过 .env、密钥文件、node_modules 等敏感/无关目录
