# /publish-blog

将目标博客内容从草稿发布到线上，作为唯一上线闸门。

## 参数

- `$ARGUMENTS`：1~N 个目标文件路径（必填）
  - 允许：`src/content/projects/*.md`
  - 允许：`src/content/essay/*.md`

## 用法

```bash
/publish-blog src/content/projects/my-cli-tool.md
/publish-blog src/content/projects/my-cli-tool.md src/content/essay/my-cli-tool-review.md
```

## 职责边界

- 本命令只负责发布闭环，不负责生成内容。
- 仅处理参数中给定的目标文件，禁止修改其他内容文件。

## 执行流程

### 1) 目标校验

- 至少提供 1 个路径
- 所有路径必须存在且为 `.md`
- 所有路径必须位于：
  - `src/content/projects/`
  - 或 `src/content/essay/`

### 2) Frontmatter 合规校验（发布前强制）

按 `src/content.config.ts` 规则校验目标文件：

- 通用：`title`、`date`、`draft`、`slug`（若存在）
- `slug`（若存在）必须是 kebab-case：`^[a-z0-9]+(?:-[a-z0-9]+)*$`
- project 文件：
  - `description` 必填
  - `status` 必须属于：`planned|in-progress|shipped|paused|archived`
  - `links.github` / `links.demo`（若存在）只能为 `http/https`
- essay 文件：
  - `project`（若存在）必须能关联到一个 project slug
  - 关联可来自：现有 `src/content/projects/*.md` 或本次参数中包含的 project 文件

若任一文件校验失败：立即终止，不做发布动作。

### 3) Draft 翻转（仅目标文件）

- 仅将目标文件中的 `draft: true` 改为 `draft: false`
- 若目标文件已是 `draft: false`，保持不变
- 不得触碰非目标文件

### 4) 构建闸门

在仓库根目录执行：

```bash
npm run check && npm run build
```

若失败：终止发布，保留失败输出供修复。

### 5) Git 发布

- `git add` 仅添加目标文件
- 创建发布提交（message 建议：`publish: release selected blog content`）
- `git push origin main`

### 6) 上线回执

输出发布结果：
- commit hash
- 推送分支（`main`）
- 发布文件列表
- 待验收项：
  - project 页面可见
  - essay 页面可见
  - `essay.project` 关联正确
  - GitHub Actions 部署成功

## 示例输出

```text
发布成功。

commit: abcdef1
branch: main
files:
- src/content/projects/my-cli-tool.md
- src/content/essay/my-cli-tool-review.md

验收建议:
- 检查项目卡片是否上线
- 检查复盘文章是否上线
- 检查 article -> project 关联跳转是否正确
- 检查 GitHub Actions 最近一次部署状态
```
