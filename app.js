/* =========================================
   API Tester — App Logic
   Provider-Centric · AES-GCM · Batch Test
   ========================================= */

const STORAGE_KEY = 'api-tester-providers';
const CRYPTO_KEY_NAME = 'api-tester-ck';
let currentExportData = { content: '', filename: '' };
let currentLang = 'zh';
let onboardingStep = 0;
let expandedProviders = new Set();
let fetchedModelsCache = []; // temp cache for current fetch

// ══════════════════════════════════
//  i18n
// ══════════════════════════════════
const i18n = {
  zh: {
    hero_title: '测试你的 OpenAI 兼容 API',
    hero_desc: '输入 Base URL 和 API Key，一键验证连通性。纯静态页面，密钥加密存储，不离开浏览器。',
    security_badge: 'AES-GCM 加密存储 · 密钥不离开浏览器',
    config_title: '接口配置',
    label_base_url: 'Base URL',
    label_api_key: 'API Key',
    label_encrypted: '已加密',
    label_model: '模型',
    label_prompt: '测试 Prompt',
    hint_base_url: 'API 提供商的接口地址，通常以 /v1 结尾',
    hint_api_key: '你的 API 密钥，保存时会使用 AES-GCM 加密',
    hint_model: '手动输入或点击右侧按钮自动获取可用模型',
    models_available: '可用模型',
    models_fetching: '正在获取模型列表…',
    models_none: '未找到可用模型',
    models_error: '获取模型列表失败',
    testall_title: '批量连通测试',
    testall_empty: '没有保存的服务商，请先保存至少一个',
    testall_running: '批量测试中…',
    testall_done: '批量测试完成',
    testall_pass: '通过',
    testall_fail: '失败',
    testall_fetching: '获取模型…',
    testall_testing: '测试中…',
    testall_nomodels: '无可用模型',
    testall_skip: '跳过（无模型）',
    btn_test: '测试连接',
    btn_ping: '连通检测',
    btn_save: '保存服务商',
    btn_copy: '复制',
    btn_download: '下载',
    saved_title: '服务商',
    empty_saved: '暂无保存的服务商',
    result_title: '测试结果',
    idle_text: '等待测试…',
    loading_text: '正在连接…',
    success_text: '连接成功',
    error_text: '连接失败',
    stat_latency: '延迟',
    stat_tokens: 'Tokens',
    stat_model: '模型',
    export_title: '导出配置',
    export_desc: '将当前配置导出为各平台通用格式',
    footer_text: '纯静态 · AES-GCM 加密 · 无服务器 · 无追踪',
    footer_star: '喜欢的话点个',
    onboarding_skip: '跳过',
    onboarding_next: '下一步',
    toast_saved: '✓ 已保存（密钥已加密）',
    toast_deleted: '✓ 已删除',
    toast_loaded: '✓ 已加载',
    toast_copied: '✓ 已复制',
    toast_imported: '✓ 导入并保存成功',
    toast_import_fail: '✗ 导入失败',
    toast_need_url: '请填写 Base URL',
    toast_need_key: '请填写 API Key',
    toast_need_model: '请填写模型名',
    toast_need_config: '请至少填写 Base URL 和 API Key',
    toast_renamed: '✓ 已重命名',
    toast_fetching_models: '正在获取模型列表…',
    prompt_name: '为该服务商命名：',
    prompt_rename: '输入新名称：',
    confirm_delete: '确认删除该服务商及其所有配置？',
    status_ok: '正常',
    status_fail: '失败',
    ping_dns: 'DNS 解析',
    ping_tls: 'HTTPS 连接',
    ping_auth: '身份验证',
    ping_model: '模型可用性',
    ping_ok: '正常',
    ping_fail: '失败',
    ping_wait: '等待中',
    ping_running: '检测中…',
    ping_dns_ok: '域名解析成功',
    ping_tls_ok: '安全连接已建立',
    ping_auth_ok: '认证通过',
    ping_model_ok: '模型可用',
    provider_models_count: '个模型',
    provider_no_models: '尚未获取模型',
    provider_refresh: '刷新模型列表',
    onboard: [
      { title: '👋 欢迎使用 API Tester', desc: '这是一个纯静态的 OpenAI 兼容 API 测试工具。你的 API Key 使用 AES-GCM 加密存储在浏览器中，不会发送到任何第三方服务器。\n\n让我带你快速了解各个功能。' },
      { title: '① 填写 Base URL', desc: 'API 提供商给你的接口地址。通常格式为 https://xxx.com/v1 。如果不确定，可以先试试填入提供商给的地址。', target: 'field-base-url' },
      { title: '② 填写 API Key', desc: '你的 API 密钥。输入框默认隐藏内容，点击右侧 👁 可切换显示。保存时会自动加密，不会以明文存储。', target: 'field-api-key' },
      { title: '③ 选择模型', desc: '手动填写模型名称，或点击输入框右侧的刷新按钮自动获取提供商的全部可用模型列表。', target: 'field-model' },
      { title: '④ 测试连接', desc: '• 「测试连接」会发送一条消息并获取完整回复\n• 「连通检测」会逐步检查 DNS、HTTPS、认证和模型\n• 「保存服务商」会自动获取所有可用模型并加密保存', target: 'card-actions' },
      { title: '⑤ 管理服务商', desc: '保存的服务商会列在这里，展开可看到全部模型。点击模型即可加载。支持重命名、删除和一键批量测试。还可导入 .json / .env / .toml / .yaml 文件（导入自动保存）。', target: 'card-saved' },
      { title: '⑥ 导出配置', desc: '你可以将当前配置一键导出为 OpenAI .env、Codex CLI、Claude Code、cURL、Python 等多种主流格式。', target: 'card-export' },
      { title: '🎉 准备就绪！', desc: '你已经了解了所有功能。现在就填写你的 API 信息，开始测试吧！\n\n提示：右上角的 ❓ 按钮可以随时重新打开引导。' },
    ],
  },
  en: {
    hero_title: 'Test Your OpenAI-Compatible API',
    hero_desc: 'Enter your Base URL and API Key, one click to verify connectivity. Fully static, keys encrypted locally.',
    security_badge: 'AES-GCM Encrypted · Keys Never Leave Browser',
    config_title: 'CONFIGURATION',
    label_base_url: 'Base URL',
    label_api_key: 'API Key',
    label_encrypted: 'Encrypted',
    label_model: 'Model',
    label_prompt: 'Test Prompt',
    hint_base_url: 'Your API provider endpoint, usually ending with /v1',
    hint_api_key: 'Your API key — saved with AES-GCM encryption',
    hint_model: 'Type manually or click the refresh button to auto-fetch',
    models_available: 'Available Models',
    models_fetching: 'Fetching model list…',
    models_none: 'No models found',
    models_error: 'Failed to fetch models',
    testall_title: 'Batch Connectivity Test',
    testall_empty: 'No saved providers. Save at least one first.',
    testall_running: 'Running batch test…',
    testall_done: 'Batch test complete',
    testall_pass: 'Pass',
    testall_fail: 'Fail',
    testall_fetching: 'Fetching…',
    testall_testing: 'Testing…',
    testall_nomodels: 'No models available',
    testall_skip: 'Skipped (no models)',
    btn_test: 'Test',
    btn_ping: 'Ping',
    btn_save: 'Save Provider',
    btn_copy: 'Copy',
    btn_download: 'Download',
    saved_title: 'PROVIDERS',
    empty_saved: 'No saved providers',
    result_title: 'RESULTS',
    idle_text: 'Waiting for test…',
    loading_text: 'Connecting…',
    success_text: 'Connected',
    error_text: 'Failed',
    stat_latency: 'Latency',
    stat_tokens: 'Tokens',
    stat_model: 'Model',
    export_title: 'EXPORT',
    export_desc: 'Export current config for various platforms',
    footer_text: 'Static · AES-GCM Encrypted · No Server · No Tracking',
    footer_star: 'Like it? Star on',
    onboarding_skip: 'Skip',
    onboarding_next: 'Next',
    toast_saved: '✓ Saved (key encrypted)',
    toast_deleted: '✓ Deleted',
    toast_loaded: '✓ Loaded',
    toast_copied: '✓ Copied',
    toast_imported: '✓ Imported & saved',
    toast_import_fail: '✗ Import failed',
    toast_need_url: 'Base URL required',
    toast_need_key: 'API Key required',
    toast_need_model: 'Model required',
    toast_need_config: 'Need at least Base URL and API Key',
    toast_renamed: '✓ Renamed',
    toast_fetching_models: 'Fetching models…',
    prompt_name: 'Name this provider:',
    prompt_rename: 'Enter new name:',
    confirm_delete: 'Delete this provider and all its config?',
    status_ok: 'OK',
    status_fail: 'FAIL',
    ping_dns: 'DNS Resolution',
    ping_tls: 'HTTPS Connection',
    ping_auth: 'Authentication',
    ping_model: 'Model Availability',
    ping_ok: 'OK',
    ping_fail: 'Failed',
    ping_wait: 'Waiting',
    ping_running: 'Checking…',
    ping_dns_ok: 'Domain resolved',
    ping_tls_ok: 'Secure connection established',
    ping_auth_ok: 'Authenticated',
    ping_model_ok: 'Model available',
    provider_models_count: ' models',
    provider_no_models: 'Models not fetched',
    provider_refresh: 'Refresh model list',
    onboard: [
      { title: '👋 Welcome to API Tester', desc: 'A fully static OpenAI-compatible API testing tool. Your API Key is encrypted with AES-GCM and stored only in your browser.\n\nLet me walk you through the features.' },
      { title: '① Base URL', desc: 'The endpoint URL from your API provider. Usually something like https://api.openai.com/v1. If unsure, paste the URL your provider gave you.', target: 'field-base-url' },
      { title: '② API Key', desc: 'Your secret API key. The input is masked by default — click the 👁 icon to toggle visibility. Keys are encrypted before saving.', target: 'field-api-key' },
      { title: '③ Model', desc: 'Type a model name manually, or click the refresh icon to auto-fetch ALL available models from the provider.', target: 'field-model' },
      { title: '④ Test & Save', desc: '• "Test" sends a message and gets a full response\n• "Ping" runs a step-by-step connectivity check\n• "Save Provider" auto-fetches all models and saves encrypted', target: 'card-actions' },
      { title: '⑤ Providers', desc: 'Saved providers appear here with all their models. Click a model to load it. You can rename, delete, refresh models, or batch-test all providers. Importing a config auto-saves it.', target: 'card-saved' },
      { title: '⑥ Export', desc: 'Export your config in multiple formats: OpenAI .env, Codex CLI, Claude Code, cURL, Python and more.', target: 'card-export' },
      { title: '🎉 Ready!', desc: 'You\'re all set! Fill in your API details and start testing.\n\nTip: Click the ❓ button in the header to restart this guide anytime.' },
    ],
  }
};

