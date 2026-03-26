/* =========================================
   API HERO - Main Application Logic
   Pure Static, No Server Required
   ========================================= */

const STORAGE_KEY = 'api-hero-configs';
let currentExportData = { content: '', filename: '' };

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
  loadSavedConfigs();
  setupEventListeners();
  loadLastUsed();
});

function setupEventListeners() {
  // Toggle API key visibility
  document.getElementById('toggle-key').addEventListener('click', () => {
    const input = document.getElementById('api-key');
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    document.getElementById('toggle-key').textContent = isPassword ? '🙈' : '👁️';
  });

  // Import file handler
  document.getElementById('import-file').addEventListener('change', handleImportFile);

  // Click explosion effect
  document.addEventListener('click', createClickExplosion);

  // Close modal on overlay click
  document.getElementById('export-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Keyboard shortcut: Escape closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}

// ── Click Explosion Effect ──
const SFX_WORDS = ['POW!', 'ZAP!', 'BAM!', 'WHAM!', 'BOOM!', 'KAPOW!', 'CRASH!'];
function createClickExplosion(e) {
  if (Math.random() > 0.3) return; // 30% chance
  const el = document.createElement('div');
  el.className = 'click-explosion';
  el.textContent = SFX_WORDS[Math.floor(Math.random() * SFX_WORDS.length)];
  el.style.left = e.clientX + 'px';
  el.style.top = e.clientY + 'px';
  document.getElementById('click-effects').appendChild(el);
  setTimeout(() => el.remove(), 700);
}

// ── Toast Notification ──
function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ── Get Current Config ──
function getCurrentConfig() {
  return {
    baseUrl: document.getElementById('base-url').value.trim(),
    apiKey: document.getElementById('api-key').value.trim(),
    model: document.getElementById('model-name').value.trim(),
    prompt: document.getElementById('test-prompt').value.trim()
  };
}

// ── Save Last Used ──
function saveLastUsed() {
  const config = getCurrentConfig();
  localStorage.setItem('api-hero-last', JSON.stringify(config));
}

function loadLastUsed() {
  try {
    const last = JSON.parse(localStorage.getItem('api-hero-last'));
    if (last) {
      if (last.baseUrl) document.getElementById('base-url').value = last.baseUrl;
      if (last.apiKey) document.getElementById('api-key').value = last.apiKey;
      if (last.model) document.getElementById('model-name').value = last.model;
      if (last.prompt) document.getElementById('test-prompt').value = last.prompt;
    }
  } catch (e) { /* ignore */ }
}

// ══════════════════════════════════════════
//  TEST API
// ══════════════════════════════════════════
async function testAPI() {
  const config = getCurrentConfig();

  if (!config.baseUrl) { showToast('⚠️ BASE URL is required!'); return; }
  if (!config.apiKey) { showToast('⚠️ API KEY is required!'); return; }
  if (!config.model) { showToast('⚠️ MODEL is required!'); return; }

  saveLastUsed();

  // Show testing state
  showState('testing');

  const startTime = performance.now();

  try {
    // Normalize base URL
    let baseUrl = config.baseUrl.replace(/\/+$/, '');
    if (!baseUrl.endsWith('/v1')) {
      // Check if it already has a path
      const url = new URL(baseUrl);
      if (url.pathname === '/' || url.pathname === '') {
        baseUrl += '/v1';
      }
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'user', content: config.prompt || 'Hello!' }
        ],
        max_tokens: 256
      })
    });

    const elapsed = Math.round(performance.now() - startTime);

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMsg = `HTTP ${response.status} ${response.statusText}`;
      try {
        const errJson = JSON.parse(errorBody);
        if (errJson.error) {
          errorMsg += `\n\n${errJson.error.message || errJson.error.type || JSON.stringify(errJson.error)}`;
        }
      } catch {
        errorMsg += `\n\n${errorBody.substring(0, 500)}`;
      }
      showState('error', errorMsg);
      return;
    }

    const data = await response.json();

    // Extract response content
    const content = data.choices?.[0]?.message?.content || 'No content in response';
    const model = data.model || config.model;
    const totalTokens = data.usage?.total_tokens || '--';

    // Show success
    showState('success', content);

    // Update stats
    document.getElementById('stats-bar').classList.remove('hidden');
    document.getElementById('stat-latency').textContent = `${elapsed}ms`;
    document.getElementById('stat-tokens').textContent = totalTokens;
    document.getElementById('stat-model').textContent = model;

  } catch (err) {
    showState('error', `Network Error: ${err.message}\n\nMake sure the API endpoint supports CORS for browser requests.`);
  }
}

function showState(state, content) {
  const states = ['waiting', 'testing', 'success', 'error'];
  states.forEach(s => {
    document.getElementById(`${s}-state`).classList.toggle('hidden', s !== state);
  });

  if (state === 'success') {
    document.getElementById('result-details').textContent = content;
  } else if (state === 'error') {
    document.getElementById('error-details').textContent = content;
    document.getElementById('stats-bar').classList.add('hidden');
  }
}

