// taiko_dict.js
(function () {
  "use strict";

  // 1. 确保子词典暂存池已建立
  window.TAIKO_SUB_DICTS = window.TAIKO_SUB_DICTS || [];

  // 2. 将暂存池中的所有子词典对象合并为一个最终的大词典
  const mergedDict = {};
  window.TAIKO_SUB_DICTS.forEach((subDict) => {
    Object.assign(mergedDict, subDict);
  });

  // 3. 暴露给油猴脚本主程序使用
  window.GLOBAL_DICT = mergedDict;
})();