function t(key) { return i18n[currentLang][key] || key; }

function applyLang() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[currentLang][key]) el.textContent = i18n[currentLang][key];
  });
  document.getElementById('lang-label').textContent = currentLang === 'zh' ? 'EN' : '中文';
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  localStorage.setItem('api-tester-lang', currentLang);
}

function toggleLang() {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  applyLang();
  renderProviders();
}

// ══════════════════════════════════
//  INIT
// ══════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  currentLang = localStorage.getItem('api-tester-lang') || 'zh';
  applyLang();
  await initCrypto();
  migrateOldData();
  renderProviders();
  setupListeners();
  loadLastUsed();
  if (!localStorage.getItem('api-tester-onboarded')) {
    setTimeout(() => startOnboarding(), 600);
  }
});

function setupListeners() {
  document.getElementById('toggle-key').addEventListener('click', () => {
    const inp = document.getElementById('api-key');
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
  document.getElementById('import-file').addEventListener('change', handleImportFile);
  document.getElementById('export-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.getElementById('testall-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeTestAllModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeTestAllModal(); cancelPromptModal(); cancelConfirmModal(); closeProviderExportModal(); }
    if (e.key === 'Enter' && !document.getElementById('prompt-modal').classList.contains('hidden')) { confirmPromptModal(); }
  });
  document.addEventListener('click', e => {
    const dd = document.getElementById('model-dropdown');
    const field = document.getElementById('field-model');
    if (!dd.classList.contains('hidden') && !field.contains(e.target)) {
      dd.classList.add('hidden');
    }
  });
}

// Migrate old format (single model) to new format (models array)
function migrateOldData() {
  const raw = getRawProviders();
  let changed = false;
  for (const p of raw) {
    if (!p.models) {
      p.models = p.model ? [p.model] : [];
      changed = true;
    }
  }
  if (changed) setProviders(raw);
}

// ══════════════════════════════════
//  AES-GCM ENCRYPTION
// ══════════════════════════════════
let cryptoKey = null;

