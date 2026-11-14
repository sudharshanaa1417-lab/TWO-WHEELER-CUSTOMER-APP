const API_URL_STORAGE_KEY = 'twf_render_api_url';

export function getSavedApiUrl() {
  const saved = localStorage.getItem(API_URL_STORAGE_KEY);
  if (saved !== null) return saved.trim().replace(/\/+$/, '');
  const envUrl = import.meta.env.VITE_API_URL || '';
  return envUrl.trim().replace(/\/+$/, '');
}

export function setSavedApiUrl(url) {
  const cleaned = String(url || '').trim().replace(/\/+$/, '');
  localStorage.setItem(API_URL_STORAGE_KEY, cleaned);
  return cleaned;
}

function buildUrl(path, baseUrl = getSavedApiUrl()) {
  if (!baseUrl) return path; // uses same-origin or Vite proxy
  return `${baseUrl}${path}`;
}

export async function checkServerHealth(customUrl) {
  const url = buildUrl('/api/health', customUrl ?? getSavedApiUrl());
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return { ok: false };
    const data = await res.json();
    return { ok: data?.status === 'ok', data };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}

export async function syncWithServer(localCustomers) {
  const baseUrl = getSavedApiUrl();
  // If hosted on Vercel without a Render URL configured, stay offline-first unless same-origin /api responds
  const health = await checkServerHealth(baseUrl);
  if (!health.ok) {
    return { synced: false, reason: 'offline_or_unconfigured', customers: localCustomers };
  }

  const res = await fetch(buildUrl('/api/customers/bulk', baseUrl), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customers: localCustomers, mode: 'merge' })
  });
  if (!res.ok) {
    return { synced: false, reason: 'server_error', customers: localCustomers };
  }
  const data = await res.json();
  return { synced: true, customers: data.customers || localCustomers };
}

export async function pushCustomerToServer(customer, isEdit = false) {
  const baseUrl = getSavedApiUrl();
  const health = await checkServerHealth(baseUrl);
  if (!health.ok) return false;

  const endpoint = isEdit ? `/api/customers/${encodeURIComponent(customer.id)}` : '/api/customers';
  const method = isEdit ? 'PUT' : 'POST';
  const res = await fetch(buildUrl(endpoint, baseUrl), {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer)
  });
  return res.ok;
}

export async function deleteCustomerOnServer(id) {
  const baseUrl = getSavedApiUrl();
  const health = await checkServerHealth(baseUrl);
  if (!health.ok) return false;

  const res = await fetch(buildUrl(`/api/customers/${encodeURIComponent(id)}`, baseUrl), {
    method: 'DELETE'
  });
  return res.ok;
}
