/* =========================================
   API Tester — Application Logic
   Pure Static, No Server
   ========================================= */

const STORAGE_KEY = 'api-tester-configs';
let currentExportData = { content: '', filename: '' };
let currentLang = 'zh';

// ── i18n ──
const i18n = {
  zh: {
    hero_title: '测试你的 OpenAI 兼容 API',
    hero_desc: '输入 Base URL 和 API Key，一键验证连通性。纯静态页面，密钥不离开浏览器。',
    config_title: '接口配置',
    label_base_url: 'Base URL',
    label_api_key: 'API Key',
    label_model: '模型',
    label_prompt: '测试 Prompt',
    btn_test: '测试连接',
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
    footer_text: '纯静态 · 密钥本地存储 · 无服务器 · 无追踪',
    footer_star: '喜欢的话点个',
    toast_saved: '✓ 已保存',
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
  },
  en: {
    hero_title: 'Test Your OpenAI-Compatible API',
    hero_desc: 'Enter your Base URL and API Key, one click to verify connectivity. Fully static, keys never leave your browser.',
    config_title: 'CONFIGURATION',
    label_base_url: 'Base URL',
    label_api_key: 'API Key',
    label_model: 'Model',
    label_prompt: 'Test Prompt',
    btn_test: 'Test',
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
    footer_text: 'Static · Local Storage · No Server · No Tracking',
    footer_star: 'Like it? Star on',
    toast_saved: '✓ Saved',
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
  loadSavedConfigs(); // re-render saved list with new language
}

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  currentLang = localStorage.getItem('api-tester-lang') || 'zh';
  applyLang();
  loadSavedConfigs();
  setupListeners();
  loadLastUsed();
});