async function initCrypto() {
  try {
    let rawKey = localStorage.getItem(CRYPTO_KEY_NAME);
    if (!rawKey) {
      const keyData = crypto.getRandomValues(new Uint8Array(32));
      rawKey = arrayToBase64(keyData);
      localStorage.setItem(CRYPTO_KEY_NAME, rawKey);
    }
    const keyBytes = base64ToArray(rawKey);
    cryptoKey = await crypto.subtle.importKey(
      'raw', keyBytes, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']
    );
  } catch (e) {
    console.warn('Web Crypto not available, falling back to obfuscation', e);
    cryptoKey = null;
  }
}

async function encryptText(plaintext) {
  if (!cryptoKey) return btoa(unescape(encodeURIComponent(plaintext)));
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, enc.encode(plaintext));
  const combined = new Uint8Array(iv.length + ct.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ct), iv.length);
  return 'enc:' + arrayToBase64(combined);
}

async function decryptText(stored) {
  if (!stored) return '';
  if (!stored.startsWith('enc:')) {
    try { return decodeURIComponent(escape(atob(stored))); } catch { return stored; }
  }
  if (!cryptoKey) return '';
  try {
    const data = base64ToArray(stored.slice(4));
    const iv = data.slice(0, 12);
    const ct = data.slice(12);
    const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ct);
    return new TextDecoder().decode(dec);
  } catch (e) {
    console.warn('Decryption failed', e);
    return '[decryption error]';
  }
}

function arrayToBase64(arr) { return btoa(String.fromCharCode(...new Uint8Array(arr))); }
function base64ToArray(b64) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

// ══════════════════════════════════
//  TOAST & CONFIG HELPERS
// ══════════════════════════════════
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

function getConfig() {
  return {
    baseUrl: document.getElementById('base-url').value.trim(),
    apiKey: document.getElementById('api-key').value.trim(),
    model: document.getElementById('model-name').value.trim(),
    prompt: document.getElementById('test-prompt').value.trim()
  };
}

function saveLastUsed() {
  const c = getConfig();
  localStorage.setItem('api-tester-last', JSON.stringify({
    baseUrl: c.baseUrl, model: c.model, prompt: c.prompt
  }));
}

function loadLastUsed() {
  try {
    const d = JSON.parse(localStorage.getItem('api-tester-last'));
    if (d) {
      if (d.baseUrl) document.getElementById('base-url').value = d.baseUrl;
      if (d.model) document.getElementById('model-name').value = d.model;
      if (d.prompt) document.getElementById('test-prompt').value = d.prompt;
    }
  } catch {}
}

function normalizeBase(url) {
  let base = url.trim().replace(/\/+$/, '');
  // Strip common trailing path fragments that users might paste
  // e.g. /chat/completions, /models
  base = base.replace(/\/(chat\/completions|models|completions)$/i, '');
  // If the URL already contains /v1 somewhere, keep it
  if (/\/v1($|\/)/i.test(base)) {
    // Trim to the /v1 part
    base = base.replace(/(\/v1)\/.*/i, '$1');
    return base;
  }
  // Otherwise, append /v1
  try {
    const u = new URL(base);
    if (u.pathname === '/' || u.pathname === '') base += '/v1';
    else if (!u.pathname.includes('/v')) base += '/v1';
  } catch {}
  return base;
}

function extractHost(url) { try { return new URL(url).hostname; } catch { return 'provider'; } }

// ══════════════════════════════════
//  PROXY FETCH (bypass CORS)
// ══════════════════════════════════
// When deployed on Netlify, use the serverless proxy function
// When running locally (file://), try direct fetch first, then proxy
function getProxyUrl() {
  if (location.hostname && location.hostname !== '') {
    return '/.netlify/functions/proxy';
  }
  return null; // local file, no proxy available
}

async function proxyFetch(url, options = {}) {
  const proxyUrl = getProxyUrl();
  if (!proxyUrl) {
    // Direct fetch (will fail on CORS in some cases)
    return fetch(url, options);
  }
  // Route through Netlify proxy
  const proxyBody = {
    targetUrl: url,
    method: options.method || 'GET',
    headers: {},
  };
  if (options.headers) {
    // Extract headers from Headers object or plain object
    if (options.headers instanceof Headers) {
      options.headers.forEach((v, k) => { proxyBody.headers[k] = v; });
    } else {
      proxyBody.headers = { ...options.headers };
    }
  }
  if (options.body) {
    proxyBody.body = options.body;
  }
  return fetch(proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(proxyBody),
  });
}

// ══════════════════════════════════
//  PROVIDER STORAGE (encrypted)
// ══════════════════════════════════
// Data model: { id, name, baseUrl, apiKey (encrypted), models: string[], ts }

function getRawProviders() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