// ══════════════════════════════════════════
//  SAVE / LOAD CONFIGS
// ══════════════════════════════════════════
function getSavedConfigs() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { return []; }
}

function saveSavedConfigs(configs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

function saveConfig() {
  const config = getCurrentConfig();
  if (!config.baseUrl || !config.apiKey) {
    showToast('⚠️ Need at least Base URL and API Key!');
    return;
  }

  const name = prompt('💾 Give this hero a name:', extractName(config.baseUrl));
  if (!name) return;

  const configs = getSavedConfigs();
  configs.push({
    id: Date.now(),
    name: name,
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    model: config.model,
    createdAt: new Date().toISOString()
  });

  saveSavedConfigs(configs);
  loadSavedConfigs();
  showToast('✅ Hero saved to archive!');
}

function extractName(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return 'My API';
  }
}

function loadSavedConfigs() {
  const configs = getSavedConfigs();
  const container = document.getElementById('saved-list');

  if (configs.length === 0) {
    container.innerHTML = `
      <div class="empty-archive">
        <p class="archive-empty-text">No saved heroes yet...</p>
        <p class="archive-hint">Save a config above to build your team!</p>
      </div>`;
    return;
  }

  container.innerHTML = configs.map(c => `
    <div class="saved-card" data-id="${c.id}">
      <div class="saved-card-header">
        <span class="saved-card-name">${escapeHtml(c.name)}</span>
        <div class="saved-card-actions">
          <button class="btn-load" onclick="loadConfig(${c.id})" title="Load">📥</button>
          <button onclick="deleteConfig(${c.id})" title="Delete">🗑️</button>
        </div>
      </div>
      <div class="saved-card-url">${escapeHtml(c.baseUrl)}</div>
      <div class="saved-card-model">Model: ${escapeHtml(c.model || 'default')}</div>
    </div>
  `).join('');
}

function loadConfig(id) {
  const configs = getSavedConfigs();
  const config = configs.find(c => c.id === id);
  if (!config) return;

  document.getElementById('base-url').value = config.baseUrl;
  document.getElementById('api-key').value = config.apiKey;
  document.getElementById('model-name').value = config.model || '';
  showToast(`⚡ Loaded: ${config.name}`);
  document.getElementById('panel-config').scrollIntoView({ behavior: 'smooth' });
}

function deleteConfig(id) {
  if (!confirm('Delete this saved config?')) return;
  const configs = getSavedConfigs().filter(c => c.id !== id);
  saveSavedConfigs(configs);
  loadSavedConfigs();
  showToast('🗑️ Config deleted!');
}

// ══════════════════════════════════════════
//  IMPORT
// ══════════════════════════════════════════
function importConfigs() {
  document.getElementById('import-file').click();
}

function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const text = ev.target.result;
    try {
      parseAndImport(text, file.name);
    } catch (err) {
      showToast(`❌ Import failed: ${err.message}`);
    }
  };
  reader.readAsText(file);
  e.target.value = ''; // Reset
}

