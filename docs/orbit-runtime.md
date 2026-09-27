# 小星球三维运行时

博客通过独立、同源的 iframe 按需加载五件小星球作品。入口为：

```text
/orbit/viewer.html?world=jielan
```

`world` 只接受 `yesterday-today`、`crossover`、`poem`、`rain-finale`、`jielan`。对应作品版本为 0.12.3、0.12.3、0.22.0、0.12.3、0.24.0。运行时默认不自动转动，支持拖动旋转、滚轮或双指缩放、正侧背视角、复位和暂停；支持自动转动的四件作品还会显示相应按钮。诗作复用 `createWorld`，但导入器为嵌入场景增加了 `orbitOnly` 选项，保留环绕观察并关闭键盘行走和点击地表游园。

## 页面集成

iframe 可以附带 `theme=light` 或 `theme=dark`。父页面也可在同源加载后同步主题：

```js
frame.contentWindow.postMessage(
  { type: 'orbit:theme', theme: 'dark' },
  location.origin,
);
```

父页面观察 iframe 容器是否离屏后，也应同步可见性；`false` 会立即暂停渲染，重新可见后恢复：

```js
frame.contentWindow.postMessage(
  { type: 'orbit:visibility', visible: false },
  location.origin,
);
```

查看器只接受来自同源 parent 的主题和可见性消息。加载成功或失败后，它向同源 parent 分别发送：

```js
{ type: 'orbit:ready', world: 'jielan' }
{ type: 'orbit:error', world: 'jielan' }
```

父页面应延迟创建 iframe，并用 `orbit:visibility` 同步父文档里的容器交点状态。iframe 自身离屏、父容器不可见或文档隐藏时，查看器都会暂停渲染。页面卸载时会释放 Three.js 场景、控制器、材质与 WebGL renderer。

## 素材导入

在项目根目录执行：

```bash
node scripts/import-orbit-assets.mjs /path/to/my-little-orbit/web
```

导入器从本机 My Little Orbit 工作区递归解析五个入口的 JavaScript 依赖，只复制实际依赖的 Three.js 0.180.0 模块、两份标题轮廓、两份芥兰运行时材质图和诗作拼贴纹理。它不会复制旧整页 HTML、GLB、海报、下载文件或私密文件。每次导入会重建 `public/orbit/source/` 与 `public/orbit/vendor/`，并生成：

- `public/orbit/asset-manifest.json`：每个导入文件的来源相对路径、字节数和 SHA-256；
- `public/orbit/SOURCES.md`：版本、来源和许可证摘要；
- `public/orbit/vendor/three/0.180.0/LICENSE` 与 `public/orbit/source/licenses/tiny-planets-MIT.txt`：保留的许可证文本。

`public/orbit/runtime.js` 和 `public/orbit/viewer.html` 是本项目维护的运行时入口，不会被导入器覆盖。