function setProviders(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

async function getProviders() {
  const raw = getRawProviders();
  const out = [];
  for (const item of raw) {
    out.push({
      ...item,
      _key: await decryptText(item.apiKey),
    });
  }
  return out;
}

// Save current config as a new provider (auto-fetches models)
async function saveConfig() {
  const c = getConfig();
  if (!c.baseUrl || !c.apiKey) { showToast(t('toast_need_config')); return; }

  showPromptModal(t('prompt_name'), extractHost(c.baseUrl), async (name) => {
    if (!name) return;
    showToast(t('toast_fetching_models'));
    const models = await fetchModelsRaw(c.baseUrl, c.apiKey);
    const modelList = models.length > 0 ? models : (c.model ? [c.model] : []);
    const encKey = await encryptText(c.apiKey);
    const raw = getRawProviders();
    raw.push({
      id: Date.now(),
      name,
      baseUrl: c.baseUrl,
      apiKey: encKey,
      models: modelList,
      ts: new Date().toISOString()
    });
    setProviders(raw);
    renderProviders();
    showToast(t('toast_saved') + ` — ${modelList.length} ${currentLang === 'zh' ? '个模型' : 'models'}`);
  });
}

// ══════════════════════════════════
//  RENDER PROVIDERS LIST
// ══════════════════════════════════
async function renderProviders() {
  const providers = await getProviders();
  const container = document.getElementById('saved-list');
  if (!providers.length) {
    container.innerHTML = `<div class="empty-state"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"><rect x="4" y="4" width="24" height="24" rx="3"/><path d="M10 16h12M16 10v12" stroke-dasharray="2 2"/></svg><p>${t('empty_saved')}</p></div>`;
    return;
  }

  const maskKey = (k) => k ? k.substring(0, 5) + '•••' + k.substring(k.length - 3) : '•••';

  container.innerHTML = providers.map(p => {
    const isExpanded = expandedProviders.has(p.id);
    const modelCount = (p.models || []).length;
    return `
      <div class="provider-card ${isExpanded ? 'expanded' : ''}">
        <div class="provider-header" onclick="toggleProvider(${p.id})">
          <div class="provider-expand-icon">${isExpanded ? '▾' : '▸'}</div>
          <div class="provider-info">
            <div class="provider-name">${esc(p.name)}</div>
            <div class="provider-meta">
              ${esc(extractHost(p.baseUrl))} · ${modelCount} ${t('provider_models_count')} · Key: ${maskKey(p._key)}
            </div>
          </div>
          <div class="provider-actions" onclick="event.stopPropagation()">
            <button class="btn-icon btn-icon-sm" onclick="refreshProviderModels(${p.id})" title="${t('provider_refresh')}">
              <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 8a6 6 0 0111.5-2.3"/><path d="M14 8a6 6 0 01-11.5 2.3"/><path d="M13 2v4h-4"/><path d="M3 14v-4h4"/></svg>
            </button>
            <button class="btn-icon btn-icon-sm" onclick="exportProvider(${p.id})" title="Export">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M6 1v7M3 5l3 3 3-3"/><path d="M1 9v2h10V9"/></svg>
            </button>
            <button class="btn-icon btn-icon-sm" onclick="renameProvider(${p.id})" title="Rename">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M7.5 2.5l2 2M2 8l5-5 2 2-5 5H2V8z"/></svg>
            </button>
            <button class="btn-icon btn-icon-sm" onclick="deleteProvider(${p.id})" title="Delete">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M2 3h8M4.5 3V2h3v1M3 3v7.5a.5.5 0 00.5.5h5a.5.5 0 00.5-.5V3"/></svg>
            </button>
          </div>
        </div>
        ${isExpanded ? `
          <div class="provider-models">
            ${modelCount === 0
              ? `<div class="provider-model-empty">${t('provider_no_models')}</div>`
              : (p.models || []).map(m => `
                <button class="provider-model-item" onclick="loadProviderModel(${p.id}, '${esc(m)}')">
                  <span class="provider-model-name">${esc(m)}</span>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M1 5h6M5 2l3 3-3 3"/></svg>
                </button>
              `).join('')
            }
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

function toggleProvider(id) {
  if (expandedProviders.has(id)) expandedProviders.delete(id);
  else expandedProviders.add(id);
  renderProviders();
}

async function loadProviderModel(providerId, model) {
  const providers = await getProviders();
  const p = providers.find(x => x.id === providerId);
  if (!p) return;
  document.getElementById('base-url').value = p.baseUrl;
  document.getElementById('api-key').value = p._key;
  document.getElementById('model-name').value = model;
  showToast(t('toast_loaded') + ` — ${model}`);
}

async function renameProvider(id) {
  const raw = getRawProviders();
  const p = raw.find(x => x.id === id);
  if (!p) return;
  showPromptModal(t('prompt_rename'), p.name, (newName) => {
    if (!newName || newName === p.name) return;
    p.name = newName;
    setProviders(raw);
    renderProviders();
    showToast(t('toast_renamed'));
  });
}

async function deleteProvider(id) {
  showConfirmModal(t('confirm_delete'), () => {
    const raw = getRawProviders().filter(p => p.id !== id);
    expandedProviders.delete(id);
    setProviders(raw);
    renderProviders();
    showToast(t('toast_deleted'));
  });
}

async function refreshProviderModels(id) {
  const providers = await getProviders();
  const p = providers.find(x => x.id === id);
  if (!p) return;
  showToast(t('toast_fetching_models'));
  const models = await fetchModelsRaw(p.baseUrl, p._key);
  if (models.length > 0) {
    const raw = getRawProviders();
    const rp = raw.find(x => x.id === id);
    if (rp) { rp.models = models; setProviders(raw); }
    expandedProviders.add(id);
    renderProviders();
    showToast(`✓ ${models.length} ${t('provider_models_count')}`);
  } else {
    showToast(t('models_error'));
  }
}

// ══════════════════════════════════
//  FETCH MODELS
// ══════════════════════════════════
async function fetchModelsRaw(baseUrl, apiKey) {
  const base = normalizeBase(baseUrl);
  // Try multiple URL patterns — some providers use /v1/models, some don't
  const urlsToTry = [base + '/models'];
  if (base.endsWith('/v1')) {
    urlsToTry.push(base.replace(/\/v1$/, '') + '/models');
  } else {
    urlsToTry.push(base + '/v1/models');
  }

  for (const url of urlsToTry) {
    try {
      const res = await proxyFetch(url, {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (!res.ok) continue;
      const data = await res.json();
      const models = (data.data || []).map(m => m.id).sort();
      if (models.length > 0) return models;
    } catch { /* try next */ }
  }
  return [];
}

// UI fetch models → show dropdown
async function fetchModels() {
  const baseUrl = document.getElementById('base-url').value.trim();
  const apiKey = document.getElementById('api-key').value.trim();
  if (!baseUrl) { showToast(t('toast_need_url')); return; }
  if (!apiKey) { showToast(t('toast_need_key')); return; }

  const btn = document.getElementById('btn-fetch-models');
  const dropdown = document.getElementById('model-dropdown');
  const list = document.getElementById('model-list');
  const countEl = document.getElementById('model-count');

  btn.classList.add('spinning');
  dropdown.classList.remove('hidden');
  list.innerHTML = `<div class="model-loading">${t('models_fetching')}</div>`;
  countEl.textContent = '';

  const models = await fetchModelsRaw(baseUrl, apiKey);
  fetchedModelsCache = models;

  if (models.length === 0) {
    const corsHint = location.protocol === 'file:'
      ? (currentLang === 'zh' ? '\n提示：本地文件打开可能因 CORS 限制无法获取，请使用在线版本' : '\nTip: Local file may be blocked by CORS. Use the online version.')
      : '';
    list.innerHTML = `<div class="model-loading">${t('models_none')}${corsHint}</div>`;
    countEl.textContent = '0';
  } else {
    const current = document.getElementById('model-name').value.trim();
    countEl.textContent = models.length;
    list.innerHTML = models.map(id => `
      <button class="model-option${id === current ? ' selected' : ''}" onclick="selectModel('${esc(id)}')">
        <span class="model-option-id">${esc(id)}</span>
      </button>
    `).join('');
  }
  btn.classList.remove('spinning');
}

function selectModel(id) {
  document.getElementById('model-name').value = id;
  document.getElementById('model-dropdown').classList.add('hidden');
  showToast('✓ ' + id);
}

// ══════════════════════════════════
//  FULL TEST (chat completions)
// ══════════════════════════════════
async function testAPI() {
  const c = getConfig();
  if (!c.baseUrl) { showToast(t('toast_need_url')); return; }
  if (!c.apiKey) { showToast(t('toast_need_key')); return; }
  if (!c.model) { showToast(t('toast_need_model')); return; }
  saveLastUsed();
  showResultState('loading');

  const t0 = performance.now();
  try {
    const base = normalizeBase(c.baseUrl);
    const res = await proxyFetch(`${base}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${c.apiKey}` },
      body: JSON.stringify({
        model: c.model,
        messages: [{ role: 'user', content: c.prompt || 'Hello!' }],
        max_tokens: 256
      })
    });
    const elapsed = Math.round(performance.now() - t0);
    if (!res.ok) {
      const txt = await res.text();
      let msg = `HTTP ${res.status} ${res.statusText}`;
      try { const j = JSON.parse(txt); if (j.error) msg += '\n' + (j.error.message || JSON.stringify(j.error)); } catch { msg += '\n' + txt.substring(0, 500); }
      showResultState('error', msg, elapsed);
      return;
    }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '(empty)';
    const model = data.model || c.model;
    const tokens = data.usage?.total_tokens || '—';
    showResultState('success', content, elapsed, tokens, model);
  } catch (err) {
    showResultState('error', `${err.message}\n\nAPI 端点可能不支持浏览器跨域 (CORS)`, Math.round(performance.now() - t0));
  }
}

function showResultState(state, content, latency, tokens, model) {
  ['idle', 'loading', 'success', 'error', 'ping'].forEach(s => {
    document.getElementById(`state-${s}`).classList.toggle('hidden', s !== state);
  });
  const badge = document.getElementById('status-badge');
  const statsRow = document.getElementById('stats-row');
  if (state === 'success') {
    document.getElementById('result-output').textContent = content;
    badge.className = 'status-badge success'; badge.classList.remove('hidden');
    document.getElementById('status-text').textContent = t('status_ok');
    statsRow.classList.remove('hidden');
    document.getElementById('stat-latency').textContent = latency + 'ms';
    document.getElementById('stat-tokens').textContent = tokens;
    document.getElementById('stat-model').textContent = model;
  } else if (state === 'error') {
    document.getElementById('error-output').textContent = content;
    badge.className = 'status-badge error'; badge.classList.remove('hidden');
    document.getElementById('status-text').textContent = t('status_fail');
    statsRow.classList.add('hidden');
  } else {
    badge.classList.add('hidden'); statsRow.classList.add('hidden');
  }
}

// ══════════════════════════════════
//  PING (step-by-step connectivity)
// ══════════════════════════════════
async function pingAPI() {
  const c = getConfig();
  if (!c.baseUrl) { showToast(t('toast_need_url')); return; }
  if (!c.apiKey) { showToast(t('toast_need_key')); return; }
  saveLastUsed();

  const steps = [
    { id: 'dns', label: t('ping_dns'), status: 'wait' },
    { id: 'tls', label: t('ping_tls'), status: 'wait' },
    { id: 'auth', label: t('ping_auth'), status: 'wait' },
    { id: 'model', label: t('ping_model'), status: 'wait' },
  ];

  ['idle', 'loading', 'success', 'error', 'ping'].forEach(s => {
    document.getElementById(`state-${s}`).classList.toggle('hidden', s !== 'ping');
  });
  document.getElementById('status-badge').classList.add('hidden');
  document.getElementById('stats-row').classList.add('hidden');

  const container = document.getElementById('ping-results');
  function renderSteps() {
    container.innerHTML = steps.map(s => `
      <div class="ping-step step-${s.status}">
        <div class="ping-icon">${stepIcon(s.status)}</div>
        <div class="ping-info">
          <div class="ping-label">${s.label}</div>
          ${s.detail ? `<div class="ping-detail">${esc(s.detail)}</div>` : ''}
        </div>
      </div>
    `).join('');
  }
  renderSteps();
  const base = normalizeBase(c.baseUrl);
  let allOk = true;

  steps[0].status = 'running'; steps[0].detail = t('ping_running'); renderSteps();
  try {
    const t0 = performance.now();
    await proxyFetch(base, { method: 'HEAD' });
    steps[0].status = 'ok'; steps[0].detail = t('ping_dns_ok') + ` (${Math.round(performance.now() - t0)}ms)`;
  } catch (e) { steps[0].status = 'fail'; steps[0].detail = e.message; allOk = false; }
  renderSteps();
  if (!allOk) { finishPing(false); return; }

  steps[1].status = 'running'; steps[1].detail = t('ping_running'); renderSteps();
  try {
    const t0 = performance.now();
    const res = await proxyFetch(`${base}/models`, { headers: { 'Authorization': `Bearer ${c.apiKey}` } });
    steps[1].status = 'ok'; steps[1].detail = t('ping_tls_ok') + ` (${Math.round(performance.now() - t0)}ms)`;

    steps[2].status = 'running'; steps[2].detail = t('ping_running'); renderSteps();
    if (res.status === 401 || res.status === 403) {
      steps[2].status = 'fail'; steps[2].detail = `HTTP ${res.status} — ` + (currentLang === 'zh' ? 'API Key 无效或已过期' : 'Invalid or expired API Key'); allOk = false;
    } else {
      steps[2].status = 'ok'; steps[2].detail = t('ping_auth_ok') + ` (HTTP ${res.status})`;
      steps[3].status = 'running'; steps[3].detail = t('ping_running'); renderSteps();
      if (res.ok && c.model) {
        try {
          const data = await res.json();
          const models = data.data?.map(m => m.id) || [];
          if (models.length === 0 || models.includes(c.model)) {
            steps[3].status = 'ok'; steps[3].detail = t('ping_model_ok') + ` — ${c.model}`;
          } else {
            steps[3].status = 'fail'; steps[3].detail = (currentLang === 'zh' ? '模型不在列表: ' : 'Not in list: ') + models.slice(0, 8).join(', '); allOk = false;
          }
        } catch { steps[3].status = 'ok'; steps[3].detail = currentLang === 'zh' ? '连接正常' : 'Connection OK'; }
      } else {
        steps[3].status = 'ok'; steps[3].detail = currentLang === 'zh' ? '连接正常' : 'Connection OK';
      }
    }
  } catch (e) { steps[1].status = 'fail'; steps[1].detail = e.message; allOk = false; }
  renderSteps(); finishPing(allOk);
}

function finishPing(ok) {
  const badge = document.getElementById('status-badge');
  badge.className = ok ? 'status-badge success' : 'status-badge error';
  badge.classList.remove('hidden');
  document.getElementById('status-text').textContent = ok ? t('status_ok') : t('status_fail');
}

function stepIcon(s) {
  if (s === 'ok') return '✓'; if (s === 'fail') return '✗';
  if (s === 'running') return '<div class="mini-spinner"></div>'; return '○';
}

// ══════════════════════════════════
//  TEST ALL PROVIDERS (batch)
// ══════════════════════════════════
let testAllAbort = false;

async function testAllProviders() {
  const providers = await getProviders();
  if (!providers.length) { showToast(t('testall_empty')); return; }

  testAllAbort = false;
  document.getElementById('testall-modal').classList.remove('hidden');
  const container = document.getElementById('testall-results');
  const summaryEl = document.getElementById('testall-summary');
  let totalOk = 0, totalFail = 0, totalSkip = 0;

  const pData = providers.map(p => ({
    id: p.id, name: p.name, baseUrl: p.baseUrl, apiKey: p._key,
    models: (p.models || []).slice(), // ALL models, no limit
    status: 'run', results: []
  }));

  function render() {
    container.innerHTML = pData.map(p => `
      <div class="testall-provider">
        <div class="testall-provider-header">
          <span class="testall-provider-name">${esc(p.name)}</span>
          <span class="testall-provider-url">${esc(extractHost(p.baseUrl))}</span>
          <span class="testall-provider-count">${p.models.length} ${t('provider_models_count')}</span>
          <span class="testall-provider-status s-${p.status}">${providerStatusText(p.status)}</span>
        </div>
        <div class="testall-models">
          ${p.models.length === 0 && p.status !== 'run'
            ? `<div class="testall-model-row"><div class="testall-model-name" style="color:var(--text-muted)">${t('testall_skip')}</div></div>`
            : p.results.map(r => `
              <div class="testall-model-row">
                <div class="testall-model-name">${esc(r.model)}</div>
                <div class="testall-model-latency">${r.latency ? r.latency + 'ms' : ''}</div>
                <div class="testall-model-status ms-${r.status}">${modelStatusIcon(r.status)}</div>
              </div>
            `).join('')
          }
          ${p.models.length > 0 && p.results.length === 0 && p.status === 'run'
            ? `<div class="testall-model-row"><div class="testall-model-name" style="color:var(--text-muted)">${t('testall_testing')}</div><div class="testall-model-status ms-run"><span class="mini-spinner-sm"></span></div></div>`
            : ''
          }
        </div>
      </div>
    `).join('');

    summaryEl.innerHTML = `
      <span class="sum-ok">✓ ${totalOk} ${t('testall_pass')}</span>
      <span class="sum-fail">✗ ${totalFail} ${t('testall_fail')}</span>
      ${totalSkip > 0 ? `<span style="color:var(--text-muted)">— ${totalSkip} ${t('testall_skip')}</span>` : ''}
    `;
  }
  render();

  for (const p of pData) {
    if (testAllAbort) break;

    if (p.models.length === 0) {
      p.status = 'fail'; totalSkip++;
      render(); continue;
    }

    p.results = p.models.map(m => ({ model: m, status: 'wait', latency: null }));
    render();

    let providerOk = true;
    for (let i = 0; i < p.results.length; i++) {
      if (testAllAbort) break;
      p.results[i].status = 'run';
      render();

      try {
        const base = normalizeBase(p.baseUrl);
        const t0 = performance.now();
        const res = await proxyFetch(`${base}/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${p.apiKey}` },
          body: JSON.stringify({
            model: p.results[i].model,
            messages: [{ role: 'user', content: 'Hi' }],
            max_tokens: 1
          })
        });
        const elapsed = Math.round(performance.now() - t0);
        p.results[i].latency = elapsed;
        if (res.ok) { p.results[i].status = 'ok'; totalOk++; }
        else { p.results[i].status = 'fail'; totalFail++; providerOk = false; }
      } catch { p.results[i].status = 'fail'; totalFail++; providerOk = false; }
      render();
    }
    p.status = providerOk ? 'ok' : 'fail';
    render();
  }
}

function providerStatusText(s) {
  if (s === 'ok') return '✓ ' + t('testall_pass');
  if (s === 'fail') return '✗ ' + t('testall_fail');
  return t('testall_running');
}

function modelStatusIcon(s) {
  if (s === 'ok') return '✓'; if (s === 'fail') return '✗';
  if (s === 'run') return '<span class="mini-spinner-sm"></span>'; return '○';
}

function closeTestAllModal() {
  testAllAbort = true;
  document.getElementById('testall-modal').classList.add('hidden');
}

// ══════════════════════════════════
//  IMPORT (auto-save)
// ══════════════════════════════════
function importConfigs() { document.getElementById('import-file').click(); }

function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try { parseAndAutoSave(ev.target.result, file.name); }
    catch { showToast(t('toast_import_fail')); }
  };
  reader.readAsText(file);
  e.target.value = '';
}

