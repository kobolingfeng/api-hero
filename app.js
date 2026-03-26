/* =========================================
   API Tester — App Logic
   AES-GCM Encryption · Onboarding · Ping
   ========================================= */

const STORAGE_KEY = 'api-tester-configs';
const CRYPTO_KEY_NAME = 'api-tester-ck';
let currentExportData = { content: '', filename: '' };
let currentLang = 'zh';
let onboardingStep = 0;

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
    hint_model: '要测试的模型名称，如 gpt-4o、gpt-3.5-turbo',
    btn_test: '测试连接',
    btn_ping: '连通检测',
    btn_save: '保存',
    btn_copy: '复制',
    btn_download: '下载',
    saved_title: '已保存',
    empty_saved: '暂无保存的配置',
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
    toast_imported: '✓ 导入成功',
    toast_import_fail: '✗ 导入失败',
    toast_need_url: '请填写 Base URL',
    toast_need_key: '请填写 API Key',
    toast_need_model: '请填写模型名',
    toast_need_config: '请至少填写 Base URL 和 API Key',
    prompt_name: '为该配置命名：',
    confirm_delete: '确认删除此配置？',
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
    onboard: [
      { title: '👋 欢迎使用 API Tester', desc: '这是一个纯静态的 OpenAI 兼容 API 测试工具。你的 API Key 使用 AES-GCM 加密存储在浏览器中，不会发送到任何第三方服务器。\n\n让我带你快速了解各个功能。' },
      { title: '① 填写 Base URL', desc: 'API 提供商给你的接口地址。通常格式为 https://xxx.com/v1 。如果不确定，可以先试试填入提供商给的地址。', target: 'field-base-url' },
      { title: '② 填写 API Key', desc: '你的 API 密钥。输入框默认隐藏内容，点击右侧 👁 可切换显示。保存时会自动加密，不会以明文存储。', target: 'field-api-key' },
      { title: '③ 选择模型', desc: '填写你要测试的模型名称，比如 gpt-4o、gpt-3.5-turbo、claude-3 等。不同提供商支持的模型不同。', target: 'field-model' },
      { title: '④ 测试连接', desc: '• 「测试连接」会发送一条消息并获取完整回复\n• 「连通检测」会逐步检查 DNS、HTTPS、认证和模型是否可用\n• 「保存」会加密保存当前配置以便下次使用', target: 'card-actions' },
      { title: '⑤ 管理已保存的配置', desc: '保存过的配置会出现在这里。点击即可快速加载，也可以导入外部配置文件（支持 .json / .env / .toml / .yaml）。', target: 'card-saved' },
      { title: '⑥ 导出配置', desc: '你可以将当前配置一键导出为 OpenAI .env、Codex CLI、Claude Code、cURL、Python 等多种主流格式，方便在不同工具中使用。', target: 'card-export' },
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
    hint_model: 'Model name to test, e.g. gpt-4o, gpt-3.5-turbo',
    btn_test: 'Test',
    btn_ping: 'Ping',
    btn_save: 'Save',
    btn_copy: 'Copy',
    btn_download: 'Download',
    saved_title: 'SAVED',
    empty_saved: 'No saved configurations',
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
    toast_imported: '✓ Imported',
    toast_import_fail: '✗ Import failed',
    toast_need_url: 'Base URL required',
    toast_need_key: 'API Key required',
    toast_need_model: 'Model required',
    toast_need_config: 'Need at least Base URL and API Key',
    prompt_name: 'Name this config:',
    confirm_delete: 'Delete this config?',
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
    onboard: [
      { title: '👋 Welcome to API Tester', desc: 'A fully static OpenAI-compatible API testing tool. Your API Key is encrypted with AES-GCM and stored only in your browser.\n\nLet me walk you through the features.' },
      { title: '① Base URL', desc: 'The endpoint URL from your API provider. Usually something like https://api.openai.com/v1. If unsure, paste the URL your provider gave you.', target: 'field-base-url' },
      { title: '② API Key', desc: 'Your secret API key. The input is masked by default — click the 👁 icon to toggle visibility. Keys are encrypted before saving.', target: 'field-api-key' },
      { title: '③ Model', desc: 'The model name you want to test, like gpt-4o, gpt-3.5-turbo, etc. Different providers support different models.', target: 'field-model' },
      { title: '④ Test & Save', desc: '• "Test" sends a message and gets a full response\n• "Ping" runs a step-by-step connectivity check\n• "Save" encrypts and stores the current config', target: 'card-actions' },
      { title: '⑤ Saved Configs', desc: 'Your saved configurations appear here. Click to load, or import configs from .json / .env / .toml / .yaml files.', target: 'card-saved' },
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
  loadSavedConfigs();
}

// ══════════════════════════════════
//  INIT
// ══════════════════════════════════
document.addEventListener('DOMContentLoaded', async () => {
  currentLang = localStorage.getItem('api-tester-lang') || 'zh';
  applyLang();
  await initCrypto();
  loadSavedConfigs();
  setupListeners();
  loadLastUsed();

  // Auto-start onboarding for first-time users
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
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

// ══════════════════════════════════
//  AES-GCM ENCRYPTION
// ══════════════════════════════════
let cryptoKey = null;

async function initCrypto() {
  try {
    let rawKey = localStorage.getItem(CRYPTO_KEY_NAME);
    if (!rawKey) {
      // Generate a new 256-bit key
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
  if (!cryptoKey) return btoa(unescape(encodeURIComponent(plaintext))); // fallback
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv }, cryptoKey, enc.encode(plaintext)
  );
  // Prepend IV to ciphertext
  const combined = new Uint8Array(iv.length + ct.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(ct), iv.length);
  return 'enc:' + arrayToBase64(combined);
}

async function decryptText(stored) {
  if (!stored) return '';
  if (!stored.startsWith('enc:')) {
    // Legacy plaintext or base64 fallback
    try { return decodeURIComponent(escape(atob(stored))); } catch { return stored; }
  }
  if (!cryptoKey) return '';
  try {
    const data = base64ToArray(stored.slice(4));
    const iv = data.slice(0, 12);
    const ct = data.slice(12);
    const dec = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv }, cryptoKey, ct
    );
    return new TextDecoder().decode(dec);
  } catch (e) {
    console.warn('Decryption failed', e);
    return '[decryption error]';
  }
}

function arrayToBase64(arr) {
  return btoa(String.fromCharCode(...new Uint8Array(arr)));
}

function base64ToArray(b64) {
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

// ── Toast ──
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 2200);
}

