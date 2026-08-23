// ==UserScript==
// @name         太鼓之达人官网/相关页汉化
// @namespace    http://tampermonkey.net/
// @version      0.1.0.260823.2212
// @description  支持云端词库，完美兼容片假名终结者，提供页面一键刷新与切换功能
// @author       hoiyuyiu
// 贡献者: Gemini（原作者）
// @icon         https://raw.githubusercontent.com/hoiyuyiu/taikoTranslate/main/images/taiko.ico
// @match        https://*.bandainamcoent.co.jp/*
// @match        https://*.taiko-ch.net/*
// @match        https://donderhiroba.jp/*
// @match        https://taiko.namco-ch.net/*
// @updateURL    https://raw.githubusercontent.com/hoiyuyiu/taikoTranslate/main/taiko.user.js
// @downloadURL  https://raw.githubusercontent.com/hoiyuyiu/taikoTranslate/main/taiko.user.js
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @require      https://raw.githubusercontent.com/hoiyuyiu/taikoTranslate/main/dict/dict_fixed.js
// @require      https://raw.githubusercontent.com/hoiyuyiu/taikoTranslate/main/dict/dict_collab.js
// @require      https://raw.githubusercontent.com/hoiyuyiu/taikoTranslate/main/dict/dict_goods.js
// @require      https://raw.githubusercontent.com/hoiyuyiu/taikoTranslate/main/dict/dict_corp.js
// @require      https://raw.githubusercontent.com/hoiyuyiu/taikoTranslate/main/dict/dict_hiroba.js
// @require      https://raw.githubusercontent.com/hoiyuyiu/taikoTranslate/main/dict/dict_game.js
// @require      https://raw.githubusercontent.com/hoiyuyiu/taikoTranslate/main/dict/dict_ui.js
// @require      https://raw.githubusercontent.com/hoiyuyiu/taikoTranslate/main/dict/dict_blog.js
// @require      https://raw.githubusercontent.com/hoiyuyiu/taikoTranslate/main/dict/dict_date.js
// @require      https://raw.githubusercontent.com/hoiyuyiu/taikoTranslate/main/dict/taiko_dict.js
// ==/UserScript==