function parseAndImport(text, filename) {
  let config = {};

  if (filename.endsWith('.json')) {
    const json = JSON.parse(text);
    // Support various JSON formats
    config.baseUrl = json.base_url || json.baseUrl || json.OPENAI_BASE_URL || json.api_base || '';
    config.apiKey = json.api_key || json.apiKey || json.OPENAI_API_KEY || '';
    config.model = json.model || json.MODEL || json.default_model || '';
  } else if (filename.endsWith('.env')) {
    const lines = text.split('\n');
    lines.forEach(line => {
      const match = line.match(/^([^#=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const val = match[2].trim().replace(/^["']|["']$/g, '');
        if (key.includes('BASE') && key.includes('URL')) config.baseUrl = val;
        else if (key.includes('API') && key.includes('KEY')) config.apiKey = val;
        else if (key.includes('MODEL')) config.model = val;
      }
    });
  } else if (filename.endsWith('.toml')) {
    // Simple TOML parser for common patterns
    const lines = text.split('\n');
    lines.forEach(line => {
      const match = line.match(/^\s*(\w+)\s*=\s*"?([^"]*)"?\s*$/);
      if (match) {
        const key = match[1].toLowerCase();
        const val = match[2].trim();
        if (key.includes('base') || key.includes('url') || key === 'api_base') config.baseUrl = val;
        else if (key.includes('key') || key === 'api_key') config.apiKey = val;
        else if (key.includes('model')) config.model = val;
      }
    });
  } else if (filename.endsWith('.yaml') || filename.endsWith('.yml')) {
    const lines = text.split('\n');
    lines.forEach(line => {
      const match = line.match(/^\s*(\S+)\s*:\s*(.+)$/);
      if (match) {
        const key = match[1].toLowerCase();
        const val = match[2].trim().replace(/^["']|["']$/g, '');
        if (key.includes('base') || key.includes('url')) config.baseUrl = val;
        else if (key.includes('key')) config.apiKey = val;
        else if (key.includes('model')) config.model = val;
      }
    });
  }

  if (config.baseUrl || config.apiKey) {
    if (config.baseUrl) document.getElementById('base-url').value = config.baseUrl;
    if (config.apiKey) document.getElementById('api-key').value = config.apiKey;
    if (config.model) document.getElementById('model-name').value = config.model;
    showToast('✅ Config imported!');
  } else {
    showToast('⚠️ Could not parse config from file');
  }
}

// ══════════════════════════════════════════
//  EXPORT
// ══════════════════════════════════════════
function exportConfig(format) {
  const config = getCurrentConfig();
  if (!config.baseUrl && !config.apiKey) {
    showToast('⚠️ Enter at least Base URL or API Key first!');
    return;
  }

  let content = '';
  let filename = '';
  let title = '';

  const baseUrl = config.baseUrl.replace(/\/+$/, '');

  switch (format) {
    case 'openai-env':
      title = '🌐 OpenAI .env Format';
      filename = '.env';
      content = `# OpenAI Compatible API Configuration
OPENAI_API_KEY="${config.apiKey}"
OPENAI_BASE_URL="${baseUrl}"
OPENAI_MODEL="${config.model}"`;
      break;

    case 'openclaw':
      title = '🐾 OpenClaw Config';
      filename = 'openclaw_config.json';
      content = JSON.stringify({
        provider: "openai-compatible",
        api_key: config.apiKey,
        base_url: baseUrl,
        model: config.model,
        max_tokens: 4096
      }, null, 2);
      break;

    case 'codex':
      title = '💻 Codex CLI Config';
      filename = 'codex_config.toml';
      content = `# Codex CLI Configuration
# Place at ~/.codex/config.toml or set env vars

[model]
name = "${config.model}"

[provider]
type = "openai"
api_key = "${config.apiKey}"
base_url = "${baseUrl}"

# Environment variables alternative:
# OPENAI_API_KEY="${config.apiKey}"
# OPENAI_BASE_URL="${baseUrl}"
# OPENAI_MODEL="${config.model}"`;
      break;

    case 'claude-code':
      title = '🧠 Claude Code Config';
      filename = 'claude_code_config.json';
      content = `# Claude Code with OpenAI-compatible API
# Set these environment variables:

OPENAI_API_KEY="${config.apiKey}"
OPENAI_BASE_URL="${baseUrl}"

# Or use claude code settings:
# claude config set --global model "${config.model}"
# claude config set --global provider "openai"

# JSON config (~/.claude/settings.json):
${JSON.stringify({
  model: config.model,
  provider: "openai",
  openaiApiKey: config.apiKey,
  openaiBaseUrl: baseUrl
}, null, 2)}`;
      break;

    case 'antigravity':
      title = '🚀 Antigravity / Gemini Config';
      filename = 'antigravity_config.json';
      content = JSON.stringify({
        provider: "openai-compatible",
        api_key: config.apiKey,
        base_url: baseUrl,
        model: config.model,
        settings: {
          temperature: 0.7,
          max_tokens: 4096
        }
      }, null, 2);
      break;

    case 'curl':
      title = '📟 cURL Command';
      filename = 'test_api.sh';
      content = `#!/bin/bash
# Test OpenAI-compatible API with cURL

curl "${baseUrl}/chat/completions" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${config.apiKey}" \\
  -d '{
    "model": "${config.model}",
    "messages": [
      {"role": "user", "content": "${(config.prompt || 'Hello!').replace(/"/g, '\\"')}"}
    ],
    "max_tokens": 256
  }'`;
      break;

    case 'python':
      title = '🐍 Python Script';
      filename = 'test_api.py';
      content = `#!/usr/bin/env python3
"""Test OpenAI-compatible API"""

from openai import OpenAI

client = OpenAI(
    api_key="${config.apiKey}",
    base_url="${baseUrl}"
)

response = client.chat.completions.create(
    model="${config.model}",
    messages=[
        {"role": "user", "content": "${(config.prompt || 'Hello!').replace(/"/g, '\\"')}"}
    ],
    max_tokens=256
)

print(response.choices[0].message.content)
print(f"Model: {response.model}")
print(f"Tokens: {response.usage.total_tokens}")`;
      break;

    case 'json':
      title = '📋 JSON Config';
      filename = 'api_config.json';
      content = JSON.stringify({
        base_url: baseUrl,
        api_key: config.apiKey,
        model: config.model,
        created_at: new Date().toISOString()
      }, null, 2);
      break;
  }

  currentExportData = { content, filename };
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-code').textContent = content;
  document.getElementById('export-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('export-modal').classList.add('hidden');
}

function copyExport() {
  navigator.clipboard.writeText(currentExportData.content).then(() => {
    showToast('📋 Copied to clipboard!');
  }).catch(() => {
    // Fallback
    const textarea = document.createElement('textarea');
    textarea.value = currentExportData.content;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('📋 Copied!');
  });
}

function downloadExport() {
  const blob = new Blob([currentExportData.content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = currentExportData.filename;
  a.click();
  URL.revokeObjectURL(url);
  showToast(`💾 Downloaded: ${currentExportData.filename}`);
}

// ── Utility ──
function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