// ── Config ──
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
  // Don't save API key in last-used (only in encrypted saved configs)
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

// ══════════════════════════════════
//  NORMALIZE BASE URL
// ══════════════════════════════════
function normalizeBase(url) {
  let base = url.replace(/\/+$/, '');
  if (!base.endsWith('/v1')) {
    try { const u = new URL(base); if (u.pathname === '/' || u.pathname === '') base += '/v1'; } catch {}
  }
  return base;
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
    const res = await fetch(`${base}/chat/completions`, {
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
    badge.className = 'status-badge success';
    badge.classList.remove('hidden');
    document.getElementById('status-text').textContent = t('status_ok');
    statsRow.classList.remove('hidden');
    document.getElementById('stat-latency').textContent = latency + 'ms';
    document.getElementById('stat-tokens').textContent = tokens;
    document.getElementById('stat-model').textContent = model;
  } else if (state === 'error') {
    document.getElementById('error-output').textContent = content;
    badge.className = 'status-badge error';
    badge.classList.remove('hidden');
    document.getElementById('status-text').textContent = t('status_fail');
    statsRow.classList.add('hidden');
  } else {
    badge.classList.add('hidden');
    statsRow.classList.add('hidden');
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

  // Show ping state
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

  // Step 1: DNS — just try to connect
  steps[0].status = 'running'; steps[0].detail = t('ping_running'); renderSteps();
  try {
    const t0 = performance.now();
    await fetch(base, { method: 'HEAD', mode: 'no-cors' });
    steps[0].status = 'ok';
    steps[0].detail = t('ping_dns_ok') + ` (${Math.round(performance.now() - t0)}ms)`;
  } catch (e) {
    steps[0].status = 'fail'; steps[0].detail = e.message; allOk = false;
  }
  renderSteps();
  if (!allOk) { finishPing(false); return; }

  // Step 2: TLS/HTTPS — try GET on base
  steps[1].status = 'running'; steps[1].detail = t('ping_running'); renderSteps();
  try {
    const t0 = performance.now();
    const res = await fetch(`${base}/models`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${c.apiKey}` }
    });
    steps[1].status = 'ok';
    steps[1].detail = t('ping_tls_ok') + ` (${Math.round(performance.now() - t0)}ms)`;

    // Step 3: Auth — check if 401/403
    steps[2].status = 'running'; steps[2].detail = t('ping_running'); renderSteps();
    if (res.status === 401 || res.status === 403) {
      steps[2].status = 'fail';
      steps[2].detail = `HTTP ${res.status} — ` + (currentLang === 'zh' ? 'API Key 无效或已过期' : 'Invalid or expired API Key');
      allOk = false;
    } else {
      steps[2].status = 'ok';
      steps[2].detail = t('ping_auth_ok') + ` (HTTP ${res.status})`;

      // Step 4: Model check
      steps[3].status = 'running'; steps[3].detail = t('ping_running'); renderSteps();
      if (res.ok && c.model) {
        try {
          const data = await res.json();
          const models = data.data?.map(m => m.id) || [];
          if (models.length === 0 || models.includes(c.model)) {
            steps[3].status = 'ok';
            steps[3].detail = t('ping_model_ok') + ` — ${c.model}`;
          } else {
            steps[3].status = 'fail';
            steps[3].detail = (currentLang === 'zh' ? '模型不在可用列表中: ' : 'Model not in list: ') + models.slice(0, 5).join(', ') + (models.length > 5 ? '…' : '');
            allOk = false;
          }
        } catch {
          steps[3].status = 'ok';
          steps[3].detail = currentLang === 'zh' ? '无法获取模型列表，但连接正常' : 'Cannot list models, but connection OK';
        }
      } else if (!c.model) {
        steps[3].status = 'ok';
        steps[3].detail = currentLang === 'zh' ? '未指定模型，跳过检查' : 'No model specified';
      } else {
        steps[3].status = 'ok';
        steps[3].detail = currentLang === 'zh' ? '连接正常（无法获取模型列表）' : 'Connected (model list unavailable)';
      }
    }
  } catch (e) {
    steps[1].status = 'fail';
    steps[1].detail = e.message;
    allOk = false;
  }
  renderSteps();
  finishPing(allOk);
}

function finishPing(allOk) {
  const badge = document.getElementById('status-badge');
  badge.className = allOk ? 'status-badge success' : 'status-badge error';
  badge.classList.remove('hidden');
  document.getElementById('status-text').textContent = allOk ? t('status_ok') : t('status_fail');
}

function stepIcon(status) {
  switch (status) {
    case 'ok': return '✓';
    case 'fail': return '✗';
    case 'running': return '<div class="mini-spinner"></div>';
    default: return '○';
  }
}

// ══════════════════════════════════
//  SAVE / LOAD (encrypted)
// ══════════════════════════════════
async function getSaved() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    // Decrypt API keys on load
    const decrypted = [];
    for (const item of raw) {
      decrypted.push({
        ...item,
        _decryptedKey: await decryptText(item.apiKey),
        _decryptedUrl: item.baseUrl // URL is not encrypted (not secret)
      });
    }
    return decrypted;
  } catch { return []; }
}

function getRawSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}

async function setSaved(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

async function saveConfig() {
  const c = getConfig();
  if (!c.baseUrl || !c.apiKey) { showToast(t('toast_need_config')); return; }
  const name = prompt(t('prompt_name'), extractHost(c.baseUrl));
  if (!name) return;

  const encApiKey = await encryptText(c.apiKey);
  const raw = getRawSaved();
  raw.push({
    id: Date.now(),
    name,
    baseUrl: c.baseUrl,
    apiKey: encApiKey,
    model: c.model,
    ts: new Date().toISOString()
  });
  await setSaved(raw);
  loadSavedConfigs();
  showToast(t('toast_saved'));
}

function extractHost(url) { try { return new URL(url).hostname; } catch { return 'config'; } }

async function loadSavedConfigs() {
  const saved = await getSaved();
  const container = document.getElementById('saved-list');
  if (!saved.length) {
    container.innerHTML = `<div class="empty-state"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"><rect x="4" y="4" width="24" height="24" rx="3"/><path d="M10 16h12M16 10v12" stroke-dasharray="2 2"/></svg><p>${t('empty_saved')}</p></div>`;
    return;
  }
  const maskKey = (k) => k ? k.substring(0, 5) + '•••' + k.substring(k.length - 3) : '•••';
  container.innerHTML = saved.map(s => `
    <div class="saved-item" onclick="loadConfigById(${s.id})">
      <div class="saved-item-info">
        <div class="saved-item-name">${esc(s.name)}</div>
        <div class="saved-item-meta">${esc(s.baseUrl)} · ${esc(s.model || '—')} · Key: ${maskKey(s._decryptedKey)}</div>
      </div>
      <div class="saved-item-actions" onclick="event.stopPropagation()">
        <button class="btn-icon" onclick="deleteConfig(${s.id})" title="Delete">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M2 3h8M4.5 3V2h3v1M3 3v7.5a.5.5 0 00.5.5h5a.5.5 0 00.5-.5V3"/></svg>
        </button>
      </div>
    </div>
  `).join('');
}

async function loadConfigById(id) {
  const saved = await getSaved();
  const s = saved.find(x => x.id === id);
  if (!s) return;
  document.getElementById('base-url').value = s.baseUrl;
  document.getElementById('api-key').value = s._decryptedKey;
  document.getElementById('model-name').value = s.model || '';
  showToast(t('toast_loaded') + ` — ${s.name}`);
}

async function deleteConfig(id) {
  if (!confirm(t('confirm_delete'))) return;
  const raw = getRawSaved().filter(s => s.id !== id);
  await setSaved(raw);
  loadSavedConfigs();
  showToast(t('toast_deleted'));
}

// ══════════════════════════════════
//  IMPORT
// ══════════════════════════════════
function importConfigs() { document.getElementById('import-file').click(); }

function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try { parseAndImport(ev.target.result, file.name); }
    catch { showToast(t('toast_import_fail')); }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function parseAndImport(text, fname) {
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
  if (cfg.baseUrl || cfg.apiKey) {
    if (cfg.baseUrl) document.getElementById('base-url').value = cfg.baseUrl;
    if (cfg.apiKey) document.getElementById('api-key').value = cfg.apiKey;
    if (cfg.model) document.getElementById('model-name').value = cfg.model;
    showToast(t('toast_imported'));
  } else { showToast(t('toast_import_fail')); }
}

// ══════════════════════════════════
//  EXPORT
// ══════════════════════════════════
function exportConfig(format) {
  const c = getConfig();
  if (!c.baseUrl && !c.apiKey) { showToast(t('toast_need_config')); return; }
  const base = c.baseUrl.replace(/\/+$/, '');
  let content = '', filename = '', title = '';
  switch (format) {
    case 'openai-env':
      title = 'OpenAI .env'; filename = '.env';
      content = `OPENAI_API_KEY="${c.apiKey}"\nOPENAI_BASE_URL="${base}"\nOPENAI_MODEL="${c.model}"`;
      break;
    case 'openclaw':
      title = 'OpenClaw'; filename = 'openclaw_config.json';
      content = JSON.stringify({ provider: 'openai-compatible', api_key: c.apiKey, base_url: base, model: c.model, max_tokens: 4096 }, null, 2);
      break;
    case 'codex':
      title = 'Codex CLI'; filename = 'codex_config.toml';
      content = `[model]\nname = "${c.model}"\n\n[provider]\ntype = "openai"\napi_key = "${c.apiKey}"\nbase_url = "${base}"`;
      break;
    case 'claude-code':
      title = 'Claude Code'; filename = 'claude_code.env';
      content = `OPENAI_API_KEY="${c.apiKey}"\nOPENAI_BASE_URL="${base}"\n\n# claude config set --global model "${c.model}"\n# claude config set --global provider "openai"`;
      break;
    case 'antigravity':
      title = 'Antigravity'; filename = 'antigravity_config.json';
      content = JSON.stringify({ provider: 'openai-compatible', api_key: c.apiKey, base_url: base, model: c.model, settings: { temperature: 0.7, max_tokens: 4096 } }, null, 2);
      break;
    case 'curl':
      title = 'cURL'; filename = 'test_api.sh';
      content = `curl "${base}/chat/completions" \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer ${c.apiKey}" \\\n  -d '{\n    "model": "${c.model}",\n    "messages": [{"role":"user","content":"${(c.prompt||'Hello!').replace(/"/g,'\\"')}"}],\n    "max_tokens": 256\n  }'`;
      break;
    case 'python':
      title = 'Python'; filename = 'test_api.py';
      content = `from openai import OpenAI\n\nclient = OpenAI(\n    api_key="${c.apiKey}",\n    base_url="${base}"\n)\n\nres = client.chat.completions.create(\n    model="${c.model}",\n    messages=[{"role":"user","content":"${(c.prompt||'Hello!').replace(/"/g,'\\"')}"}],\n    max_tokens=256\n)\nprint(res.choices[0].message.content)`;
      break;
    case 'json':
      title = 'JSON'; filename = 'api_config.json';
      content = JSON.stringify({ base_url: base, api_key: c.apiKey, model: c.model, created_at: new Date().toISOString() }, null, 2);
      break;
  }
  currentExportData = { content, filename };
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-code').textContent = content;
  document.getElementById('export-modal').classList.remove('hidden');
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
  // Remove any highlights
  document.querySelectorAll('.onboarding-highlight').forEach(el => el.classList.remove('onboarding-highlight'));
}

function nextOnboardingStep() {
  onboardingStep++;
  const steps = i18n[currentLang].onboard;
  if (onboardingStep >= steps.length) {
    endOnboarding();
    return;
  }
  renderOnboardingStep();
}

function renderOnboardingStep() {
  const steps = i18n[currentLang].onboard;
  const step = steps[onboardingStep];
  const tooltip = document.getElementById('onboarding-tooltip');
  const backdrop = document.getElementById('onboarding-backdrop');

  // Update content
  document.getElementById('onboarding-title').textContent = step.title;
  document.getElementById('onboarding-desc').textContent = step.desc;

  // Update step indicator
  const indicator = document.getElementById('onboarding-step-indicator');
  indicator.innerHTML = steps.map((_, i) => {
    let cls = 'step-dot';
    if (i < onboardingStep) cls += ' done';
    else if (i === onboardingStep) cls += ' active';
    return `<span class="${cls}"></span>`;
  }).join('');

  // Update button text for last step
  const nextBtn = document.getElementById('onboarding-next');
  const isLast = onboardingStep === steps.length - 1;
  nextBtn.querySelector('span').textContent = isLast
    ? (currentLang === 'zh' ? '开始使用' : 'Get Started')
    : t('onboarding_next');

  // Remove old highlights
  document.querySelectorAll('.onboarding-highlight').forEach(el => el.classList.remove('onboarding-highlight'));

  if (step.target) {
    const target = document.getElementById(step.target);
    if (target) {
      target.classList.add('onboarding-highlight');
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      backdrop.style.display = 'none'; // Hide full backdrop when highlighting

      // Position tooltip near the target
      setTimeout(() => {
        const rect = target.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let top = rect.bottom + 12;
        let left = rect.left;

        // Keep tooltip in viewport
        if (top + tooltipRect.height > window.innerHeight - 20) {
          top = rect.top - tooltipRect.height - 12;
        }
        if (left + tooltipRect.width > window.innerWidth - 20) {
          left = window.innerWidth - tooltipRect.width - 20;
        }
        if (left < 20) left = 20;

        tooltip.style.top = top + 'px';
        tooltip.style.left = left + 'px';
      }, 100);
    }
  } else {
    // Center tooltip (welcome / final step)
    backdrop.style.display = 'block';
    tooltip.style.top = '50%';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translate(-50%, -50%)';
    setTimeout(() => { tooltip.style.transform = 'translate(-50%, -50%)'; }, 10);
  }

  // Reset transform when targeting
  if (step.target) {
    tooltip.style.transform = 'none';
  }
}

// ── Utility ──
function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
