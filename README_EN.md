# API Tester

> Test whether your OpenAI-compatible API works. Fully static page, encrypted key storage, never leaves your browser.

[中文](./README.md) | English

## Links

- 🌐 **Live Demo**: [api-hero.pages.dev](https://api-hero.pages.dev)
- 💬 **Linux.do**: [linux.do](https://linux.do)

## Features

- **Smart Paste** — Paste a config block, auto-extract Base URL, API Key, and Model name
- **Provider Management** — Manage API configs per provider. Rename, delete, refresh model lists
- **Auto Fetch Models** — Pull all available models from a provider in one click
- **Model Probe** — Select a model from your saved providers, check which support it, and test connectivity individually or in batch
- **AES-GCM Encryption** — API keys encrypted locally using the browser's native Web Crypto API
- **Connection Test** — Send a message to verify API availability. Supports step-by-step Ping diagnostics (DNS → HTTPS → Auth → Model)
- **Batch Test** — Test all saved providers' models in one click
- **Multi-Platform Export** — Export individual or all providers as OpenAI .env / Codex CLI / Claude Code / Antigravity / OpenClaw / cURL / Python / JSON
- **ZIP Export** — Export all provider configs as individual JSONs packed into a ZIP
- **Import Config** — Import `.json` / `.env` / `.toml` / `.yaml` files, auto-saved on import
- **Smart URL Handling** — Auto-normalizes Base URL with or without `/v1`, trailing slashes, etc.
- **CORS Proxy** — Built-in Cloudflare Workers proxy to bypass API provider CORS restrictions
- **Bilingual** — Chinese by default, English toggle in the top-right corner
- **Onboarding** — Interactive guided tour for first-time visitors

## Usage

Visit the live demo, or open `index.html` locally.

> Some features (model fetching, connection tests) may be limited by CORS when opened locally. The online version is recommended.

## Privacy

- Fully static frontend. Cloudflare Workers only forwards requests
- API keys are AES-GCM encrypted and stored in localStorage
- No data is collected or uploaded

## Sponsor

If you find this useful, buy me a coffee ☕

- 💳 [PayPal](https://paypal.me/koboling)

## License

MIT

---

⭐ If you like it, give it a Star
