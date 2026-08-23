# 太鼓之达人官网/相关页汉化

Tampermonkey 油猴脚本：汉化太鼓之达人官网及相关页面（万代南梦宫娱乐、太鼓之达人官方博客、Donder Hiroba 等）。

脚本本体与运行所需的全部词库文件均在本仓库中，通过 GitHub raw 链接在云端加载，无需本地服务器。

## 安装

[![Install](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fhoiyuyiu%2FtaikoTranslate%2Fmain%2Fversion.json&query=version&prefix=v&label=Install&color=green&style=for-the-badge&logo=tampermonkey&logoColor=white)](https://raw.githubusercontent.com/hoiyuyiu/taikoTranslate/main/taiko.user.js)

点击上方绿色按钮安装（需先安装 Tampermonkey 浏览器扩展），安装后访问目标网站自动生效，页面右下角有刷新 / 语言切换 / Dev 悬浮按钮。

## 更新词库

1. 修改 `dict/` 下对应的 `dict_*.js` 文件。
2. 运行 `node bump-version.mjs` 刷新版本号，然后 `git add -A && git commit && git push`。
3. 在 Tampermonkey 管理面板中对该脚本点击「检查更新」，新版本与云端词库即会重新下载。

> 说明：Tampermonkey 对 `@require` 文件有缓存（默认约 24 小时检查一次），版本号变更会立即触发重下；也可在面板中「强制更新」。