async function parseAndAutoSave(text, fname) {
  let cfg = {};
  if (fname.endsWith('.json')) {
    const j = JSON.parse(text);
    cfg.baseUrl = j.base_url || j.baseUrl || j.OPENAI_BASE_URL || j.api_base || '';
    cfg.apiKey = j.api_key || j.apiKey || j.OPENAI_API_KEY || '';
    cfg.model = j.model || j.MODEL || j.default_model || '';
  } else if (fname.endsWith('.env')) {
    text.split('\n').forEach(line => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (!m) return;
      const k = m[1].trim(), v = m[2].trim().replace(/^["']|["']$/g, '');
      if (k.includes('BASE') && k.includes('URL')) cfg.baseUrl = v;
      else if (k.includes('API') && k.includes('KEY')) cfg.apiKey = v;
      else if (k.includes('MODEL')) cfg.model = v;
    });
  } else if (fname.endsWith('.toml')) {
    text.split('\n').forEach(line => {
      const m = line.match(/^\s*(\w+)\s*=\s*"?([^"]*)"?\s*$/);
      if (!m) return;
      const k = m[1].toLowerCase(), v = m[2].trim();
      if (k.includes('base') || k.includes('url')) cfg.baseUrl = v;
      else if (k.includes('key')) cfg.apiKey = v;
      else if (k.includes('model')) cfg.model = v;
    });
  } else {
    text.split('\n').forEach(line => {
      const m = line.match(/^\s*(\S+)\s*:\s*(.+)$/);
      if (!m) return;
      const k = m[1].toLowerCase(), v = m[2].trim().replace(/^["']|["']$/g, '');
      if (k.includes('base') || k.includes('url')) cfg.baseUrl = v;
      else if (k.includes('key')) cfg.apiKey = v;
      else if (k.includes('model')) cfg.model = v;
    });
  }

  if (!cfg.baseUrl || !cfg.apiKey) { showToast(t('toast_import_fail')); return; }

  // Fill form
  document.getElementById('base-url').value = cfg.baseUrl;
  document.getElementById('api-key').value = cfg.apiKey;
  if (cfg.model) document.getElementById('model-name').value = cfg.model;

  // Auto-save: fetch models then save
  showToast(t('toast_fetching_models'));
  const models = await fetchModelsRaw(cfg.baseUrl, cfg.apiKey);
  const modelList = models.length > 0 ? models : (cfg.model ? [cfg.model] : []);

  const encKey = await encryptText(cfg.apiKey);
  const raw = getRawProviders();
  const name = extractHost(cfg.baseUrl);
  raw.push({
    id: Date.now(),
    name,
    baseUrl: cfg.baseUrl,
    apiKey: encKey,
    models: modelList,
    ts: new Date().toISOString()
  });
  setProviders(raw);
  renderProviders();
  showToast(t('toast_imported') + ` — ${name} (${modelList.length} ${currentLang === 'zh' ? '个模型' : 'models'})`);
}

// ══════════════════════════════════
//  EXPORT
// ══════════════════════════════════

// Reusable format generator
function generateFormatContent(format, cfg) {
  const base = (cfg.baseUrl || '').replace(/\/+$/, '');
  const apiKey = cfg.apiKey || '';
  const model = cfg.model || (cfg.models && cfg.models[0]) || '';
  const prompt = cfg.prompt || 'Hello!';
  const name = cfg.name || extractHost(base);
  switch (format) {
    case 'openai-env': return { title: 'OpenAI .env', filename: '.env', content: `OPENAI_API_KEY="${apiKey}"\nOPENAI_BASE_URL="${base}"\nOPENAI_MODEL="${model}"` };
    case 'openclaw': return { title: 'OpenClaw', filename: 'openclaw_config.json', content: JSON.stringify({ provider: 'openai-compatible', api_key: apiKey, base_url: base, model, max_tokens: 4096 }, null, 2) };
    case 'codex': return { title: 'Codex CLI', filename: 'codex_config.toml', content: `[model]\nname = "${model}"\n\n[provider]\ntype = "openai"\napi_key = "${apiKey}"\nbase_url = "${base}"` };
    case 'claude-code': return { title: 'Claude Code', filename: 'claude_code.env', content: `OPENAI_API_KEY="${apiKey}"\nOPENAI_BASE_URL="${base}"\n\n# claude config set --global model "${model}"\n# claude config set --global provider "openai"` };
    case 'antigravity': return { title: 'Antigravity', filename: 'antigravity_config.json', content: JSON.stringify({ provider: 'openai-compatible', api_key: apiKey, base_url: base, model, settings: { temperature: 0.7, max_tokens: 4096 } }, null, 2) };
    case 'curl': return { title: 'cURL', filename: 'test_api.sh', content: `curl "${base}/chat/completions" \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer ${apiKey}" \\\n  -d '{\n    "model": "${model}",\n    "messages": [{"role":"user","content":"${prompt.replace(/"/g, '\\"')}"}],\n    "max_tokens": 256\n  }'` };
    case 'python': return { title: 'Python', filename: 'test_api.py', content: `from openai import OpenAI\n\nclient = OpenAI(\n    api_key="${apiKey}",\n    base_url="${base}"\n)\n\nres = client.chat.completions.create(\n    model="${model}",\n    messages=[{"role":"user","content":"${prompt.replace(/"/g, '\\"')}"}],\n    max_tokens=256\n)\nprint(res.choices[0].message.content)` };
    case 'json': return { title: 'JSON', filename: `${name.replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g,'_')}_config.json`, content: JSON.stringify({ name, base_url: base, api_key: apiKey, model, models: cfg.models || [model], created_at: new Date().toISOString() }, null, 2) };
    case 'provider-full': return { title: name, filename: `${name.replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g,'_')}.json`, content: JSON.stringify({ name, base_url: base, api_key: apiKey, models: cfg.models || [], created_at: cfg.ts || new Date().toISOString() }, null, 2) };
    default: return { title: '', filename: '', content: '' };
  }
}

const EXPORT_FORMATS = [
  { id: 'provider-full', label: 'Full JSON' },
  { id: 'openai-env', label: 'OpenAI .env' },
  { id: 'codex', label: 'Codex CLI' },
  { id: 'claude-code', label: 'Claude Code' },
  { id: 'antigravity', label: 'Antigravity' },
  { id: 'openclaw', label: 'OpenClaw' },
  { id: 'curl', label: 'cURL' },
  { id: 'python', label: 'Python' },
];

// Export from config form
function exportConfig(format) {
  const c = getConfig();
  if (!c.baseUrl && !c.apiKey) { showToast(t('toast_need_config')); return; }
  const result = generateFormatContent(format, c);
  currentExportData = { content: result.content, filename: result.filename };
  document.getElementById('modal-title').textContent = result.title;
  document.getElementById('modal-code').textContent = result.content;
  document.getElementById('export-modal').classList.remove('hidden');
}

// Per-provider export — show format selector
let _exportProviderId = null;

async function exportProvider(id) {
  const providers = await getProviders();
  const p = providers.find(x => x.id === id);
  if (!p) return;
  _exportProviderId = id;
  document.getElementById('provider-export-title').textContent =
    (currentLang === 'zh' ? '导出: ' : 'Export: ') + p.name;
  const grid = document.getElementById('provider-export-grid');
  grid.innerHTML = EXPORT_FORMATS.map(f => `
    <button class="export-item" onclick="doExportProvider('${f.id}')">
      <span class="export-name">${f.label}</span>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M2 6h8M7 3l3 3-3 3"/></svg>
    </button>
  `).join('');
  document.getElementById('provider-export-modal').classList.remove('hidden');
}

async function doExportProvider(format) {
  const providers = await getProviders();
  const p = providers.find(x => x.id === _exportProviderId);
  if (!p) return;
  const cfg = { baseUrl: p.baseUrl, apiKey: p._key, model: (p.models && p.models[0]) || '', models: p.models, name: p.name, ts: p.ts };
  const result = generateFormatContent(format, cfg);
  closeProviderExportModal();
  currentExportData = { content: result.content, filename: result.filename };
  document.getElementById('modal-title').textContent = result.title;
  document.getElementById('modal-code').textContent = result.content;
  document.getElementById('export-modal').classList.remove('hidden');
}

function closeProviderExportModal() {
  document.getElementById('provider-export-modal').classList.add('hidden');
}

// Export ALL providers as ZIP
async function exportAllProviders() {
  const providers = await getProviders();
  if (!providers.length) {
    showToast(currentLang === 'zh' ? '没有保存的服务商' : 'No saved providers');
    return;
  }
  if (typeof JSZip === 'undefined') {
    showToast(currentLang === 'zh' ? 'JSZip 未加载，请刷新页面' : 'JSZip not loaded');
    return;
  }
  showToast(currentLang === 'zh' ? '正在打包…' : 'Packing…');
  const zip = new JSZip();
  for (const p of providers) {
    const safeName = p.name.replace(/[^a-zA-Z0-9\u4e00-\u9fff_-]/g, '_');
    const cfg = { baseUrl: p.baseUrl, apiKey: p._key, model: (p.models && p.models[0]) || '', models: p.models, name: p.name, ts: p.ts };
    const result = generateFormatContent('provider-full', cfg);
    zip.file(`${safeName}.json`, result.content);
  }
  try {
    const blob = await zip.generateAsync({ type: 'blob' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `api-providers_${new Date().toISOString().slice(0, 10)}.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast(`✓ ${providers.length} ${currentLang === 'zh' ? '个服务商已导出' : 'providers exported'}`);
  } catch (e) {
    showToast((currentLang === 'zh' ? '导出失败: ' : 'Export failed: ') + e.message);
  }
}

function closeModal() { document.getElementById('export-modal').classList.add('hidden'); }

function copyExport() {
  navigator.clipboard.writeText(currentExportData.content).then(() => showToast(t('toast_copied'))).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = currentExportData.content; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    showToast(t('toast_copied'));
  });
}

function downloadExport() {
  const blob = new Blob([currentExportData.content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = currentExportData.filename; a.click(); URL.revokeObjectURL(a.href);
}

// ══════════════════════════════════
//  ONBOARDING
// ══════════════════════════════════
function startOnboarding() {
  onboardingStep = 0;
  document.getElementById('onboarding-overlay').classList.remove('hidden');
  renderOnboardingStep();
}

function endOnboarding() {
  document.getElementById('onboarding-overlay').classList.add('hidden');
  localStorage.setItem('api-tester-onboarded', '1');
  document.querySelectorAll('.onboarding-highlight').forEach(el => el.classList.remove('onboarding-highlight'));
}

function nextOnboardingStep() {
  onboardingStep++;
  if (onboardingStep >= i18n[currentLang].onboard.length) { endOnboarding(); return; }
  renderOnboardingStep();
}

function renderOnboardingStep() {
  const steps = i18n[currentLang].onboard;
  const step = steps[onboardingStep];
  const tooltip = document.getElementById('onboarding-tooltip');
  const backdrop = document.getElementById('onboarding-backdrop');

  document.getElementById('onboarding-title').textContent = step.title;
  document.getElementById('onboarding-desc').textContent = step.desc;

  const indicator = document.getElementById('onboarding-step-indicator');
  indicator.innerHTML = steps.map((_, i) => {
    let cls = 'step-dot';
    if (i < onboardingStep) cls += ' done';
    else if (i === onboardingStep) cls += ' active';
    return `<span class="${cls}"></span>`;
  }).join('');

  const nextBtn = document.getElementById('onboarding-next');
  nextBtn.querySelector('span').textContent = onboardingStep === steps.length - 1
    ? (currentLang === 'zh' ? '开始使用' : 'Get Started')
    : t('onboarding_next');

  document.querySelectorAll('.onboarding-highlight').forEach(el => el.classList.remove('onboarding-highlight'));

  if (step.target) {
    const target = document.getElementById(step.target);
    if (target) {
      target.classList.add('onboarding-highlight');
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      backdrop.style.display = 'none';
      setTimeout(() => {
        const rect = target.getBoundingClientRect();
        let top = rect.bottom + 12, left = rect.left;
        const tw = tooltip.getBoundingClientRect().width, th = tooltip.getBoundingClientRect().height;
        if (top + th > window.innerHeight - 20) top = rect.top - th - 12;
        if (left + tw > window.innerWidth - 20) left = window.innerWidth - tw - 20;
        if (left < 20) left = 20;
        tooltip.style.top = top + 'px'; tooltip.style.left = left + 'px'; tooltip.style.transform = 'none';
      }, 100);
    }
  } else {
    backdrop.style.display = 'block';
    tooltip.style.top = '50%'; tooltip.style.left = '50%'; tooltip.style.transform = 'translate(-50%, -50%)';
  }
}

// ── Utility ──
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

// ══════════════════════════════════
//  CUSTOM MODALS (replace prompt/confirm)
// ══════════════════════════════════
let _promptCallback = null;
let _confirmCallback = null;

function showPromptModal(title, defaultValue, callback) {
  _promptCallback = callback;
  document.getElementById('prompt-modal-title').textContent = title;
  const input = document.getElementById('prompt-modal-input');
  input.value = defaultValue || '';
  document.getElementById('prompt-modal').classList.remove('hidden');
  setTimeout(() => { input.focus(); input.select(); }, 50);
}

function confirmPromptModal() {
  const val = document.getElementById('prompt-modal-input').value.trim();
  document.getElementById('prompt-modal').classList.add('hidden');
  if (_promptCallback && val) _promptCallback(val);
  _promptCallback = null;
}

function cancelPromptModal() {
  document.getElementById('prompt-modal').classList.add('hidden');
  _promptCallback = null;
}

function showConfirmModal(title, callback) {
  _confirmCallback = callback;
  document.getElementById('confirm-modal-title').textContent = title;
  document.getElementById('confirm-modal').classList.remove('hidden');
}

function confirmConfirmModal() {
  document.getElementById('confirm-modal').classList.add('hidden');
  if (_confirmCallback) _confirmCallback();
  _confirmCallback = null;
}

function cancelConfirmModal() {
  document.getElementById('confirm-modal').classList.add('hidden');
  _confirmCallback = null;
}
