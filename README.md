# API Tester

> 测试你的 OpenAI 兼容 API 是否可用。纯静态页面，密钥不离开浏览器。

🌐 **在线使用**：[https://api-hero-tester.netlify.app](https://api-hero-tester.netlify.app)

## 功能

- **API 连通测试** — 输入 Base URL + API Key + Model，一键验证
- **本地存储** — 自动记住你的配置（localStorage），不上传任何数据
- **多平台导出** — 一键导出配置到 OpenAI .env / OpenClaw / Codex CLI / Claude Code / Antigravity / cURL / Python / JSON
- **导入配置** — 支持从 `.json` / `.env` / `.toml` / `.yaml` 文件导入
- **中英双语** — 默认中文，右上角可切换英文

## 使用

直接打开 `index.html`，或访问上面的在线地址。

> 部分 API 端点可能不支持浏览器跨域请求（CORS），遇到网络错误时请确认 API 是否支持跨域。

## 隐私

- 纯静态，没有服务器
- 所有数据存于 localStorage
- API Key 不会发送到任何第三方

## License

MIT

---

⭐ 喜欢的话点个 Star
