# astro-whono

[中文](README.md) | [English](README.en.md)

[![CI](https://img.shields.io/github/actions/workflow/status/cxro/astro-whono/ci.yml?style=flat&label=CI&labelColor=2E3440&color=A3BE8C&logo=githubactions&logoColor=ECEFF4)](https://github.com/cxro/astro-whono/actions/workflows/ci.yml)  [![Node](https://img.shields.io/badge/Node-%3E%3D22.12.0-81A1C1?style=flat&labelColor=2E3440&logo=nodedotjs&logoColor=ECEFF4)](README.en.md#requirements)  [![Astro](https://img.shields.io/github/package-json/dependency-version/cxro/astro-whono/astro?branch=main&style=flat&label=Astro&labelColor=2E3440&color=BC52EE&logo=astro&logoColor=ECEFF4)](https://docs.astro.build/)  [![License](https://img.shields.io/badge/License-MIT-4C566A?style=flat&labelColor=2E3440&logo=opensourceinitiative&logoColor=ECEFF4)](LICENSE)

A minimal two-column Astro theme for personal writing and lightweight publishing.

## Links

- Live demo: <https://astro.whono.me>
- Repository: <https://github.com/cxro/astro-whono>


## Preview

<p align="center">
  <img src="public/preview-light.png" width="49%" alt="Light preview" />
  <img src="public/preview-dark.png" width="49%" alt="Dark preview" />
</p>


## Features

- Two-column layout (sidebar navigation + content area)
- Responsive design for mobile devices
- Content collections: essay / bits / memo (archive is generated from essay)
- Bits draft generator on `/bits/`: one-click Markdown output (copy/download), with multi-image support and automatic image dimension detection
- RSS: aggregated feed + section feeds
- Light / dark theme + reading mode


## Getting Started

### Requirements

- Node.js 22.12+ (`.nvmrc` recommended)


### Quick Start

```bash
npm i
# Repeatable install (recommended for CI/troubleshooting)
# npm ci
npm run dev
npm run build && npm run preview
```

<details>
  <summary>Windows (PowerShell) note</summary>

If execution policy blocks `npm.ps1`, use one of the following:

- `cmd /c npm run ...`
- Or use Git Bash / WSL
</details>


### Common Commands

- `npm run check`
- `npm run ci`
- `npm run audit:prod`
- `npm run new:bit`
- `npm run font:build`


## Deployment

### One-click Deploy

[![Deploy to Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/new/clone?repository-url=https://github.com/cxro/astro-whono)&nbsp;&nbsp;[![Deploy to Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7?style=flat&logo=netlify&logoColor=white)](https://app.netlify.com/start/deploy?repository=https://github.com/cxro/astro-whono)&nbsp;&nbsp;[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?style=flat&logo=cloudflare&logoColor=white)](https://dash.cloudflare.com/?to=/:account/workers-and-pages)

> For production, set: `SITE_URL=https://your-domain` (without a trailing slash).
> If not set, the site can still run, but link metadata for sharing/indexing may be incomplete.

<details>
  <summary><strong>Cloudflare Pages deployment (manual repository import)</strong></summary>

**Build settings**
- Framework preset: `Astro`
- Build command: `npm run build`
- Output directory: `dist`

**Node.js version (usually not required)**
- This project includes `.nvmrc`, and Cloudflare Pages reads it automatically.
- If you need to set it manually, add `NODE_VERSION=22.22.0` in environment variables.

**Environment variables (strongly recommended for production)**
- In Pages project -> Settings -> Environment variables, add: `SITE_URL=https://your-domain` (for example `https://astro.whono.me`, without a trailing `/`).

**Why set `SITE_URL`?**
- Astro uses it to generate canonical, Open Graph `og:url`, RSS links, sitemap, and other fields that require absolute URLs. Without `SITE_URL`, deployment still works, but these links may fall back to relative paths or placeholder domains, which can hurt share previews and search indexing.

**About sitemap / robots**
- `sitemap` is generated only when `SITE_URL` is set, and `/robots.txt` includes a `Sitemap:` line only in that case (to avoid pointing to the wrong domain).

</details>

<details>
<summary><strong>Post-deploy checklist</strong></summary>

- Home page / list pages / detail pages are accessible
- RSS endpoints are accessible (`/rss.xml` and section feeds)
- With `SITE_URL` set: canonical / `og:url` point to your domain
- No network requests to demo-domain resources

</details>


## Configuration and Entry Points

### Project Entry Points

- Site config: `site.config.mjs`
- Content collections: `src/content.config.ts`
- Style entry: `src/styles/global.css`


## Content and Writing

### Collections and Routes

Content Collections:
- Essay: `src/content/essay`
- Bits: `src/content/bits`
- Memo: `src/content/memo/index.md`
- Archive: generated from essay entries via the `archive` field

Main routes:
- List pages: `/archive/`, `/essay/`, `/bits/`, `/memo/`, `/about/`
- Detail page: `/archive/[...slug]` (single canonical entry point)


### Core Frontmatter Fields

Essay:
```yaml
title: My Post
date: 2026-01-01
draft: false        # Draft: hidden from list/RSS in production (visible in local preview; default false, optional)
archive: true       # Archive switch: false excludes it from /archive and /archive/rss.xml (default true; detail page and /essay remain available)
slug: optional      # Custom URL slug (filename is used by default)
badge: optional     # List badge; if omitted, list shows "Essay"
```

Bits:
```yaml
date: 2026-01-01T12:00:00+08:00 # Example; generator outputs local timezone
tags:                           # Optional tags (defaults to empty array)
  - loc:Shenzhen                # Location tag format: loc:<place>; only the first one is displayed
  - reading
images:                         # Optional: multi-image list (dimensions reduce CLS)
  - src: bits/demo-01.webp      # Supports relative path bits/... or absolute URL https://...
    width: 800
    height: 800
# draft: true   # Optional draft; visible in `dev`, hidden by default in `build/preview` and production
```

Author info (on `/bits/` only):

- Default author and avatar are configured in `site.config.mjs`: `site.author` / `site.authorAvatar`
- `authorAvatar` should be a relative path only (no `public/`, no leading `/`), for example: `author/avatar.webp`
- Per-bit overrides are supported via `author` in frontmatter:

```yaml
author:
  name: Alice
  avatar: author/alice.webp
```

- If the avatar is missing or fails to load, it automatically falls back to an initial-based avatar.


### Excerpt and Description (`description`)

- List excerpt is generated from content by default (sanitized and truncated)
- Use `<!-- more -->` to define excerpt split point
- `description` is used for SEO/OG (meta description) only and does not affect list excerpts


### Writing Conventions (Content Blocks)

- Callout: recommended directive syntax `:::note[title] ... :::` (`note` / `tip` / `info` / `warning`); in HTML form use `.callout-title`, and use `data-icon="none"` to hide icon
- Figure: `figure > (img|picture) + figcaption?`
- Gallery: `ul.gallery > li > figure > (img|picture) + figcaption?` (optional `cols-2` / `cols-3`)
- Quote: standard `blockquote`, optional `cite` for source
- Pullquote: `blockquote.pullquote`
- Code Block: toolbar / copy button / line numbers are enhanced at build time (no extra author-side syntax needed)

Callout example:

```md
:::note[Note]
Body text goes here...
:::
```

HTML example:

```html
<div class="callout note">
  <p class="callout-title" data-icon="none">Note</p>
  <p>Body text goes here...</p>
</div>
```


## Fonts and Licensing

This theme uses two typeface families (self-hosted + subsetted):
- Noto Serif SC (400 / 600)
- LXGW WenKai Lite (Regular)

The repository includes subsetted WOFF2 files (`latin` / `cjk-common` / `cjk-ext`, loaded on demand via `unicode-range`), so you can use the project immediately after cloning.
Subset charset is generated from repository text plus `tools/charset-base.txt` (3,500 common characters) to reduce missing-glyph cases.

To regenerate font subsets:
1. Put source font files in `tools/fonts-src/`
2. Run `npm run font:build`
3. If glyphs are missing, add them to `tools/charset-common.txt` and run again

<details>
  <summary>Font file list (subsets + source files)</summary>

Subset files (tracked in repository):
- `public/fonts/lxgw-wenkai-lite-latin.woff2`
- `public/fonts/lxgw-wenkai-lite-cjk-common.woff2`
- `public/fonts/lxgw-wenkai-lite-cjk-ext.woff2`
- `public/fonts/noto-serif-sc-400-latin.woff2`
- `public/fonts/noto-serif-sc-400-cjk-common.woff2`
- `public/fonts/noto-serif-sc-400-cjk-ext.woff2`
- `public/fonts/noto-serif-sc-600-latin.woff2`
- `public/fonts/noto-serif-sc-600-cjk-common.woff2`
- `public/fonts/noto-serif-sc-600-cjk-ext.woff2`

Source files (not tracked in repository):
- `tools/fonts-src/LXGWWenKaiLite-Regular.woff2`
- `tools/fonts-src/NotoSerifSC-Regular.ttf`
- `tools/fonts-src/NotoSerifSC-SemiBold.ttf`
</details>

Font license: SIL Open Font License 1.1 (see `public/fonts/OFL-LXGW-WenKai-Lite.txt` and `public/fonts/OFL-NotoSerifSC.txt`).


## RSS

- `/rss.xml` (aggregated)
- `/archive/rss.xml`
- `/essay/rss.xml`

Setting `SITE_URL` is recommended for deployment (affects absolute links in RSS/OG/canonical).


## Contributing

Issues are welcome for bug reports and ideas.
Pull requests are welcome; using a `feature/*` branch is recommended.

### Sync Upstream in a Fork

```bash
git remote add upstream https://github.com/cxro/astro-whono.git
git fetch upstream --tags
git checkout main
git merge upstream/main
git push origin main --tags
```


## Acknowledgements

- Thanks to [elizen/elizen-blog](https://github.com/elizen/elizen-blog), the starting point of this theme design, which is inspired by the Hugo theme [yihui/hugo-ivy](https://github.com/yihui/hugo-ivy)


## License

License: MIT