function setupListeners() {
  document.getElementById('toggle-key').addEventListener('click', () => {
    const input = document.getElementById('api-key');
    input.type = input.type === 'password' ? 'text' : 'password';
  });
  document.getElementById('import-file').addEventListener('change', handleImportFile);
  document.getElementById('export-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
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
  localStorage.setItem('api-tester-last', JSON.stringify(getConfig()));
}

function loadLastUsed() {
  try {
    const d = JSON.parse(localStorage.getItem('api-tester-last'));
    if (d) {
      if (d.baseUrl) document.getElementById('base-url').value = d.baseUrl;
      if (d.apiKey) document.getElementById('api-key').value = d.apiKey;
      if (d.model) document.getElementById('model-name').value = d.model;
      if (d.prompt) document.getElementById('test-prompt').value = d.prompt;
    }
  } catch {}
}

// ══════════════════════════════════
//  TEST API
// ══════════════════════════════════
async function testAPI() {
  const c = getConfig();
  if (!c.baseUrl) { showToast(t('toast_need_url')); return; }
  if (!c.apiKey) { showToast(t('toast_need_key')); return; }
  if (!c.model) { showToast(t('toast_need_model')); return; }
  saveLastUsed();
  showResult('loading');

  const t0 = performance.now();
  try {
    let base = c.baseUrl.replace(/\/+$/, '');
    if (!base.endsWith('/v1')) {
      try { const u = new URL(base); if (u.pathname === '/' || u.pathname === '') base += '/v1'; } catch {}
    }

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
      showResult('error', msg, elapsed);
      return;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '(empty response)';
    const model = data.model || c.model;
    const tokens = data.usage?.total_tokens || '—';
    showResult('success', content, elapsed, tokens, model);
  } catch (err) {
    showResult('error', `${err.message}\n\nAPI 端点可能不支持浏览器跨域 (CORS) 请求`, Math.round(performance.now() - t0));
  }
}

function showResult(state, content, latency, tokens, model) {
  ['idle', 'loading', 'success', 'error'].forEach(s => {
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
  } else if (state === 'loading') {
    badge.classList.add('hidden');
    statsRow.classList.add('hidden');
  }
}

// ══════════════════════════════════
//  SAVE / LOAD
// ══════════════════════════════════
function getSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function setSaved(arr) { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }

function saveConfig() {
  const c = getConfig();
  if (!c.baseUrl || !c.apiKey) { showToast(t('toast_need_config')); return; }
  const name = prompt(t('prompt_name'), extractHost(c.baseUrl));
  if (!name) return;
  const saved = getSaved();
  saved.push({ id: Date.now(), name, baseUrl: c.baseUrl, apiKey: c.apiKey, model: c.model, ts: new Date().toISOString() });
  setSaved(saved);
  loadSavedConfigs();
  showToast(t('toast_saved'));
}

function extractHost(url) { try { return new URL(url).hostname; } catch { return 'config'; } }

function loadSavedConfigs() {
  const saved = getSaved();
  const container = document.getElementById('saved-list');
  if (!saved.length) {
    container.innerHTML = `<div class="empty-state"><svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1" opacity="0.3"><rect x="4" y="4" width="24" height="24" rx="3"/><path d="M10 16h12M16 10v12" stroke-dasharray="2 2"/></svg><p data-i18n="empty_saved">${t('empty_saved')}</p></div>`;
    return;
  }
  container.innerHTML = saved.map(s => `
    <div class="saved-item" onclick="loadConfig(${s.id})">
      <div class="saved-item-info">
        <div class="saved-item-name">${esc(s.name)}</div>
        <div class="saved-item-meta">${esc(s.baseUrl)} · ${esc(s.model || '—')}</div>
      </div>
      <div class="saved-item-actions" onclick="event.stopPropagation()">
        <button class="btn-icon" onclick="deleteConfig(${s.id})" title="Delete">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2"><path d="M2 3h8M4.5 3V2h3v1M3 3v7.5a.5.5 0 00.5.5h5a.5.5 0 00.5-.5V3"/></svg>
        </button>
      </div>
    </div>
  `).join('');
}

function loadConfig(id) {
  const c = getSaved().find(s => s.id === id);
  if (!c) return;
  document.getElementById('base-url').value = c.baseUrl;
  document.getElementById('api-key').value = c.apiKey;
  document.getElementById('model-name').value = c.model || '';
  showToast(t('toast_loaded') + ` — ${c.name}`);
}

function deleteConfig(id) {
  if (!confirm(t('confirm_delete'))) return;
  setSaved(getSaved().filter(s => s.id !== id));
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
    catch (err) { showToast(t('toast_import_fail')); }
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
      const [, k, v] = [, m[1].trim(), m[2].trim().replace(/^["']|["']$/g, '')];
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
  } else {
    showToast(t('toast_import_fail'));
  }
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
      title = 'OpenAI .env';
      filename = '.env';
      content = `OPENAI_API_KEY="${c.apiKey}"\nOPENAI_BASE_URL="${base}"\nOPENAI_MODEL="${c.model}"`;
      break;
    case 'openclaw':
      title = 'OpenClaw';
      filename = 'openclaw_config.json';
      content = JSON.stringify({ provider: 'openai-compatible', api_key: c.apiKey, base_url: base, model: c.model, max_tokens: 4096 }, null, 2);
      break;
    case 'codex':
      title = 'Codex CLI';
      filename = 'codex_config.toml';
      content = `[model]\nname = "${c.model}"\n\n[provider]\ntype = "openai"\napi_key = "${c.apiKey}"\nbase_url = "${base}"`;
      break;
    case 'claude-code':
      title = 'Claude Code';
      filename = 'claude_code.env';
      content = `OPENAI_API_KEY="${c.apiKey}"\nOPENAI_BASE_URL="${base}"\n\n# claude config set --global model "${c.model}"\n# claude config set --global provider "openai"`;
      break;
    case 'antigravity':
      title = 'Antigravity';
      filename = 'antigravity_config.json';
      content = JSON.stringify({ provider: 'openai-compatible', api_key: c.apiKey, base_url: base, model: c.model, settings: { temperature: 0.7, max_tokens: 4096 } }, null, 2);
      break;
    case 'curl':
      title = 'cURL';
      filename = 'test_api.sh';
      content = `curl "${base}/chat/completions" \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer ${c.apiKey}" \\\n  -d '{\n    "model": "${c.model}",\n    "messages": [{"role":"user","content":"${(c.prompt||'Hello!').replace(/"/g,'\\"')}"}],\n    "max_tokens": 256\n  }'`;
      break;
    case 'python':
      title = 'Python';
      filename = 'test_api.py';
      content = `from openai import OpenAI\n\nclient = OpenAI(\n    api_key="${c.apiKey}",\n    base_url="${base}"\n)\n\nres = client.chat.completions.create(\n    model="${c.model}",\n    messages=[{"role":"user","content":"${(c.prompt||'Hello!').replace(/"/g,'\\"')}"}],\n    max_tokens=256\n)\nprint(res.choices[0].message.content)`;
      break;
    case 'json':
      title = 'JSON';
      filename = 'api_config.json';
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
    ta.value = currentExportData.content;
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
    showToast(t('toast_copied'));
  });
}

function downloadExport() {
  const blob = new Blob([currentExportData.content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = currentExportData.filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
