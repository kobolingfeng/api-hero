# ⚡ API HERO — OpenAI Compatible API Tester

> 漫画风格的 OpenAI 兼容 API 测试工具。纯静态页面，零服务器，零追踪。

![Comic Style](https://img.shields.io/badge/Style-Comic%20Book-E23636?style=for-the-badge)
![Static](https://img.shields.io/badge/Type-Pure%20Static-1E90FF?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-FFD700?style=for-the-badge)

## 🦸 功能

- **🔑 API 测试** — 输入 Base URL + API Key + Model，一键测试 OpenAI 兼容 API 是否可用
- **💾 本地存储** — 自动记住你使用过的 API 配置（localStorage，不上传任何数据）
- **📤 多平台导出** — 一键导出配置到：
  - OpenAI `.env`
  - OpenClaw
  - Codex CLI
  - Claude Code
  - Antigravity
  - cURL
  - Python
  - JSON
- **📥 导入** — 支持从 `.json` / `.env` / `.toml` / `.yaml` 文件导入配置
- **🎨 漫画书 UI** — 致敬 Jack Kirby & Stan Lee 时代的漫威漫画风格

## 🚀 使用

直接打开 `index.html` 即可使用，或访问在线部署版本。

**注意**：部分 API 端点可能不支持浏览器直接访问（CORS 限制）。如果遇到网络错误，请确认你的 API 支持跨域请求。

## 📂 项目结构

```
├── index.html    # 主页面
├── style.css     # 漫画书风格样式
├── app.js        # 应用逻辑
└── README.md     # 你正在看的这个
```

## 🔒 隐私

- ✅ 纯静态页面，**没有任何服务器**
- ✅ 所有数据存储在浏览器 localStorage
- ✅ API Key 不会被发送到任何第三方
- ✅ 零追踪，零分析

## ⭐ 喜欢的话

点个 Star 支持一下！

## License

MIT
