---
layout: ../../layouts/MarkdownFixtureLayout.astro
title: CI Markdown Fixtures
description: 仅用于 CI 校验 markdown 渲染产物的隐藏夹具页。
date: 2026-03-09
---

:::tip[提示块]
这段内容用于校验 callout 容器和标题是否按预期渲染。
:::

```bash
npm run build
npm run ci
```

<ul class="gallery cols-2">
  <li>
    <figure>
      <img src="/favicon-192x192.png" alt="CI 示例图片一" width="192" height="192" />
      <figcaption>CI 示例图片一</figcaption>
    </figure>
  </li>
  <li>
    <figure>
      <img src="/favicon-32x32.png" alt="CI 示例图片二" width="32" height="32" />
      <figcaption>CI 示例图片二</figcaption>
    </figure>
  </li>
</ul>