(function() {
    'use strict';

    // ==========================================
    // 🎛️ 核心状态管理（从本地读取或初始化）
    // ==========================================
    let isDebugMode = GM_getValue("isDebugMode", false);
    let DEBUG_MARK = isDebugMode ? "^" : "";
    let isTranslationEnabled = GM_getValue("isTranslationEnabled", true);

    const TARGET_LANG = "zh-CN";
    const LOGO_URL = "https://raw.githubusercontent.com/hoiyuyiu/taikoTranslate/main/images/logo-zh.png";
    let DICT = window.GLOBAL_DICT || {};

    // ==========================================
    // 🔘 核心动作函数（控制开关与页面刷新）
    // ==========================================
    function toggleTranslation() {
        isTranslationEnabled = !isTranslationEnabled;
        GM_setValue("isTranslationEnabled", isTranslationEnabled);

        if (document.body) {
            walkTheDOM(document.body);
        }
        location.reload();
    }

    function toggleDebugMode() {
        isDebugMode = !isDebugMode;
        GM_setValue("isDebugMode", isDebugMode);
        location.reload();
    }

    // 🌟 页面刷新逻辑：调用浏览器原生刷新
    function refreshPage() {
        location.reload();
    }

    // ==========================================
    // 🎛️ 油猴菜单注册
    // ==========================================
    function registerMenu() {
        const debugMenuText = isDebugMode ? "🟢 已开启 Debug 标记 (点击关闭)" : "🔴 已开启 Debug 标记 (点击开启)";
        GM_registerMenuCommand(debugMenuText, toggleDebugMode);

        const transMenuText = isTranslationEnabled ? "🟢 汉化已开启 (点击切换回原文)" : "🔴 汉化已关闭 (点击显示汉化)";
        GM_registerMenuCommand(transMenuText, toggleTranslation);
    }
    registerMenu();

    // ==========================================
    // 🎨 动态创建右下角悬浮按钮
    // ==========================================
    function createFloatingButtons() {
        if (document.getElementById('translation-float-container')) return;

        const tooltipStyle = document.createElement('style');
        tooltipStyle.innerHTML = `
            .custom-tooltip {
                position: relative;
            }
            .custom-tooltip::before {
                content: attr(data-tooltip);
                position: absolute;
                top: 50%;
                right: calc(100% + 8px);
                transform: translateY(-50%) scale(0.9);
                background-color: rgba(33, 33, 33, 0.9);
                color: #fff;
                padding: 5px 8px;
                font-size: 12px;
                font-family: "Hiragino Sans GB", "メイリオ", sans-serif;
                font-weight: normal;
                border-radius: 4px;
                white-space: nowrap;
                pointer-events: none;
                opacity: 0;
                visibility: hidden;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                transition: opacity 0.15s ease, transform 0.15s ease, visibility 0.15s;
                transition-delay: 0s;
            }
            .custom-tooltip:hover::before {
                opacity: 1;
                visibility: visible;
                transform: translateY(-50%) scale(1);
                transition-delay: 0.5s;
            }
            .reload-btn-active svg {
                transition: transform 0.4s ease;
                transform: rotate(360deg);
            }
        `;
        document.head.appendChild(tooltipStyle);

        const container = document.createElement('div');
        container.id = 'translation-float-container';
        container.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 999999;
            user-select: none;
        `;

        const baseRoundStyle = `
            width: 30px;
            height: 30px;
            padding: 0;
            border: none;
            border-radius: 50%;
            color: white;
            font-family: "Hiragino Sans GB", "メイリオ", sans-serif;
            font-weight: bold;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            transition: transform 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            white-space: nowrap;
        `;

        const animatedButtons = [];

        // 创建【页面刷新按钮】（仅在汉化模式下显示，且不在 TM 菜单中注册）
        if (isTranslationEnabled) {
            const reloadBtn = document.createElement('button');
            reloadBtn.className = 'custom-tooltip';
            reloadBtn.style.cssText = baseRoundStyle + ` background-color: #1976D2; `;
            reloadBtn.setAttribute('data-tooltip', "刷新页面");

            reloadBtn.innerHTML = `
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
                </svg>
            `;

            reloadBtn.addEventListener('click', () => {
                reloadBtn.classList.add('reload-btn-active');
                refreshPage();
            });

            container.appendChild(reloadBtn);
            animatedButtons.push(reloadBtn);
        }

        // 创建语言切换按钮 (简 / 日)
        const transBtn = document.createElement('button');
        transBtn.className = 'custom-tooltip';
        transBtn.innerText = isTranslationEnabled ? "简" : "日";
        transBtn.style.cssText = baseRoundStyle + ` background-color: #4A4A4A; font-size: 14px; `;
        transBtn.setAttribute('data-tooltip', isTranslationEnabled ? "切换语言" : "言語切り替え");
        transBtn.addEventListener('click', toggleTranslation);
        container.appendChild(transBtn);
        animatedButtons.push(transBtn);

        // 创建标记按钮 (Dev)
        const debugBtn = document.createElement('button');
        debugBtn.className = 'custom-tooltip';
        debugBtn.innerText = "Dev";
        const debugBgColor = isDebugMode ? '#2E7D32' : '#9E9E9E';
        debugBtn.style.cssText = baseRoundStyle + ` background-color: ${debugBgColor}; font-size: 10px; `;
        debugBtn.setAttribute('data-tooltip', "显示/隐藏Debug标识");
        debugBtn.addEventListener('click', toggleDebugMode);
        container.appendChild(debugBtn);
        animatedButtons.push(debugBtn);

        animatedButtons.forEach(btn => {
            btn.onmouseenter = () => btn.style.transform = 'scale(1.08)';
            btn.onmouseleave = () => btn.style.transform = 'scale(1)';
        });

        document.body.appendChild(container);
    }

    // ==========================================
    // 🌟 动态控制字体的注入与移除
    // ==========================================
    function manageChineseFont() {
        const fontStyleId = 'tm-chinese-font-style';
        let existingStyle = document.getElementById(fontStyleId);

        if (isTranslationEnabled) {
            if (!existingStyle) {
                const chineseFontStyle = document.createElement('style');
                chineseFontStyle.id = fontStyleId;
                chineseFontStyle.innerHTML = `* { font-family: "Hiragino Sans GB", "メイリオ", sans-serif !important; }`;
                document.head.appendChild(chineseFontStyle);
            }
        } else {
            if (existingStyle) {
                existingStyle.remove();
            }
        }
    }

    // ==========================================
    // 振假名 Ruby 标签清理函数（仅精准针对被汉化节点）
    // ==========================================
    function cleanupRubyIfNecessary(node) {
        if (!node || !node.parentNode) return;
        if (node.parentNode.tagName === 'RUBY') {
            const rubyElement = node.parentNode;
            const rtElement = rubyElement.querySelector('rt');
            if (rtElement) rtElement.remove();
            const textNode = document.createTextNode(node.nodeValue);
            if (rubyElement.parentNode) {
                rubyElement.parentNode.replaceChild(textNode, rubyElement);
            }
        }
    }

    // ==========================================
    // 替换引擎
    // ==========================================
    function translateNode(node) {
        const ignoreTags = ['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA'];
        if (node.parentNode && ignoreTags.includes(node.parentNode.tagName)) return;
        if (node.parentNode && node.parentNode.tagName === 'RT') return;

        if (node._rawText === undefined) {
            node._rawText = node.nodeValue;
        }

        if (!isTranslationEnabled) {
            if (node.nodeValue !== node._rawText) {
                node.nodeValue = node._rawText;
            }
            return;
        }

        let rawText = node._rawText;
        if (!rawText) return;

        let isReplaced = false;
        const sortedKeys = Object.keys(DICT).sort((a, b) => b.length - a.length);

        for (const key of sortedKeys) {
            if (rawText.includes(key)) {
                const dictItem = DICT[key];
                const trans = (typeof dictItem === 'object') ? (dictItem[TARGET_LANG] || dictItem["zh-CN"]) : dictItem;
                const markedTrans = DEBUG_MARK + trans + DEBUG_MARK;

                rawText = rawText.split(key).join(markedTrans);
                isReplaced = true;
            }
        }

        if (isReplaced) {
            node.nodeValue = rawText;
            setTimeout(() => cleanupRubyIfNecessary(node), 0);
        }
    }

    // ==========================================
    // 🖼️ 图片替换引擎（直接指定替换，不走字典循环）
    // ==========================================
    function translateImage(imgNode) {
        if (!imgNode || imgNode.tagName !== 'IMG') return;

        const currentSrc = imgNode.src;
        // 🌟 核心提速：如果当前图既不是我们要换的日文图，也不是已经换好的云端图片，说明是无关图片，直接秒返回！
        const isTarget = currentSrc.includes("images/blog/logo.png");
        const isReplaced = currentSrc.includes(LOGO_URL);
        if (!isTarget && !isReplaced) return;

        // 后面原封不动
        if (imgNode._rawSrc === undefined) {
            imgNode._rawSrc = currentSrc;
        }

        if (!isTranslationEnabled) {
            if (imgNode.src !== imgNode._rawSrc) imgNode.src = imgNode._rawSrc;
            return;
        }

        if (isTarget && !isReplaced) {
            imgNode.src = LOGO_URL;
        }
    }

    // ==========================================
    // DOM 遍历与动态监听
    // ==========================================
    function walkTheDOM(element) {
        let child = element.firstChild;
        while (child) {
            if (child.nodeType === 3) {
                translateNode(child);
            } else if (child.nodeType === 1) {
                // 🌟 新增：如果遍历过程中遇到了 IMG 标签，直接执行上面写死的图片替换
                if (child.tagName === 'IMG') {
                    translateImage(child);
                }
                walkTheDOM(child);
            }
            child = child.nextSibling;
        }
    }

    // 初始化流控制函数
    function initPipeline() {
        manageChineseFont();
        walkTheDOM(document.body);
        createFloatingButtons();
    }

    // 启动流程
    if (document.body) {
        initPipeline();
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            initPipeline();
        });
    }

    // MutationObserver 动态追踪
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            mutation.addedNodes.forEach((node) => {
                if (node.id === 'translation-float-container' || (node.parentNode && node.parentNode.id === 'translation-float-container')) return;

                if (node.nodeType === 1) {
                    // 🌟 新增：如果网页动态冒出来的这个新节点本身就是 IMG 标签，直接截获并汉化
                    if (node.tagName === 'IMG') translateImage(node);
                    walkTheDOM(node);
                }
                else if (node.nodeType === 3) {
                    translateNode(node);
                }
            });
        }
    });

    observer.observe(document.body || document.documentElement, { childList: true, subtree: true });

    // ==========================================
    // 🏷️ 独立网页标题（document.title）无条件多语言改写
    // ==========================================
    setInterval(() => {
        if (isTranslationEnabled) {
            // 在这里直接指定每种语言对应的中文标题（无需检测日文原标题）
            const titleTranslations = {
                "zh-CN": "太鼓之达人　官方博客|万代南梦宫娱乐官网",
                "zh-TW": "太鼓之達人　官方部落格|萬代南夢宮娛樂官網", // 预留给未来可能扩展的繁体
                "zh-HK": "太鼓之達人　官方網誌|萬代南夢宮娛樂官網",
            };

            // 直接读取核心变量 TARGET_LANG 进行无条件改写
            if (titleTranslations[TARGET_LANG]) {
                document.title = titleTranslations[TARGET_LANG];
            }
        }
    }, 1000);

})();
