# 太鼓之达人官网/相关页汉化（云端词库版）

Tampermonkey 油猴脚本：汉化太鼓之达人官网及相关页面（万代南梦宫娱乐、太鼓之达人官方博客、Donder Hiroba 等）。

本仓库包含脚本本体与运行所需的全部词库文件，通过 GitHub raw 链接在云端加载，无需本地服务器。

## 文件说明

| 文件 | 说明 |
|---|---|
| `taiko.user.js` | 油猴脚本本体（安装此文件） |
| `dict/dict_*.js`（9 个） | 各分类词库（公告/联动/周边/企业/音游/界面/博客/日期等） |
| `dict/taiko_dict.js` | 词库合并器：将所有子词典合并为 `window.GLOBAL_DICT` |
| `images/logo-zh.png` | 页面 Logo 汉化替换图（脚本从云端加载） |
| `images/taiko.ico` | 脚本图标（Tampermonkey 界面显示，`@icon` 云端引用） |

## 安装

1. 安装 Tampermonkey 浏览器扩展。
2. 打开安装链接（点击后 Tampermonkey 会弹出安装确认）：
   `https://raw.githubusercontent.com/hoiyuyiu/taikoTranslate/main/taiko.user.js`
3. 访问目标网站即可自动生效（页面右下角有刷新/语言切换/Dev 悬浮按钮）。

## 更新词库

1. 修改 `dict/` 下对应的 `dict_*.js` 文件。
2. `git add` + `git commit` + `git push` 推送到 GitHub。
3. 在 Tampermonkey 管理面板中对该脚本点击「强制更新」（或等待自动检查更新），`@require` 的云端词库即会重新下载。

> 说明：Tampermonkey 对 `@require` 文件有缓存（约 24 小时检查一次），强制更新可立即生效。
