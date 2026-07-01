# GBA Pixel Portfolio

这是一个静态个人风格网站，直接打开 `index.html` 就能预览。

当前版本使用轻量开场视频，结束后进入作品集首页顶部，作品视频按需加载。

参考和使用的 GitHub 开源方向：

- NES.css / RPGUI：复古像素与游戏 UI 审美参考
- Lenis 1.3.23：丝滑滚动
- GSAP 3.15.0：转场后的入场动效
- Vanilla Tilt 1.8.1：卡片 3D 悬停
- Lucide 1.21.0：按钮和导航图标

常改内容集中在 `index.html`：姓名、简介、作品、文章标题、邮箱和社交链接。

视频轮播也在 `index.html`，当前接入 `assets/compressed/portfolio/` 下的 28 条作品轻量版；脚本会只加载当前和相邻视频，避免首屏过慢。
